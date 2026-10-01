const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// Update HTML files
const htmlFiles = ['index.html', 'customer.html', 'staff-login.html', 'staff.html'];
const newFooter = `  <footer style="background: transparent; color: var(--text-muted); padding: 2.5rem 1.5rem; text-align: center;">
    <div style="font-weight: 500; font-size: 1.05rem; margin-bottom: 2rem;">It's Jus Marketing & Shipping - Jamaica's Package Accountability System</div>
    <div style="display: flex; align-items: center; justify-content: center; gap: 0.6rem; font-size: 0.82rem; color: #475569;">
      <span>Website designed by</span>
      <a href="https://www.instagram.com/itsjusmarketing" target="_blank" rel="noopener noreferrer">
        <img src="/ijm-logo.png" alt="It's Jus Marketing" style="height: 32px; border-radius: 4px; opacity: 0.85;">
      </a>
    </div>
  </footer>`;

htmlFiles.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/<footer[\s\S]*?<\/footer>/, newFooter);
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

// Update sw.js to force cache reload
const swPath = path.join(publicDir, 'sw.js');
if (fs.existsSync(swPath)) {
  let swContent = fs.readFileSync(swPath, 'utf8');
  swContent = swContent.replace(/its-jus-marketing-and-shipping-v4/g, 'its-jus-marketing-and-shipping-v5');
  fs.writeFileSync(swPath, swContent, 'utf8');
}

console.log('Footer updated to transparent and restored credit!');
