import { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { deflateSync, inflateSync } from "node:zlib";

const pdfText = (value) => String(value ?? "").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/[^\x20-\x7e]/g, "?");
const money = (amount) => `Rs. ${Number(amount).toLocaleString("en-IN")}`;

const paeth = (left, above, upperLeft) => {
  const prediction = left + above - upperLeft;
  const leftDistance = Math.abs(prediction - left);
  const aboveDistance = Math.abs(prediction - above);
  const upperLeftDistance = Math.abs(prediction - upperLeft);
  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) return left;
  return aboveDistance <= upperLeftDistance ? above : upperLeft;
};

function transparentPngForPdf(path) {
  const png = readFileSync(path);
  if (!png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw new Error("Receipt logo must be a PNG file.");
  let offset = 8;
  let width = 0;
  let height = 0;
  const compressed = [];
  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString("ascii", offset + 4, offset + 8);
    const data = png.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      if (data[8] !== 8 || data[9] !== 6 || data[12] !== 0) throw new Error("Receipt logo must be an 8-bit, non-interlaced RGBA PNG.");
    } else if (type === "IDAT") compressed.push(data);
    else if (type === "IEND") break;
    offset += length + 12;
  }
  if (!width || !height || !compressed.length) throw new Error("Receipt logo PNG is incomplete.");
  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  const filtered = inflateSync(Buffer.concat(compressed));
  const rgba = Buffer.alloc(stride * height);
  let sourceOffset = 0;
  for (let row = 0; row < height; row += 1) {
    const filter = filtered[sourceOffset];
    sourceOffset += 1;
    for (let column = 0; column < stride; column += 1) {
      const raw = filtered[sourceOffset + column];
      const target = row * stride + column;
      const left = column >= bytesPerPixel ? rgba[target - bytesPerPixel] : 0;
      const above = row > 0 ? rgba[target - stride] : 0;
      const upperLeft = row > 0 && column >= bytesPerPixel ? rgba[target - stride - bytesPerPixel] : 0;
      if (filter === 0) rgba[target] = raw;
      else if (filter === 1) rgba[target] = (raw + left) & 255;
      else if (filter === 2) rgba[target] = (raw + above) & 255;
      else if (filter === 3) rgba[target] = (raw + Math.floor((left + above) / 2)) & 255;
      else if (filter === 4) rgba[target] = (raw + paeth(left, above, upperLeft)) & 255;
      else throw new Error("Receipt logo uses an unsupported PNG filter.");
    }
    sourceOffset += stride;
  }
  const rgb = Buffer.alloc(width * height * 3);
  const alpha = Buffer.alloc(width * height);
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    rgb[pixel * 3] = rgba[pixel * 4];
    rgb[pixel * 3 + 1] = rgba[pixel * 4 + 1];
    rgb[pixel * 3 + 2] = rgba[pixel * 4 + 2];
    alpha[pixel] = rgba[pixel * 4 + 3];
  }
  return { width, height, rgb: deflateSync(rgb), alpha: deflateSync(alpha) };
}

export function createChandaReceiptPdf({ receiptNumber, donorName, amount, paymentMethod, donorHostel, donorEmail, collectedAt }) {
  const logo = transparentPngForPdf(join(process.cwd(), "public/community/garbaraas-mark.png"));
  const stream = [
    "q 0.96 0.94 0.89 rg 0 0 612 792 re f Q",
    "q 0.07 0.22 0.18 rg 0 580 612 212 re f Q",
    "q 52 0 0 51 48 696 cm /Im1 Do Q",
    "BT /F2 25 Tf 112 722 Td 0.96 0.94 0.89 rg (GarbaRaas 2026) Tj ET",
    "0.95 0.78 0.25 RG 0.75 w 112 710 m 320 710 l S",
    "BT /F1 8 Tf 112 697 Td 0.95 0.78 0.25 rg (IIT GUWAHATI  |  CHANDA CONTRIBUTION) Tj ET",
    "BT /F2 32 Tf 48 630 Td 0.96 0.94 0.89 rg (Thank you!) Tj ET",
    "BT /F1 12 Tf 48 600 Td 0.95 0.78 0.25 rg (A small contribution. A shared celebration.) Tj ET",
    `BT /F1 11 Tf 48 566 Td 0.36 0.46 0.43 rg (DONOR) Tj 0 -24 Td 0.07 0.22 0.18 rg (${pdfText(donorName)}) Tj ET`,
    "0.82 0.78 0.69 RG 1 w 48 526 m 564 526 l S",
    `BT /F1 11 Tf 48 502 Td 0.36 0.46 0.43 rg (CONTRIBUTION) Tj 0 -24 Td 0.77 0.17 0.09 rg (${pdfText(money(amount))}) Tj ET`,
    `BT /F1 11 Tf 48 438 Td 0.36 0.46 0.43 rg (PAYMENT METHOD) Tj 0 -24 Td 0.07 0.22 0.18 rg (${pdfText(paymentMethod === "online" ? "Online payment" : "Cash")}) Tj ET`,
    `BT /F1 11 Tf 48 374 Td 0.36 0.46 0.43 rg (DONOR HOSTEL) Tj 0 -24 Td 0.07 0.22 0.18 rg (${pdfText(donorHostel)}) Tj ET`,
    `BT /F1 11 Tf 48 310 Td 0.36 0.46 0.43 rg (RECEIPT EMAIL) Tj 0 -24 Td 0.07 0.22 0.18 rg (${pdfText(donorEmail)}) Tj ET`,
    `BT /F1 11 Tf 48 246 Td 0.36 0.46 0.43 rg (RECEIPT NUMBER) Tj 0 -24 Td 0.07 0.22 0.18 rg (${pdfText(receiptNumber)}) Tj ET`,
    `BT /F1 11 Tf 48 182 Td 0.36 0.46 0.43 rg (RECORDED) Tj 0 -24 Td 0.07 0.22 0.18 rg (${pdfText(collectedAt)}) Tj ET`,
    "0.77 0.17 0.09 RG 1 w 48 136 m 564 136 l S",
    "BT /F1 10 Tf 48 104 Td 0.36 0.46 0.43 rg (5th Edition of IITG Navratri.) Tj ET",
    "BT /F1 9 Tf 48 76 Td 0.36 0.46 0.43 rg (Queries: Yash Modi  +91 79-84223250  |  Aarsh Jain  +91 99092 01117) Tj ET",
    "BT /F1 8 Tf 48 48 Td 0.36 0.46 0.43 rg (This is a system-generated receipt for the GarbaRaas Chanda collection.) Tj ET",
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> /XObject << /Im1 7 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(stream, "ascii")} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>",
    `<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /SMask 8 0 R /Length ${logo.rgb.length} >>\nstream\n${logo.rgb.toString("binary")}\nendstream`,
    `<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode /Length ${logo.alpha.length} >>\nstream\n${logo.alpha.toString("binary")}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets = [0];
  objects.forEach((object, index) => { offsets[index + 1] = Buffer.byteLength(pdf, "binary"); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(pdf, "binary");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, "binary").toString("base64");
}
