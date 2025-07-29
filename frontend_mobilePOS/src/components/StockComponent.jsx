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
    <div className="space-y-4 p-4">
      {/* Stock List Header with hole effect */}
      <div className="relative w-full pl-2 -mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="
              w-[140px] h-[36px]
              flex items-center justify-center
              rounded-full
              bg-white
              shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
              <div className="
                w-[130px] h-[30px]
                flex items-center justify-center
                rounded-full
                bg-white
                border border-[#d0d7f2]
                text-[#0b27b1] text-[13px] font-semibold -mt-0.5
                shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.8)]
              ">
                Stock List
              </div>
            </div>
            {selectedBranch && (
              <span className="ml-3 text-sm text-[#5a6e9a]">
                {selectedBranch.name}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Filter Section */}
      <div className="bg-white rounded-lg p-3 shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#5a6e9a] mb-1">Item Name</label>
            <input
              type="text"
              placeholder="Search by name"
              value={filters.name}
              onChange={e => setFilters(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-1.5 text-sm border border-[#e0e4ed] rounded-lg 
                shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.8)]
                focus:outline-none focus:ring-2 focus:ring-[#0b27b1]/50"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-[#5a6e9a] mb-1">Item Code</label>
            <input
              type="text"
              placeholder="Search by code"
              value={filters.code}
              onChange={e => setFilters(f => ({ ...f, code: e.target.value }))}
              className="w-full px-3 py-1.5 text-sm border border-[#e0e4ed] rounded-lg 
                shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.8)]
                focus:outline-none focus:ring-2 focus:ring-[#0b27b1]/50"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-[#5a6e9a] mb-1">Category</label>
            <input
              type="text"
              placeholder="Filter by category"
              value={filters.category}
              onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-1.5 text-sm border border-[#e0e4ed] rounded-lg 
                shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.8)]
                focus:outline-none focus:ring-2 focus:ring-[#0b27b1]/50"
            />
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              type="button"
              onClick={() => setFilters({
                name: '', code: '', category: '', minQty: '', maxQty: '', minPrice: '', maxPrice: ''
              })}
              className="px-4 py-1.5 bg-white text-[#5a6e9a] rounded-lg text-sm font-medium border border-[#e0e4ed]
                shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:bg-gray-50 transition-all duration-200
                active:translate-y-px"
            >
              Clear Filters
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-[#5a6e9a] mb-1">Min Qty</label>
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={filters.minQty}
                onChange={e => setFilters(f => ({ ...f, minQty: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border border-[#e0e4ed] rounded-lg 
                  shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.8)]
                  focus:outline-none focus:ring-2 focus:ring-[#0b27b1]/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5a6e9a] mb-1">Max Qty</label>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={filters.maxQty}
                onChange={e => setFilters(f => ({ ...f, maxQty: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border border-[#e0e4ed] rounded-lg 
                  shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.8)]
                  focus:outline-none focus:ring-2 focus:ring-[#0b27b1]/50"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-[#5a6e9a] mb-1">Min Price</label>
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={filters.minPrice}
                onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border border-[#e0e4ed] rounded-lg 
                  shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.8)]
                  focus:outline-none focus:ring-2 focus:ring-[#0b27b1]/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5a6e9a] mb-1">Max Price</label>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border border-[#e0e4ed] rounded-lg 
                  shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.8)]
                  focus:outline-none focus:ring-2 focus:ring-[#0b27b1]/50"
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-pulse flex flex-col items-center space-y-2">
            <div className="w-8 h-8 border-4 border-t-[#0b27b1] border-r-[#0b27b1] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <span className="text-[#5a6e9a] text-sm">Loading stock data...</span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-[#e0e4ed] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#e0e4ed]">
              <thead className="bg-[#f8f9fd]">
                <tr>
                  <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-[#5a6e9a] uppercase tracking-wider">
                    SN
                  </th>
                  <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-[#5a6e9a] uppercase tracking-wider">
                    Image
                  </th>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-[#5a6e9a] uppercase tracking-wider">
                    Item Name
                  </th>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-[#5a6e9a] uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-[#5a6e9a] uppercase tracking-wider">
                    Barcode
                  </th>
                  <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-[#5a6e9a] uppercase tracking-wider">
                    Qty
                  </th>
                  <th scope="col" className="px-2 py-2 text-right text-xs font-medium text-[#5a6e9a] uppercase tracking-wider">
                    Retail
                  </th>
                  <th scope="col" className="px-2 py-2 text-right text-xs font-medium text-[#5a6e9a] uppercase tracking-wider">
                    Wholesale
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#e0e4ed]">
                {filteredStock.length > 0 ? filteredStock.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700 text-center">
                      {index + 1}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div className="w-8 h-8 mx-auto bg-white rounded-md border border-[#e0e4ed] overflow-hidden flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.item_name}
                            className="w-full h-full object-cover"
                            onError={e => { 
                              e.target.onerror = null; 
                              e.target.src = '/no-image.png'; 
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-gray-50">
                            <span className="text-[10px] text-gray-400">No Image</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.item_name}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {item.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-center text-sm text-gray-700 font-mono">
                      {item.barcode || '-'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.available_qty === 0 
                          ? 'bg-red-100 text-red-800' 
                          : item.available_qty < 10 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.available_qty}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700 text-right">
                      {Number(item.retail_price || 0).toFixed(2)}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm font-semibold text-gray-700 text-right">
                      {Number(item.wholesale_price || 0).toFixed(2)}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293L8.293 13.293A1 1 0 007.586 13H4"></path>
                        </svg>
                        <p className="text-sm font-medium text-gray-500">No stock data found</p>
                        <p className="text-xs text-gray-400">Try adjusting your filters or add new stock</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      
    </div>
  );
}