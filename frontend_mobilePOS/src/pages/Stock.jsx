import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRegEdit } from 'react-icons/fa';
import { MdDeleteOutline, MdVisibility } from 'react-icons/md';



export default function Stock() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filteredStock = hardcodedStock.filter(
    (item) =>
      item.item_name.toLowerCase().includes(search.toLowerCase()) ||
      item.item_code.toLowerCase().includes(search.toLowerCase()) ||
      item.bar_code.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.variant_type.toLowerCase().includes(search.toLowerCase()) ||
      item.variant_option.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full flex justify-center items-start min-h-[calc(100vh-60px)] bg-gradient-to-br from-[#e4f4fa] to-[#f8fbff] py-6 px-1">
      <div className="w-full max-w-6xl bg-white/90 rounded-2xl shadow-2xl border border-[#b6e0fe] p-4 relative animate-fadein">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-[#0492C2] tracking-wide flex items-center gap-2">
            <span>Stock Overview</span>
            <span className="block w-12 md:w-16 h-1 rounded bg-gradient-to-r from-[#0492C2] to-[#b6e0fe]"></span>
          </h1>
          <button
            className="px-4 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition text-xs md:text-sm"
            onClick={() => navigate('/add-stock')}
          >
            + Add Stock
          </button>
        </div>
        <div className="flex justify-between items-center mb-3">
          <input
            type="text"
            placeholder="Search by any column..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs px-3 py-1.5 rounded-lg border border-[#b6e0fe] bg-[#f8fbff] focus:outline-none focus:border-[#0492C2] text-xs md:text-sm shadow"
          />
        </div>
        <div className="overflow-x-auto rounded-lg border border-[#b6e0fe] bg-white/80 shadow">
          <table className="min-w-full text-[11px] md:text-xs">
            <thead className="bg-[#e4f4fa] text-[#0492C2]">
              <tr>
                <th className="px-2 py-2 font-semibold">SM</th>
                <th className="px-2 py-2 font-semibold">Item Code</th>
                <th className="px-2 py-2 font-semibold">Bar Code</th>
                <th className="px-2 py-2 font-semibold">Item Name</th>
                <th className="px-2 py-2 font-semibold">Category</th>
                <th className="px-2 py-2 font-semibold">Variant Type</th>
                <th className="px-2 py-2 font-semibold">Variant Option</th>
                <th className="px-2 py-2 font-semibold">Quantity</th>
                <th className="px-2 py-2 font-semibold">Cost</th>
                <th className="px-2 py-2 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.length > 0 ? (
                filteredStock.map((item, idx) => (
                  <tr key={item.id} className="border-b border-[#e4f4fa] hover:bg-[#f0f9ff] transition group">
                    <td className="px-2 py-2 text-center font-bold">{idx + 1}</td>
                    <td className="px-2 py-2">{item.item_code}</td>
                    <td className="px-2 py-2">{item.bar_code}</td>
                    <td className="px-2 py-2 font-semibold text-[#0492C2]">{item.item_name}</td>
                    <td className="px-2 py-2">{item.category}</td>
                    <td className="px-2 py-2">{item.variant_type}</td>
                    <td className="px-2 py-2">{item.variant_option}</td>
                    <td className="px-2 py-2 text-center font-semibold">{item.quantity}</td>
                    <td className="px-2 py-2 text-right font-semibold text-[#0492C2]">LKR {item.cost.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                    <td className="px-2 py-2 text-center flex gap-1 justify-center items-center">
                      <button
                        className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#0492C2] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                        title="View"
                      >
                        <MdVisibility className="w-4 h-4 drop-shadow" />
                      </button>
                      <button
                        className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#0492C2] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                        title="Edit"
                      >
                        <FaRegEdit className="w-4 h-4 drop-shadow" />
                      </button>
                      <button
                        className="action-btn-3d bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-400 text-red-400 hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                        title="Delete"
                      >
                        <MdDeleteOutline className="w-4 h-4 drop-shadow" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center text-[#0492C2] font-semibold py-8 opacity-70">
                    No stock items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <style>{`
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