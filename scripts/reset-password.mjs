// Admin tool — set a new password for a user by email. No reset email needed.
//
// Usage:
//   node scripts/reset-password.mjs <email> <newPassword>
//
// If your machine intercepts TLS (the cert issue that breaks Mongo/git here),
// prefix it so the Atlas connection can complete:
//   NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/reset-password.mjs <email> <newPassword>
//
// Reads MONGODB_URI from .env.local. Hand the new password to the user; they
// can sign in with it immediately and change it later.

import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";
import { hashPassword } from "better-auth/crypto";

// Minimal .env.local loader (Node 20 doesn't auto-load it).
function loadEnv(path = ".env.local") {
  try {
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* no .env.local — rely on real env vars */
  }
}

loadEnv();

const [email, newPassword] = process.argv.slice(2);
if (!email || !newPassword) {
  console.error("Usage: node scripts/reset-password.mjs <email> <newPassword>");
  process.exit(1);
}
if (newPassword.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI (looked in .env.local and the environment).");
  process.exit(1);
}

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db("oiltrack");

  // Match email case-insensitively (better-auth stores it lowercased).
  const safe = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const user = await db.collection("user").findOne({ email: { $regex: `^${safe}$`, $options: "i" } });
  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  // account.userId is an ObjectId ref to user._id; tolerate a string just in case.
  const account = await db.collection("account").findOne({
    providerId: "credential",
    $or: [{ userId: user._id }, { userId: user._id.toString() }],
  });
  if (!account) {
    console.error(`User ${user.email} has no email/password login to reset.`);
    process.exit(1);
  }

  const hash = await hashPassword(newPassword);
  await db.collection("account").updateOne(
    { _id: account._id },
    { $set: { password: hash, updatedAt: new Date() } }
  );

  console.log(`✅ Password reset for ${user.email}. They can now sign in with the new password.`);
} catch (e) {
  console.error("Failed:", e?.message || e);
  process.exitCode = 1;
} finally {
  await client.close();
}
