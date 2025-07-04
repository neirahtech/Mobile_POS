import React, { useEffect, useState } from 'react';
import api from '../utils/axios';

export default function StockComponent() {
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
        // Fetch all items with their full details
        const itemsRes = await api.get('/items');
        const items = itemsRes.data?.items || [];

        // Fetch GRNs for stock calculations
        const grnRes = await api.get('/grn');
        const grns = Array.isArray(grnRes.data) ? grnRes.data : grnRes.data?.grns || [];

        // Build maps for quantities, latest prices, wholesale prices, and discounts from GRNs
        const qtyMap = {};
        const priceMap = {};
        const wholesalePriceMap = {};
        const discountMap = {};

        // Process GRNs in reverse order to get latest prices and discounts
        [...grns].reverse().forEach(grn => {
          (grn.items || []).forEach(item => {
            const code = item.item_code || item.code;
            qtyMap[code] = (qtyMap[code] || 0) + Number(item.quantity || 0);

            // Only update price/discount if this GRN is newer (higher ID) than what we have
            if (!priceMap[code] || grn.id > priceMap[code].grnId) {
              priceMap[code] = {
                price: item.retail_price || item.price || 0,
                grnId: grn.id
              };
              wholesalePriceMap[code] = {
                price: item.wholesale_price || 0,
                grnId: grn.id
              };
              discountMap[code] = {
                discount: item.sale_discount || 0,
                grnId: grn.id
              };
            }
          });
        });

        // Get all unique codes from both GRN and items table
        const allCodesSet = new Set();
        grns.forEach(grn => {
          (grn.items || []).forEach(grnItem => {
            const code = grnItem.item_code || grnItem.code;
            allCodesSet.add(code);
          });
        });
        items.forEach(item => {
          const code = item.item_code || item.model_number || item.code || '';
          if (code) allCodesSet.add(code);
        });
        const allCodes = Array.from(allCodesSet);

        // Compose stock list for all codes
        const stockList = allCodes.map(code => {
          // Try to find item details from GRN first, then from items table
          let grnItem = null;
          for (const grn of grns) {
            grnItem = (grn.items || []).find(i => (i.item_code || i.code) === code);
            if (grnItem) break;
          }
          const item = items.find(i => (i.item_code || i.model_number || i.code) === code) || {};

          // Prefer GRN name/image/category if available, else fallback to items table
          const name = grnItem?.item_name || grnItem?.name || item.name || item.item_name || code;
          let imageUrl = '';
          if (grnItem?.image_url) imageUrl = grnItem.image_url;
          else if (item.image_url) imageUrl = item.image_url;
          else if (item.image) {
            imageUrl = item.image.startsWith('http')
              ? item.image
              : `${api.defaults.baseURL.replace('/api', '')}/uploads/${item.image}`;
          }
          const category = grnItem?.category || grnItem?.category_name || item.category || item.category_name || '';

          return {
            id: item.id || code,
            name,
            image: imageUrl,
            code,
            price: (priceMap[code]?.price) || item.retail_price || item.retailPrice || item.price || 0,
            wholesale_price: (wholesalePriceMap[code]?.price) || item.wholesale_price || item.wholesalePrice || 0,
            available_qty: qtyMap[code] || 0,
            discount: (discountMap[code]?.discount) || item.sale_discount || 0,
            category
          };
        });

        setStock(stockList);
      } catch (err) {
        console.error('Error fetching stock:', err);
        setStock([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, []);

  // Filtered stock based on filters
  const filteredStock = stock.filter(item => {
    const matchName = !filters.name || (item.name || '').toLowerCase().includes(filters.name.toLowerCase());
    const matchCode = !filters.code || (item.code || '').toLowerCase().includes(filters.code.toLowerCase());
    const matchCategory = !filters.category || (item.category || '').toLowerCase().includes(filters.category.toLowerCase());
    const matchMinQty = !filters.minQty || Number(item.available_qty) >= Number(filters.minQty);
    const matchMaxQty = !filters.maxQty || Number(item.available_qty) <= Number(filters.maxQty);
    const matchMinPrice = !filters.minPrice || Number(item.price) >= Number(filters.minPrice);
    const matchMaxPrice = !filters.maxPrice || Number(item.price) <= Number(filters.maxPrice);
    return matchName && matchCode && matchCategory && matchMinQty && matchMaxQty && matchMinPrice && matchMaxPrice;
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-[#03648a] mb-4">Stock Inventory</h2>
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
                <th className="px-2 py-2 font-semibold text-center">Discount</th>
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
                          alt={item.name}
                          className="w-full h-full object-cover"
                          style={{ minWidth: '40px', minHeight: '28px' }}
                          onError={e => { e.target.onerror = null; e.target.src = '/no-image.png'; }}
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">No Image</span>
                      )}
                    </div>
                  </td>
                  <td className="text-center align-middle">{item.name}</td>
                  <td className="text-center align-middle">{item.category}</td>
                  <td className="text-center align-middle">{item.code}</td>
                  <td className="text-center align-middle font-bold">{item.available_qty}</td>
                  <td className="text-center align-middle">LKR {Number(item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="text-center align-middle">LKR {Number(item.wholesale_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="text-center align-middle">LKR {Number(item.discount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="text-center text-gray-400 py-4">No stock data found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// How Available Qty is calculated:
// For each item code, Available Qty is the sum of all 'quantity' fields for that code from all GRNs.
// Example: If GRN1 has 5 units of code X and GRN2 has 3 units of code X, Available Qty for X = 8.
