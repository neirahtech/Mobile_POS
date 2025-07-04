import { useState, useEffect } from 'react';

export default function SupplierForm({ onClose, onSave, editData }) {
  const [form, setForm] = useState({
    name: '',
    contact: '',
    total_purchase: '',
    paid: '',
    discount: '',
    balance: '',
  });

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || '',
        contact: editData.contact || '',
        total_purchase: editData.total_purchase || '',
        paid: editData.paid || '',
        discount: editData.discount || '',
        balance: editData.balance || '',
      });
    } else {
      setForm({
        name: '',
        contact: '',
        total_purchase: '',
        paid: '',
        discount: '',
        balance: '',
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
        <input name="name" type="text" placeholder="Supplier Name" value={form.name} onChange={handleChange} required className="input" />
        <input name="contact" type="text" placeholder="Contact Number" value={form.contact} onChange={handleChange} required className="input" />
        <input name="total_purchase" type="number" placeholder="Total Purchase" value={form.total_purchase} onChange={handleChange} className="input" />
        <input name="paid" type="number" placeholder="Paid" value={form.paid} onChange={handleChange} className="input" />
        <input name="discount" type="number" placeholder="Discount" value={form.discount} onChange={handleChange} className="input" />
        <input name="balance" type="number" placeholder="Balance Pay" value={form.balance} onChange={handleChange} className="input" />
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

