const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Ensure uploads directory exists (Git ignores empty folders)
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Setup Multer for image uploads (limit to 5MB)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '-'))
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// THE "BRAIN" (In-Memory Database Prototype)
let packages = [
  { id: 'PC-0045821', customer: 'John Brown', store: 'Amazon', tracking: '1Z123456', status: 'Received', receivedDate: 'Sept 27', step: 'Received from Amazon. Preparing for shipment.', receiptUrl: null },
  { id: 'PC-0045822', customer: 'Sarah Williams', store: 'Shein', tracking: 'SH123456', status: 'In Transit', receivedDate: 'Sept 27', step: 'Arriving in Jamaica soon', receiptUrl: null },
  { id: 'PC-0045800', customer: 'Kevin Smith', store: 'eBay', tracking: '789123', status: 'Ready for Pickup', receivedDate: 'Sept 26', step: 'Ready at Kingston Branch', receiptUrl: null }
];

// --- API ROUTES ---

// 1. Get all packages (For Staff Dashboard)
app.get('/api/packages', (req, res) => {
  res.json(packages);
});

// 2. Track a single package (For Customer Guest Tracking)
app.get('/api/track/:query', (req, res) => {
  const query = req.params.query.toLowerCase().trim();
  const found = packages.find(p => 
    p.id.toLowerCase() === query || 
    p.tracking.toLowerCase() === query ||
    (p.order && p.order.toLowerCase() === query)
  );
  if (found) {
    res.json(found);
  } else {
    res.status(404).json({ error: 'Package not found' });
  }
});

// 3. Add new packages WITH receipt image (Customer submitting receipt)
app.post('/api/packages', upload.single('receiptImage'), (req, res) => {
  let trackingNumbers = [];
  try {
    trackingNumbers = JSON.parse(req.body.tracking);
  } catch(e) {
    trackingNumbers = [req.body.tracking]; // Fallback just in case
  }

  const createdPackages = [];

  trackingNumbers.forEach(trackNum => {
    const newPackage = {
      id: `PC-00${Math.floor(10000 + Math.random() * 90000)}`,
      customer: `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim() || 'Guest User',
      firstName: req.body.firstName || '',
      lastName: req.body.lastName || '',
      store: req.body.store,
      order: req.body.order || '',
      tracking: trackNum,
      status: 'Pending Receipt',
      receivedDate: 'Awaiting Dropoff',
      step: 'Waiting for courier confirmation',
      receiptUrl: req.file ? `/uploads/${req.file.filename}` : null,
      viaWhatsapp: req.body.viaWhatsapp === 'true'
    };
    packages.unshift(newPackage);
    createdPackages.push(newPackage);
  });
  
  res.json(createdPackages);
});

// 4. Update a package status (Staff updating the journey)
app.put('/api/packages/:id/status', (req, res) => {
  const packageId = req.params.id;
  const newStatus = req.body.status;
  
  const pkg = packages.find(p => p.id === packageId);
  if (pkg) {
    pkg.status = newStatus;
    if(newStatus === 'Received') pkg.step = `Received from ${pkg.store}. Preparing for shipment.`;
    if(newStatus === 'Shipping') pkg.step = 'Leaving facility';
    if(newStatus === 'In Transit') pkg.step = 'Arriving in Jamaica soon';
    if(newStatus === 'Arrived in Jamaica') pkg.step = 'Processing at customs';
    if(newStatus === 'Ready for Pickup') pkg.step = 'Ready at Kingston Branch';
    if(newStatus === 'Delivered') pkg.step = 'Completed';
    
    if(newStatus === 'Received' && pkg.receivedDate === 'Awaiting Dropoff') {
       pkg.receivedDate = 'Today';
    }
    res.json(pkg);
  } else {
    res.status(404).json({ error: 'Package not found' });
  }
});

// Fallback to customer dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'customer.html'));
});

app.listen(port, () => {
  console.log(`Purple Couriers app listening on port ${port}`);
});
