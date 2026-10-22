// All generation happens locally. Export bytes are deliberately unencrypted so
// employers can read them; the UI explains this before the user downloads.
const xml = value => value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
export async function makeDocx(blocks) {
  const { zipSync, strToU8 } = await import('../vendor/fflate/browser.mjs');
  const paragraphs = blocks.flatMap(b => b.text.split('\n').map(line => {
    const size = b.style === 'title' ? 36 : b.style === 'heading' ? 26 : 22;
    const bold = ['title', 'heading'].includes(b.style) ? '<w:b/>' : '';
    const keep = (['title', 'heading', 'subtitle'].includes(b.style) ? '<w:keepNext/>' : '') + (b.pageBreak ? '<w:pageBreakBefore/>' : '');
    const colour = ['title', 'heading'].includes(b.style) ? '<w:color w:val="195B48"/>' : '';
    return `<w:p><w:pPr>${keep}<w:spacing w:after="100"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>${bold}${colour}<w:sz w:val="${size}"/></w:rPr><w:t xml:space="preserve">${xml(line)}</w:t></w:r></w:p>`;
  })).join('');
  const files = {
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    'word/document.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`
  };
  return zipSync(Object.fromEntries(Object.entries(files).map(([name, value]) => [name, strToU8(value)])));
}
let fontPromise;
async function fontBytes() {
  if (!fontPromise) fontPromise = fetch(new URL('../vendor/fonts/DejaVuSans.ttf', import.meta.url), { credentials: 'omit' }).then(response => { if (!response.ok) throw new Error('The PDF font could not be loaded. Try again or download Word/text.'); return response.arrayBuffer(); }).catch(error => { fontPromise = null; throw error; });
  return fontPromise;
}
export async function makePdf(blocks, { onePage = false, pageNumberOffset = 0, totalPages = null } = {}) {
  const [{ PDFDocument, rgb }, { default: fontkit }, fontData] = await Promise.all([
    import('../vendor/pdf-lib/pdf-lib.mjs'), import('../vendor/fontkit/fontkit.mjs'), fontBytes()
  ]);
  const pdf = await PDFDocument.create(); pdf.registerFontkit(fontkit);
  pdf.setProducer('RoleBridge'); pdf.setCreator('RoleBridge'); pdf.setTitle(blocks.find(b => b.style === 'title')?.text || 'RoleBridge document'); pdf.setAuthor(''); pdf.setSubject('');
  const font = await pdf.embedFont(fontData, { subset: true });
  const supported = new Set(font.getCharacterSet());
  const clean = s => s.replace(/\t/g, '    ').replace(/\r/g, '');
  for (const b of blocks) for (const char of clean(b.text)) {
    if (char !== '\n' && !supported.has(char.codePointAt(0))) throw new Error('The PDF font cannot display a character in this document. Download Word/text to preserve it, or edit that character and retry.');
  }
  const width = 595.28, height = 841.89, margin = 50, available = width - margin * 2;
  let page, y;
  function nextPage() {
    if (onePage && pdf.getPageCount()) throw new Error('The cheat sheet is too long for one page. Shorten your inputs and try again.');
    if (pdf.getPageCount() >= 30) throw new Error('This document exceeds 30 PDF pages. Shorten it before downloading.');
    page = pdf.addPage([width, height]); y = height - margin;
  }
  function wrap(text, size) {
    const result = [];
    for (const source of clean(text).split('\n')) {
      let current = '';
      for (const word of source.split(/ +/)) {
        if (!word) continue;
        if (font.widthOfTextAtSize(current ? `${current} ${word}` : word, size) <= available) { current = current ? `${current} ${word}` : word; continue; }
        if (current) { result.push(current); current = ''; }
        for (const char of word) {
          if (font.widthOfTextAtSize(current + char, size) > available) { result.push(current); current = ''; }
          current += char;
        }
      }
      result.push(current);
    }
    return result;
  }
  nextPage();
  for (const [blockIndex, b] of blocks.entries()) {
    if (b.pageBreak && y < height - margin) nextPage();
    if (!b.text.trim()) continue;
    const size = onePage ? (b.style === 'title' ? 18 : b.style === 'heading' || b.style === 'subtitle' ? 11.5 : 10.5) : b.style === 'title' ? 19 : b.style === 'heading' ? 12 : b.style === 'subtitle' ? 12 : 10.5;
    const lineHeight = size * (onePage ? 1.3 : 1.5);
    let lines = wrap(b.text, size);
    if (onePage && b.maxLines && lines.length > b.maxLines) {
      lines = lines.slice(0, b.maxLines);
      let last = lines.at(-1);
      while (last && font.widthOfTextAtSize(last + '…', size) > available) last = Array.from(last).slice(0, -1).join('');
      lines[lines.length - 1] = last.trimEnd() + '…';
    }
    if (!onePage) {
      // Keep ordinary paragraphs/STAR worksheets intact when they fit a page.
      // A heading or sample label also stays with the following short paragraph.
      let required = lines.length * lineHeight;
      const next = blocks[blockIndex + 1];
      if (['heading', 'subtitle'].includes(b.style) && next && !next.pageBreak) {
        const nextSize = ['heading', 'subtitle'].includes(next.style) ? 12 : next.style === 'title' ? 19 : 10.5;
        required += 14 + wrap(next.text, nextSize).length * nextSize * 1.5;
      }
      if (required <= height - margin * 2 - 9 && y - required - 9 < margin) nextPage();
    }
    if (b.style === 'heading' || b.style === 'subtitle') { y -= onePage ? 4 : 9; if (y - lineHeight * Math.min(lines.length + 2, 5) < margin) nextPage(); }
    if (b.style === 'heading') page.drawLine({ start: { x: margin, y: y + 1 }, end: { x: width - margin, y: y + 1 }, thickness: 0.4, color: rgb(0.72, 0.78, 0.75) });
    for (const line of lines) {
      if (y - lineHeight < margin) nextPage();
      y -= lineHeight;
      page.drawText(line, { x: margin, y, size, font, color: ['heading', 'title'].includes(b.style) ? rgb(0.08, 0.28, 0.22) : rgb(0.08, 0.12, 0.14) });
    }
    y -= onePage ? 3 : b.style === 'title' ? 9 : 5;
  }
  for (const [index, sheet] of pdf.getPages().entries()) sheet.drawText(`RoleBridge  |  ${index + 1 + pageNumberOffset} / ${totalPages || pdf.getPageCount()}`, { x: margin, y: 30, size: 8, font, color: rgb(0.32, 0.40, 0.38) });
  return pdf.save();
}
export function downloadDocument(bytes, filename, type) {
  const blob = new Blob([bytes], { type }), url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export async function makeCheatSheetsPdf(sheets) {
  const { PDFDocument } = await import('../vendor/pdf-lib/pdf-lib.mjs');
  const merged = await PDFDocument.create();
  merged.setTitle('Pre-interview and interview-day cheat sheets'); merged.setAuthor(''); merged.setCreator('RoleBridge');
  for (const [index, blocks] of sheets.entries()) {
    const source = await PDFDocument.load(await makePdf(blocks, { onePage: true, pageNumberOffset: index, totalPages: sheets.length }));
    const [page] = await merged.copyPages(source, [0]); merged.addPage(page);
  }
  return merged.save();
}
