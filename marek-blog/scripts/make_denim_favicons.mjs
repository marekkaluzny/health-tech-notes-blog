import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const outputDir = path.join(process.cwd(), 'src/assets/img/favicon');
const denim = { r: 21, g: 96, b: 189 };
const white = { r: 255, g: 255, b: 255 };

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j++) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function makePng(size) {
  const bytesPerPixel = 4;
  const rowLength = size * bytesPerPixel + 1;
  const raw = Buffer.alloc(rowLength * size, 0);

  const radius = size * 0.075;
  const gap = size * 0.11;
  const centerY = size * 0.5;
  const centerX = size * 0.5;
  const spacing = radius * 2 + gap;
  const centers = [centerX - spacing, centerX, centerX + spacing];

  for (let y = 0; y < size; y++) {
    const rowStart = y * rowLength;
    raw[rowStart] = 0;

    for (let x = 0; x < size; x++) {
      let isDot = false;
      for (const cx of centers) {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const edge = 0.6;

        if (distance <= radius - edge) {
          isDot = true;
          break;
        }
      }

      const offset = rowStart + 1 + x * bytesPerPixel;
      raw[offset] = isDot ? denim.r : white.r;
      raw[offset + 1] = isDot ? denim.g : white.g;
      raw[offset + 2] = isDot ? denim.b : white.b;
      raw[offset + 3] = 255;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const compressed = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    pngSignature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const files = [
  ['favicon-32x32.png', 32],
  ['favicon-192x192.png', 192],
  ['favicon-512x512.png', 512],
  ['apple-touch-icon.png', 180],
];

for (const [fileName, size] of files) {
  fs.writeFileSync(path.join(outputDir, fileName), makePng(size));
}

console.log('Generated denim dot favicon set');
