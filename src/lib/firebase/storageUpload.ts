/**
 * Upload product images to Firebase Storage.
 * Returns public download URLs (permanent, accessible on all devices).
 */
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseStorage } from "./config";

/**
 * Upload one file to Firebase Storage and return its download URL.
 * Path: product-images/{slug}/{index}.{ext}
 */
export async function uploadProductImage(
  file: File,
  slug: string,
  index: number
): Promise<string> {
  const storage = getFirebaseStorage();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const storageRef = ref(storage, `product-images/${slug}/${index}.${ext}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

/**
 * Upload multiple files and return all URLs in order.
 */
export async function uploadProductImages(
  files: File[],
  slug: string
): Promise<string[]> {
  const urls = await Promise.all(
    files.map((file, i) => uploadProductImage(file, slug, i + 1))
  );
  return urls;
}
