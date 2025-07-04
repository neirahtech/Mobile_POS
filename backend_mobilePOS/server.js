const express = require('express');
require('dotenv').config();
const cors = require('cors');
const db = require('./db');
const categoryRoutes = require('./routes/categoryRoutes');
const itemsRoutes = require('./routes/itemsRoutes');
const variantRoutes = require('./routes/variantRoutes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/variants', variantRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// DB Test Route
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.json({ success: true, result: rows[0].result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
