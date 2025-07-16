const db = require('../db');

// Get expense summary by category
const getExpenseSummaryByCategory = async (req, res) => {
  try {
    const { branch_id, start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        category,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM expenses
      WHERE 1=1
    `;
    
    const params = [];
    
    if (branch_id) {
      query += ' AND branch_id = ?';
      params.push(branch_id);
    }
    
    if (start_date) {
      query += ' AND date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND date <= ?';
      params.push(end_date);
    }
    
    query += ' GROUP BY category ORDER BY total_amount DESC';
    
    const [results] = await db.execute(query, params);
    res.json(results);
  } catch (err) {
    console.error('Error in getExpenseSummaryByCategory:', err);
    res.status(500).json({ message: 'Error fetching expense summary', error: err.message });
  }
};

// Get expenses by time period (daily, weekly, monthly)
const getExpensesByTimePeriod = async (req, res) => {
  try {
    const { branch_id, period = 'monthly' } = req.query;
    
    let dateFormat, groupBy;
    
    switch (period) {
      case 'daily':
        dateFormat = '%Y-%m-%d';
        groupBy = 'DATE(date)';
        break;
      case 'weekly':
        dateFormat = '%x-%v'; // Year-WeekNumber
        groupBy = 'YEARWEEK(date)';
        break;
      case 'monthly':
      default:
        dateFormat = '%Y-%m';
        groupBy = 'DATE_FORMAT(date, "%Y-%m")';
    }
    
    let query = `
      SELECT 
        ${groupBy} as period,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM expenses
      WHERE 1=1
    `;
    
    const params = [];
    
    if (branch_id) {
      query += ' AND branch_id = ?';
      params.push(branch_id);
    }
    
    query += ` GROUP BY ${groupBy} ORDER BY period DESC`;
    
    const [results] = await db.execute(query, params);
    res.json(results);
  } catch (err) {
    console.error('Error in getExpensesByTimePeriod:', err);
    res.status(500).json({ message: 'Error fetching expenses by time period', error: err.message });
  }
};

// Get branch-wise expense comparison
const getBranchWiseExpenses = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        b.name as branch_name,
        COUNT(e.id) as expense_count,
        COALESCE(SUM(e.amount), 0) as total_amount
      FROM branches b
      LEFT JOIN expenses e ON b.id = e.branch_id
    `;
    
    const params = [];
    
    if (start_date || end_date) {
      query += ' WHERE 1=1';
      if (start_date) {
        query += ' AND e.date >= ?';
        params.push(start_date);
      }
      if (end_date) {
        query += ' AND e.date <= ?';
        params.push(end_date);
      }
    }
    
    query += ' GROUP BY b.id, b.name ORDER BY total_amount DESC';
    
    const [results] = await db.execute(query, params);
    res.json(results);
  } catch (err) {
    console.error('Error in getBranchWiseExpenses:', err);
    res.status(500).json({ message: 'Error fetching branch-wise expenses', error: err.message });
  }
};

module.exports = {
  getExpenseSummaryByCategory,
  getExpensesByTimePeriod,
  getBranchWiseExpenses
};
