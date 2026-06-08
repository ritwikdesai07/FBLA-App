/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

// Minimal text-to-PDF renderer using standard PDF Type1 fonts.
// Produces a readable, monospaced, multi-page PDF without external deps.

const letter = { w: 612, h: 792 }; // points
const margin = 54; // 0.75in
const fontSize = 9;
const leading = Math.round(fontSize * 1.25);
const maxChars = Math.floor((letter.w - margin * 2) / (fontSize * 0.6)); // Courier ~= 600 units/1000

const escPdfString = (s) =>
  s
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r/g, '');

const wrapLine = (line) => {
  if (line.length <= maxChars) return [line];
  const out = [];
  let i = 0;
  while (i < line.length) {
    out.push(line.slice(i, i + maxChars));
    i += maxChars;
  }
  return out;
};

const buildPdf = (text) => {
  const rawLines = text.replace(/\r\n/g, '\n').split('\n');
  const lines = rawLines.flatMap(wrapLine);
  const linesPerPage = Math.floor((letter.h - margin * 2) / leading);

  const pages = [];
  for (let i = 0; i < lines.length; i += linesPerPage) {
    pages.push(lines.slice(i, i + linesPerPage));
  }

  const objects = [];
  const addObj = (body) => {
    objects.push(body);
    return objects.length; // 1-based object number
  };

  // 1: Catalog (ref pages at 2)
  addObj('<< /Type /Catalog /Pages 2 0 R >>');

  // 2: Pages (kids filled later)
  const pagesObjNum = addObj('<< /Type /Pages /Kids [] /Count 0 >>');

  // 3: Font (Courier)
  const fontObjNum = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>');

  const pageObjNums = [];
  const contentObjNums = [];

  for (const pageLines of pages) {
    const content = [];
    content.push('BT');
    content.push(`/F1 ${fontSize} Tf`);
    content.push(`${leading} TL`);
    content.push(`${margin} ${letter.h - margin - fontSize} Td`);
    for (const l of pageLines) {
      content.push(`(${escPdfString(l)}) Tj`);
      content.push('T*');
    }
    content.push('ET');
    const contentStream = content.join('\n');
    const contentObj = `<< /Length ${Buffer.byteLength(contentStream, 'utf8')} >>\nstream\n${contentStream}\nendstream`;
    const contentNum = addObj(contentStream.length ? contentObj : '<< /Length 0 >>\nstream\n\nendstream');
    contentObjNums.push(contentNum);

    const pageObj = [
      '<< /Type /Page',
      `/Parent ${pagesObjNum} 0 R`,
      `/MediaBox [0 0 ${letter.w} ${letter.h}]`,
      `/Resources << /Font << /F1 ${fontObjNum} 0 R >> >>`,
      `/Contents ${contentNum} 0 R`,
      '>>',
    ].join(' ');
    const pageNum = addObj(pageObj);
    pageObjNums.push(pageNum);
  }

  // Patch Pages object with Kids and Count
  objects[pagesObjNum - 1] = `<< /Type /Pages /Kids [${pageObjNums.map((n) => `${n} 0 R`).join(' ')}] /Count ${pageObjNums.length} >>`;

  // Build file with xref
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefStart = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += `0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return Buffer.from(pdf, 'utf8');
};

const main = () => {
  const inPath = process.argv[2] || path.join(process.cwd(), 'FBLA', 'TECHNICAL_LAYER.txt');
  const outPath = process.argv[3] || path.join(process.cwd(), 'FBLA', 'TECHNICAL_LAYER.pdf');

  const text = fs.readFileSync(inPath, 'utf8');
  const pdf = buildPdf(text);
  fs.writeFileSync(outPath, pdf);

  console.log(`Wrote: ${outPath}`);
  console.log(`Bytes: ${pdf.length}`);
};

main();

