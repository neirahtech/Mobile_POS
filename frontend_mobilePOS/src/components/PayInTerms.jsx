import { useState, useEffect } from 'react';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../utils/axios';

export default function PayInTerms({ onView, showAddForm, setShowAddForm }) {
  const [payInTermsCustomers, setPayInTermsCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    contact: '',
    creditLimit: '',
    termDuration: '',
    creditUsed: '',
    paymentCycle: '',
  });
  const [viewCustomer, setViewCustomer] = useState(null);
  const [editCustomer, setEditCustomer] = useState(null);

  // Fetch all Pay in Terms customers from backend
  useEffect(() => {
    fetchPayInTerms();
  }, []);

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

  // Handle input change for add/edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        paymentCycle: '',
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
    } catch (err) {
      setViewCustomer(null);
    }
  };

  // Edit details
  const handleEdit = (c) => {
    setEditCustomer(c);
    setShowAddForm(true);
    setForm({
      name: c.name,
      contact: c.contact,
      creditLimit: c.creditLimit,
      termDuration: c.termDuration,
      creditUsed: c.creditUsed,
      paymentCycle: c.paymentCycle,
    });
  };

  return (
    <div>
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
                <input
                  type="text"
                  name="paymentCycle"
                  required
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                  value={form.paymentCycle}
                  onChange={handleInputChange}
                  placeholder="e.g. Monthly"
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
            ) : payInTermsCustomers.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-400">
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
                  <td className="text-center align-middle text-[#03648a]">{c.paymentCycle}</td>
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-[#b6e0fe] p-6 max-w-lg w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-[#0492C2]">Pay in Terms Customer Details</h2>
              <button
                onClick={() => setViewCustomer(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="space-y-2">
              <div><span className="font-semibold text-[#03648a]">Name:</span> {viewCustomer.name}</div>
              <div><span className="font-semibold text-[#03648a]">Contact:</span> {viewCustomer.contact}</div>
              <div><span className="font-semibold text-[#03648a]">Credit Limit:</span> LKR {Number(viewCustomer.creditLimit).toLocaleString()}</div>
              <div><span className="font-semibold text-[#03648a]">Term Duration:</span> {viewCustomer.termDuration}</div>
              <div><span className="font-semibold text-[#03648a]">Credit Used:</span> LKR {Number(viewCustomer.creditUsed).toLocaleString()}</div>
              <div><span className="font-semibold text-[#03648a]">Payment Cycle:</span> {viewCustomer.paymentCycle}</div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewCustomer(null)}
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

