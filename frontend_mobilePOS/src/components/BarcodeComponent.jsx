import React, { useState, useEffect } from 'react';
import { BsPrinter, BsEye, BsBoxSeam } from 'react-icons/bs';
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
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Barcode Management</h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Print Type:</span>
            <select 
              className="border rounded p-1 text-sm"
              value={printType}
              onChange={(e) => setPrintType(e.target.value)}
            >
              <option value="sticker">Sticker</option>
              <option value="tag">Price Tag</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Barcode (8-digit)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Update
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col items-start">
                    <img 
                      src={generateBarcode(item)} 
                      alt="Barcode" 
                      className="h-10 w-auto"
                    />
                    <span className="text-xs text-gray-500 mt-1">
                      {item.barcodeNumber || generateBarcodeNumber(item.id)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.item_name || item.name || 'N/A'}</div>
                  <div className="text-sm text-gray-500">Code: {item.model_number || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <BsBoxSeam className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-700">
                      {item.stock} in stock
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(item.updated_at || new Date()).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handlePrint(item)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                    title="Print Barcode"
                  >
                    <BsPrinter className="h-5 w-5 inline" />
                  </button>
                  <button
                    onClick={() => handlePreview(item)}
                    className="text-green-600 hover:text-green-900"
                    title="View Barcode"
                  >
                    <BsEye className="h-5 w-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Barcode Preview Modal */}
      {showPreview && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{selectedItem.name} - Barcode</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col items-center">
              <img 
                src={generateBarcode(selectedItem.id)} 
                alt="Barcode Preview" 
                className="mb-4 w-full max-w-xs"
              />
              <div className="text-center">
                <p className="font-medium">{selectedItem.name}</p>
                <p className="text-sm text-gray-600">ID: {selectedItem.id}</p>
                <p className="text-sm text-gray-600">Price: ${selectedItem.price}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => handlePrint(selectedItem)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <BsPrinter className="h-4 w-4" />
                Print {printType === 'sticker' ? 'Sticker' : 'Tag'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeComponent;
