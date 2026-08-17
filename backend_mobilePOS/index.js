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
const storeRoutes = require('./routes/storeRoutes');
const branchRoutes = require('./routes/branchRoutes');
const userRoutes = require('./routes/userRoutes');
const billingSettingsRoutes = require('./routes/billingSettingsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const sendNotificationRoutes = require('./routes/sendNotificationRoutes');
const paymentHistoryRoutes = require('./routes/paymentHistoryRoutes');
const expenseReportRoutes = require('./routes/expenseReportRoutes');
const expenseCategoryRoutes = require('./routes/expenseCategoryRoutes');

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Serve uploaded files - this must come before body parsers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Parse JSON and urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});
app.use('/api', storeRoutes);
app.use('/api', branchRoutes); // <-- add this
// Register expense routes BEFORE body parsers (for multer)
app.use('/api/expenses', expenseRoutes);
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
app.use('/api', userRoutes);
app.use('/api', billingSettingsRoutes);
app.use('/api/notification-templates', notificationRoutes);
app.use('/api/notifications', sendNotificationRoutes);
app.use('/api/payment-history', paymentHistoryRoutes);
app.use('/api/expense-reports', expenseReportRoutes);
app.use('/api/expense-categories', expenseCategoryRoutes);

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

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
