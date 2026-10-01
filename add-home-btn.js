const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// Add Home link to navbar on customer, staff, staff-login pages
const pages = ['customer.html', 'staff-login.html', 'staff.html'];

pages.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Add Home as first link in navbar-links
    content = content.replace(
      '<div class="navbar-links">',
      '<div class="navbar-links">\n      <a href="/index.html">🏠 Home</a>'
    );
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Added Home button to: ${file}`);
  }
});

console.log('Done!');
