const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const htmlFiles = ['index.html', 'customer.html', 'staff-login.html', 'staff.html'];

// The navbar to restore
const navbar = `  <nav class="navbar">
    <h1>It's Jus Marketing and Shipping</h1>
    <div class="navbar-links">
      <a href="/customer.html">Track / Submit</a>
      <a href="/staff-login.html">Staff Portal</a>
    </div>
  </nav>`;

htmlFiles.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Restore navbar after <body> tag
    content = content.replace('<body>', `<body>\n${navbar}`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Restored navbar in: ${file}`);
  }
});

// Fix only index.html hero badge - remove ✈️ USA ➡️ 🇯🇲 but keep the rest
const indexPath = path.join(publicDir, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');
indexContent = indexContent.replace(
  /✈️ USA ➡️ 🇯🇲 Jamaica's Package Accountability System/g,
  "📦 Jamaica's Package Accountability System"
);
fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('Fixed hero badge in index.html');

console.log('All done!');
