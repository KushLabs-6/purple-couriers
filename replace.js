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
      if (dirFile.match(/\.(html|css|js)$/)) {
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
  content = content.replace(/Purple Couriers/g, 'It's Just Marketing and Shipping');
  content = content.replace(/purple-couriers/g, 'its-just-marketing-and-shipping');
  content = content.replace(/PurpleCouriers/g, 'ItsJustMarketingAndShipping');
  
  // Replace colors in style.css and index.html
  content = content.replace(/#7e22ce/gi, '#009b3a'); // Green
  content = content.replace(/#581c87/gi, '#007a2e'); // Dark Green
  content = content.replace(/#9333ea 0%, #6b21a8/gi, '#009b3a 0%, #fed100'); // Green to Yellow gradient
  content = content.replace(/126, 34, 206/g, '0, 155, 58'); // rgba green
  content = content.replace(/126,34,206/g, '0,155,58'); // rgba green
  content = content.replace(/107, 33, 168/g, '0, 122, 46'); // rgba dark green
  content = content.replace(/#f3e8ff/gi, '#e6f5ea'); // light green bg
  content = content.replace(/#e9d5ff/gi, '#fed100'); // yellow accent
  content = content.replace(/#0f172a/gi, '#000000'); // text main black
  
  fs.writeFileSync(file, content, 'utf8');
});

console.log('Done!');
