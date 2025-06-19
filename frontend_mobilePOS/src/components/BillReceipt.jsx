import React, { useRef } from 'react';
import {
  CheckCircleIcon,
  PhoneIcon,
  MapPinIcon,
  XMarkIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';

export default function BillReceipt({ order, onClose }) {
  const receiptRef = useRef(null);

  const handlePrint = () => {
    const content = receiptRef.current;
    const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');

    printWindow.document.write(`
      <html>
        <head>
          <title>Bill Receipt</title>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link 
            href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" 
            rel="stylesheet" 
            id="tailwind-css"
          />
          <style>
            html, body {
              margin: 0; 
              padding: 10px;
              background: white;
              font-size: 10px;
              line-height: 1.25;
              overflow-x: hidden;
            }
            @page {
              size: auto;
              margin: 10mm;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          </style>
        </head>
        <body class="p-4">
          ${content.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();

    const cssLink = printWindow.document.getElementById('tailwind-css');
    cssLink.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const subtotal = order.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  return (
    <div className="bg-white p-3 w-full max-w-md mx-auto rounded-lg shadow print:p-0 print:shadow-none text-[10px] leading-tight">
      <div className="flex justify-end print:hidden">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      <div ref={receiptRef}>
        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-base font-bold text-[#0492C2]">Mobile Shop POS</h1>
          <p className="text-[9px] text-gray-500">123 Main Street, Colombo</p>
          <p className="text-[9px] text-gray-500">Tel: +94 11 234 5678</p>
          <p className="text-[9px] text-gray-500">Receipt #{order.id}</p>
          <p className="text-[9px] text-gray-500">{formatDate(order.date)}</p>
        </div>

        <div className="flex justify-center mb-1">
          <CheckCircleIcon className="w-5 h-5 text-[#04924A]" />
        </div>
        <p className="text-center text-[#04924A] font-medium mb-2">Payment Successful</p>

        {/* Customer Info */}
        <div className="bg-gray-50 p-2 rounded mb-2">
          <h2 className="font-semibold mb-1">Customer Info</h2>
          <p>
            <span className="font-medium">Name:</span> {order.customerName}
          </p>
          {order.phone && (
            <p className="mt-1 flex items-center">
              <PhoneIcon className="w-3 h-3 text-gray-400 mr-1" />
              {order.phone}
            </p>
          )}
          {order.address && (
            <p className="mt-1 flex items-start">
              <MapPinIcon className="w-3 h-3 text-gray-400 mr-1 mt-0.5" />
              {order.address}
            </p>
          )}
        </div>

        {/* Payment Method */}
        <div className="mb-2">
          <h2 className="font-semibold mb-1">Payment Method</h2>
          <span className="inline-block bg-[#E6F4F9] text-[#0492C2] px-2 py-0.5 rounded-full">
            {order.paymentMethod === 'card'
              ? 'Credit/Debit Card'
              : order.paymentMethod === 'qr'
              ? 'QR Payment'
              : 'Cash'}
          </span>
        </div>

        {/* Items */}
        <div className="mb-2">
          <h2 className="font-semibold mb-1">Order Items</h2>
          <div className="border-t border-b border-gray-200 py-1 space-y-1">
            {order.cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-[9px] text-gray-500">
                    {item.qty} x LKR {item.price.toFixed(2)}
                  </p>
                </div>
                <p className="font-medium">LKR {(item.qty * item.price).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="space-y-0.5">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>LKR {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax (18%)</span>
            <span>LKR {tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold pt-1 border-t mt-1">
            <span>Total</span>
            <span className="text-[#0492C2]">LKR {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[9px] text-gray-500 mt-3 border-t pt-2">
          <p>Thank you for your purchase!</p>
          <p>Visit us again soon.</p>
          <p className="mt-1">www.mobileshop.com</p>
        </div>
      </div>

      {/* Print Button */}
      <div className="flex justify-center gap-3 mt-3 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center px-3 py-1 bg-[#0492C2] text-white rounded hover:bg-[#047BA1] transition text-[10px]"
        >
          <PrinterIcon className="w-4 h-4 mr-1" /> Print
        </button>
      </div>
    </div>
  );
}
