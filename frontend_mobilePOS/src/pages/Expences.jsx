import { useState, useRef } from 'react';
import { MdOutlineAttachMoney, MdOutlineEdit, MdOutlineDelete, MdAddCircleOutline } from 'react-icons/md';

const hardcodedExpenses = [
  {
    id: 1,
    expense: 'Electricity Bill',
    paidTo: 'CEB',
    remark: 'June 2024',
    date: '2024-06-05',
    amount: 12000,
  },
  {
    id: 2,
    expense: 'Internet Bill',
    paidTo: 'SLT',
    remark: 'Fiber 100Mbps',
    date: '2024-06-03',
    amount: 3500,
  },
  {
    id: 3,
    expense: 'Shop Rent',
    paidTo: 'Landlord',
    remark: 'June 2024',
    date: '2024-06-01',
    amount: 40000,
  },
  {
    id: 4,
    expense: 'Cleaning',
    paidTo: 'Cleaner',
    remark: 'Monthly',
    date: '2024-06-02',
    amount: 2000,
  },
];

export default function Expences() {
  const [expenses, setExpenses] = useState(hardcodedExpenses);
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
  const fileInputRef = useRef();

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

  const handleAddExpense = (e) => {
    e.preventDefault();
    setExpenses((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        ...form,
        amount: Number(form.amount),
        receipt: receiptPreview,
        paymentMethod: form.paymentMethod === 'Other' ? form.otherPaymentMethod : form.paymentMethod,
        balance: form.status === 'Pending' ? form.balance : undefined,
      },
    ]);
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
    if (fileInputRef.current) fileInputRef.current.value = '';
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
                Save
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
                <th className="px-2 py-2 font-semibold">Receipt</th>
                <th className="px-2 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length > 0 ? (
                expenses.map((exp, idx) => (
                  <tr key={exp.id} className="border-b border-[#e4f4fa] hover:bg-[#f0f9ff] transition group">
                    <td className="px-2 py-2 text-center font-bold">{idx + 1}</td>
                    <td className="px-2 py-2">{exp.expense}</td>
                    <td className="px-2 py-2">{exp.paidTo}</td>
                    <td className="px-2 py-2">{exp.date}</td>
                    <td className="px-2 py-2 text-right font-semibold text-[#0492C2]">LKR {Number(exp.amount).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                    <td className="px-2 py-2">{exp.paymentMethod}</td>
                    <td className="px-2 py-2">{exp.status}</td>
                    <td className="px-2 py-2">{exp.remark}</td>
                    <td className="px-2 py-2">
                      {exp.receipt && (
                        <img
                          src={exp.receipt}
                          alt="Receipt"
                          className="w-10 h-10 object-contain border rounded"
                        />
                      )}
                    </td>
                    <td className="px-2 py-2 text-center flex gap-1 justify-center items-center">
                      <button
                        className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#0492C2] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                        title="Edit"
                      >
                        <MdOutlineEdit className="w-4 h-4 drop-shadow" />
                      </button>
                      <button
                        className="action-btn-3d bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-400 text-red-400 hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                        title="Delete"
                      >
                        <MdOutlineDelete className="w-4 h-4 drop-shadow" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center text-[#0492C2] font-semibold py-8 opacity-70">
                    No expenses found.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-[#e4f4fa] font-bold">
                <td colSpan={4} className="py-2 px-2 text-right text-[#0492C2]">Total Expense</td>
                <td colSpan={6} className="py-2 px-2 text-right text-[#0492C2]">
                  LKR {total.toLocaleString(undefined, {minimumFractionDigits:2})}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
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
