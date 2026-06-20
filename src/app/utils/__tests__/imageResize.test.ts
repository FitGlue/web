import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../../shared/logger', () => ({ logger: { warn: vi.fn(), error: vi.fn() } }));

import { readImageSize, resizeImageFile } from '../imageResize';

// --- header builders -------------------------------------------------------

function pngHeader(width: number, height: number): ArrayBuffer {
    const b = new Uint8Array(24);
    b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
    const dv = new DataView(b.buffer);
    dv.setUint32(16, width);
    dv.setUint32(20, height);
    return b.buffer;
}

function jpegHeader(width: number, height: number, withApp0 = false): ArrayBuffer {
    const b = new Uint8Array(32);
    const dv = new DataView(b.buffer);
    let o = 0;
    dv.setUint16(o, 0xffd8); o += 2; // SOI
    if (withApp0) {
        dv.setUint16(o, 0xffe0); o += 2; // APP0
        dv.setUint16(o, 0x0004); o += 2; // length covers the next 2 bytes
        o += 2;                          // (payload)
    }
    dv.setUint16(o, 0xffc0); o += 2;     // SOF0
    dv.setUint16(o, 0x0011); o += 2;     // segment length
    dv.setUint8(o, 8); o += 1;           // precision
    dv.setUint16(o, height); o += 2;
    dv.setUint16(o, width);
    return b.buffer;
}

function webpVp8xHeader(width: number, height: number): ArrayBuffer {
    const b = new Uint8Array(30);
    const dv = new DataView(b.buffer);
    dv.setUint32(0, 0x52494646);  // RIFF
    dv.setUint32(8, 0x57454250);  // WEBP
    dv.setUint32(12, 0x56503858); // VP8X
    const w = width - 1;
    const h = height - 1;
    b[24] = w & 0xff; b[25] = (w >> 8) & 0xff; b[26] = (w >> 16) & 0xff;
    b[27] = h & 0xff; b[28] = (h >> 8) & 0xff; b[29] = (h >> 16) & 0xff;
    return b.buffer;
}

function fakeFile(type: string, header: ArrayBuffer): File {
    return {
        type,
        slice: () => ({ arrayBuffer: async () => header }),
    } as unknown as File;
}

// --- readImageSize ---------------------------------------------------------

describe('readImageSize', () => {
    it('reads PNG dimensions', () => {
        expect(readImageSize(pngHeader(800, 600))).toEqual({ width: 800, height: 600 });
    });

    it('reads JPEG dimensions from the SOF marker', () => {
        expect(readImageSize(jpegHeader(4032, 3024))).toEqual({ width: 4032, height: 3024 });
    });

    it('skips intervening JPEG segments to find the SOF marker', () => {
        expect(readImageSize(jpegHeader(1920, 1080, true))).toEqual({ width: 1920, height: 1080 });
    });

    it('reads WebP (VP8X) dimensions', () => {
        expect(readImageSize(webpVp8xHeader(2000, 1500))).toEqual({ width: 2000, height: 1500 });
    });

    it('returns null for an unknown / truncated header', () => {
        expect(readImageSize(new Uint8Array(8).buffer)).toBeNull();
        expect(readImageSize(new Uint8Array(64).buffer)).toBeNull();
    });
});

// --- resizeImageFile -------------------------------------------------------

describe('resizeImageFile', () => {
    let createImageBitmap: ReturnType<typeof vi.fn>;
    let toBlob: ReturnType<typeof vi.fn>;
    let drawImage: ReturnType<typeof vi.fn>;
    let origCreateElement: typeof document.createElement;

    beforeEach(() => {
        createImageBitmap = vi.fn();
        vi.stubGlobal('createImageBitmap', createImageBitmap);

        drawImage = vi.fn();
        toBlob = vi.fn((cb: BlobCallback) => cb(new Blob(['x'], { type: 'image/jpeg' })));
        origCreateElement = document.createElement.bind(document);
        vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
            if (tag === 'canvas') {
                return {
                    width: 0,
                    height: 0,
                    getContext: () => ({ drawImage }),
                    toBlob,
                } as unknown as HTMLCanvasElement;
            }
            return origCreateElement(tag);
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('passes HEIC through untouched without decoding', async () => {
        const file = fakeFile('image/heic', new ArrayBuffer(0));
        const out = await resizeImageFile(file);
        expect(out).toEqual({ blob: file, contentType: 'image/heic' });
        expect(createImageBitmap).not.toHaveBeenCalled();
    });

    it('skips decode entirely when the header says the image is small', async () => {
        const file = fakeFile('image/png', pngHeader(1024, 768));
        const out = await resizeImageFile(file, 1920);
        expect(out).toEqual({ blob: file, contentType: 'image/png' });
        expect(createImageBitmap).not.toHaveBeenCalled();
    });

    it('resizes and re-encodes a large image to JPEG', async () => {
        createImageBitmap.mockResolvedValue({ width: 4000, height: 3000, close: vi.fn() });
        const file = fakeFile('image/jpeg', jpegHeader(4000, 3000));
        const out = await resizeImageFile(file, 1920);
        expect(createImageBitmap).toHaveBeenCalledWith(file, { imageOrientation: 'from-image' });
        expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1920, 1440);
        expect(out.contentType).toBe('image/jpeg');
        expect(out.blob).toBeInstanceOf(Blob);
    });

    it('does not re-encode when the decoded image is already within bounds', async () => {
        // Header unreadable so we reach the decode path, but the decoded size fits.
        createImageBitmap.mockResolvedValue({ width: 800, height: 600, close: vi.fn() });
        const file = fakeFile('image/jpeg', new ArrayBuffer(64));
        const out = await resizeImageFile(file, 1920);
        expect(out).toEqual({ blob: file, contentType: 'image/jpeg' });
        expect(drawImage).not.toHaveBeenCalled();
    });

    it('falls back to the original file when decoding fails', async () => {
        createImageBitmap.mockRejectedValue(new Error('decode failed'));
        const file = fakeFile('image/jpeg', new ArrayBuffer(64));
        const out = await resizeImageFile(file);
        expect(out).toEqual({ blob: file, contentType: 'image/jpeg' });
    });
});
