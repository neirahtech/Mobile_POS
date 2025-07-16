const db = require('../db');

// Helper to get payment cycle info from pay_in_terms
async function getPaymentCycle(pay_in_terms_id) {
  const [[row]] = await db.execute('SELECT paymentCycle FROM pay_in_terms WHERE id = ?', [pay_in_terms_id]);
  if (!row || !row.paymentCycle) return null;
  const [value, unit] = row.paymentCycle.split(' ');
  return { value: parseInt(value, 10), unit: unit.toLowerCase() };
}

// Helper to calculate next due date
function calculateNextDueDate(payment_date, cycle) {
  const date = new Date(payment_date);
  if (!cycle) return payment_date;
  if (cycle.unit.includes('day')) {
    date.setDate(date.getDate() + cycle.value);
  } else if (cycle.unit.includes('week')) {
    date.setDate(date.getDate() + (cycle.value * 7));
  } else if (cycle.unit.includes('month')) {
    date.setMonth(date.getMonth() + cycle.value);
  } else if (cycle.unit.includes('year')) {
    date.setFullYear(date.getFullYear() + cycle.value);
  }
  return date.toISOString().split('T')[0];
}

// Add payment and update due date
const addPayment = async (req, res) => {
  let { pay_in_terms_id, payment_date, amount, notes, branch_id } = req.body;
  // Ensure branch_id is a number
  branch_id = Number(branch_id) || null;
  try {
    const cycle = await getPaymentCycle(pay_in_terms_id);
    const next_due_date = calculateNextDueDate(payment_date, cycle);

    await db.execute(
      'INSERT INTO payment_history (pay_in_terms_id, payment_date, amount, next_due_date, notes, branch_id) VALUES (?, ?, ?, ?, ?, ?)',
      [pay_in_terms_id, payment_date, amount, next_due_date, notes || null, branch_id]
    );

    // Update due date in pay_in_terms (optionally filter by branch_id if your schema supports it)
    await db.execute(
      'UPDATE pay_in_terms SET due_date = ? WHERE id = ?',
      [next_due_date, pay_in_terms_id]
    );

    res.status(201).json({ message: 'Payment recorded successfully', next_due_date });
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({ message: 'Error recording payment', error: error.message });
  }
};

// Get payment history for a customer and branch, recalculate next_due_date for each payment
const getPaymentHistory = async (req, res) => {
  const { pay_in_terms_id } = req.params;
  const { branch_id } = req.query;
  try {
    const [rows] = await db.execute(
      'SELECT * FROM payment_history WHERE pay_in_terms_id = ? AND branch_id = ? ORDER BY payment_date ASC, id ASC',
      [pay_in_terms_id, branch_id]
    );
    // Recalculate next_due_date for each payment in order
    const cycle = await getPaymentCycle(pay_in_terms_id);
    let lastDate = null;
    const result = rows.map(payment => {
      const payment_date = payment.payment_date;
      const next_due_date = calculateNextDueDate(payment_date, cycle);
      lastDate = next_due_date;
      return {
        ...payment,
        next_due_date
      };
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ message: 'Error fetching payment history', error: error.message });
  }
};

// Delete a payment and update due date
const deletePayment = async (req, res) => {
  const { id } = req.params;
  try {
    // Get the payment to be deleted
    const [paymentRows] = await db.execute('SELECT * FROM payment_history WHERE id = ?', [id]);
    if (paymentRows.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    const payment = paymentRows[0];
    await db.execute('DELETE FROM payment_history WHERE id = ?', [id]);
    // Get the latest payment for this customer/branch to update due date
    const [latestPaymentRows] = await db.execute(
      'SELECT next_due_date FROM payment_history WHERE pay_in_terms_id = ? AND branch_id = ? ORDER BY payment_date DESC, id DESC LIMIT 1',
      [payment.pay_in_terms_id, payment.branch_id]
    );
    let newDueDate;
    if (latestPaymentRows.length > 0) {
      newDueDate = latestPaymentRows[0].next_due_date;
    } else {
      const [[customer]] = await db.execute('SELECT invoice_date FROM pay_in_terms WHERE id = ?', [payment.pay_in_terms_id]);
      newDueDate = customer.invoice_date;
    }
    await db.execute(
      'UPDATE pay_in_terms SET due_date = ? WHERE id = ?',
      [newDueDate, payment.pay_in_terms_id]
    );
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ message: 'Error deleting payment', error: error.message });
  }
};

module.exports = {
  addPayment,
  getPaymentHistory,
  deletePayment
};
