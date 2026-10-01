const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const htmlFiles = ['index.html', 'customer.html', 'staff-login.html', 'staff.html'];

htmlFiles.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Remove the entire <nav class="navbar">...</nav> block
    content = content.replace(/<nav class="navbar">[\s\S]*?<\/nav>/g, '');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Removed navbar from: ${file}`);
  }
});

console.log('All navbars removed!');
