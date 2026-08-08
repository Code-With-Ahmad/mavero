/**
 * Bootstraps the very first admin account.
 *
 * Mavero has no backend/Admin SDK for the *live app* (client-SDK-only, by
 * design — see README.md): firestore.rules only lets an existing admin
 * change someone's role, and a self-created profile must be written as
 * role "customer" (the same rule that stops any signed-up customer from
 * promoting themselves — see the "users collection" tests in
 * tests/firestore.rules.test.js). The client SDK alone genuinely cannot
 * do the promotion.
 *
 * What this script always does: create the Firebase Auth account (or sign
 * into it if it already exists) and write its Firestore profile doc.
 *
 * What it does NEXT depends on whether you've provided service-account
 * credentials (FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY in
 * .env — see guide.txt Part 2.6 for where to get them):
 *   - Provided     -> uses the Firebase ADMIN SDK (which bypasses
 *                     firestore.rules by design, unlike the client SDK)
 *                     to set role: "admin" directly. Fully automated.
 *   - Not provided -> prints a direct link to the account's Firestore
 *                     document; you flip role -> "admin" there yourself
 *                     (one click).
 * Neither path is "more correct" than the other — the service-account
 * path just trades "one manual console click" for "you now hold a
 * credential that can bypass every security rule in this project," which
 * is exactly why it's opt-in, not the default.
 *
 * Usage: npm run create-admin
 * Requires: a filled-in .env (Firebase section), and ADMIN_BOOTSTRAP_EMAIL
 * / ADMIN_BOOTSTRAP_PASSWORD in .env (or it will prompt for them). These
 * are intentionally NOT prefixed with VITE_ — Vite inlines every VITE_*
 * variable into the browser bundle, and a password must never end up
 * there. This script reads them with plain Node `process.env`.
 */
import "dotenv/config";
import readline from "node:readline/promises";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const hasServiceAccount = Boolean(
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY
);

async function promoteViaAdminSdk(uid) {
  // Dynamic import: firebase-admin has a heavier startup cost and isn't
  // needed at all on the "print a link" path, so don't pay for it there.
  const { initializeApp: initAdminApp, cert, getApps } = await import("firebase-admin/app");
  const { getFirestore: getAdminFirestore } = await import("firebase-admin/firestore");

  const adminApp = getApps().length
    ? getApps()[0]
    : initAdminApp({
        credential: cert({
          projectId: firebaseConfig.projectId,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          // Service-account JSON keys store the private key with literal
          // "\n" escape sequences; .env can't hold real newlines in a
          // single-line value, so it round-trips as that literal two-char
          // sequence and has to be converted back here.
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });

  const adminDb = getAdminFirestore(adminApp);
  await adminDb.collection("users").doc(uid).update({ role: "admin" });
}

function assertEnv() {
  const missing = Object.entries(firebaseConfig)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    console.error(
      `\nMissing required .env values: ${missing.join(", ")}.\n` +
        "Fill in .env (see .env.example / guide.txt) before running this.\n"
    );
    process.exitCode = 1;
    return false;
  }
  return true;
}

async function main() {
  if (!assertEnv()) return;

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL || (await rl.question("New admin email: "));
  const password =
    process.env.ADMIN_BOOTSTRAP_PASSWORD || (await rl.question("New admin password: "));
  const name = (await rl.question("Display name [Admin]: ")) || "Admin";
  rl.close();

  let uid;
  let isNewAccount = true;

  try {
    console.log(`\nCreating account for ${email}...`);
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    uid = credential.user.uid;
    await updateProfile(credential.user, { displayName: name });
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      console.log("That account already exists — signing in instead...");
      const credential = await signInWithEmailAndPassword(auth, email, password);
      uid = credential.user.uid;
      isNewAccount = false;
    } else {
      throw error;
    }
  }

  const userRef = doc(db, "users", uid);
  const existingDoc = await getDoc(userRef);

  if (!existingDoc.exists()) {
    // Brand-new profile doc: firestore.rules requires role == "customer"
    // on self-creation, so this is the only role a fresh doc can be
    // written with from the client SDK.
    await setDoc(userRef, {
      name,
      email,
      phone: "",
      role: "customer",
      createdAt: serverTimestamp(),
    });
    console.log("Firestore profile created (role: customer).");
  } else {
    console.log(
      `Firestore profile already exists (current role: ${existingDoc.data().role}).`
    );
  }

  if (hasServiceAccount) {
    console.log("Service-account credentials found — promoting via the Admin SDK...");
    await promoteViaAdminSdk(uid);
    console.log(
      `\n${isNewAccount ? "Account created" : "Signed in"} and promoted to admin.\n\n` +
        `Log into the app with this email/password — the admin panel is now at /admin.\n`
    );
    return;
  }

  const consoleLink = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/data/~2Fusers~2F${uid}`;

  console.log(
    `\n${isNewAccount ? "Account created" : "Signed in"}. One manual step left ` +
      `(set FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY in .env to skip this next time):\n\n` +
      `  1. Open: ${consoleLink}\n` +
      `  2. Click the "role" field, change its value from "customer" to "admin", and save.\n` +
      `  3. Log into the app with this email/password — the admin panel is now at /admin.\n`
  );
}

main()
  .then(() => {
    if (process.exitCode === undefined) process.exitCode = 0;
  })
  .catch((error) => {
    console.error("\nFailed:", error.message || error);
    process.exitCode = 1;
  })
  .finally(() => {
    // See scripts/seedProducts.js for why this isn't a bare process.exit().
    setTimeout(() => process.exit(process.exitCode ?? 0), 300);
  });
