const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');
let serverContent = fs.readFileSync(serverPath, 'utf8');

// Replace the generic error message with the actual error message
const oldError = `return res.status(400).json({ error: 'Image upload failed. Check Cloudinary settings on Render.' });`;
const newError = `return res.status(400).json({ error: 'Upload error: ' + (err.message || err.toString()) });`;

serverContent = serverContent.replace(oldError, newError);
fs.writeFileSync(serverPath, serverContent, 'utf8');
console.log('Updated error message to be specific');
