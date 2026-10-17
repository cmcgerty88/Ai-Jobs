import { MAX_FILE_BYTES, MAX_TEXT } from './model.mjs';

function checkDocxArchive(buffer) {
  // Inspect central-directory sizes before decompression; do not trust extension alone.
  const bytes = new Uint8Array(buffer), view = new DataView(buffer);
  if (view.byteLength < 22 || view.getUint32(0, true) !== 0x04034b50) throw new Error('This does not look like a DOCX file. Export it again as DOCX or paste the text.');
  let entries = 0, total = 0;
  for (let i = 0; i + 46 <= bytes.length; i++) {
    if (view.getUint32(i, true) === 0x02014b50) {
      entries++; total += view.getUint32(i + 24, true);
      if (entries > 2000 || total > 25 * 1024 * 1024) throw new Error('This document expands to more than the supported size. Please paste the CV text instead.');
      i += 45 + view.getUint16(i + 28, true) + view.getUint16(i + 30, true) + view.getUint16(i + 32, true);
    }
  }
  if (!entries) throw new Error('The DOCX file could not be read. Please export it again or paste its text.');
}
export async function readCv(file) {
  if (!file || !file.size) throw new Error('Choose a non-empty CV file.');
  if (file.size > MAX_FILE_BYTES) throw new Error('Please use a CV smaller than 5 MB, or paste its text.');
  const extension = file.name.split('.').pop().toLowerCase();
  let value = '';
  if (extension === 'txt') value = await file.text();
  else if (extension === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    checkDocxArchive(arrayBuffer);
    const { unzipSync, strFromU8 } = await import('../vendor/fflate/browser.mjs');
    const archive = unzipSync(new Uint8Array(arrayBuffer), { filter: entry => entry.name === 'word/document.xml' });
    if (!archive['word/document.xml']) throw new Error('This file does not contain a readable Word document. Please paste the CV text instead.');
    const xml = strFromU8(archive['word/document.xml']);
    if (xml.length > 25 * 1024 * 1024 || /<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('This Word document uses unsupported content. Please paste the CV text instead.');
    const document = new DOMParser().parseFromString(xml, 'application/xml');
    if (document.querySelector('parsererror') || document.documentElement.localName !== 'document') throw new Error('The Word document text is damaged or unsupported. Please paste the text instead.');
    const parts = [];
    function visit(element) {
      if (element.nodeType !== 1 || element.localName === 'del' || element.localName === 'instrText') return;
      if (element.localName === 't') { parts.push(element.textContent); return; }
      if (element.localName === 'tab') { parts.push('\t'); return; }
      if (['br', 'cr'].includes(element.localName)) { parts.push('\n'); return; }
      for (const child of element.children) visit(child);
      if (element.localName === 'p' || element.localName === 'tr') parts.push('\n');
      if (element.localName === 'tc') parts.push('\t');
    }
    visit(document.documentElement);
    value = parts.join('');
  } else if (extension === 'pdf') {
    const pdfjs = await import('../vendor/pdfjs/pdf.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('../vendor/pdfjs/pdf.worker.mjs', import.meta.url).href;
    const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false, useSystemFonts: false, disableFontFace: true });
    let pdf;
    try {
      pdf = await task.promise;
      if (pdf.numPages > 30) throw new Error('Please use a CV with no more than 30 pages, or paste the relevant text.');
      for (let n = 1; n <= pdf.numPages; n++) {
        const page = await pdf.getPage(n);
        const content = await page.getTextContent();
        value += content.items.map(item => typeof item.str === 'string' ? item.str + (item.hasEOL ? '\n' : ' ') : '').join('') + '\n\n';
        page.cleanup();
        if (value.length > MAX_TEXT) throw new Error('The CV contains too much text. Please paste only the relevant sections.');
      }
    } catch (error) {
      if (error.name === 'PasswordException') throw new Error('This PDF is password-protected. Use an unlocked copy or paste the relevant text.');
      if (error.name === 'InvalidPDFException') throw new Error('This PDF could not be read. Try a DOCX file or paste its text.');
      throw error;
    } finally { await task.destroy(); }
  } else throw new Error('Use a PDF, DOCX or TXT file. Older .doc files need to be exported as DOCX first.');
  value = value.replace(/\u0000/g, '').trim();
  if (value.length > MAX_TEXT) throw new Error('The CV contains too much text. Paste the relevant sections instead.');
  if (value.length < 20) throw new Error('There is not enough readable text. A scanned PDF may be an image; paste the CV text or use a DOCX copy.');
  return value;
}
