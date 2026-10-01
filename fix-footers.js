const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

const htmlFiles = ['index.html', 'customer.html', 'staff-login.html', 'staff.html'];

htmlFiles.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Fix any inline footer style with black background
    content = content.replace(
      /footer\s*\{[^}]*background:\s*#000000;[^}]*\}/g,
      'footer { background: transparent; color: #64748b; text-align: center; padding: 1.5rem; font-size: 0.9rem; margin-top: 3rem; }'
    );

    // Also fix index.html's full footer style block that includes padding
    content = content.replace(
      /footer \{ background: #000000; color: #94a3b8; padding: 2\.5rem 1\.5rem; text-align: center; \}/,
      'footer { background: transparent; color: #64748b; text-align: center; padding: 2.5rem 1.5rem; font-size: 0.9rem; }'
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${file}`);
  }
});

// Update sw.js cache version to force refresh
const swPath = path.join(publicDir, 'sw.js');
if (fs.existsSync(swPath)) {
  let swContent = fs.readFileSync(swPath, 'utf8');
  swContent = swContent.replace(/v\d+'/g, (match) => {
    const num = parseInt(match.replace("v","").replace("'","")) + 1;
    return `v${num}'`;
  });
  fs.writeFileSync(swPath, swContent, 'utf8');
  console.log('Updated sw.js cache version');
}

console.log('All done!');
