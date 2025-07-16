import { useState, useEffect } from 'react';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../utils/axios';

export default function ReturnsRefunds({ onView, showAddForm, setShowAddForm }) {
  const [returnsRefundsData, setReturnsRefundsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: '',
    item: '',
    reason: '',
    refund: '',
    method: '',
    customer_name: '',
    customer_id: ''
  });
  const [viewRefund, setViewRefund] = useState(null);
  const [editRefund, setEditRefund] = useState(null);
  const [customers, setCustomers] = useState([]);

  // Fetch all returns/refunds and customers from backend
  useEffect(() => {
    fetchReturnsRefunds();
    fetchCustomers();
  }, []);

  // Fetch all customers
  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setCustomers([]);
    }
  };

  const fetchReturnsRefunds = async () => {
    setLoading(true);
    try {
      const res = await api.get('/returns-refunds');
      setReturnsRefundsData(res.data);
    } catch (err) {
      setReturnsRefundsData([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change for add/edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add or update return/refund
  const handleAddReturnRefund = async (e) => {
    e.preventDefault();
    try {
      // Always send customer_name as the selected customer's name
      let customerName = form.customer_name;
      if (!customerName && form.customer_id) {
        const selectedCustomer = customers.find(c => String(c.id) === String(form.customer_id));
        customerName = selectedCustomer ? selectedCustomer.name : '';
      }
      if (editRefund) {
        await api.put(`/returns-refunds/${editRefund.id}`, {
          ...form,
          refund: Number(form.refund),
          customer_name: customerName,
        });
      } else {
        await api.post('/returns-refunds', {
          ...form,
          refund: Number(form.refund),
          customer_name: customerName,
        });
      }
      setShowAddForm(false);
      setEditRefund(null);
      setForm({
        date: '',
        item: '',
        reason: '',
        refund: '',
        method: '',
        customer_name: '',
        customer_id: ''
      });
      fetchReturnsRefunds();
    } catch (err) {
      alert('Failed to save return/refund');
    }
  };

  // Delete return/refund
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this refund?')) return;
    try {
      await api.delete(`/returns-refunds/${id}`);
      setReturnsRefundsData((prev) => prev.filter((r) => r.id !== id));
      if (viewRefund && viewRefund.id === id) setViewRefund(null);
    } catch (err) {
      alert('Failed to delete refund');
    }
  };

  // View details
  const handleView = async (r) => {
    try {
      const res = await api.get(`/returns-refunds/${r.id}`);
      setViewRefund(res.data);
    } catch (err) {
      setViewRefund(null);
    }
  };

  // Edit details
  const handleEdit = (r) => {
    setEditRefund(r);
    setShowAddForm(true);
    setForm({
      date: r.date && typeof r.date === 'string'
        ? r.date.slice(0, 10)
        : r.date instanceof Date
          ? `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, '0')}-${String(r.date.getDate()).padStart(2, '0')}`
          : '',
      item: r.item,
      reason: r.reason,
      refund: r.refund,
      method: r.method,
      customer_name: r.customer_name || '',
      customer_id: r.customer_id || ''
    });
  };

  return (
    <div>
      {showAddForm && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-lg mx-auto p-8 border border-[#b6e0fe] mb-8 animate-fade-in relative z-20">
          <div className="flex flex-wrap items-center justify-between pb-2 border-b border-[#e0eefa] mb-4">
            <h2 className="text-xl font-bold text-[#03648a] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#0492C2]/90 to-[#b6e0fe]/90 flex items-center justify-center shadow">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0492C2] to-[#b6e0fe]">
                {editRefund ? 'Edit Return / Refund' : 'Add Return / Refund'}
              </span>
            </h2>
            <span className="text-xs font-medium px-2 py-1 bg-gradient-to-r from-white to-[#e4f4fa] text-[#0492C2] rounded-full border border-[#e0eefa]">
              All fields required
            </span>
          </div>
          <form onSubmit={handleAddReturnRefund} className="space-y-4" autoComplete="off">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                  value={form.date}
                  onChange={handleInputChange}
                  placeholder="Refund date"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">Item</label>
                <input
                  type="text"
                  name="item"
                  required
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                  value={form.item}
                  onChange={handleInputChange}
                  placeholder="Item name"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">Reason</label>
                <input
                  type="text"
                  name="reason"
                  required
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                  value={form.reason}
                  onChange={handleInputChange}
                  placeholder="Reason for return/refund"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">Refund Amount</label>
                <input
                  type="number"
                  name="refund"
                  required
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                  value={form.refund}
                  onChange={handleInputChange}
                  placeholder="Refund amount"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">Refund Method</label>
                <input
                  type="text"
                  name="method"
                  required
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                  value={form.method}
                  onChange={handleInputChange}
                  placeholder="e.g. Cash, Bank Transfer"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">Customer</label>
                <select
                  name="customer_id"
                  required
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition bg-white"
                  value={form.customer_id}
                  onChange={(e) => {
                    const selectedCustomer = customers.find(c => c.id === parseInt(e.target.value));
                    setForm(prev => ({
                      ...prev,
                      customer_id: e.target.value,
                      customer_name: selectedCustomer ? selectedCustomer.name : ''
                    }));
                  }}
                >
                  <option value="">Select a customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.contact || 'No contact'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                className="px-5 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 text-base font-semibold transition"
                onClick={() => {
                  setShowAddForm(false);
                  setEditRefund(null);
                  setForm({
                    date: '',
                    item: '',
                    reason: '',
                    refund: '',
                    method: '',
                    customer_name: '',
                  });
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white font-semibold hover:from-[#037ba1] hover:to-[#b6e0fe] transition"
              >
                {editRefund ? 'Update Refund' : 'Add Refund'}
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
              <th className="px-2 py-2 font-semibold text-center">Date</th>
              <th className="px-2 py-2 font-semibold text-center">Item</th>
              <th className="px-2 py-2 font-semibold text-center">Reason</th>
              <th className="px-2 py-2 font-semibold text-center">Refund</th>
              <th className="px-2 py-2 font-semibold text-center">Refund Method</th>
              <th className="px-2 py-2 font-semibold text-center">Customer</th>
              <th className="px-2 py-2 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-[#0492C2] font-semibold">
                  Loading...
                </td>
              </tr>
            ) : returnsRefundsData.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-400">
                  No returns or refunds found.
                </td>
              </tr>
            ) : (
              returnsRefundsData.map((r, idx) => (
                <tr key={r.id} className="items-table-row group transition-all duration-200 align-middle">
                  <td className="text-center align-middle font-bold text-[#0492C2]">{idx + 1}</td>
                  <td className="text-center align-middle text-[#03648a]">{r.date}</td>
                  <td className="text-center align-middle text-[#03648a]">{r.item}</td>
                  <td className="text-center align-middle text-[#03648a]">{r.reason}</td>
                  <td className="text-center align-middle text-[#03648a]">LKR {Number(r.refund).toLocaleString()}</td>
                  <td className="text-center align-middle text-[#03648a]">{r.method}</td>
                  <td className="text-center align-middle text-[#03648a]">{r.customer_name || 'N/A'}</td>
                  <td className="text-center align-middle">
                    <div className="flex gap-1 justify-center items-center">
                      <button
                        className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#0492C2] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                        title="View"
                        onClick={() => handleView(r)}
                      >
                        <EyeIcon className="w-4 h-4 drop-shadow" />
                      </button>
                      <button
                        className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#0492C2] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                        title="Edit"
                        onClick={() => handleEdit(r)}
                      >
                        <PencilIcon className="w-4 h-4 drop-shadow" />
                      </button>
                      <button
                        className="action-btn-3d bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-400 text-red-400 hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                        title="Delete"
                        onClick={() => handleDelete(r.id)}
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
      {viewRefund && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-[#b6e0fe] p-6 max-w-lg w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-[#0492C2]">Return / Refund Details</h2>
              <button
                onClick={() => setViewRefund(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="space-y-2">
              <div><span className="font-semibold text-[#03648a]">Date:</span> {viewRefund.date}</div>
              <div><span className="font-semibold text-[#03648a]">Item:</span> {viewRefund.item}</div>
              <div><span className="font-semibold text-[#03648a]">Reason:</span> {viewRefund.reason}</div>
              <div><span className="font-semibold text-[#03648a]">Refund:</span> LKR {Number(viewRefund.refund).toLocaleString()}</div>
              <div><span className="font-semibold text-[#03648a]">Refund Method:</span> {viewRefund.method}</div>
              <div><span className="font-semibold text-[#03648a]">Customer Name:</span> {viewRefund.customer_name || 'N/A'}</div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewRefund(null)}
                className="px-6 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
