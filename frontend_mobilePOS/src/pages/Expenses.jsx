import { useState, useRef, useEffect } from 'react';
import { MdOutlineAttachMoney, MdOutlineEdit, MdOutlineDelete, MdAddCircleOutline, MdVisibility } from 'react-icons/md';
import api from '../utils/axios';

export default function Expences() {
  const [expenses, setExpenses] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    expense: '',
    paidTo: '',
    date: '',
    amount: '',
    paymentMethod: '',
    otherPaymentMethod: '',
    status: 'Paid',
    balance: '',
    remark: '',
    receipt: null,
  });
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [editExpense, setEditExpense] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState(null);
  const fileInputRef = useRef();

  // Fetch all expenses from backend
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data);
    } catch (err) {
      setExpenses([]);
    }
  };

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setForm((prev) => ({
        ...prev,
        receipt: file,
      }));
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setReceiptPreview(reader.result);
        reader.readAsDataURL(file);
      }
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleEditExpense = (exp) => {
    setShowAdd(true);
    setEditExpense(exp);
    setForm({
      expense: exp.expense,
      paidTo: exp.paidTo,
      date: exp.date ? exp.date.slice(0, 10) : '',
      amount: exp.amount,
      paymentMethod: exp.paymentMethod,
      otherPaymentMethod: exp.paymentMethod === 'Other' ? exp.paymentMethod : '',
      status: exp.status,
      balance: exp.balance || '',
      remark: exp.remark || '',
      receipt: null,
    });
    setReceiptPreview(exp.receipt ? `/uploads/${exp.receipt}` : null);
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      alert('Failed to delete expense');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('expense', form.expense);
      formData.append('paidTo', form.paidTo);
      formData.append('date', form.date);
      formData.append('amount', form.amount);
      formData.append('paymentMethod', form.paymentMethod === 'Other' ? form.otherPaymentMethod : form.paymentMethod);
      formData.append('status', form.status);
      formData.append('remark', form.remark);
      if (form.status === 'Pending') formData.append('balance', form.balance);
      if (form.receipt) formData.append('receipt', form.receipt);

      if (editExpense) {
        await api.put(`/expenses/${editExpense.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/expenses', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setForm({
        expense: '',
        paidTo: '',
        date: '',
        amount: '',
        paymentMethod: '',
        otherPaymentMethod: '',
        status: 'Paid',
        balance: '',
        remark: '',
        receipt: null,
      });
      setReceiptPreview(null);
      setShowAdd(false);
      setEditExpense(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchExpenses();
    } catch (err) {
      alert('Failed to save expense');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Header with hole effect */}
      <div className="relative w-full pl-2 -mt-2 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-[140px] h-[36px] flex items-center justify-center rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
              <div className="w-[130px] h-[30px] flex items-center justify-center rounded-full bg-white border border-[#d0d7f2] text-[#0b27b1] text-[13px] font-semibold -mt-0.5 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.8)]">
                Expenses List
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-br from-[#0492c2] via-[#107cd1] to-[#0b27b1] text-white shadow-[inset_0_6px_10px_rgba(0,0,0,0.7),0_6px_10px_#0b27b1] border border-white/20 text-sm font-medium hover:brightness-110 transition-all duration-300 active:translate-y-px flex items-center gap-1 whitespace-nowrap"
          >
            <MdAddCircleOutline className="w-4 h-4 text-white" />
            Add Expense
          </button>
        </div>
      </div>
        {showAdd && (
          <form onSubmit={handleAddExpense} className="mb-6 bg-[#f8fbff] rounded-lg p-4 border border-[#b6e0fe] shadow space-y-2 animate-fadein">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                name="expense"
                type="text"
                placeholder="Expense"
                value={form.expense}
                onChange={handleChange}
                required
                className="input"
              />
              <input
                name="paidTo"
                type="text"
                placeholder="Paid To"
                value={form.paidTo}
                onChange={handleChange}
                required
                className="input"
              />
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
                className="input"
              />
              <input
                name="amount"
                type="number"
                placeholder="Amount"
                value={form.amount}
                onChange={handleChange}
                required
                className="input"
              />
              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Payment Method</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
              {form.paymentMethod === 'Other' && (
                <input
                  name="otherPaymentMethod"
                  type="text"
                  placeholder="Type payment method"
                  value={form.otherPaymentMethod}
                  onChange={handleChange}
                  required
                  className="input"
                />
              )}
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
              {form.status === 'Pending' && (
                <input
                  name="balance"
                  type="number"
                  placeholder="Balance Amount"
                  value={form.balance}
                  onChange={handleChange}
                  required
                  className="input"
                />
              )}
            </div>
            <div>
              <textarea
                name="remark"
                placeholder="Remarks"
                value={form.remark}
                onChange={handleChange}
                className="input"
                rows={2}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="block text-sm font-medium text-[#03648a]">
                📎 Receipt Upload
                <input
                  ref={fileInputRef}
                  type="file"
                  name="receipt"
                  accept="image/*,application/pdf"
                  onChange={handleChange}
                  className="block mt-1"
                />
              </label>
              {receiptPreview && (
                <div className="flex items-center">
                  <img
                    src={receiptPreview}
                    alt="Receipt Preview"
                    className="w-16 h-16 object-contain border rounded"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-300 transition text-xs"
                onClick={() => {
                  setShowAdd(false);
                  setEditExpense(null);
                  setForm({
                    expense: '',
                    paidTo: '',
                    date: '',
                    amount: '',
                    paymentMethod: '',
                    otherPaymentMethod: '',
                    status: 'Paid',
                    balance: '',
                    remark: '',
                    receipt: null,
                  });
                  setReceiptPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-1.5 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition text-xs"
              >
                {editExpense ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        )}
        {/* Filters */}
        <div className="bg-white rounded-lg p-3 shadow-[0_2px_6px_rgba(0,0,0,0.1)] mb-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs font-medium text-[#5a6e9a] mb-1">Expense</label>
              <input
                type="text"
                placeholder="Search expense"
                className="w-full px-3 py-1.5 text-sm border border-[#e0e4ed] rounded-lg shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#0b27b1]/50"
              />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs font-medium text-[#5a6e9a] mb-1">Payment Method</label>
              <select className="w-full px-3 py-1.5 text-sm border border-[#e0e4ed] rounded-lg shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#0b27b1]/50">
                <option value="">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs font-medium text-[#5a6e9a] mb-1">Status</label>
              <select className="w-full px-3 py-1.5 text-sm border border-[#e0e4ed] rounded-lg shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#0b27b1]/50">
                <option value="">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs font-medium text-[#5a6e9a] mb-1">From Date</label>
              <input
                type="date"
                className="w-full px-3 py-1.5 text-sm border border-[#e0e4ed] rounded-lg shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#0b27b1]/50"
              />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs font-medium text-[#5a6e9a] mb-1">To Date</label>
              <input
                type="date"
                className="w-full px-3 py-1.5 text-sm border border-[#e0e4ed] rounded-lg shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#0b27b1]/50"
              />
            </div>
            <button className="px-4 py-1.5 bg-white text-[#5a6e9a] rounded-lg text-sm font-medium border border-[#e0e4ed] shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:bg-gray-50 transition-all duration-200 active:translate-y-px">
              Clear Filters
            </button>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-lg overflow-hidden shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#e0e4ed]">
              <thead className="bg-[#f8f9fd]">
                <tr>
                  <th className="px-3 py-2.5 text-center text-xs font-medium text-[#5a6e9a] uppercase tracking-wider">SN</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-[#5a6e9a] uppercase tracking-wider">Expense</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-[#5a6e9a] uppercase tracking-wider">Paid To</th>
                  <th className="px-3 py-2.5 text-center text-xs font-medium text-[#5a6e9a] uppercase tracking-wider">Date</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-[#5a6e9a] uppercase tracking-wider">Amount</th>
                  <th className="px-3 py-2.5 text-center text-xs font-medium text-[#5a6e9a] uppercase tracking-wider">Payment</th>
                  <th className="px-3 py-2.5 text-center text-xs font-medium text-[#5a6e9a] uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2.5 text-center text-xs font-medium text-[#5a6e9a] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#e0e4ed]">
                {expenses.length > 0 ? (
                  expenses.map((exp, idx) => (
                    <tr key={exp.id} className="hover:bg-[#f8fbff] transition-colors duration-150">
                      <td className="px-3 py-3 whitespace-nowrap text-center text-sm text-[#4a5568]">{idx + 1}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-[#2d3748]">{exp.expense}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-[#4a5568]">{exp.paidTo}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-center text-sm text-[#4a5568]">{exp.date}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium text-[#2d3748]">
                        LKR {Number(exp.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-center text-sm text-[#4a5568]">
                        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#e4f4fa] text-[#03648a]">
                          {exp.paymentMethod}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-center">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          exp.status === 'Paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {exp.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-center text-sm">
                        <div className="flex justify-center items-center space-x-1">
                          {exp.receipt && (
                            <button
                              onClick={() => {
                                setModalImageSrc(`http://localhost:3000/uploads/${exp.receipt}`);
                                setShowImageModal(true);
                              }}
                              className="p-1.5 rounded-lg bg-white border border-[#e0e4ed] text-[#5a6e9a] hover:bg-[#f0f4ff] hover:text-[#0b27b1] transition-colors duration-200 shadow-sm"
                              title="View Receipt"
                            >
                              <MdVisibility className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditExpense(exp)}
                            className="p-1.5 rounded-lg bg-white border border-[#e0e4ed] text-[#5a6e9a] hover:bg-[#f0f4ff] hover:text-[#0b27b1] transition-colors duration-200 shadow-sm"
                            title="Edit Expense"
                          >
                            <MdOutlineEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1.5 rounded-lg bg-white border border-[#e0e4ed] text-[#5a6e9a] hover:bg-red-50 hover:text-red-600 transition-colors duration-200 shadow-sm"
                            title="Delete Expense"
                          >
                            <MdOutlineDelete className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-[#5a6e9a]">
                      No expenses found.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-[#f8f9fd]">
                <tr>
                  <td colSpan={4} className="px-3 py-3 text-right text-sm font-medium text-[#5a6e9a]">
                    Total Expenses:
                  </td>
                  <td className="px-3 py-3 text-right text-sm font-semibold text-[#2d3748]">
                    LKR {total.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
      </div>
      {showImageModal && modalImageSrc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="relative bg-white rounded-lg shadow-lg p-4 max-w-2xl w-full flex flex-col items-center">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setShowImageModal(false)}
              >
                &times;
              </button>
              <img
                src={modalImageSrc}
                alt="Full Receipt"
                className="max-h-[80vh] w-auto object-contain rounded"
                style={{ maxWidth: '100%' }}
              />
            </div>
          </div>
        )}
        <style>{`
          .input {
            width: 100%;
            padding: 0.5rem;
            border-radius: 0.5rem;
            border: 1.5px solid #b6e0fe;
            background: #f8fbff;
            margin-top: 0.25rem;
            font-size: 1rem;
          }
          .input:focus {
            outline: none;
            border-color: #0492C2;
            background: #fff;
          }
          .animate-fadein {
            animation: fadein 0.7s cubic-bezier(.4,0,.2,1);
          }
          @keyframes fadein {
            from { opacity: 0; transform: translateY(24px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .action-btn-3d {
            box-shadow: 0 2px 8px 0 #b6e0fe33, 0 1px 0 0 #b6e0fe;
            transform: perspective(400px) translateZ(0);
          }
          .action-btn-3d:active {
            transform: scale(0.95) perspective(400px) translateZ(0);
          }
        `}</style>
    </div>
  );
}
