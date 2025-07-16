import { useState, useEffect } from 'react';
import { EyeIcon, PencilIcon, TrashIcon, CurrencyDollarIcon, CalendarIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import api from '../utils/axios';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export default function PayInTerms({ onView, showAddForm, setShowAddForm }) {
  const [payInTermsCustomers, setPayInTermsCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    contact: '',
    creditLimit: '',
    termDuration: '',
    creditUsed: '',
    paymentCycleNumber: '',
    paymentCycleUnit: 'days',
    invoice_date: '',
    due_date: ''
  });
  const [viewCustomer, setViewCustomer] = useState(null);
  const [editCustomer, setEditCustomer] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentForm, setPaymentForm] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    amount: '',
    notes: ''
  });

  // Fetch all Pay in Terms customers from backend
  useEffect(() => {
    fetchPayInTerms();
  }, []);

  // Fetch payment history when viewing a customer
  useEffect(() => {
    if (viewCustomer?.id && viewCustomer?.branch_id) {
      fetchPaymentHistory(viewCustomer.id, viewCustomer.branch_id);
    }
  }, [viewCustomer]);

  // Fetch payment history for a customer and branch
  const fetchPaymentHistory = async (customerId, branchId) => {
    try {
      const response = await api.get(`/payment-history/${customerId}`, {
        params: { branch_id: branchId }
      });
      setPaymentHistory(response.data);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setPaymentHistory([]);
    }
  };

  const fetchPayInTerms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pay-in-terms');
      setPayInTermsCustomers(res.data);
    } catch (err) {
      setPayInTermsCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle payment form input changes
  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate next due date based on payment cycle
  const calculateNextDueDate = (paymentDate) => {
    if (!viewCustomer?.paymentCycle) return paymentDate;
    
    const date = new Date(paymentDate);
    const paymentCycle = viewCustomer.paymentCycle;
    
    // Parse the payment cycle (e.g., "30 days", "1 month")
    const [value, unit] = paymentCycle.split(' ');
    const numValue = parseInt(value, 10);
    
    if (unit.includes('day')) {
      date.setDate(date.getDate() + numValue);
    } else if (unit.includes('week')) {
      date.setDate(date.getDate() + (numValue * 7));
    } else if (unit.includes('month')) {
      date.setMonth(date.getMonth() + numValue);
    } else if (unit.includes('year')) {
      date.setFullYear(date.getFullYear() + numValue);
    }
    
    return date.toISOString().split('T')[0];
  };

  // Handle payment submission
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!viewCustomer?.id || !viewCustomer?.branch_id) return;

    try {
      await api.post('/payment-history', {
        pay_in_terms_id: viewCustomer.id,
        payment_date: paymentForm.payment_date,
        amount: parseFloat(paymentForm.amount),
        notes: paymentForm.notes,
        branch_id: viewCustomer.branch_id
      });

      // Refresh data
      fetchPayInTerms();
      fetchPaymentHistory(viewCustomer.id, viewCustomer.branch_id);

      // Reset form and close modal
      setPaymentForm({
        payment_date: new Date().toISOString().split('T')[0],
        amount: '',
        notes: ''
      });
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment. Please try again.');
    }
  };

  // Delete a payment
  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment record?')) return;

    try {
      await api.delete(`/payment-history/${paymentId}`);
      if (viewCustomer?.id && viewCustomer?.branch_id) {
        fetchPaymentHistory(viewCustomer.id, viewCustomer.branch_id);
        fetchPayInTerms();
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Failed to delete payment record.');
    }
  };

  // Calculate due date based on invoice date and term duration
  const calculateDueDate = (invoiceDate, termDuration, unit) => {
    if (!invoiceDate || !termDuration) return '';
    
    const date = new Date(invoiceDate);
    const duration = parseInt(termDuration) || 0;
    
    switch(unit) {
      case 'days':
        date.setDate(date.getDate() + duration);
        break;
      case 'weeks':
        date.setDate(date.getDate() + (duration * 7));
        break;
      case 'months':
        date.setMonth(date.getMonth() + duration);
        break;
      case 'years':
        date.setFullYear(date.getFullYear() + duration);
        break;
      default:
        date.setDate(date.getDate() + duration);
    }
    
    return date.toISOString().split('T')[0];
  };

  // Handle input change for add/edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newForm = {
      ...form,
      [name]: value
    };

    // Update the form
    setForm(newForm);

    // Auto-calculate due date when relevant fields change
    if (name === 'invoice_date' || name === 'paymentCycleNumber' || name === 'paymentCycleUnit' || name === 'termDuration') {
      if (newForm.invoice_date) {
        const dueDate = calculateDueDate(
          newForm.invoice_date,
          name === 'termDuration' ? value : newForm.termDuration,
          name === 'paymentCycleUnit' ? value : newForm.paymentCycleUnit
        );
        setForm(prev => ({
          ...prev,
          due_date: dueDate
        }));
      }
    }
  };

  // Add or update Pay in Terms customer
  const handleAddPayInTerms = async (e) => {
    e.preventDefault();
    try {
      if (editCustomer) {
        await api.put(`/pay-in-terms/${editCustomer.id}`, {
          ...form,
          creditLimit: Number(form.creditLimit),
          creditUsed: Number(form.creditUsed) || 0,
        });
      } else {
        await api.post('/pay-in-terms', {
          ...form,
          creditLimit: Number(form.creditLimit),
          creditUsed: Number(form.creditUsed) || 0,
        });
      }
      setShowAddForm(false);
      setEditCustomer(null);
      setForm({
        name: '',
        contact: '',
        creditLimit: '',
        termDuration: '',
        creditUsed: '',
        paymentCycleNumber: '',
        paymentCycleUnit: 'days',
        invoice_date: '',
        due_date: ''
      });
      fetchPayInTerms();
    } catch (err) {
      alert('Failed to save Pay in Terms customer');
    }
  };

  // Delete Pay in Terms customer
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.delete(`/pay-in-terms/${id}`);
      setPayInTermsCustomers(prev => prev.filter(c => c.id !== id));
      if (viewCustomer && viewCustomer.id === id) setViewCustomer(null);
    } catch (err) {
      alert('Failed to delete customer');
    }
  };

  // View details
  const handleView = async (c) => {
    try {
      const res = await api.get(`/pay-in-terms/${c.id}`);
      setViewCustomer(res.data);
      setShowPaymentModal(false);
    } catch (err) {
      console.error('Error fetching customer details:', err);
      setViewCustomer(null);
    }
  };

  // Edit details
  const handleEdit = (customer) => {
    setEditCustomer(customer);
    setShowAddForm(true);
    
    // Parse the existing payment cycle (format: "30 days" or "1 month" etc.)
    const paymentCycleMatch = customer.paymentCycle ? customer.paymentCycle.match(/(\d+)\s*(\w+)/) : null;
    const paymentCycleNumber = paymentCycleMatch ? paymentCycleMatch[1] : '';
    const paymentCycleUnit = paymentCycleMatch ? 
      (paymentCycleMatch[2].toLowerCase().includes('year') ? 'years' : 
       paymentCycleMatch[2].toLowerCase().includes('month') ? 'months' :
       paymentCycleMatch[2].toLowerCase().includes('week') ? 'weeks' : 'days') : 'days';
    
    setForm({
      name: customer.name,
      contact: customer.contact,
      creditLimit: customer.creditLimit,
      termDuration: customer.termDuration,
      creditUsed: customer.creditUsed,
      paymentCycleNumber,
      paymentCycleUnit,
      invoice_date: customer.invoice_date ? customer.invoice_date.split('T')[0] : '',
      due_date: customer.due_date ? customer.due_date.split('T')[0] : ''
    });
  };

  // Calculate total paid amount
  const totalPaid = paymentHistory.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

  return (
    <div className="space-y-6">
      {showAddForm && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-lg mx-auto p-8 border border-[#b6e0fe] mb-8 animate-fade-in relative z-20">
          <div className="flex flex-wrap items-center justify-between pb-2 border-b border-[#e0eefa] mb-4">
            <h2 className="text-xl font-bold text-[#03648a] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#0492C2]/90 to-[#b6e0fe]/90 flex items-center justify-center shadow">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0492C2] to-[#b6e0fe]">
                {editCustomer ? 'Edit Pay in Terms Customer' : 'Add Pay in Terms Customer'}
              </span>
            </h2>
            <span className="text-xs font-medium px-2 py-1 bg-gradient-to-r from-white to-[#e4f4fa] text-[#0492C2] rounded-full border border-[#e0eefa]">
              All fields required
            </span>
          </div>
          <form onSubmit={handleAddPayInTerms} className="space-y-4" autoComplete="off">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">Customer Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Full name or business name"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">Contact No</label>
                <input
                  type="text"
                  name="contact"
                  required
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                  value={form.contact}
                  onChange={handleInputChange}
                  placeholder="Phone number"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">Credit Limit</label>
                <input
                  type="number"
                  name="creditLimit"
                  required
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                  value={form.creditLimit}
                  onChange={handleInputChange}
                  placeholder="Credit limit"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">Term Duration</label>
                <input
                  type="text"
                  name="termDuration"
                  required
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                  value={form.termDuration}
                  onChange={handleInputChange}
                  placeholder="e.g. 30 days"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">Credit Used</label>
                <input
                  type="number"
                  name="creditUsed"
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                  value={form.creditUsed}
                  onChange={handleInputChange}
                  placeholder="Credit used"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">Payment Cycle</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="paymentCycleNumber"
                    required
                    className="w-1/2 px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                    value={form.paymentCycleNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., 30"
                    min="1"
                  />
                  <select
                    name="paymentCycleUnit"
                    className="w-1/2 px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition bg-white"
                    value={form.paymentCycleUnit}
                    onChange={handleInputChange}
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">Invoice Date</label>
                <input
                  type="date"
                  name="invoice_date"
                  required
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                  value={form.invoice_date}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  required
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                  value={form.due_date}
                  onChange={handleInputChange}
                  min={form.invoice_date}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                className="px-5 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 text-base font-semibold transition"
                onClick={() => {
                  setShowAddForm(false);
                  setEditCustomer(null);
                  setForm({
                    name: '',
                    contact: '',
                    creditLimit: '',
                    termDuration: '',
                    creditUsed: '',
                    paymentCycle: '',
                    invoice_date: '',
                    due_date: ''
                  });
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white font-semibold hover:from-[#037ba1] hover:to-[#b6e0fe] transition"
              >
                {editCustomer ? 'Update Terms Customer' : 'Add Terms Customer'}
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-[#b6e0fe] bg-white/80 shadow mb-8">
        <table className="min-w-full text-[11px] md:text-xs border-separate border-spacing-y-2">
          <thead className="bg-[#e4f4fa] text-[#0492C2]">
            <tr>
              <th className="px-2 py-2 font-semibold text-center">SN</th>
              <th className="px-2 py-2 font-semibold text-center">Customer Name</th>
              <th className="px-2 py-2 font-semibold text-center">Contact No</th>
              <th className="px-2 py-2 font-semibold text-center">Credit Limit</th>
              <th className="px-2 py-2 font-semibold text-center">Term Duration</th>
              <th className="px-2 py-2 font-semibold text-center">Total Credit Used</th>
              <th className="px-2 py-2 font-semibold text-center">Payment Cycle</th>
              <th className="px-2 py-2 font-semibold text-center">Invoice Date</th>
              <th className="px-2 py-2 font-semibold text-center">Due Date</th>
              <th className="px-2 py-2 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="text-center py-6 text-[#0492C2] font-semibold">
                  Loading...
                </td>
              </tr>
            ) : payInTermsCustomers.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-6 text-gray-400">
                  No pay in terms customers found.
                </td>
              </tr>
            ) : (
              payInTermsCustomers.map((c, idx) => (
                <tr key={c.id} className="items-table-row group transition-all duration-200 align-middle">
                  <td className="text-center align-middle font-bold text-[#0492C2]">{idx + 1}</td>
                  <td className="text-center align-middle text-[#03648a]">{c.name}</td>
                  <td className="text-center align-middle text-[#03648a]">{c.contact}</td>
                  <td className="text-center align-middle text-[#03648a]">LKR {Number(c.creditLimit).toLocaleString()}</td>
                  <td className="text-center align-middle text-[#03648a]">{c.termDuration}</td>
                  <td className="text-center align-middle text-[#03648a]">LKR {Number(c.creditUsed).toLocaleString()}</td>
                  <td className="text-center align-middle text-[#03648a] whitespace-nowrap">
                    {c.paymentCycle}
                  </td>
                  <td className="text-center align-middle text-[#03648a]">{new Date(c.invoice_date).toLocaleDateString()}</td>
                  <td className="text-center align-middle text-[#03648a]">{new Date(c.due_date).toLocaleDateString()}</td>
                  <td className="text-center align-middle">
                    <div className="flex gap-1 justify-center items-center">
                      <button
                        className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#0492C2] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                        title="View"
                        onClick={() => handleView(c)}
                      >
                        <EyeIcon className="w-4 h-4 drop-shadow" />
                      </button>
                      <button
                        className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#0492C2] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                        title="Edit"
                        onClick={() => handleEdit(c)}
                      >
                        <PencilIcon className="w-4 h-4 drop-shadow" />
                      </button>
                      <button
                        className="action-btn-3d bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-400 text-red-400 hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                        title="Delete"
                        onClick={() => handleDelete(c.id)}
                      >
                        <TrashIcon className="w-4 h-4 drop-shadow" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* View Modal */}
      {viewCustomer && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-[#b6e0fe] p-6 w-full max-w-4xl my-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#03648a]">{viewCustomer.name}</h2>
                <p className="text-gray-600">{viewCustomer.contact}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Credit Limit</div>
                <div className="text-lg font-semibold text-[#0492C2]">LKR {Number(viewCustomer.creditLimit).toLocaleString()}</div>
                <div className="mt-2 text-sm text-gray-500">Credit Used</div>
                <div className="text-lg font-semibold text-red-500">LKR {Number(viewCustomer.creditUsed).toLocaleString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-[#03648a] mb-3 border-b pb-2">Payment Terms</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Term Duration:</span>
                    <span className="font-medium">{viewCustomer.termDuration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Cycle:</span>
                    <span className="font-medium">{viewCustomer.paymentCycle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice Date:</span>
                    <span className="font-medium">{formatDate(viewCustomer.invoice_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className={`font-medium ${new Date(viewCustomer.due_date) < new Date() ? 'text-red-500' : 'text-green-600'}`}>
                      {formatDate(viewCustomer.due_date)}
                      {new Date(viewCustomer.due_date) < new Date() && (
                        <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Overdue</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3 border-b pb-2">
                  <h3 className="font-semibold text-[#03648a]">Payment Summary</h3>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#0492C2] text-white text-sm rounded-md hover:bg-[#037ba1] transition"
                  >
                    <CurrencyDollarIcon className="h-4 w-4" />
                    Record Payment
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium">LKR {Number(viewCustomer.creditLimit).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Paid:</span>
                    <span className="font-medium text-green-600">LKR {totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>Balance:</span>
                    <span className={totalPaid >= viewCustomer.creditLimit ? 'text-green-600' : 'text-red-500'}>
                      LKR {(viewCustomer.creditLimit - totalPaid).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-[#03648a] mb-3 border-b pb-2">Payment History</h3>
              {paymentHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paymentHistory.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(payment.payment_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                            LKR {Number(payment.amount).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(payment.next_due_date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {payment.notes || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDeletePayment(payment.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No payment history found.</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setViewCustomer(null)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0492C2] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && viewCustomer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-[#b6e0fe] p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#03648a]">Record Payment</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  name="payment_date"
                  required
                  className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-[#0492C2] focus:border-transparent"
                  value={paymentForm.payment_date}
                  onChange={handlePaymentInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (LKR)</label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="1"
                  step="0.01"
                  className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-[#0492C2] focus:border-transparent"
                  value={paymentForm.amount}
                  onChange={handlePaymentInputChange}
                  placeholder="0.00"
                />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center text-sm text-blue-700">
                  <InformationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>Next due date will be calculated automatically based on the payment cycle.</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  name="notes"
                  rows="2"
                  className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-[#0492C2] focus:border-transparent"
                  value={paymentForm.notes}
                  onChange={handlePaymentInputChange}
                  placeholder="Add any notes about this payment"
                />
              </div>
              
              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-[#0492C2] hover:bg-[#037ba1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#037ba1] transition"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
        

