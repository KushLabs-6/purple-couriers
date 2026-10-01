const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'public', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// Replace the broken plane SVG with a clean Material Design airplane SVG
const badPlaneRegex = /<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var\(--primary\)" stroke-width="2"[^>]*><path d="M17\.8 19\.2 16 11l3\.5-3\.5[^>]*><\/path><\/svg>/;

const goodPlaneSvg = `<svg width="40" height="40" viewBox="0 0 24 24" fill="var(--primary)" stroke="none"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`;

content = content.replace(badPlaneRegex, goodPlaneSvg);

fs.writeFileSync(indexPath, content, 'utf8');
console.log('Fixed plane icon');
