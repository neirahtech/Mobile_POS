import { useState, useEffect } from 'react';
import api from '../utils/axios';

export default function PurchaseOrderForm({ onClose, onSave, editData }) {
  const [form, setForm] = useState({
    orderNo: '',
    supplier: '',
    date: '',
    status: '',
    amount: '',
  });
  const [suppliers, setSuppliers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Fetch suppliers for dropdown
    const fetchSuppliers = async () => {
      try {
        const res = await api.get('/suppliers');
        setSuppliers(res.data);
      } catch {
        setSuppliers([]);
      }
    };
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (editData) {
      setForm({
        orderNo: editData.orderNo || '',
        supplier: editData.supplier || '',
        date: editData.date ? editData.date.slice(0, 10) : '',
        status: editData.status || '',
        amount: editData.amount || '',
      });
    } else {
      setForm({
        orderNo: '',
        supplier: '',
        date: '',
        status: '',
        amount: '',
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-[#f8fbff] rounded-lg p-4 border border-[#b6e0fe] shadow space-y-2 animate-fadein">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input name="orderNo" type="text" placeholder="Order No" value={form.orderNo} onChange={handleChange} required className="input" />
        {/* Custom styled dropdown with typing support */}
        <div className="relative">
          <input
            name="supplier"
            value={form.supplier}
            onChange={handleChange}
            required
            className="input"
            placeholder="Select or type supplier"
            autoComplete="off"
            onFocus={e => setShowDropdown(true)}
            onBlur={e => setTimeout(() => setShowDropdown(false), 150)}
          />
          {/* Dropdown list */}
          {showDropdown && suppliers.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-[#b6e0fe] rounded-lg shadow max-h-40 overflow-auto">
              {suppliers.map(s => (
                <div
                  key={s.id}
                  className={`px-4 py-2 hover:bg-[#e4f4fa] cursor-pointer text-[#03648a] ${
                    form.supplier === s.name ? 'bg-[#e4f4fa] font-semibold' : ''
                  }`}
                  onMouseDown={() => setForm(prev => ({ ...prev, supplier: s.name }))}
                >
                  {s.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <input name="date" type="date" placeholder="Date" value={form.date} onChange={handleChange} required className="input" />
        <input name="status" type="text" placeholder="Status" value={form.status} onChange={handleChange} required className="input" />
        <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleChange} required className="input" />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-300 transition text-xs" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="px-6 py-1.5 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition text-xs">
          {editData ? 'Update' : 'Save'}
        </button>
      </div>
    </form>
  );
}

