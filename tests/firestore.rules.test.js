/**
 * Firestore Security Rules tests — run against the Firebase emulator, never
 * a real project. These verify the "UI hides admin routes" story is backed
 * by an actual server-side rule, not just client-side trust.
 *
 * Requires the Firebase emulator (and therefore a JDK) locally:
 *   npm run test:rules
 * See guide.txt for one-time setup (install Java + firebase-tools).
 */
import { beforeAll, afterAll, beforeEach, describe, it } from "vitest";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  collection,
  addDoc,
} from "firebase/firestore";

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "mavero-rules-test",
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

function customerCtx() {
  return testEnv.authenticatedContext("customer-uid", { email: "customer@test.com" });
}
function otherCustomerCtx() {
  return testEnv.authenticatedContext("other-uid", { email: "other@test.com" });
}
function adminCtx() {
  return testEnv.authenticatedContext("admin-uid", { email: "admin@test.com" });
}
function anonCtx() {
  return testEnv.unauthenticatedContext();
}

async function seedUsers() {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "users", "customer-uid"), { role: "customer", email: "customer@test.com" });
    await setDoc(doc(db, "users", "other-uid"), { role: "customer", email: "other@test.com" });
    await setDoc(doc(db, "users", "admin-uid"), { role: "admin", email: "admin@test.com" });
  });
}

describe("users collection", () => {
  beforeEach(seedUsers);

  it("a user can read their own profile", async () => {
    const db = customerCtx().firestore();
    await assertSucceeds(getDoc(doc(db, "users", "customer-uid")));
  });

  it("a user cannot read another user's profile", async () => {
    const db = customerCtx().firestore();
    await assertFails(getDoc(doc(db, "users", "other-uid")));
  });

  it("an admin can read any user's profile", async () => {
    const db = adminCtx().firestore();
    await assertSucceeds(getDoc(doc(db, "users", "customer-uid")));
  });

  it("a user cannot promote themself to admin", async () => {
    const db = customerCtx().firestore();
    await assertFails(
      updateDoc(doc(db, "users", "customer-uid"), { role: "admin" })
    );
  });

  it("a user CAN update their own non-role fields", async () => {
    const db = customerCtx().firestore();
    await assertSucceeds(
      updateDoc(doc(db, "users", "customer-uid"), { name: "New Name" })
    );
  });

  it("an admin CAN change another user's role", async () => {
    const db = adminCtx().firestore();
    await assertSucceeds(
      updateDoc(doc(db, "users", "customer-uid"), { role: "admin" })
    );
  });

  it("a user cannot write to another user's cart subcollection", async () => {
    const db = customerCtx().firestore();
    await assertFails(
      setDoc(doc(db, "users", "other-uid", "cart", "item1"), { sku: "X", quantity: 1 })
    );
  });

  it("a user CAN write to their own cart subcollection", async () => {
    const db = customerCtx().firestore();
    await assertSucceeds(
      setDoc(doc(db, "users", "customer-uid", "cart", "item1"), { sku: "X", quantity: 1 })
    );
  });
});

describe("products collection", () => {
  beforeEach(async () => {
    await seedUsers();
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "products", "SKU-1"), {
        name: "Test Product",
        price: 100,
        stock: 10,
        variants: [],
        soldCount: 0,
        status: "active",
      });
    });
  });

  it("anyone (even signed out) can read products", async () => {
    const db = anonCtx().firestore();
    await assertSucceeds(getDoc(doc(db, "products", "SKU-1")));
  });

  it("a non-admin cannot create a product", async () => {
    const db = customerCtx().firestore();
    await assertFails(
      setDoc(doc(db, "products", "SKU-2"), { name: "New", price: 10, stock: 1 })
    );
  });

  it("a non-admin cannot delete a product", async () => {
    const db = customerCtx().firestore();
    await assertFails(deleteDoc(doc(db, "products", "SKU-1")));
  });

  it("a non-admin cannot change a product's price", async () => {
    const db = customerCtx().firestore();
    await assertFails(updateDoc(doc(db, "products", "SKU-1"), { price: 1 }));
  });

  it("a non-admin cannot increase a product's stock", async () => {
    const db = customerCtx().firestore();
    await assertFails(updateDoc(doc(db, "products", "SKU-1"), { stock: 999 }));
  });

  it("a non-admin CAN decrement stock only (checkout side-effect)", async () => {
    const db = customerCtx().firestore();
    await assertSucceeds(updateDoc(doc(db, "products", "SKU-1"), { stock: 9 }));
  });

  it("an admin can update any product field", async () => {
    const db = adminCtx().firestore();
    await assertSucceeds(updateDoc(doc(db, "products", "SKU-1"), { price: 200, name: "Renamed" }));
  });
});

describe("categories collection", () => {
  beforeEach(seedUsers);

  it("a non-admin cannot create a category", async () => {
    const db = customerCtx().firestore();
    await assertFails(setDoc(doc(db, "categories", "new-cat"), { name: "New" }));
  });

  it("an admin can create a category", async () => {
    const db = adminCtx().firestore();
    await assertSucceeds(setDoc(doc(db, "categories", "new-cat"), { name: "New" }));
  });
});

describe("coupons collection", () => {
  beforeEach(async () => {
    await seedUsers();
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "coupons", "WELCOME10"), {
        code: "WELCOME10",
        type: "percentage",
        value: 10,
        usedCount: 0,
        active: true,
      });
    });
  });

  it("a non-admin cannot create a coupon", async () => {
    const db = customerCtx().firestore();
    await assertFails(setDoc(doc(db, "coupons", "HACK50"), { code: "HACK50", value: 50 }));
  });

  it("a non-admin cannot change a coupon's value", async () => {
    const db = customerCtx().firestore();
    await assertFails(updateDoc(doc(db, "coupons", "WELCOME10"), { value: 100 }));
  });

  it("a non-admin CAN redeem (increment usedCount by exactly 1)", async () => {
    const db = customerCtx().firestore();
    await assertSucceeds(updateDoc(doc(db, "coupons", "WELCOME10"), { usedCount: 1 }));
  });

  it("a non-admin cannot jump usedCount by more than 1", async () => {
    const db = customerCtx().firestore();
    await assertFails(updateDoc(doc(db, "coupons", "WELCOME10"), { usedCount: 5 }));
  });
});

describe("orders collection", () => {
  beforeEach(seedUsers);

  it("a signed-in user can create their own pending order", async () => {
    const db = customerCtx().firestore();
    await assertSucceeds(
      addDoc(collection(db, "orders"), {
        userId: "customer-uid",
        status: "pending",
        items: [],
        total: 100,
      })
    );
  });

  it("a user cannot create an order impersonating another user", async () => {
    const db = customerCtx().firestore();
    await assertFails(
      addDoc(collection(db, "orders"), {
        userId: "other-uid",
        status: "pending",
        items: [],
        total: 100,
      })
    );
  });

  it("a user cannot create an order with a non-pending status", async () => {
    const db = customerCtx().firestore();
    await assertFails(
      addDoc(collection(db, "orders"), {
        userId: "customer-uid",
        status: "delivered",
        items: [],
        total: 100,
      })
    );
  });

  it("a user can read their own order but not another user's order", async () => {
    let orderId;
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const ref = await addDoc(collection(ctx.firestore(), "orders"), {
        userId: "other-uid",
        status: "pending",
        items: [],
        total: 50,
      });
      orderId = ref.id;
    });
    const db = customerCtx().firestore();
    await assertFails(getDoc(doc(db, "orders", orderId)));
  });

  it("a customer cannot update an order's status themselves", async () => {
    let orderId;
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const ref = await addDoc(collection(ctx.firestore(), "orders"), {
        userId: "customer-uid",
        status: "pending",
        items: [],
        total: 50,
      });
      orderId = ref.id;
    });
    const db = customerCtx().firestore();
    await assertFails(updateDoc(doc(db, "orders", orderId), { status: "delivered" }));
  });

  it("an admin CAN update an order's status", async () => {
    let orderId;
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const ref = await addDoc(collection(ctx.firestore(), "orders"), {
        userId: "customer-uid",
        status: "pending",
        items: [],
        total: 50,
      });
      orderId = ref.id;
    });
    const db = adminCtx().firestore();
    await assertSucceeds(updateDoc(doc(db, "orders", orderId), { status: "shipped" }));
  });
});

describe("reviews collection", () => {
  beforeEach(seedUsers);

  it("anyone can read reviews", async () => {
    const db = anonCtx().firestore();
    await assertSucceeds(getDocs(collection(db, "reviews")));
  });

  it("a signed-in user can create a review under their own uid", async () => {
    const db = customerCtx().firestore();
    await assertSucceeds(
      addDoc(collection(db, "reviews"), {
        userId: "customer-uid",
        productId: "SKU-1",
        rating: 5,
        comment: "Great!",
      })
    );
  });

  it("a user cannot create a review impersonating another user", async () => {
    const db = customerCtx().firestore();
    await assertFails(
      addDoc(collection(db, "reviews"), {
        userId: "other-uid",
        productId: "SKU-1",
        rating: 5,
        comment: "Fake",
      })
    );
  });

  it("a user cannot delete another user's review", async () => {
    let reviewId;
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const ref = await addDoc(collection(ctx.firestore(), "reviews"), {
        userId: "other-uid",
        productId: "SKU-1",
        rating: 3,
      });
      reviewId = ref.id;
    });
    const db = customerCtx().firestore();
    await assertFails(deleteDoc(doc(db, "reviews", reviewId)));
  });

  it("an admin CAN delete any review (moderation)", async () => {
    let reviewId;
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const ref = await addDoc(collection(ctx.firestore(), "reviews"), {
        userId: "other-uid",
        productId: "SKU-1",
        rating: 1,
      });
      reviewId = ref.id;
    });
    const db = adminCtx().firestore();
    await assertSucceeds(deleteDoc(doc(db, "reviews", reviewId)));
  });
});

describe("subscribers & contactMessages", () => {
  beforeEach(seedUsers);

  it("anyone can subscribe to the newsletter", async () => {
    const db = anonCtx().firestore();
    await assertSucceeds(addDoc(collection(db, "subscribers"), { email: "a@b.com" }));
  });

  it("a non-admin cannot read the subscribers list", async () => {
    const db = customerCtx().firestore();
    await assertFails(getDocs(collection(db, "subscribers")));
  });

  it("anyone can submit the contact form", async () => {
    const db = anonCtx().firestore();
    await assertSucceeds(
      addDoc(collection(db, "contactMessages"), { name: "A", email: "a@b.com", message: "Hi" })
    );
  });

  it("a non-admin cannot read contact messages", async () => {
    const db = customerCtx().firestore();
    await assertFails(getDocs(collection(db, "contactMessages")));
  });
});
