import React from 'react';

export default function BillReceipt({ order, onClose, printMode }) {
  if (!order) return null;
  const { 
    customerName, 
    cart, 
    date, 
    paymentMethod, 
    subtotal, 
    discount = { type: 'percentage', value: 0, amount: 0 },
    tax = { rate: 0.18, amount: 0 },
    total, 
    paidAmount, 
    futureCredit = 0,
    billingSettings = { taxPercentage: 18 }
  } = order;
  
  // Calculate change and ensure it's not negative
  const change = Math.max(0, (paidAmount || 0) - total);
  const taxRate = (tax.rate || (billingSettings.taxPercentage / 100) || 0.18) * 100;
  const receiptFooter = billingSettings?.receiptFooter || 'Thank you for your business!';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 ${printMode ? 'print-receipt' : ''}`}
      style={{ fontFamily: 'monospace' }}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-[340px] mx-auto border border-gray-300 print:shadow-none print:border-none print:rounded-none"
        style={{
          minWidth: 320,
          maxWidth: 360,
          border: '1px dashed #bbb',
          boxShadow: printMode ? 'none' : undefined,
        }}
      >
        <div className="text-center text-[13px] font-bold mb-2 border-b border-dashed pb-1">
          {'*'.repeat(32)}
          <div className="text-[15px] font-bold mt-1 mb-1">RECEIPT</div>
          {'*'.repeat(32)}
        </div>
        <div className="flex justify-between text-[11px] mb-1">
          <span>Terminal#1</span>
          <span>{date ? new Date(date).toLocaleDateString() : ''} {date ? new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
        </div>
        <div className="border-b border-dashed my-1" />
        <div className="mb-2">
          {cart.map((item, idx) => (
            <div key={idx} className="flex justify-between text-[12px]">
              <span>{item.qty} x {item.name}</span>
              <span>{(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-b border-dashed my-1" />
        <div className="flex justify-between text-[12px]">
          <span>SUBTOTAL</span>
          <span>{subtotal.toFixed(2)}</span>
        </div>
        {discount?.amount > 0 && (
          <div className="flex justify-between text-[12px] text-red-600">
            <span>DISCOUNT ({discount.value}%)</span>
            <span>-{discount.amount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-[12px]">
          <span>TAX ({taxRate}%)</span>
          <span>{tax.amount.toFixed(2)}</span>
        </div>
        <div className="border-t border-dashed my-1" />
        <div className="flex justify-between text-[12px] font-bold">
          <span>TOTAL</span>
          <span>{total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span>CASH</span>
          <span>{paidAmount ? paidAmount.toFixed(2) : '0.00'}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span>CHANGE</span>
          <span>{change > 0 ? change.toFixed(2) : '0.00'}</span>
        </div>
        {futureCredit > 0 && (
          <div className="flex justify-between text-[12px]">
            <span>Future Credit</span>
            <span>{futureCredit.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-[12px] mt-2">
          <span>Payment Method</span>
          <span className="font-semibold">{String(paymentMethod || '').toUpperCase()}</span>
        </div>
        {customerName && (
          <div className="flex justify-between text-[12px]">
            <span>Customer</span>
            <span className="font-semibold">{customerName}</span>
          </div>
        )}
        <div className="border-b border-dashed my-2" />
        <div className="text-center text-[13px] font-bold mb-2">
          {'*'.repeat(10)}THANK YOU!{'*'.repeat(10)}
        </div>
        {receiptFooter && (
          <div className="text-center text-[11px] text-gray-600 mt-1">
            {receiptFooter}
          </div>
        )}
        {/* Barcode placeholder */}
        <div className="flex justify-center mt-2">
          <div style={{
            width: 180,
            height: 40,
            background: 'repeating-linear-gradient(90deg, #000 0 2px, #fff 2px 6px)',
            margin: '0 auto'
          }} />
        </div>
        {!printMode && (
          <div className="flex justify-center mt-4">
            <button
              className="px-4 py-1 rounded bg-[#0492C2] text-white font-semibold"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        )}
      </div>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .print\\:static, .print\\:static * {
            visibility: visible !important;
          }
          .print\\:static {
            position: static !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: white !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
