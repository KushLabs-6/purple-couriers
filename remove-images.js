const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'public', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// Remove the shopping banner
content = content.replace(
  /<div style="max-width: 1000px; margin: 4rem auto 0; padding: 0 1\.5rem; text-align: center;">\s*<img src="\/shopping-banner\.jpg"[^>]*>\s*<\/div>/g,
  ''
);

// Restore CTA section to original without the delivery person
const ctaRegex = /<section class="cta-section" style="[^"]*">([\s\S]*?)<\/section>/;
const originalCta = `<section class="cta-section">
    <h2>Ready to Submit a Package?</h2>
    <p>Upload your receipt now and we'll track it from here to your door.</p>
    <a href="/customer.html" class="btn-white">Get Started</a>
  </section>`;
content = content.replace(ctaRegex, originalCta);

fs.writeFileSync(indexPath, content, 'utf8');
console.log('Removed bad images');
