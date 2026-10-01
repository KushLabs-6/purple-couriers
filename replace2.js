const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      if (!dirFile.includes('node_modules')) {
        filelist = walkSync(dirFile, filelist);
      }
    } else {
      if (dirFile.match(/\.(html|css|js|json)$/)) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname));

files.forEach(file => {
  if (file === __filename) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace texts
  content = content.replace(/JUS Marketing Shipping/g, "It's Just Marketing and Shipping");
  content = content.replace(/jus-marketing-shipping/g, 'its-just-marketing-and-shipping');
  content = content.replace(/JUSMarketingShipping/g, 'ItsJustMarketingAndShipping');
  
  // Specifically for the navbar to avoid breaking layout maybe use 'It's Just Marketing & Shipping' or just string
  
  // Update sw.js cache name just in case to force reload
  if (file.endsWith('sw.js')) {
    content = content.replace(/its-just-marketing-and-shipping-v1/g, 'its-just-marketing-and-shipping-v2');
    content = content.replace(/jus-marketing-shipping-v\d+/g, 'its-just-marketing-and-shipping-v2');
  }

  // Double check colors, in case they weren't saved correctly.
  
  fs.writeFileSync(file, content, 'utf8');
});

console.log('Done renaming!');
