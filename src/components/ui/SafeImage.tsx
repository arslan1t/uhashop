"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

/**
 * <Image> that degrades to a branded placeholder instead of the browser's
 * broken-image glyph.
 *
 * Needed because product photos live on remote storage that can go away
 * wholesale: the Firebase bucket started answering 402 for every object when
 * its billing account closed, and ~187 products rendered as broken icons with
 * raw alt text sprawling over the card. A placeholder keeps the grid readable
 * while the images are being migrated, and covers the ordinary case of one
 * deleted file just as well.
 *
 * Takes the same props as next/image; `fill` and `sizes` pass straight through.
 */
export function SafeImage({ alt, className, ...props }: ImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={typeof alt === "string" ? alt : undefined}
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[rgb(var(--surface-2))] text-[rgb(var(--muted))]"
      >
        <svg viewBox="0 0 40 40" className="w-8 h-8 opacity-40" fill="none" aria-hidden="true">
          <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 25l5-6 4 4.5 3-3.5 4 5z" fill="currentColor" />
          <circle cx="15.5" cy="15" r="2" fill="currentColor" />
        </svg>
        <span className="text-[9px] font-bold uppercase tracking-wider opacity-50">
          UHA
        </span>
      </div>
    );
  }

  return (
    <Image
      {...props}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
