const express = require('express');
const app = express();
app.use(express.json()); // <-- Add this line at the top, before routes

const itemsRouter = require('./routes/items');
app.use('/', itemsRouter);
// Only mount GRN routes at /api/grn
app.use('/api/grn', require('./routes/grnRoutes'));

module.exports = app;