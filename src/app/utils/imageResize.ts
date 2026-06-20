import { logger } from '../../shared/logger';

/** Longest-side cap (px) applied to client-side resized photos. */
export const MAX_CLIENT_DIM = 1920;

/** How much of the file head to read when probing for intrinsic dimensions. */
const HEADER_BYTES = 64 * 1024;

/**
 * Read the intrinsic pixel dimensions of an image from its file header without
 * decoding the pixels. Supports PNG, JPEG and WebP — the formats we accept that
 * a browser canvas can decode. Returns null if the format is unknown or the
 * header is truncated/malformed, in which case callers should fall back to a
 * full decode.
 *
 * For JPEG the dimensions are the encoded (pre-EXIF-orientation) size; that is
 * fine for a longest-side cap because max(width, height) is invariant under the
 * 90° orientation swaps.
 */
export function readImageSize(buffer: ArrayBuffer): { width: number; height: number } | null {
    const view = new DataView(buffer);
    const len = view.byteLength;
    if (len < 24) return null;

    // PNG — 8-byte signature, then IHDR with width@16, height@20 (big-endian).
    if (view.getUint32(0) === 0x89504e47 && view.getUint32(4) === 0x0d0a1a0a) {
        return { width: view.getUint32(16), height: view.getUint32(20) };
    }

    // JPEG — SOI (0xFFD8), then walk the marker segments looking for a SOFn.
    if (view.getUint16(0) === 0xffd8) {
        let offset = 2;
        while (offset + 9 < len) {
            if (view.getUint8(offset) !== 0xff) {
                offset++;
                continue;
            }
            let marker = view.getUint8(offset + 1);
            // Collapse runs of padding 0xFF bytes between segments.
            while (marker === 0xff && offset + 2 < len) {
                offset++;
                marker = view.getUint8(offset + 1);
            }
            // Standalone markers carry no length: SOI/EOI, RSTn, TEM.
            if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
                offset += 2;
                continue;
            }
            const segLen = view.getUint16(offset + 2);
            // SOFn markers (0xC0–0xCF) hold the frame size, except DHT (C4),
            // JPG (C8) and DAC (CC) which are not start-of-frame.
            if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
                if (offset + 9 > len) return null;
                const height = view.getUint16(offset + 5);
                const width = view.getUint16(offset + 7);
                return { width, height };
            }
            offset += 2 + segLen;
        }
        return null;
    }

    // WebP — "RIFF"...."WEBP", then a VP8 / VP8L / VP8X chunk.
    if (view.getUint32(0) === 0x52494646 && view.getUint32(8) === 0x57454250 && len >= 30) {
        const fourcc = view.getUint32(12);
        if (fourcc === 0x56503820) {
            // 'VP8 ' lossy: 14-bit dims (LE) after the 0x9d012a start code.
            const width = view.getUint16(26, true) & 0x3fff;
            const height = view.getUint16(28, true) & 0x3fff;
            return { width, height };
        }
        if (fourcc === 0x5650384c) {
            // 'VP8L' lossless: 14-bit width-1 / height-1 packed after the 0x2f sig.
            const b0 = view.getUint8(21);
            const b1 = view.getUint8(22);
            const b2 = view.getUint8(23);
            const b3 = view.getUint8(24);
            const width = 1 + (((b1 & 0x3f) << 8) | b0);
            const height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
            return { width, height };
        }
        if (fourcc === 0x56503858) {
            // 'VP8X' extended: 24-bit canvas width-1 / height-1 (LE).
            const width = 1 + (view.getUint8(24) | (view.getUint8(25) << 8) | (view.getUint8(26) << 16));
            const height = 1 + (view.getUint8(27) | (view.getUint8(28) << 8) | (view.getUint8(29) << 16));
            return { width, height };
        }
    }

    return null;
}

/**
 * Resize an image to at most `maxDim` on its longest side and re-encode as JPEG.
 *
 * - HEIC files are returned unchanged — browsers can't decode them via canvas.
 * - Images already within `maxDim` are returned unchanged (no decode/re-encode).
 *   We try a cheap header probe first so already-small images skip decoding
 *   entirely; otherwise the post-decode dimensions are used.
 * - EXIF orientation is baked into the pixels (`imageOrientation: 'from-image'`)
 *   so the re-encoded JPEG, which has no EXIF, is displayed the right way up.
 * - Falls back to the original file on any error.
 */
export async function resizeImageFile(
    file: File,
    maxDim: number = MAX_CLIENT_DIM,
): Promise<{ blob: Blob; contentType: string }> {
    if (file.type === 'image/heic') {
        return { blob: file, contentType: file.type };
    }

    // Fast path: read dimensions from the header and skip all work if the image
    // is already small enough. Decoding a 12MP photo just to discard it is the
    // single most expensive thing we can avoid here.
    try {
        const head = await file.slice(0, HEADER_BYTES).arrayBuffer();
        const size = readImageSize(head);
        if (size && size.width <= maxDim && size.height <= maxDim) {
            return { blob: file, contentType: file.type };
        }
    } catch {
        // Header unreadable — fall through to the decode path.
    }

    try {
        const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
        const { width, height } = bitmap;

        if (width <= maxDim && height <= maxDim) {
            bitmap.close();
            return { blob: file, contentType: file.type };
        }

        let newW = width;
        let newH = height;
        if (width > height) {
            newW = maxDim;
            newH = Math.round((height * maxDim) / width);
        } else {
            newH = maxDim;
            newW = Math.round((width * maxDim) / height);
        }

        const canvas = document.createElement('canvas');
        canvas.width = newW;
        canvas.height = newH;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(bitmap, 0, 0, newW, newH);
        bitmap.close();

        const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/jpeg', 0.85);
        });
        return { blob, contentType: 'image/jpeg' };
    } catch (err) {
        logger.warn('Photo resize failed, uploading original', err);
        return { blob: file, contentType: file.type };
    }
}
