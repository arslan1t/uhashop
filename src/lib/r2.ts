/**
 * Cloudflare R2 object storage — server-only module.
 *
 * Replaces Firebase Cloud Storage, whose bucket started returning 402
 * ("billing account ... disabled in state closed") and took every uploaded
 * product photo and avatar down with it. R2 is S3-compatible, so this is the
 * AWS S3 client pointed at the account's R2 endpoint.
 *
 * Required environment variables (no NEXT_PUBLIC_ prefix except the last):
 *   R2_ACCOUNT_ID
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   R2_BUCKET
 *   NEXT_PUBLIC_R2_PUBLIC_URL   e.g. https://pub-xxxx.r2.dev (browser-visible)
 *
 * Never import this file from client-side code — it holds the secret key.
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

let _client: S3Client | null = null;

function env(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `R2: missing ${name}. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, ` +
      `R2_SECRET_ACCESS_KEY, R2_BUCKET and NEXT_PUBLIC_R2_PUBLIC_URL in ` +
      `.env.local and in Vercel → Settings → Environment Variables.`
    );
  }
  return v;
}

export function getR2(): S3Client {
  if (_client) return _client;
  _client = new S3Client({
    region: "auto",
    endpoint: `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env("R2_ACCESS_KEY_ID"),
      secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
    },
    // R2 accepts both addressing styles; path-style matches the endpoint the
    // dashboard shows and avoids per-bucket DNS surprises.
    forcePathStyle: true,
  });
  return _client;
}

/** Public URL of an object, as the browser should load it. */
export function r2PublicUrl(key: string): string {
  const base = env("NEXT_PUBLIC_R2_PUBLIC_URL").replace(/\/+$/, "");
  // Encode each segment but keep the slashes that make up the path.
  return `${base}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

/**
 * Upload a buffer and return its public URL.
 *
 * Keys are unique per upload (callers mint a uuid), so the object is immutable
 * and can be cached by the CDN forever — that is what keeps repeat views off
 * the bandwidth bill.
 */
export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await getR2().send(
    new PutObjectCommand({
      Bucket: env("R2_BUCKET"),
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return r2PublicUrl(key);
}

export const isR2Configured = () =>
  !!(process.env.R2_ACCOUNT_ID &&
     process.env.R2_ACCESS_KEY_ID &&
     process.env.R2_SECRET_ACCESS_KEY &&
     process.env.R2_BUCKET &&
     process.env.NEXT_PUBLIC_R2_PUBLIC_URL);
