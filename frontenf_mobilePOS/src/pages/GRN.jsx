import { useState } from 'react';

const hardcodedGRNs = [
  {
    id: 1,
    code: 1001,
    supplier_code: 2001,
    invoice_code: 'INV-001',
    invoice_date: '2024-06-01',
    grn_date: '2024-06-02',
    total_amount: 10000.00,
    discount: 500.00,
    sub_total_amount: 9500.00,
    paid_amount: 9500.00,
    prints: 1,
    paid_status: true,
    is_lock: false,
    is_active: true,
    created_by: 'admin',
    updated_by: 'admin',
  },
  {
    id: 2,
    code: 1002,
    supplier_code: 2002,
    invoice_code: 'INV-002',
    invoice_date: '2024-06-03',
    grn_date: '2024-06-04',
    total_amount: 20000.00,
    discount: 1000.00,
    sub_total_amount: 19000.00,
    paid_amount: 15000.00,
    prints: 1,
    paid_status: false,
    is_lock: false,
    is_active: true,
    created_by: 'manager',
    updated_by: 'manager',
  },
   {
    id: 3,
    code: 1003,
    supplier_code: 2003,
    invoice_code: 'INV-003',
    invoice_date: '2024-06-04',
    grn_date: '2024-06-04',
    total_amount: 20000.00,
    discount: 1000.00,
    sub_total_amount: 19000.00,
    paid_amount: 15000.00,
    prints: 1,
    paid_status: true,
    is_lock: false,
    is_active: true,
    created_by: 'manager',
    updated_by: 'manager',
  },
  {
    id: 4,
    code: 1004,
    supplier_code: 2004,
    invoice_code: 'INV-004',
    invoice_date: '2024-06-05',
    grn_date: '2024-06-04',
    total_amount: 20000.00,
    discount: 1000.00,
    sub_total_amount: 19000.00,
    paid_amount: 15000.00,
    prints: 1,
    paid_status: false,
    is_lock: false,
    is_active: true,
    created_by: 'manager',
    updated_by: 'manager',
  },
  {
    id: 5,
    code: 1005,
    supplier_code: 2005,
    invoice_code: 'INV-003',
    invoice_date: '2024-06-04',
    grn_date: '2024-06-04',
    total_amount: 20000.00,
    discount: 1000.00,
    sub_total_amount: 19000.00,
    paid_amount: 15000.00,
    prints: 1,
    paid_status: true,
    is_lock: false,
    is_active: true,
    created_by: 'manager',
    updated_by: 'manager',
  },
];

export default function GRN() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '',
    supplier_code: '',
    invoice_code: '',
    invoice_date: '',
    grn_date: '',
    total_amount: '',
    discount: '',
    sub_total_amount: '',
    paid_amount: '',
    prints: 1,
    paid_status: false,
    is_lock: false,
    is_active: true,
    created_by: '',
    updated_by: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Integrate with backend
    alert('GRN saved!\n' + JSON.stringify(form, null, 2));
    setShowForm(false);
  };

  return (
    <div className="w-full flex justify-center items-start min-h-[calc(100vh-60px)] bg-gradient-to-br from-[#e4f4fa] to-[#f8fbff] py-8 px-2">
      <div className="w-full max-w-4xl bg-white/90 rounded-2xl shadow-2xl border border-[#b6e0fe] p-6 relative animate-fadein">
        <h1 className="text-2xl font-bold text-[#0492C2] mb-6 tracking-wide flex items-center gap-2">
          <span>Goods Received Note (GRN)</span>
          <span className="block w-16 h-1 rounded bg-gradient-to-r from-[#0492C2] to-[#b6e0fe]"></span>
        </h1>
        {!showForm ? (
          <>
            <div className="flex justify-end mb-3">
              <button
                className="px-6 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition"
                onClick={() => setShowForm(true)}
              >
                Add GRN
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-[#b6e0fe] bg-white/80">
              <table className="min-w-full text-xs md:text-sm">
                <thead className="bg-[#e4f4fa] text-[#0492C2]">
                  <tr>
                    <th className="px-2 py-2">GRN Code</th>
                    <th className="px-2 py-2">Supplier Code</th>
                    <th className="px-2 py-2">Invoice Code</th>
                    <th className="px-2 py-2">Invoice Date</th>
                    <th className="px-2 py-2">GRN Date</th>
                    <th className="px-2 py-2">Total</th>
                    <th className="px-2 py-2">Paid</th>
                    <th className="px-2 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hardcodedGRNs.map((grn) => (
                    <tr key={grn.id} className="border-b border-[#e4f4fa] hover:bg-[#f0f9ff] transition">
                      <td className="px-2 py-2">{grn.code}</td>
                      <td className="px-2 py-2">{grn.supplier_code}</td>
                      <td className="px-2 py-2">{grn.invoice_code}</td>
                      <td className="px-2 py-2">{grn.invoice_date}</td>
                      <td className="px-2 py-2">{grn.grn_date}</td>
                      <td className="px-2 py-2">LKR {grn.total_amount.toFixed(2)}</td>
                      <td className="px-2 py-2">LKR {grn.paid_amount.toFixed(2)}</td>
                      <td className="px-2 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${grn.paid_status ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {grn.paid_status ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="grn-label">GRN Code</label>
                <input name="code" type="number" value={form.code} onChange={handleChange} required className="grn-input" />
              </div>
              <div>
                <label className="grn-label">Supplier Code</label>
                <input name="supplier_code" type="number" value={form.supplier_code} onChange={handleChange} required className="grn-input" />
              </div>
              <div>
                <label className="grn-label">Invoice Code</label>
                <input name="invoice_code" type="text" value={form.invoice_code} onChange={handleChange} className="grn-input" />
              </div>
              <div>
                <label className="grn-label">Invoice Date</label>
                <input name="invoice_date" type="date" value={form.invoice_date} onChange={handleChange} className="grn-input" />
              </div>
              <div>
                <label className="grn-label">GRN Date</label>
                <input name="grn_date" type="date" value={form.grn_date} onChange={handleChange} className="grn-input" />
              </div>
              <div>
                <label className="grn-label">Total Amount</label>
                <input name="total_amount" type="number" step="0.01" value={form.total_amount} onChange={handleChange} className="grn-input" />
              </div>
              <div>
                <label className="grn-label">Discount</label>
                <input name="discount" type="number" step="0.01" value={form.discount} onChange={handleChange} className="grn-input" />
              </div>
              <div>
                <label className="grn-label">Sub Total Amount</label>
                <input name="sub_total_amount" type="number" step="0.01" value={form.sub_total_amount} onChange={handleChange} className="grn-input" />
              </div>
              <div>
                <label className="grn-label">Paid Amount</label>
                <input name="paid_amount" type="number" step="0.01" value={form.paid_amount} onChange={handleChange} className="grn-input" />
              </div>
              <div>
                <label className="grn-label">Prints</label>
                <input name="prints" type="number" value={form.prints} onChange={handleChange} className="grn-input" />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input name="paid_status" type="checkbox" checked={form.paid_status} onChange={handleChange} className="grn-checkbox" id="paid_status" />
                <label htmlFor="paid_status" className="grn-label !mb-0">Paid Status</label>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input name="is_lock" type="checkbox" checked={form.is_lock} onChange={handleChange} className="grn-checkbox" id="is_lock" />
                <label htmlFor="is_lock" className="grn-label !mb-0">Is Lock</label>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} className="grn-checkbox" id="is_active" />
                <label htmlFor="is_active" className="grn-label !mb-0">Is Active</label>
              </div>
              <div>
                <label className="grn-label">Created By</label>
                <input name="created_by" type="text" value={form.created_by} onChange={handleChange} className="grn-input" />
              </div>
              <div>
                <label className="grn-label">Updated By</label>
                <input name="updated_by" type="text" value={form.updated_by} onChange={handleChange} className="grn-input" />
              </div>
            </div>
            <div className="flex justify-end mt-6 gap-2">
              <button
                type="button"
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-300 transition"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="px-8 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow-lg hover:from-[#037ba1] hover:to-[#b6e0fe] transition-all duration-200">
                Save GRN
              </button>
            </div>
          </form>
        )}
        <style>{`
          .grn-label {
            display: block;
            font-size: 0.95rem;
            color: #0492C2;
            font-weight: 500;
            margin-bottom: 0.25rem;
            letter-spacing: 0.01em;
          }
          .grn-input {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border-radius: 0.5rem;
            border: 1.5px solid #b6e0fe;
            background: #f8fbff;
            font-size: 1rem;
            transition: border 0.2s, background 0.2s;
          }
          .grn-input:focus {
            outline: none;
            border-color: #0492C2;
            background: #fff;
          }
          .grn-checkbox {
            width: 1.1rem;
            height: 1.1rem;
            accent-color: #0492C2;
          }
          .animate-fadein {
            animation: fadein 0.7s cubic-bezier(.4,0,.2,1);
          }
          @keyframes fadein {
            from { opacity: 0; transform: translateY(24px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}</style>
      </div>
    </div>
  );
}
