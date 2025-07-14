import React, { useEffect, useState } from 'react';
import api from '../utils/axios';
import { useBranch } from '../context/BranchContext';

export default function StockComponent() {
  const { selectedBranch } = useBranch();
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add filter state
  const [filters, setFilters] = useState({
    name: '',
    code: '',
    category: '',
    minQty: '',
    maxQty: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    const fetchStock = async () => {
      setLoading(true);
      try {
        // Get branch_id - use selectedBranch if available, otherwise default to 1
        const branch_id = selectedBranch?.id || 1;
        
        // Fetch all items for the current branch
        const itemsRes = await api.get('/items', { params: { branch_id } });
        const items = itemsRes.data?.items || [];

        // Fetch all GRNs for the current branch
        const grnRes = await api.get('/grn', { params: { branch_id } });
        const grns = Array.isArray(grnRes.data) ? grnRes.data : grnRes.data?.grns || [];

        // Create maps for GRN data indexed by item_code
        const quantityMap = {}; // item_code -> total quantity
        const latestPriceMap = {}; // item_code -> { retail_price, wholesale_price, invoice_date }

        // Sort GRNs by invoice_date in descending order to get the latest prices
        const sortedGrns = [...grns].sort((a, b) => 
          new Date(b.invoice_date) - new Date(a.invoice_date)
        );

        // Process all GRN items to build quantity and price maps
        sortedGrns.forEach(grn => {
          if (grn.items && Array.isArray(grn.items)) {
            grn.items.forEach(grnItem => {
              const itemCode = grnItem.item_code;
              if (!itemCode) return;

              // Calculate total quantity - sum all quantities from GRN
              const quantity = Number(grnItem.quantity) || 0;
              quantityMap[itemCode] = (quantityMap[itemCode] || 0) + quantity;

              // Get prices
              const retailPrice = Number(grnItem.retail_price) || 0;
              const wholesalePrice = Number(grnItem.wholesale_price) || 0;

              // Only set prices if not already set (since GRNs are sorted by date)
              if (!latestPriceMap[itemCode]) {
                latestPriceMap[itemCode] = {
                  retail_price: retailPrice,
                  wholesale_price: wholesalePrice,
                  invoice_date: grn.invoice_date
                };
              }
            });
          }
        });

        // Build stock data by combining items with GRN data
        const stockData = items.map(item => {
          // Use model_number as the item code to match with GRN
          const itemCode = item.model_number;
          
          // Get GRN data for this item
          const quantity = quantityMap[itemCode] || 0;
          const priceData = latestPriceMap[itemCode] || { retail_price: 0, wholesale_price: 0 };

          // Build image URL
          let imageUrl = '';
          if (item.image) {
            imageUrl = item.image.startsWith('http')
              ? item.image
              : `${api.defaults.baseURL.replace('/api', '')}/uploads/${item.image}`;
          }

          return {
            id: item.id,
            image: imageUrl,
            item_name: item.item_name || '',
            category: item.category_name || '',
            barcode: item.barcode || '',
            item_code: itemCode || '',
            available_qty: quantity,
            retail_price: priceData.retail_price,
            wholesale_price: priceData.wholesale_price
          };
        });

        setStock(stockData);
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setStock([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, [selectedBranch]);

  // Filtered stock based on filters
  const filteredStock = stock.filter(item => {
    const matchName = !filters.name || (item.item_name || '').toLowerCase().includes(filters.name.toLowerCase());
    const matchCode = !filters.code || (item.item_code || '').toLowerCase().includes(filters.code.toLowerCase());
    const matchCategory = !filters.category || (item.category || '').toLowerCase().includes(filters.category.toLowerCase());
    const matchMinQty = !filters.minQty || Number(item.available_qty) >= Number(filters.minQty);
    const matchMaxQty = !filters.maxQty || Number(item.available_qty) <= Number(filters.maxQty);
    const matchMinPrice = !filters.minPrice || Number(item.retail_price) >= Number(filters.minPrice);
    const matchMaxPrice = !filters.maxPrice || Number(item.retail_price) <= Number(filters.maxPrice);
    return matchName && matchCode && matchCategory && matchMinQty && matchMaxQty && matchMinPrice && matchMaxPrice;
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-[#03648a] mb-4">
        Stock Inventory {selectedBranch ? `- ${selectedBranch.name}` : ''}
      </h2>
      
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div>
          <label className="block text-xs font-medium text-[#03648a] mb-1">Name</label>
          <input
            type="text"
            placeholder="Item name"
            value={filters.name}
            onChange={e => setFilters(f => ({ ...f, name: e.target.value }))}
            className="px-2 py-1 border border-[#e0eefa] rounded-lg text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#03648a] mb-1">Code</label>
          <input
            type="text"
            placeholder="Item code"
            value={filters.code}
            onChange={e => setFilters(f => ({ ...f, code: e.target.value }))}
            className="px-2 py-1 border border-[#e0eefa] rounded-lg text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#03648a] mb-1">Category</label>
          <input
            type="text"
            placeholder="Category"
            value={filters.category}
            onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
            className="px-2 py-1 border border-[#e0eefa] rounded-lg text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#03648a] mb-1">Min Qty</label>
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minQty}
            onChange={e => setFilters(f => ({ ...f, minQty: e.target.value }))}
            className="px-2 py-1 border border-[#e0eefa] rounded-lg text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#03648a] mb-1">Max Qty</label>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxQty}
            onChange={e => setFilters(f => ({ ...f, maxQty: e.target.value }))}
            className="px-2 py-1 border border-[#e0eefa] rounded-lg text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#03648a] mb-1">Min Price</label>
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minPrice}
            onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
            className="px-2 py-1 border border-[#e0eefa] rounded-lg text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#03648a] mb-1">Max Price</label>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
            className="px-2 py-1 border border-[#e0eefa] rounded-lg text-xs"
          />
        </div>
        <button
          type="button"
          className="ml-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs border border-[#e0eefa] hover:bg-gray-200"
          onClick={() => setFilters({
            name: '', code: '', category: '', minQty: '', maxQty: '', minPrice: '', maxPrice: ''
          })}
        >
          Clear
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading stock...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#b6e0fe] bg-white/80 shadow mb-8">
          <table className="min-w-full text-[11px] md:text-xs border-separate border-spacing-y-2">
            <thead className="bg-[#e4f4fa] text-[#0492C2]">
              <tr>
                <th className="px-2 py-2 font-semibold text-center">Image</th>
                <th className="px-2 py-2 font-semibold text-center">Item Name</th>
                <th className="px-2 py-2 font-semibold text-center">Category</th>
                <th className="px-2 py-2 font-semibold text-center">Barcode</th>
                <th className="px-2 py-2 font-semibold text-center">Available Qty</th>
                <th className="px-2 py-2 font-semibold text-center">Retail Price</th>
                <th className="px-2 py-2 font-semibold text-center">Wholesale Price</th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.length > 0 ? filteredStock.map(item => (
                <tr
                  key={item.id}
                  className="items-table-row group transition-all duration-200 align-middle text-[#03648a]"
                  style={{
                    height: '56px',
                    borderRadius: '18px',
                    background: '#fff',
                  }}
                >
                  <td className="text-center align-middle">
                    <div className="w-10 h-7 mx-auto flex items-center justify-center rounded-md border border-[#e0eefa] bg-[#f8fbff] overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.item_name}
                          className="w-full h-full object-cover"
                          style={{ minWidth: '40px', minHeight: '28px' }}
                          onError={e => { 
                            e.target.onerror = null; 
                            e.target.src = '/no-image.png'; 
                          }}
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">No Image</span>
                      )}
                    </div>
                  </td>
                  <td className="text-center align-middle">{item.item_name}</td>
                  <td className="text-center align-middle">{item.category}</td>
                  <td className="text-center align-middle">{item.barcode}</td>
                  <td className="text-center align-middle font-bold">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.available_qty === 0 
                        ? 'bg-red-100 text-red-600' 
                        : item.available_qty < 10 
                        ? 'bg-yellow-100 text-yellow-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {item.available_qty}
                    </span>
                  </td>
                  <td className="text-center align-middle">
                    LKR {Number(item.retail_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-center align-middle">
                    LKR {Number(item.wholesale_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-4">
                    No stock data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      
    </div>
  );
}