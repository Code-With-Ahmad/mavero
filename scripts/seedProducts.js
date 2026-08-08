/**
 * Seeds Firestore with sample categories and products, uploading each
 * product/category image to Cloudinary (via a remote-URL fetch through the
 * unsigned upload preset) so seed data lives on the same CDN as real admin
 * uploads — nothing hardcoded to local files.
 *
 * Usage: npm run seed
 * Requires: a filled-in .env (Firebase + Cloudinary), and an existing
 * account promoted to role "admin" in Firestore (see README "Making your
 * account an admin"). You'll be prompted for that admin's email/password so
 * the writes are authenticated and pass firestore.rules.
 */
import "dotenv/config";
import readline from "node:readline/promises";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { CATEGORIES, PRODUCTS, buildVariants } from "./seedData.js";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const CLOUD_NAME = process.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.VITE_CLOUDINARY_UPLOAD_PRESET;

function assertEnv() {
  const missing = Object.entries({ ...firebaseConfig, CLOUD_NAME, UPLOAD_PRESET })
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    console.error(
      `\nMissing required .env values: ${missing.join(", ")}.\n` +
        "Fill in .env (see .env.example / guide.txt) before seeding.\n"
    );
    process.exit(1);
  }
}

async function uploadRemoteImage(sourceUrl, folder) {
  const params = new URLSearchParams({
    file: sourceUrl,
    upload_preset: UPLOAD_PRESET,
    folder,
  });
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: params }
  );
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Cloudinary upload failed (${response.status}): ${body}`);
  }
  const data = await response.json();
  return data.secure_url;
}

function picsumUrl(seed, width = 900, height = 1100) {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

async function main() {
  assertEnv();

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const email = await rl.question("Admin email: ");
  const password = await rl.question("Admin password: ");
  rl.close();

  console.log(`\nSigning in as ${email}...`);
  await signInWithEmailAndPassword(auth, email, password);
  console.log("Signed in. Note: this script trusts firestore.rules to reject the writes below if this account is not role=admin.\n");

  console.log("Seeding categories...");
  for (const category of CATEGORIES) {
    process.stdout.write(`  - ${category.name}... `);
    const imageUrl = await uploadRemoteImage(
      picsumUrl(category.imageSeed, 1200, 800),
      "categories"
    );
    await setDoc(doc(db, "categories", category.slug), {
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: imageUrl,
      createdAt: serverTimestamp(),
    });
    console.log("done");
  }

  console.log("\nSeeding products...");
  for (const product of PRODUCTS) {
    process.stdout.write(`  - ${product.name}... `);
    const imageUrl = await uploadRemoteImage(
      picsumUrl(product.imageSeed),
      "products"
    );
    const secondImageUrl = await uploadRemoteImage(
      picsumUrl(`${product.imageSeed}-2`),
      "products"
    );

    const variants = buildVariants(product);
    const totalStock = variants.length
      ? variants.reduce((sum, v) => sum + v.stock, 0)
      : 15 + Math.floor(Math.random() * 20);

    await setDoc(doc(db, "products", product.sku), {
      sku: product.sku,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      salePrice: product.salePrice || null,
      tags: product.tags,
      images: [imageUrl, secondImageUrl],
      variants,
      stock: totalStock,
      featured: !!product.featured,
      status: "active",
      soldCount: 0,
      createdAt: serverTimestamp(),
    });
    console.log("done");
  }

  console.log(
    `\nSeed complete: ${CATEGORIES.length} categories, ${PRODUCTS.length} products.\n`
  );
}

main()
  .then(() => {
    process.exitCode = 0;
  })
  .catch((error) => {
    console.error("\nSeed failed:", error.message || error);
    process.exitCode = 1;
  })
  .finally(() => {
    // Firebase Auth/Firestore leave background handles (token-refresh
    // timers, the readline stdin interface) open in Node. Exiting
    // immediately races their teardown and crashes on Windows
    // ("Assertion failed: ...UV_HANDLE_CLOSING..."). Give pending handles
    // a beat to settle, then force-exit as a fallback in case any of
    // those handles would otherwise keep the process alive forever.
    setTimeout(() => process.exit(process.exitCode ?? 0), 300);
  });
