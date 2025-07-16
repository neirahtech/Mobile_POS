const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const itemsRouter = require('./routes/items');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/items', itemsRouter);
app.use('/api/grn', require('./routes/grnRoutes'));
app.use('/api/notification-templates', notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

module.exports = app;