/**
 * Product image upload — saves to Firebase Storage (permanent, cross-device).
 * Returns Firebase Storage download URLs.
 */
import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

function getFirebaseStorageServer() {
  const cfg = {
    apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };
  const app = getApps().length > 0 ? getApp() : initializeApp(cfg);
  return getStorage(app);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const slug  = formData.get("slug") as string;
    const files = formData.getAll("files") as File[];

    if (!slug || !files.length) {
      return NextResponse.json({ error: "slug and files required" }, { status: 400 });
    }

    const storage = getFirebaseStorageServer();
    const urls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const buffer = Buffer.from(await file.arrayBuffer());
      const storageRef = ref(storage, `product-images/${slug}/${i + 1}.${ext}`);
      await uploadBytes(storageRef, buffer, { contentType: file.type || "image/jpeg" });
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    }

    return NextResponse.json({ paths: urls });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
