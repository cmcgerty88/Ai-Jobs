# Bundled CV readers

PDF.js 6.4.299 (Apache-2.0) and fflate 0.8.3 (MIT) are bundled locally. See their adjacent licence files.

DOCX reading extracts only the main document XML with fflate and the browser XML parser. It does not render document HTML or follow external relationships.

Refresh from the integrity-checked lockfile with `npm ci --ignore-scripts` followed by `npm run vendor`. No CDN requests are made when a candidate opens a CV.
