const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const itemsRoutes = require('./routes/itemsRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const variantRoutes = require('./routes/variantRoutes');
const authRoutes = require('./routes/authRoutes');
const grnRoutes = require('./routes/grnRoutes');
const customerRoutes = require('./routes/customerRoutes');
const payInTermsRoutes = require('./routes/payInTermsRoutes');
const returnsRefundsRoutes = require('./routes/returnsRefundsRoutes');
const discountRoutes = require('./routes/discountRoutes');
const salesRoutes = require('./routes/salesRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const purchaseReturnRoutes = require('./routes/purchaseReturnRoutes');
const debtorStatementRoutes = require('./routes/debtorStatementRoutes');


const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register expense routes BEFORE body parsers (for multer)
app.use('/api/expenses', expenseRoutes);
// Move express.json() and express.urlencoded() BEFORE all other routes!
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/discounts', discountRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/pay-in-terms', payInTermsRoutes);
app.use('/api/returns-refunds', returnsRefundsRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/purchase-returns', purchaseReturnRoutes);
app.use('/api/debtor-statements', debtorStatementRoutes);

// Routes
app.use('/api/items', itemsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/grn', grnRoutes); // <-- FIXED: added leading slash

app.use('/api', salesRoutes);

const itemsRouter = require('./routes/items');
app.use('/', itemsRouter);

// Error handling middleware (should be after all routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal server error',
    error: err.message
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
