import { useState, useEffect } from 'react';
import { MdVisibility } from 'react-icons/md';
import { FaRegEdit } from 'react-icons/fa';
import { MdDeleteOutline } from 'react-icons/md';
import { PlusIcon } from '@heroicons/react/24/outline';
import api from '../utils/axios'; // Make sure this points to your axios instance

export default function SalesDetails() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    date: '',
    customer: '',
    items: [{ name: '', quantity: 1 }],
    total: ''
  });
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itemOptions, setItemOptions] = useState([]);
  const [viewSale, setViewSale] = useState(null);
  const [editSale, setEditSale] = useState(null);
  const [filters, setFilters] = useState({
    date: '',
    customer: '',
    item: '',
    min: '',
    max: ''
  });

  // Fetch sales details and item names from stock table
  useEffect(() => {
    fetchSales();
    fetchItemOptions();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sales-details');
      // Ensure date is formatted as YYYY-MM-DD for display
      const formatted = res.data.map(sale => ({
        ...sale,
        date: sale.date
          ? typeof sale.date === 'string'
            ? sale.date.slice(0, 10)
            : new Date(sale.date).toISOString().slice(0, 10)
          : ''
      }));
      setSales(formatted);
    } catch (err) {
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch item names from stock table
  const fetchItemOptions = async () => {
    try {
      const res = await api.get('/items');
      // Assuming backend returns array of items with item_name
      setItemOptions(res.data.items.map(item => item.item_name));
    } catch (err) {
      setItemOptions([]);
    }
  };

  // Add item row in form
  const addItemRow = () => {
    setForm(f => ({
      ...f,
      items: [...f.items, { name: '', quantity: 1 }]
    }));
  };

  // Remove item row in form
  const removeItemRow = (idx) => {
    setForm(f => ({
      ...f,
      items: f.items.filter((_, i) => i !== idx)
    }));
  };

  // Handle form input change
  const handleFormChange = (e, idx = null, field = null) => {
    if (idx !== null && field) {
      // Item row change
      const items = [...form.items];
      items[idx][field] = field === 'quantity' ? Number(e.target.value) : e.target.value;
      setForm(f => ({ ...f, items }));
    } else {
      setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    }
  };

  // View sale handler
  const handleViewSale = (sale) => {
    setViewSale(sale);
  };

  // Edit sale handler
  const handleEditSale = (sale) => {
    setEditSale(sale);
    setShowAddForm(true);
    setForm({
      date: sale.date,
      customer: sale.customer,
      items: sale.items.map(i => ({ name: i.name, quantity: i.quantity })),
      total: sale.total
    });
  };

  // Delete sale handler
  const handleDeleteSale = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sale?')) return;
    try {
      await api.delete(`/sales-details/${id}`);
      setSales(prev => prev.filter(sale => sale.id !== id));
    } catch (err) {
      alert('Failed to delete sale');
    }
  };

  // Handle form submit (add or edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editSale) {
        // Call PUT endpoint for update
        await api.put(`/sales-details/${editSale.id}`, {
          date: form.date,
          customer: form.customer,
          items: form.items,
          total: form.total
        });
        setEditSale(null);
        setShowAddForm(false);
        setForm({
          date: '',
          customer: '',
          items: [{ name: '', quantity: 1 }],
          total: ''
        });
        fetchSales();
        return;
      }
      await api.post('/sales-details', {
        date: form.date,
        customer: form.customer,
        items: form.items,
        total: form.total
      });
      setShowAddForm(false);
      setForm({
        date: '',
        customer: '',
        items: [{ name: '', quantity: 1 }],
        total: ''
      });
      fetchSales();
    } catch (err) {
      alert('Failed to add or update sales. Please check your input.');
    }
  };

  // In the add sales form, ensure each item row can select a different item
  // and that the same item cannot be selected twice in the same sale

  // Helper to get available options for a dropdown (exclude already selected except current)
  const getAvailableOptions = (idx) => {
    const selectedNames = form.items.map((item, i) => i !== idx ? item.name : null).filter(Boolean);
    return itemOptions.filter(name => !selectedNames.includes(name));
  };

  // Filtered sales based on filters
  const filteredSales = sales.filter(sale => {
    const matchDate = !filters.date || sale.date === filters.date;
    const matchCustomer = !filters.customer || sale.customer.toLowerCase().includes(filters.customer.toLowerCase());
    const matchItem = !filters.item || sale.items.some(item => item.name === filters.item);
    const matchMin = !filters.min || Number(sale.total) >= Number(filters.min);
    const matchMax = !filters.max || Number(sale.total) <= Number(filters.max);
    return matchDate && matchCustomer && matchItem && matchMin && matchMax;
  });

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#e4f4fa] to-[#b6e0fe] text-[#03648a] font-semibold text-xs shadow transition-all duration-200 flex items-center gap-1"
          style={{ transition: 'all 0.2s', background: 'linear-gradient(to right, #e4f4fa, #b6e0fe)' }}
          onClick={() => setShowAddForm(true)}
          onMouseOver={e => e.currentTarget.style.background = '#c5ecfc'}
          onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(to right, #e4f4fa, #b6e0fe)'}
        >
          <PlusIcon className="w-4 h-4 mr-1 text-[#0492C2]" />
          Add Sales
        </button>
      </div>
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div>
          <label className="block text-xs font-medium text-[#03648a] mb-1">Date</label>
          <input
            type="date"
            value={filters.date}
            onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
            className="px-2 py-1 border border-[#e0eefa] rounded-lg text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#03648a] mb-1">Customer</label>
          <input
            type="text"
            placeholder="Customer name"
            value={filters.customer}
            onChange={e => setFilters(f => ({ ...f, customer: e.target.value }))}
            className="px-2 py-1 border border-[#e0eefa] rounded-lg text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#03648a] mb-1">Item</label>
          <select
            value={filters.item}
            onChange={e => setFilters(f => ({ ...f, item: e.target.value }))}
            className="px-2 py-1 border border-[#e0eefa] rounded-lg text-xs"
          >
            <option value="">All Items</option>
            {itemOptions.map((name, i) => (
              <option key={i} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#03648a] mb-1">Min Total</label>
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={filters.min}
            onChange={e => setFilters(f => ({ ...f, min: e.target.value }))}
            className="px-2 py-1 border border-[#e0eefa] rounded-lg text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#03648a] mb-1">Max Total</label>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.max}
            onChange={e => setFilters(f => ({ ...f, max: e.target.value }))}
            className="px-2 py-1 border border-[#e0eefa] rounded-lg text-xs"
          />
        </div>
        <button
          type="button"
          className="ml-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs border border-[#e0eefa] hover:bg-gray-200"
          onClick={() => setFilters({ date: '', customer: '', item: '', min: '', max: '' })}
        >
          Clear
        </button>
      </div>
      {showAddForm ? (
        <form
          className="bg-white/80 backdrop-blur-sm p-6 space-y-6 rounded-xl shadow border border-[#b6e0fe] mb-6 relative z-10"
          onSubmit={handleFormSubmit}
        >
          <div className="flex flex-wrap items-center justify-between pb-2 border-b border-[#e0eefa] mb-4">
            <h2 className="text-xl font-bold text-[#03648a] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#e4f4fa] to-[#b6e0fe] flex items-center justify-center shadow">
                <PlusIcon className="h-5 w-5 text-[#0492C2]" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0492C2] to-[#b6e0fe]">
                Add Sales
              </span>
            </h2>
            <span className="text-xs font-medium px-2 py-1 bg-gradient-to-r from-white to-[#e4f4fa] text-[#0492C2] rounded-full border border-[#e0eefa]">
              All fields required
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#03648a] mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleFormChange}
                className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#03648a] mb-1">Customer Name</label>
              <input
                type="text"
                name="customer"
                value={form.customer}
                onChange={handleFormChange}
                className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                placeholder="Enter customer name"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#03648a] mb-1">Items &amp; Quantity</label>
            <div className="space-y-2">
              {form.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    value={item.name}
                    onChange={e => handleFormChange({ target: { value: e.target.value } }, idx, 'name')}
                    className="flex-1 px-3 py-2 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent"
                    required
                  >
                    <option value="">Select item</option>
                    {getAvailableOptions(idx).map((name, i) => (
                      <option key={i} value={name}>{name}</option>
                    ))}
                    {/* Show current value if not in available options (for edit) */}
                    {item.name && !itemOptions.includes(item.name) && (
                      <option value={item.name}>{item.name}</option>
                    )}
                  </select>
                  <input
                    type="number"
                    min={1}
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={e => handleFormChange(e, idx, 'quantity')}
                    className="w-20 px-3 py-2 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent"
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
            </div>
            <button
              type="button"
              className="flex items-center text-[#0492C2] hover:underline text-sm mt-2"
              onClick={addItemRow}
              disabled={form.items.length >= itemOptions.length}
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Item
            </button>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#03648a] mb-1">Total Bill</label>
            <input
              type="number"
              name="total"
              value={form.total}
              onChange={handleFormChange}
              className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm shadow hover:bg-gray-300 transition"
              onClick={() => {
                setShowAddForm(false);
                setEditSale(null);
                setForm({
                  date: '',
                  customer: '',
                  items: [{ name: '', quantity: 1 }],
                  total: ''
                });
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold text-sm shadow-md hover:from-[#037ba1] hover:to-[#b6e0fe] transition-all duration-200"
            >
              {editSale ? 'Update Sale' : 'Save Sales'}
            </button>
          </div>
        </form>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#b6e0fe] bg-white/80 shadow mb-8">
          <table className="min-w-full text-[11px] md:text-xs border-separate border-spacing-y-2">
            <thead className="bg-[#e4f4fa] text-[#0492C2]">
              <tr>
                <th className="px-2 py-2 font-semibold text-center">SN</th>
                <th className="px-2 py-2 font-semibold text-center">Date</th>
                <th className="px-2 py-2 font-semibold text-center">Customer Name</th>
                <th className="px-2 py-2 font-semibold text-center">Items &amp; Quantity</th>
                <th className="px-2 py-2 font-semibold text-center">Total Bill</th>
                <th className="px-2 py-2 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-[#0492C2] font-semibold">
                    Loading...
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-400">
                    No sales found.
                  </td>
                </tr>
              ) : (
                filteredSales.map((transaction, idx) => (
                  <tr
                    key={transaction.id}
                    className="items-table-row group transition-all duration-200 align-middle"
                  >
                    <td className="text-center align-middle font-bold text-[#0492C2]">{idx + 1}</td>
                    <td className="text-center align-middle text-[#03648a]">{transaction.date}</td>
                    <td className="text-center align-middle text-[#03648a]">{transaction.customer}</td>
                    <td className="text-center align-middle text-[#03648a]">
                      {transaction.items.map((item, i) => (
                        <span
                          key={i}
                          className="bg-[#e4f4fa] text-[#03648a] px-2 py-0.5 rounded-full text-xs mr-1 inline-block mb-0.5"
                        >
                          {item.name} <span className="font-bold">x{item.quantity}</span>
                        </span>
                      ))}
                    </td>
                    <td className="text-center align-middle text-[#03648a]">
                      LKR {Number(transaction.total).toLocaleString()}
                    </td>
                    <td className="text-center align-middle">
                      <div className="flex gap-1 justify-center items-center">
                        <button
                          className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#0492C2] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                          title="View"
                          onClick={() => handleViewSale(transaction)}
                        >
                          <MdVisibility className="w-4 h-4 drop-shadow" />
                        </button>
                        <button
                          className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#0492C2] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                          title="Edit"
                          onClick={() => handleEditSale(transaction)}
                        >
                          <FaRegEdit className="w-4 h-4 drop-shadow" />
                        </button>
                        <button
                          className="action-btn-3d bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-400 text-red-400 hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                          title="Delete"
                          onClick={() => handleDeleteSale(transaction.id)}
                        >
                          <MdDeleteOutline className="w-4 h-4 drop-shadow" />
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
      )}

      {/* View Sale Modal */}
      {viewSale && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-[#b6e0fe] p-6 max-w-lg w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-[#0492C2]">Sale Details</h2>
              <button
                onClick={() => setViewSale(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="space-y-2">
              <div><span className="font-semibold text-[#03648a]">Date:</span> {viewSale.date}</div>
              <div><span className="font-semibold text-[#03648a]">Customer:</span> {viewSale.customer}</div>
              <div>
                <span className="font-semibold text-[#03648a]">Items:</span>
                <ul className="list-disc ml-6">
                  {viewSale.items.map((item, i) => (
                    <li key={i}>{item.name} x{item.quantity}</li>
                  ))}
                </ul>
              </div>
              <div><span className="font-semibold text-[#03648a]">Total:</span> LKR {Number(viewSale.total).toLocaleString()}</div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewSale(null)}
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
