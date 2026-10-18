import { mkdir, copyFile, writeFile, readFile } from 'node:fs/promises';

// Commit these copies so GitHub Pages never needs a CDN or a build service.
await mkdir('vendor/pdfjs', { recursive: true });
await mkdir('vendor/fflate', { recursive: true });
for (const name of ['pdf.mjs', 'pdf.worker.mjs']) {
  await copyFile(`node_modules/pdfjs-dist/build/${name}`, `vendor/pdfjs/${name}`);
}
await copyFile('node_modules/pdfjs-dist/LICENSE', 'vendor/pdfjs/LICENSE');
await copyFile('node_modules/fflate/esm/browser.js', 'vendor/fflate/browser.mjs');
await copyFile('node_modules/fflate/LICENSE', 'vendor/fflate/LICENSE');
for (const [folder, source, destination, licence] of [
  ['pdf-lib', 'node_modules/pdf-lib/dist/pdf-lib.esm.min.js', 'pdf-lib.mjs', 'node_modules/pdf-lib/LICENSE.md']
]) {
  await mkdir(`vendor/${folder}`, { recursive: true });
  await copyFile(source, `vendor/${folder}/${destination}`);
  await copyFile(licence, `vendor/${folder}/LICENSE`);
}
await mkdir('vendor/fontkit', { recursive: true });
await copyFile('node_modules/pako/LICENSE', 'vendor/fontkit/pako-LICENSE');
// Use the self-contained UMD bundle (the upstream ESM file imports bare pako).
// Expose it as a local module without retaining a global reference.
const fontkit = (await readFile('node_modules/@pdf-lib/fontkit/dist/fontkit.umd.min.js', 'utf8')).replace('}(this,', '}(globalThis,');
await writeFile('vendor/fontkit/fontkit.mjs', fontkit + '\nconst bundledFontkit = globalThis.fontkit; delete globalThis.fontkit; export default bundledFontkit;\n');
await writeFile('vendor/README.md', `# Bundled document tools

PDF.js 6.4.299 (Apache-2.0), fflate 0.8.3 (MIT), pdf-lib 1.17.1 (MIT) and @pdf-lib/fontkit 1.1.1 (MIT) are bundled locally with adjacent licences. They load only from this site; no CDN is used.

DOCX reading extracts main-document XML only and never follows external relationships. DOCX writing creates a plain, single-column Word document. PDF writing embeds a local font with a text mapping so text can be selected and extracted.

Refresh JavaScript from the integrity-checked lockfile with npm ci --ignore-scripts followed by npm run vendor. The fontkit licence attribution note is separately checked in because upstream supplies its MIT declaration only in package metadata and README. The separately checked-in DejaVu Sans font is from the system fonts-dejavu-core package (2.37), sourced from https://dejavu-fonts.github.io/. Its Bitstream Vera licence and public-domain DejaVu changes are described in fonts/LICENSE. The font stays checked in when JavaScript is refreshed.
`);
console.log('Bundled local document readers and writers, with licences.');
