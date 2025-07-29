import React, { useState, useEffect } from 'react';
import { BsPrinter, BsBoxSeam } from 'react-icons/bs';
import { MdVisibility } from 'react-icons/md';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import JsBarcode from 'jsbarcode';
import api from '../utils/axios';

// Helper function to generate 8-digit barcode from item ID
const generateBarcodeNumber = (id) => {
  // Convert ID to string and pad with leading zeros to make it 8 digits
  return String(id).padStart(8, '0');
};

const BarcodeComponent = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printType, setPrintType] = useState('sticker'); // 'sticker' or 'tag'
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchItemsWithStock();
  }, []);

  const fetchItemsWithStock = async () => {
    setLoading(true);
    try {
      // Fetch all items
      const itemsRes = await api.get('/items');
      const itemsList = itemsRes.data.items || [];

      // Fetch all GRNs
      const grnRes = await api.get('/grn');
      const grns = Array.isArray(grnRes.data) ? grnRes.data : grnRes.data?.grns || [];

      // Fetch all sales details
      const salesRes = await api.get('/sales-details');
      const sales = Array.isArray(salesRes.data) ? salesRes.data : [];

      const today = new Date().toISOString().slice(0, 10);

      // Build GRN quantity map: item_code -> sum of quantity up to today
      const grnQuantityMap = {};
      grns.forEach(grn => {
        if (!grn.invoice_date || grn.invoice_date > today) return;
        if (grn.items && Array.isArray(grn.items)) {
          grn.items.forEach(grnItem => {
            const itemCode = grnItem.item_code || grnItem.code;
            if (!itemCode) return;
            const quantity = Number(grnItem.quantity) || 0;
            grnQuantityMap[itemCode] = (grnQuantityMap[itemCode] || 0) + quantity;
          });
        }
      });

      // Build sales quantity map: item_code -> sum of sold quantity up to today
      const salesQuantityMap = {};
      sales.forEach(sale => {
        if (!sale.date || sale.date > today) return;
        if (Array.isArray(sale.items)) {
          sale.items.forEach(saleItem => {
            let itemCode = saleItem.item_code;
            if (!itemCode && saleItem.name) {
              const found = itemsList.find(i => i.item_name === saleItem.name || i.name === saleItem.name);
              itemCode = found ? (found.model_number || found.item_code) : '';
            }
            if (!itemCode) return;
            const qty = Number(saleItem.quantity) || 0;
            salesQuantityMap[itemCode] = (salesQuantityMap[itemCode] || 0) + qty;
          });
        }
      });

      // Map items to include barcode number and stock
      const itemsWithBarcodes = itemsList.map(item => {
        const itemCode = item.model_number || item.item_code;
        const grnQty = grnQuantityMap[itemCode] || 0;
        const salesQty = salesQuantityMap[itemCode] || 0;
        let available = grnQty - salesQty;
        if (available <= 0) available = 0;
        return {
          ...item,
          barcodeNumber: generateBarcodeNumber(item.id),
          stock: available
        };
      });

      setItems(itemsWithBarcodes);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setLoading(false);
    }
  };

  const generateBarcode = (item) => {
    const canvas = document.createElement('canvas');
    const barcodeNumber = item.barcodeNumber || generateBarcodeNumber(item.id);
    JsBarcode(canvas, barcodeNumber, {
      format: 'CODE128',
      displayValue: true,
      width: 2,
      height: 50,
      fontSize: 12,
      margin: 5
    });
    return canvas.toDataURL('image/png');
  };

  const handlePrint = (item) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    const barcodeNumber = item.barcodeNumber || generateBarcodeNumber(item.id);
    const barcodeData = generateBarcode(item);
    
    // Create HTML content for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Barcode - ${item.item_name || item.name || 'Item'}</title>
        <style>
          @page { 
            margin: 0.5cm;
            size: ${printType === 'sticker' ? '3.5in 2in' : '3in 5in'};
          }
          body { 
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
          }
          .barcode-container { 
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            page-break-inside: avoid;
          }
          .barcode-img { 
            max-width: 100%;
            height: auto;
            margin: 0 auto;
            image-rendering: crisp-edges;
          }
          .item-details { 
            text-align: center;
            width: 100%;
          }
          .sticker {
            width: 3.5in;
            height: 2in;
            padding: 5mm;
            box-sizing: border-box;
            border: 1px dashed #ccc;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .sticker .barcode-img {
            max-height: 50%;
          }
          .sticker .item-details {
            font-size: 10px;
          }
          .sticker .item-name {
            font-weight: bold;
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .sticker .item-price {
            font-size: 14px;
            font-weight: bold;
            color: #d32f2f;
            margin-top: 3px;
          }
          .tag {
            width: 3in;
            height: 5in;
            padding: 10mm;
            box-sizing: border-box;
            border: 1px solid #333;
            position: relative;
          }
          .tag .barcode-img {
            max-height: 60%;
            margin-bottom: 10px;
          }
          .tag .item-details {
            margin-top: 10px;
          }
          .tag .item-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .tag .item-code {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
          }
          .tag .item-price {
            font-size: 24px;
            font-weight: bold;
            color: #d32f2f;
            margin: 10px 0;
          }
          .tag .barcode-number {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            letter-spacing: 1px;
            margin-top: 5px;
          }
          .tag .store-info {
            position: absolute;
            bottom: 10px;
            width: calc(100% - 20mm);
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 5px;
          }
        </style>
      </head>
      <body>
        <div class="${printType === 'sticker' ? 'sticker' : 'tag'}">
          <div class="barcode-container">
            <img src="${barcodeData}" alt="Barcode" class="barcode-img"/>
            <div class="item-details">
              ${printType === 'sticker' ? `
                <div class="item-name">${(item.item_name || item.name || 'N/A').substring(0, 20)}${(item.item_name || item.name || '').length > 20 ? '...' : ''}</div>
                ${(item.retail_price || item.price) ? `<div class="item-price">$${(parseFloat(item.retail_price || item.price) || 0).toFixed(2)}</div>` : ''}
                <div class="barcode-number">${barcodeNumber}</div>
              ` : `
                <div class="item-name">${item.item_name || item.name || 'N/A'}</div>
                <div class="item-code">${item.model_number || 'N/A'}</div>
                ${(item.retail_price || item.price) ? `<div class="item-price">$${(parseFloat(item.retail_price || item.price) || 0).toFixed(2)}</div>` : ''}
                <div class="barcode-number">${barcodeNumber.match(/.{1,4}/g).join(' ')}</div>
                <div class="store-info">Your Store Name • ${new Date().toLocaleDateString()}</div>
              `}
            </div>
          </div>
        </div>
        <script>
          // Auto-print when the window loads
          window.onload = function() {
            setTimeout(function() {
              window.print();
              // Close the window after printing
              window.onafterprint = function() {
                window.close();
              };
            }, 500);
          };
        </script>
      </body>
      </html>
    `;
    
    // Write the content to the new window
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handlePreview = (item) => {
    setSelectedItem(item);
    setShowPreview(true);
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading items...</div>;
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header with hole effect */}
      <div className="relative w-full pl-2 -mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="
              w-[180px] h-[36px]
              flex items-center justify-center
              rounded-full
              bg-white
              shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
              <div className="
                w-[170px] h-[30px]
                flex items-center justify-center
                rounded-full
                bg-white
                border border-[#d0d7f2]
                text-[#0b27b1] text-[13px] font-semibold -mt-0.5
                shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.8)]
              ">
                Barcode Management
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#5a6e9a]">Print Type:</span>
            <select 
              className="px-3 py-1.5 text-sm text-[#2d3748] border border-[#e0e4ed] rounded-lg 
                shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.8)]
                focus:outline-none focus:ring-2 focus:ring-[#0b27b1]/50"
              value={printType}
              onChange={(e) => setPrintType(e.target.value)}
            >
              <option value="sticker">Sticker</option>
              <option value="tag">Price Tag</option>
            </select>
          </div>
        </div>
      </div>

      {/* Barcodes Table */}
      <div className="bg-white rounded-lg shadow-sm border border-[#e0e4ed] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#e0e4ed]">
            <thead className="bg-[#f8f9fd]">
              <tr>
                <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-[#5a6e9a] uppercase tracking-wider">
                  SN
                </th>
                <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-[#5a6e9a] uppercase tracking-wider">
                  Barcode
                </th>
                <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-[#5a6e9a] uppercase tracking-wider">
                  Item Name
                </th>
                <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-[#5a6e9a] uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-[#5a6e9a] uppercase tracking-wider">
                  Last Update
                </th>
                <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-[#5a6e9a] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#e0e4ed]">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                      <p className="text-sm font-medium text-gray-500">No barcode items found</p>
                      <p className="text-xs text-gray-400">Add items to generate barcodes</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700 text-center">
                      {index + 1}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        <img 
                          src={generateBarcode(item)} 
                          alt="Barcode" 
                          className="h-8 w-auto"
                        />
                        <span className="text-xs text-gray-500 mt-0.5">
                          {item.barcodeNumber || generateBarcodeNumber(item.id)}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.item_name || item.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.model_number ? `Code: ${item.model_number}` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        <BsBoxSeam className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          item.stock === 0 
                            ? 'bg-red-100 text-red-800' 
                            : item.stock < 10 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {item.stock} in stock
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center text-sm text-[#4a5568]">
                      {new Date(item.updated_at || new Date()).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center text-sm">
                      <div className="flex justify-center items-center space-x-1">
                        <button
                          onClick={() => handlePreview(item)}
                          className="p-1.5 rounded-lg bg-white border border-[#e0e4ed] text-[#5a6e9a] hover:bg-[#f0f4ff] hover:text-[#0b27b1] transition-colors duration-200 shadow-sm"
                          title="View Barcode"
                        >
                          <MdVisibility className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrint(item)}
                          className="p-1.5 rounded-lg bg-white border border-[#e0e4ed] text-[#5a6e9a] hover:bg-[#f0f4ff] hover:text-[#0b27b1] transition-colors duration-200 shadow-sm"
                          title="Print Barcode"
                        >
                          <BsPrinter className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Barcode Preview Modal */}
      {showPreview && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="sticky top-0 bg-white border-b border-[#e0e4ed] p-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-[#03648a]">
                  {selectedItem.name || selectedItem.item_name || 'Item'} - Barcode
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col items-center">
                <img 
                  src={generateBarcode(selectedItem)} 
                  alt="Barcode Preview" 
                  className="mb-6 w-full max-w-xs"
                />
                <div className="text-center w-full">
                  <p className="font-medium text-[#2d3748] text-lg">
                    {selectedItem.name || selectedItem.item_name || 'N/A'}
                  </p>
                  {selectedItem.model_number && (
                    <p className="text-sm text-[#5a6e9a] mt-1">
                      Code: {selectedItem.model_number}
                    </p>
                  )}
                  {(selectedItem.retail_price || selectedItem.price) && (
                    <p className="text-lg font-bold text-[#0b27b1] mt-2">
                      ${(parseFloat(selectedItem.retail_price || selectedItem.price) || 0).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => handlePrint(selectedItem)}
                  className="px-6 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition flex items-center gap-2"
                >
                  <BsPrinter className="w-4 h-4" />
                  Print {printType === 'sticker' ? 'Sticker' : 'Tag'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeComponent;
