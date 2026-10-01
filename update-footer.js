const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// Update style.css
const cssPath = path.join(publicDir, 'style.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');
cssContent = cssContent.replace(
  /footer\s*\{\s*background:\s*#000000;\s*color:\s*#[0-9a-fA-F]+;\s*padding:\s*2\.5rem 1\.5rem;\s*text-align:\s*center;\s*\}/,
  'footer { background: var(--primary-dark); color: white; padding: 2.5rem 1.5rem; text-align: center; font-weight: 500; font-size: 1.1rem; }'
);
fs.writeFileSync(cssPath, cssContent, 'utf8');

// Update HTML files
const htmlFiles = ['index.html', 'customer.html', 'staff-login.html', 'staff.html'];
const newFooter = `  <footer>
    <div>It's Jus Marketing & Shipping - Jamaica's Package Accountability System</div>
  </footer>`;

htmlFiles.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // regex to replace <footer>...</footer>
    content = content.replace(/<footer>[\s\S]*?<\/footer>/, newFooter);
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

// Update sw.js to force cache reload
const swPath = path.join(publicDir, 'sw.js');
if (fs.existsSync(swPath)) {
  let swContent = fs.readFileSync(swPath, 'utf8');
  swContent = swContent.replace(/its-jus-marketing-and-shipping-v3/g, 'its-jus-marketing-and-shipping-v4');
  fs.writeFileSync(swPath, swContent, 'utf8');
}

console.log('Footer updated!');
