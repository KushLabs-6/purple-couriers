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
  if (file === __filename || file.endsWith('.png') || file.endsWith('.jpg')) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace texts
  content = content.replace(/It's Just Marketing and Shipping/g, "It's Jus Marketing and Shipping");
  content = content.replace(/its-just-marketing-and-shipping/g, 'its-jus-marketing-and-shipping');
  content = content.replace(/ItsJustMarketingAndShipping/g, 'ItsJusMarketingAndShipping');
  
  // Update sw.js cache name just in case to force reload
  if (file.endsWith('sw.js')) {
    content = content.replace(/its-just-marketing-and-shipping-v2/g, 'its-jus-marketing-and-shipping-v3');
  }

  fs.writeFileSync(file, content, 'utf8');
});

console.log('Done fixing spelling!');
