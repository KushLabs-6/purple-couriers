const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON data from requests
app.use(express.json());
// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// THE "BRAIN" (In-Memory Database Prototype)
// ==========================================
let packages = [
  { id: 'PC-0045821', customer: 'John Brown', store: 'Amazon', tracking: '1Z123456', status: 'Received', receivedDate: 'Sept 27', step: 'Received from Amazon. Preparing for shipment.' },
  { id: 'PC-0045822', customer: 'Sarah Williams', store: 'Shein', tracking: 'SH123456', status: 'In Transit', receivedDate: 'Sept 27', step: 'Arriving in Jamaica soon' },
  { id: 'PC-0045800', customer: 'Kevin Smith', store: 'eBay', tracking: '789123', status: 'Ready for Pickup', receivedDate: 'Sept 26', step: 'Ready at Kingston Branch' }
];

// --- API ROUTES ---

// 1. Get all packages (For Staff Dashboard & Customer Dashboard)
app.get('/api/packages', (req, res) => {
  res.json(packages);
});

// 2. Add a new package (Customer submitting receipt)
app.post('/api/packages', (req, res) => {
  const newPackage = {
    id: `PC-00${Math.floor(10000 + Math.random() * 90000)}`,
    customer: req.body.customer || 'Current User', // Hardcoded user for prototype
    store: req.body.store,
    tracking: req.body.tracking,
    status: 'Pending Receipt',
    receivedDate: 'Awaiting Dropoff',
    step: 'Waiting for courier confirmation'
  };
  // Add to the top of our database
  packages.unshift(newPackage);
  res.json(newPackage);
});

// 3. Update a package status (Staff updating the journey)
app.put('/api/packages/:id/status', (req, res) => {
  const packageId = req.params.id;
  const newStatus = req.body.status;
  
  const pkg = packages.find(p => p.id === packageId);
  if (pkg) {
    pkg.status = newStatus;
    // Auto-update the "next step" description based on status
    if(newStatus === 'Received') pkg.step = `Received from ${pkg.store}. Preparing for shipment.`;
    if(newStatus === 'Shipping') pkg.step = 'Leaving facility';
    if(newStatus === 'In Transit') pkg.step = 'Arriving in Jamaica soon';
    if(newStatus === 'Arrived in Jamaica') pkg.step = 'Processing at customs';
    if(newStatus === 'Ready for Pickup') pkg.step = 'Ready at Kingston Branch';
    if(newStatus === 'Delivered') pkg.step = 'Completed';
    
    // If it was just received, set today's date
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
