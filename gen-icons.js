const fs = require('fs');

// A simple 1x1 transparent purple base64 png
const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const buffer = Buffer.from(base64Png, 'base64');

fs.writeFileSync('public/icon-192.png', buffer);
fs.writeFileSync('public/icon-512.png', buffer);
console.log('Dummy icons generated');
