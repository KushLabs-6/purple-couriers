const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');
let serverContent = fs.readFileSync(serverPath, 'utf8');

// Replace standard multer route with error-handling middleware
const oldRoute = `app.post('/api/packages', upload.single('receiptImage'), async (req, res) => {`;
const newRoute = `app.post('/api/packages', (req, res, next) => {
  upload.single('receiptImage')(req, res, function (err) {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ error: 'Image upload failed. Check Cloudinary settings on Render.' });
    }
    next();
  });
}, async (req, res) => {`;

serverContent = serverContent.replace(oldRoute, newRoute);

fs.writeFileSync(serverPath, serverContent, 'utf8');

const customerPath = path.join(__dirname, 'public', 'customer.html');
let customerContent = fs.readFileSync(customerPath, 'utf8');

// Replace standard alert with dynamic alert
const oldAlert = `alert('Error submitting receipt. If uploading an image, make sure it is under 5MB.');`;
const newAlert = `const errData = await res.json().catch(()=>({})); alert(errData.error || 'Error submitting receipt. Please check server logs.');`;

customerContent = customerContent.replace(oldAlert, newAlert);

fs.writeFileSync(customerPath, customerContent, 'utf8');
console.log('Updated error handling');
