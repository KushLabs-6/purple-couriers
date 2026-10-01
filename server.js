const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const basicAuth = require('express-basic-auth');
const app = express();
const port = process.env.PORT || 3000;

// ==========================================
// CONNECT TO MONGODB
// ==========================================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ==========================================
// CONNECT TO CLOUDINARY
// ==========================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage for multer (images go directly to cloud)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'its-jus-marketing-and-shipping/receipts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// ==========================================
// PACKAGE SCHEMA (MongoDB Model)
// ==========================================
const packageSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  customer: String,
  firstName: String,
  lastName: String,
  store: String,
  order: String,
  tracking: String,
  status: { type: String, default: 'Pending' },
  receivedDate: { type: String, default: 'Awaiting Dropoff' },
  step: { type: String, default: 'Waiting for courier confirmation' },
  receiptUrl: { type: String, default: null },
  viaWhatsapp: { type: Boolean, default: false },
  history: [{ status: String, date: { type: Date, default: Date.now } }],
  staffNote: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const Package = mongoose.model('Package', packageSchema);

// Middleware
// app.use(basicAuth({
//   users: { 'admin': 'admin2026' },
//   challenge: true,
//   realm: 'It's Jus Marketing and Shipping'
// }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// API ROUTES
// ==========================================

// 1. Get all packages (Staff Dashboard)
app.get('/api/packages', async (req, res) => {
  try {
    const packages = await Package.find().sort({ createdAt: -1 });
    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// 2. Track a single package (Guest Tracking)
app.get('/api/track/:query', async (req, res) => {
  const query = req.params.query.toLowerCase().trim();
  try {
    const found = await Package.findOne({
      $or: [
        { id: { $regex: new RegExp(`^${query}$`, 'i') } },
        { tracking: { $regex: new RegExp(`^${query}$`, 'i') } },
        { order: { $regex: new RegExp(`^${query}$`, 'i') } },
      ]
    });
    if (found) {
      res.json(found);
    } else {
      res.status(404).json({ error: 'Package not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// 3. Add new packages (Customer submitting receipt)
app.post('/api/packages', upload.single('receiptImage'), async (req, res) => {
  let trackingNumbers = [];
  try {
    trackingNumbers = JSON.parse(req.body.tracking);
  } catch (e) {
    trackingNumbers = [req.body.tracking];
  }

  try {
    const createdPackages = [];
    for (const trackNum of trackingNumbers) {
      const newPackage = new Package({
        id: `PC-00${Math.floor(10000 + Math.random() * 90000)}`,
        customer: `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim() || 'Guest User',
        firstName: req.body.firstName || '',
        lastName: req.body.lastName || '',
        store: req.body.store,
        order: req.body.order || '',
        tracking: trackNum,
        status: 'Pending',
        receivedDate: 'Awaiting Dropoff',
        step: 'Waiting for courier confirmation',
        receiptUrl: req.file ? req.file.path : null,
        viaWhatsapp: req.body.viaWhatsapp === 'true',
        history: [{ status: 'Receipt Submitted by Customer', date: new Date() }],
      });
      await newPackage.save();
      createdPackages.push(newPackage);
    }
    res.json(createdPackages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save package' });
  }
});

// 4. Update a package status (Staff)
app.put('/api/packages/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const stepMap = {
    'Pending':            () => 'Waiting for courier confirmation',
    'Pending Receipt':    () => 'Waiting for receipt submission',
    'Received':           (store) => `Received from ${store}. Preparing for shipment.`,
    'Shipping':           () => 'Leaving facility',
    'In Transit':         () => 'Arriving in Jamaica soon',
    'Arrived in Jamaica': () => 'Processing at customs',
    'Ready for Pickup':   () => 'Ready at Kingston Branch',
    'Delivered':          () => 'Completed',
  };

  try {
    const pkg = await Package.findOne({ id });
    if (!pkg) return res.status(404).json({ error: 'Package not found' });

    pkg.status = status;
    if (stepMap[status]) pkg.step = stepMap[status](pkg.store);
    // Push to history timeline
    pkg.history.push({ status: status === 'Received' ? `Received from ${pkg.store}` : status, date: new Date() });
    if (status === 'Received' && pkg.receivedDate === 'Awaiting Dropoff') {
      const today = new Date();
      pkg.receivedDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    await pkg.save();
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// 5. Update staff note
app.put('/api/packages/:id/note', async (req, res) => {
  try {
    const pkg = await Package.findOne({ id: req.params.id });
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    pkg.staffNote = req.body.staffNote || '';
    await pkg.save();
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// 6. DELETE a package (Staff)
app.delete('/api/packages/:id', async (req, res) => {
  try {
    await Package.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete package' });
  }
});

// 6. Staff Login
app.post('/api/staff/login', (req, res) => {
  const { password } = req.body;
  const staffPassword = process.env.STAFF_PASSWORD || 'admin2026';
  if (password === staffPassword) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Incorrect password' });
  }
});

// Serve homepage as root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`It's Jus Marketing and Shipping app listening on port ${port}`);
});
