import { useEffect, useState } from 'react';
import api from '../utils/axios';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function Discounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editDiscount, setEditDiscount] = useState(null);
  const [viewDiscount, setViewDiscount] = useState(null);
  const [form, setForm] = useState({
    name: '',
    type: 'percentage',
    value: '',
    item: '',
    items: [''],
    startDate: '',
    endDate: '',
    status: 'Active'
  });

  // Fetch discounts from backend
  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/discounts');
      // Parse items field if it's a stringified array
      setDiscounts((res.data || []).map(d => ({
        ...d,
        items: typeof d.items === 'string' ? JSON.parse(d.items) : (d.items || [])
      })));
    } catch (err) {
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Handle change for items array
  const handleItemsChange = (idx, value) => {
    setForm(f => ({
      ...f,
      items: f.items.map((item, i) => i === idx ? value : item)
    }));
  };

  // Add item row
  const addItemRow = () => {
    setForm(f => ({
      ...f,
      items: [...(f.items || []), '']
    }));
  };

  // Remove item row
  const removeItemRow = (idx) => {
    setForm(f => ({
      ...f,
      items: f.items.filter((_, i) => i !== idx)
    }));
  };

  // Add or update discount
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        // Ensure items is a JSON string, and item is a string (for backward compatibility)
        items: JSON.stringify(form.items.filter(i => i && i.trim() !== '')),
        item: (form.items && form.items.length > 0) ? form.items[0] : ''
      };
      if (editDiscount) {
        await api.put(`/discounts/${editDiscount.id}`, payload);
      } else {
        await api.post('/discounts', payload);
      }
      setShowForm(false);
      setEditDiscount(null);
      setForm({
        name: '',
        type: 'percentage',
        value: '',
        item: '',
        items: [''],
        startDate: '',
        endDate: '',
        status: 'Active'
      });
      fetchDiscounts();
    } catch (err) {
      alert('Failed to save discount');
    }
  };

  // View discount (fetch latest from backend)
  const handleView = async (id) => {
    try {
      const res = await api.get(`/discounts/${id}`);
      setViewDiscount({
        ...res.data,
        items: typeof res.data.items === 'string' ? JSON.parse(res.data.items) : (res.data.items || [])
      });
    } catch (err) {
      alert('Failed to fetch discount details');
    }
  };

  // Edit discount (ensure date fields are yyyy-MM-dd)
  const handleEdit = (discount) => {
    setEditDiscount(discount);
    setShowForm(true);
    setForm({
      name: discount.name,
      type: discount.type,
      value: discount.value,
      item: discount.item,
      items: Array.isArray(discount.items) && discount.items.length > 0 ? discount.items : [''],
      startDate: discount.startDate ? discount.startDate.slice(0, 10) : '',
      endDate: discount.endDate ? discount.endDate.slice(0, 10) : '',
      status: discount.status
    });
  };

  // Delete discount
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this discount?')) return;
    try {
      await api.delete(`/discounts/${id}`);
      fetchDiscounts();
    } catch (err) {
      alert('Failed to delete discount');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#0492C2]">Discounts</h1>
        <button
          className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition"
          onClick={() => {
            setShowForm(true);
            setEditDiscount(null);
            setForm({
              name: '',
              type: 'percentage',
              value: '',
              item: '',
              items: [''],
              startDate: '',
              endDate: '',
              status: 'Active'
            });
          }}
        >
          <PlusIcon className="w-5 h-5" />
          Add Discount
        </button>
      </div>

      {/* Add/Edit Discount Form */}
      {showForm && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-2xl mx-auto p-8 border border-[#b6e0fe] mb-8 animate-fade-in relative z-20">
          <div className="flex flex-wrap items-center justify-between pb-2 border-b border-[#e0eefa] mb-4">
            <h2 className="text-xl font-bold text-[#03648a] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#0492C2]/90 to-[#b6e0fe]/90 flex items-center justify-center shadow">
                <PlusIcon className="h-5 w-5 text-white" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0492C2] to-[#b6e0fe]">
                {editDiscount ? 'Edit Discount' : 'Add Discount'}
              </span>
            </h2>
            <span className="text-xs font-medium px-2 py-1 bg-gradient-to-r from-white to-[#e4f4fa] text-[#0492C2] rounded-full border border-[#e0eefa]">
              All fields required
            </span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">Discount Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="Discount name"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">Type</label>
                <select
                  name="type"
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                  value={form.type}
                  onChange={handleFormChange}
                  required
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">Value</label>
                <input
                  type="number"
                  name="value"
                  required
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                  value={form.value}
                  onChange={handleFormChange}
                  placeholder="Discount value"
                />
              </div>
              {/* Items field (multiple) */}
              <div className="space-y-2 col-span-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">Items (multiple allowed)</label>
                <div className="space-y-2">
                  {(form.items || []).map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={item}
                        onChange={e => handleItemsChange(idx, e.target.value)}
                        placeholder="Item name or code"
                        className="flex-1 px-3 py-2 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent"
                        required
                      />
                      {form.items.length > 1 && (
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700 font-bold px-2"
                          onClick={() => removeItemRow(idx)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="flex items-center text-[#0492C2] hover:underline text-sm mt-2"
                    onClick={addItemRow}
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Add Item
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                  value={form.startDate}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                  value={form.endDate}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">Status</label>
                <select
                  name="status"
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                  value={form.status}
                  onChange={handleFormChange}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                className="px-5 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 text-base font-semibold transition"
                onClick={() => {
                  setShowForm(false);
                  setEditDiscount(null);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white font-semibold hover:from-[#037ba1] hover:to-[#b6e0fe] transition"
              >
                {editDiscount ? 'Update Discount' : 'Add Discount'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Discount Modal */}
      {viewDiscount && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-[#b6e0fe] p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-[#0492C2]">Discount Details</h2>
              <button
                onClick={() => setViewDiscount(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="space-y-2 text-[15px]">
              <div><span className="font-semibold text-[#03648a]">Name:</span> {viewDiscount.name}</div>
              <div><span className="font-semibold text-[#03648a]">Type:</span> {viewDiscount.type}</div>
              <div><span className="font-semibold text-[#03648a]">Value:</span> {viewDiscount.type === 'percentage' ? `${viewDiscount.value}%` : `LKR ${viewDiscount.value}`}</div>
              <div><span className="font-semibold text-[#03648a]">Discount Name:</span> {viewDiscount.name}</div>
              <div><span className="font-semibold text-[#03648a]">Items:</span> {(viewDiscount.items || []).join(', ')}</div>
              <div><span className="font-semibold text-[#03648a]">Start Date:</span> {viewDiscount.startDate ? viewDiscount.startDate.slice(0, 10) : ''}</div>
              <div><span className="font-semibold text-[#03648a]">End Date:</span> {viewDiscount.endDate ? viewDiscount.endDate.slice(0, 10) : ''}</div>
              <div><span className="font-semibold text-[#03648a]">Status:</span> {viewDiscount.status}</div>
            </div>
            <div className="flex justify-end mt-6 gap-2">
              <button
                onClick={() => {
                  setViewDiscount(null);
                  handleEdit(viewDiscount);
                }}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white font-semibold hover:from-[#037ba1] hover:to-[#b6e0fe] transition"
              >
                Edit
              </button>
              <button
                onClick={() => setViewDiscount(null)}
                className="px-5 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 text-base font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discounts Table */}
      <div className="overflow-x-auto rounded-lg border border-[#b6e0fe] bg-white/80 shadow mb-8">
        <table className="min-w-full text-[13px] md:text-sm border-separate border-spacing-y-2">
          <thead className="bg-[#e4f4fa] text-[#0492C2]">
            <tr>
              <th className="px-2 py-2 font-semibold text-center">Name</th>
              <th className="px-2 py-2 font-semibold text-center">Type</th>
              <th className="px-2 py-2 font-semibold text-center">Value</th>
              <th className="px-2 py-2 font-semibold text-center">Discount Name</th>
              <th className="px-2 py-2 font-semibold text-center">Items</th>
              <th className="px-2 py-2 font-semibold text-center">Start Date</th>
              <th className="px-2 py-2 font-semibold text-center">End Date</th>
              <th className="px-2 py-2 font-semibold text-center">Status</th>
              <th className="px-2 py-2 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-6 text-[#0492C2] font-semibold">
                  Loading...
                </td>
              </tr>
            ) : discounts.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-6 text-gray-400">
                  No discounts found.
                </td>
              </tr>
            ) : (
              discounts.map((d, idx) => (
                <tr
                  key={d.id || idx}
                  className="items-table-row group transition-all duration-200 align-middle text-[13px]"
                >
                  <td className="text-center align-middle text-[#03648a]">{d.name}</td>
                  <td className="text-center align-middle text-[#03648a]">{d.type === 'percentage' ? 'Percentage' : 'Fixed'}</td>
                  <td className="text-center align-middle text-[#03648a]">
                    {d.type === 'percentage' ? `${d.value}%` : `LKR ${Number(d.value).toLocaleString()}`}
                  </td>
                  <td className="text-center align-middle text-[#03648a]">{d.name}</td>
                  <td className="text-center align-middle text-[#03648a]">
                    {(d.items || []).join(', ')}
                  </td>
                  <td className="text-center align-middle text-[#03648a]">{d.startDate ? d.startDate.slice(0, 10) : ''}</td>
                  <td className="text-center align-middle text-[#03648a]">{d.endDate ? d.endDate.slice(0, 10) : ''}</td>
                  <td className="text-center align-middle">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        d.status === 'Active'
                          ? 'bg-[#e0f7fa] text-[#0492C2]'
                          : d.status === 'Inactive'
                            ? 'bg-[#b6e0fe] text-[#03648a]'
                            : 'bg-[#b6e0fe]/60 text-[#03648a]/80'
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="text-center align-middle">
                    <div className="flex gap-1 justify-center items-center">
                      <button
                        className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#0492C2] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                        title="View"
                        onClick={() => handleView(d.id)}
                      >
                        <EyeIcon className="w-4 h-4 drop-shadow" />
                      </button>
                      <button
                        className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#0492C2] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                        title="Edit"
                        onClick={() => handleEdit(d)}
                      >
                        <PencilIcon className="w-4 h-4 drop-shadow" />
                      </button>
                      <button
                        className="action-btn-3d bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-400 text-red-400 hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                        title="Delete"
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this discount?')) {
                            try {
                              await api.delete(`/discounts/${d.id}`);
                              fetchDiscounts();
                            } catch {
                              alert('Failed to delete discount');
                            }
                          }
                        }}
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
        <style>{`
          .items-table-row {
            border-radius: 18px !important;
            background: #fff !important;
            margin-bottom: 14px !important;
            box-shadow: 0 6px 24px 0 rgba(4,146,194,0.10), 0 1.5px 4px 0 rgba(4,146,194,0.06) !important;
            border: 1.5px solid #e0eefa !important;
            transition: 
              box-shadow 0.25s cubic-bezier(.4,0,.2,1),
              transform 0.25s cubic-bezier(.4,0,.2,1),
              background 0.2s;
          }
          .items-table-row:hover {
            box-shadow: 0 12px 32px 0 rgba(4,146,194,0.18), 0 3px 12px 0 rgba(4,146,194,0.10) !important;
            transform: translateY(-4px) scale(1.025);
            background: #f8fbff !important;
            z-index: 2;
          }
          .action-btn-3d {
            transition: all 0.2s ease;
            transform: translateY(0);
          }
          .action-btn-3d:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px rgba(4, 146, 194, 0.2);
          }
        `}</style>
      </div>
    </div>
  );
}
