const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'public', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// Insert shopping banner before "How It Works"
const bannerHtml = `
  <div style="max-width: 1000px; margin: 4rem auto 0; padding: 0 1.5rem; text-align: center;">
    <img src="/shopping-banner.jpg" alt="Happy customers unboxing" style="width: 100%; border-radius: 24px; box-shadow: 0 15px 40px rgba(0,155,58,0.15);">
  </div>
  <!-- HOW IT WORKS -->`;
content = content.replace('<!-- HOW IT WORKS -->', bannerHtml);

// Update CTA section to include delivery person
const ctaRegex = /<section class="cta-section">([\s\S]*?)<\/section>/;
const newCta = `<section class="cta-section" style="display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 3rem; text-align: left;">
    <div style="max-width: 500px;">
      <h2 style="color: white; font-size: 2rem; font-weight: 700; margin-bottom: 1rem;">Ready to Submit a Package?</h2>
      <p style="color: rgba(255,255,255,0.9); margin-bottom: 2rem; font-size: 1.1rem;">Upload your receipt now and we'll track it from the US all the way to your door in Jamaica.</p>
      <a href="/customer.html" class="btn-white">Get Started</a>
    </div>
    <img src="/delivery-person.jpg" alt="Courier delivery person" style="height: 280px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
  </section>`;
content = content.replace(ctaRegex, newCta);

fs.writeFileSync(indexPath, content, 'utf8');

console.log('Added graphics to index.html');
