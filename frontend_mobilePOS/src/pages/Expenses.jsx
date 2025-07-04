import { useState, useRef, useEffect } from 'react';
import { MdOutlineAttachMoney, MdOutlineEdit, MdOutlineDelete, MdAddCircleOutline } from 'react-icons/md';
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
    <div className="w-full flex justify-center items-start min-h-[calc(100vh-60px)] bg-gradient-to-br from-[#e4f4fa] to-[#f8fbff] py-8 px-2">
      <div className="w-full max-w-4xl bg-white/90 rounded-2xl shadow-2xl border border-[#b6e0fe] p-6 relative animate-fadein">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-[#0492C2] tracking-wide flex items-center gap-2">
            <MdOutlineAttachMoney className="w-7 h-7 text-[#0492C2]" />
            <span>Expenses</span>
            <span className="block w-12 md:w-16 h-1 rounded bg-gradient-to-r from-[#0492C2] to-[#b6e0fe]"></span>
          </h1>
          <button
            className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition text-xs md:text-sm"
            onClick={() => setShowAdd((v) => !v)}
          >
            <MdAddCircleOutline className="w-5 h-5" />
            Add Expense
          </button>
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
        <div className="overflow-x-auto rounded-lg border border-[#b6e0fe] bg-white/80 shadow">
          <table className="min-w-full text-[11px] md:text-xs">
            <thead className="bg-[#e4f4fa] text-[#0492C2]">
              <tr>
                <th className="px-2 py-2 font-semibold">SN</th>
                <th className="px-2 py-2 font-semibold">Expense</th>
                <th className="px-2 py-2 font-semibold">Paid To</th>
                <th className="px-2 py-2 font-semibold">Date</th>
                <th className="px-2 py-2 font-semibold">Amount</th>
                <th className="px-2 py-2 font-semibold">Payment</th>
                <th className="px-2 py-2 font-semibold">Status</th>
                <th className="px-2 py-2 font-semibold">Remarks</th>
                <th className="px-2 py-2 font-semibold">Balance</th>
                <th className="px-2 py-2 font-semibold">Receipt</th>
                <th className="px-2 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length > 0 ? (
                expenses.map((exp, idx) => (
                  <tr key={exp.id} className="border-b border-[#e4f4fa] hover:bg-[#f0f9ff] transition group text-[#03648a]">
                    <td className="px-2 py-2 text-center font-bold">{idx + 1}</td>
                    <td className="px-2 py-2">{exp.expense}</td>
                    <td className="px-2 py-2">{exp.paidTo}</td>
                    <td className="px-2 py-2">{exp.date}</td>
                    <td className="px-2 py-2 text-right font-semibold text-[#0492C2]">LKR {Number(exp.amount).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                    <td className="px-2 py-2">{exp.paymentMethod}</td>
                    <td className="px-2 py-2">{exp.status}</td>
                    <td className="px-2 py-2">{exp.remark}</td>
                    <td className="px-2 py-2">{exp.balance ? Number(exp.balance).toLocaleString(undefined, {minimumFractionDigits:2}) : '-'}</td>
                    <td className="px-2 py-2">
                      {exp.receipt && (
                        <>
                          <a
                            href={`http://localhost:3000/uploads/${exp.receipt}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => {
                              e.preventDefault();
                              setModalImageSrc(`http://localhost:3000/uploads/${exp.receipt}`);
                              setShowImageModal(true);
                            }}
                          >
                            <img
                              src={`http://localhost:3000/uploads/${exp.receipt}`}
                              alt="Receipt"
                              className="w-10 h-10 object-contain border rounded cursor-pointer"
                              onError={e => { e.target.onerror = null; e.target.src = '/no-image.png'; }}
                            />
                          </a>
                        </>
                      )}
                    </td>
                    <td className="px-2 py-2 text-center flex gap-1 justify-center items-center">
                      <button
                        className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#0492C2] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                        title="Edit"
                        onClick={() => handleEditExpense(exp)}
                      >
                        <MdOutlineEdit className="w-4 h-4 drop-shadow" />
                      </button>
                      <button
                        className="action-btn-3d bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-400 text-red-400 hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                        title="Delete"
                        onClick={() => handleDeleteExpense(exp.id)}
                      >
                        <MdOutlineDelete className="w-4 h-4 drop-shadow" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="text-center text-[#0492C2] font-semibold py-8 opacity-70">
                    No expenses found.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-[#e4f4fa] font-bold">
                <td colSpan={4} className="py-2 px-2 text-right text-[#0492C2]">Total Expense</td>
                <td colSpan={7} className="py-2 px-2 text-right text-[#0492C2]">
                  LKR {total.toLocaleString(undefined, {minimumFractionDigits:2})}
                </td>
              </tr>
            </tfoot>
          </table>
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
    </div>
  );
}

