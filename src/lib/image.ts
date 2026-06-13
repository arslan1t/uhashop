/**
 * Client-side image compression. Resizes to a max dimension and re-encodes as
 * JPEG so uploads stay well under Vercel's ~4.5MB serverless body limit — a raw
 * phone photo (8–12MB) would otherwise make the upload request fail outright,
 * which is why some uploaded set/avatar photos never appeared.
 *
 * Browser-only (uses Image + canvas). Falls back to the original file if the
 * browser can't decode it.
 */
export function compressImage(file: File, max = 1800, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !file.type.startsWith("image/")) {
      resolve(file);
      return;
    }
    const img = new window.Image();
    const blobUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(blobUrl);
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > max || h > max) {
        if (w > h) { h = Math.round((h * max) / w); w = max; }
        else { w = Math.round((w * max) / h); h = max; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) =>
          resolve(
            blob
              ? new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" })
              : file,
          ),
        "image/jpeg",
        quality,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(blobUrl); resolve(file); };
    img.src = blobUrl;
  });
}
