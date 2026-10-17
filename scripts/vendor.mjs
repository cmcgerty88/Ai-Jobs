import { mkdir, copyFile, writeFile } from 'node:fs/promises';

// Commit these copies so GitHub Pages never needs a CDN or a build service.
await mkdir('vendor/pdfjs', { recursive: true });
await mkdir('vendor/fflate', { recursive: true });
for (const name of ['pdf.mjs', 'pdf.worker.mjs']) {
  await copyFile(`node_modules/pdfjs-dist/build/${name}`, `vendor/pdfjs/${name}`);
}
await copyFile('node_modules/pdfjs-dist/LICENSE', 'vendor/pdfjs/LICENSE');
await copyFile('node_modules/fflate/esm/browser.js', 'vendor/fflate/browser.mjs');
await copyFile('node_modules/fflate/LICENSE', 'vendor/fflate/LICENSE');
await writeFile('vendor/README.md', '# Bundled CV readers\n\nPDF.js 6.4.299 (Apache-2.0) and fflate 0.8.3 (MIT) are bundled locally. See their adjacent licence files.\n\nDOCX reading extracts only the main document XML with fflate and the browser XML parser. It does not render document HTML or follow external relationships.\n\nRefresh from the integrity-checked lockfile with `npm ci --ignore-scripts` followed by `npm run vendor`. No CDN requests are made when a candidate opens a CV.\n');
console.log('Bundled locally hosted PDF and DOCX readers, with licences.');
