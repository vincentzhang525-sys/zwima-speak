import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { deflateSync } from "zlib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, "..", "public", "icons");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="96" fill="#0f172a"/>
  <path d="M128 160h256L160 352h256" stroke="#ffffff" stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="384" cy="128" r="32" fill="#627d98"/>
</svg>`;

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function writePng(filename, size) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rowSize = 1 + size * 3;
  const raw = Buffer.alloc(rowSize * size);
  const r = 15,
    g = 23,
    b = 42;

  for (let y = 0; y < size; y++) {
    const rowStart = y * rowSize;
    raw[rowStart] = 0;
    for (let x = 0; x < size; x++) {
      const px = rowStart + 1 + x * 3;
      const margin = size * 0.12;
      const inner = size - margin * 2;
      const lx = x - margin;
      const ly = y - margin;
      const inBox = lx >= 0 && ly >= 0 && lx <= inner && ly <= inner;
      const corner = size * 0.18;
      const rx =
        lx < corner ? corner - lx : lx > inner - corner ? lx - (inner - corner) : 0;
      const ry =
        ly < corner ? corner - ly : ly > inner - corner ? ly - (inner - corner) : 0;
      const inRounded = inBox && rx * rx + ry * ry <= corner * corner;

      if (inRounded) {
        raw[px] = r;
        raw[px + 1] = g;
        raw[px + 2] = b;
      } else {
        raw[px] = 255;
        raw[px + 1] = 255;
        raw[px + 2] = 255;
      }
    }
  }

  const compressed = deflateSync(raw);
  const png = Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);

  fs.writeFileSync(path.join(iconsDir, filename), png);
  console.log(`Created ${filename}`);
}

fs.mkdirSync(iconsDir, { recursive: true });
fs.writeFileSync(path.join(iconsDir, "icon.svg"), svg);

writePng("icon-192x192.png", 192);
writePng("icon-512x512.png", 512);
writePng("apple-touch-icon.png", 180);

console.log("Icons generated successfully.");
