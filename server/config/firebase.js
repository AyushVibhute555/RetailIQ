import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
    // 1. ADDED THIS LINE: Tells Firebase where to store the images
    storageBucket: "retailiq-prod.appspot.com",
  });

  console.log(" Firebase Admin initialized");
}

// 2. ADDED THIS LINE: Exports the bucket so your product controller can use it
export const bucket = admin.storage().bucket();

export default admin;