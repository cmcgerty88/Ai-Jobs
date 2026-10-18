# Bundled document tools

PDF.js 6.4.299 (Apache-2.0), fflate 0.8.3 (MIT), pdf-lib 1.17.1 (MIT) and @pdf-lib/fontkit 1.1.1 (MIT) are bundled locally with adjacent licences. They load only from this site; no CDN is used.

DOCX reading extracts main-document XML only and never follows external relationships. DOCX writing creates a plain, single-column Word document. PDF writing embeds a local font with a text mapping so text can be selected and extracted.

Refresh JavaScript from the integrity-checked lockfile with npm ci --ignore-scripts followed by npm run vendor. The fontkit licence attribution note is separately checked in because upstream supplies its MIT declaration only in package metadata and README. The separately checked-in DejaVu Sans font is from the system fonts-dejavu-core package (2.37), sourced from https://dejavu-fonts.github.io/. Its Bitstream Vera licence and public-domain DejaVu changes are described in fonts/LICENSE. The font stays checked in when JavaScript is refreshed.
