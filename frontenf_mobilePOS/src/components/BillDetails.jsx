import { useState } from 'react';
import { 
  UserIcon, 
  PrinterIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { BsCashStack, BsCreditCard2FrontFill, BsQrCode } from 'react-icons/bs';
import BillReceipt from './BillReceipt';
import { toast } from 'react-toastify';

export default function BillDetails({
  cart = [],
  onRemove,
  onIncrease,
  onDecrease,
  onCheckout,
}) {
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showReceipt, setShowReceipt] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Fixed tax rate of 18%
  const taxRate = 0.18;

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountAmount = subtotal * (discountPercentage / 100);
  const tax = (subtotal - discountAmount) * taxRate;
  const total = subtotal - discountAmount + tax;

  const handleQuantityChange = (index, delta) => {
    if (delta > 0) {
      onIncrease(index);
    } else {
      onDecrease(index);
    }
    toast.info('Quantity updated', { 
      position: 'bottom-right',
      className: 'bg-[#0492C2] text-white'
    });
  };

  const removeFromCart = (index) => {
    onRemove(index);
    toast.info('Item removed from cart', { 
      position: 'bottom-right',
      className: 'bg-[#0492C2] text-white'
    });
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('Are you sure you want to clear the cart?')) {
      cart.forEach((_, index) => onRemove(index));
      setCustomerName('');
      setDiscountPercentage(0);
      setPaymentMethod('cash');
      toast.info('Cart cleared', { 
        position: 'bottom-right',
        className: 'bg-[#0492C2] text-white'
      });
    }
  };

  const handlePaid = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    if (!customerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }

    setIsProcessing(true);
    try {
      const orderData = {
        customerName: customerName.trim(),
        items: cart,
        subtotal,
        discount: {
          type: 'percentage',
          value: discountPercentage,
          amount: discountAmount
        },
        tax: {
          rate: taxRate,
          amount: tax
        },
        total,
        paymentMethod,
        orderDate: new Date().toISOString()
      };

      if (onCheckout) {
        await onCheckout(orderData);
      }
      
      setShowReceipt(true);
      toast.success('Payment successful!', { 
        position: 'bottom-right',
        className: 'bg-green-500 text-white'
      });
    } catch (error) {
      toast.error('Payment failed: ' + error.message, { 
        position: 'bottom-right',
        className: 'bg-red-500 text-white'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    setShowReceipt(true);
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this transaction?')) {
      clearCart();
      toast.info('Transaction cancelled', { 
        position: 'bottom-right',
        className: 'bg-[#0492C2] text-white'
      });
    }
  };

  return (
    <>
      <div className="w-full h-full max-w-md mx-auto glass-card shadow-2xl border border-[#b6e0fe] px-3 py-3 animate-bill-slidein relative overflow-hidden rounded-xl flex flex-col">
        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="floating-circle floating-circle-1" />
          <div className="floating-circle floating-circle-2" />
          <div className="floating-circle floating-circle-3" />
          <div className="floating-circle floating-circle-4" />
        </div>

        {/* Fixed Top Section */}
        <div className="flex-none">
          {/* Header with gradient underline */}
          <div className="sticky top-0 z-10 bg-transparent pb-1 mb-1">
            <h2 className="text-xl font-bold text-[#0492C2] flex items-center gap-1 tracking-wide">
              <span>Bill Details</span>
              <span className="bill-underline" />
            </h2>
          </div>

          {/* Customer Name with enhanced styling */}
          <div className="mb-2 relative z-10">
            <label className="text-xs text-[#0492C2] mb-1 block font-medium">Customer Name</label>
            <div className="relative group">
              <input
                type="text"
                placeholder="Enter customer name"
                className="pl-8 pr-2 py-1.5 text-xs border-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-[#0492C2] bg-white/90 transition-all duration-300 group-hover:border-[#0492C2] shadow-sm"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              <UserIcon className="w-4 h-4 text-[#0492C2] absolute left-2 top-1/2 -translate-y-1/2 transition-colors duration-300 group-hover:text-[#03648a]" />
            </div>
          </div>
        </div>

        {/* Scrollable Cart Items Section */}
        <div className="flex-grow mb-2 relative z-10" style={{ minHeight: '80px', maxHeight: '120px' }}>
          {cart.length === 0 ? (
            <div className="text-center py-6 text-gray-500 animate-fade-in h-full flex flex-col justify-center border-2 border-[#b6e0fe] rounded-lg bg-white/90">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mx-auto mb-2 opacity-50" viewBox="0 0 24 24">
                <path fill="#0492C2" d="M17 18c-1.11 0-2 .89-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2M1 2v2h2l3.6 7.59l-1.36 2.45c-.15.28-.24.61-.24.96a2 2 0 0 0 2 2h12v-2H7.42a.25.25 0 0 1-.25-.25c0-.05.01-.09.03-.12L8.1 13h7.45c.75 0 1.41-.42 1.75-1.03l3.58-6.47c.07-.16.12-.33.12-.5a1 1 0 0 0-1-1H5.21l-.94-2M7 18c-1.11 0-2 .89-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2Z"/>
              </svg>
              <p className="text-xs font-medium">Your cart is empty</p>
            </div>
          ) : (
            <div className="bg-white/90 rounded-lg border-2 border-[#b6e0fe] overflow-hidden h-full">
              <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: '100px' }}>
                <table className="w-full">
                  <thead className="bg-[#e4f4fa] sticky top-0 z-10">
                    <tr>
                      <th className="py-0.5 px-0.5 text-center text-[9px] font-semibold text-[#0492C2] uppercase w-[10%]">#</th>
                      <th className="py-0.5 px-0.5 text-left text-[9px] font-semibold text-[#0492C2] uppercase w-[35%]">Item</th>
                      <th className="py-0.5 px-0.5 text-center text-[9px] font-semibold text-[#0492C2] uppercase w-[25%]">Qty</th>
                      <th className="py-0.5 px-0.5 text-right text-[9px] font-semibold text-[#0492C2] uppercase w-[15%]">Price</th>
                      <th className="py-0.5 px-0.5 text-right text-[9px] font-semibold text-[#0492C2] uppercase w-[15%]">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, index) => (
                      <tr 
                        key={`${item.id}-${index}`}
                        className="border-t border-[#b6e0fe] hover:bg-[#f0f9ff] group"
                      >
                        <td className="py-0.5 px-0.5 text-center align-middle relative">
                          <button
                            onClick={() => removeFromCart(index)}
                            className="w-full h-full flex items-center justify-center transition-all duration-200"
                            title="Remove item"
                          >
                            <span className="text-[10px] font-medium text-gray-700 group-hover:opacity-0 transition-opacity">
                              {index + 1}
                            </span>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3 h-3 fill-red-600 group-hover:fill-red-500 transition-colors duration-200">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" 
                                      style={{filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))"}} />
                              </svg>
                            </div>
                          </button>
                        </td>
                        <td className="py-0.5 px-0.5 text-[10px] font-semibold text-gray-800 align-middle truncate">{item.name}</td>
                        <td className="py-0.5 px-0.5 align-middle">
                          <div className="flex items-center justify-center gap-0.5">
                            <button
                              onClick={() => handleQuantityChange(index, -1)}
                              className="p-0.5 rounded bg-white border border-gray-300 hover:bg-[#e4f4fa] text-[#0492C2] disabled:opacity-30"
                              disabled={item.qty <= 1}
                              title="Decrease quantity"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                                <path d="M19 13H5v-2h14v2z" 
                                      style={{filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))"}} />
                              </svg>
                            </button>
                            <span className="text-[10px] font-bold w-4 text-center text-[#0492C2]">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(index, 1)}
                              className="p-0.5 rounded bg-white border border-gray-300 hover:bg-[#e4f4fa] text-[#0492C2]"
                              title="Increase quantity"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" 
                                      style={{filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))"}} />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="py-0.5 px-0.5 text-right text-[10px] text-[#0492C2] font-semibold align-middle">
                          LKR {item.price.toFixed(2)}
                        </td>
                        <td className="py-0.5 px-0.5 text-right text-[10px] font-bold text-[#0492C2] align-middle">
                          LKR {(item.price * item.qty).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#e4f4fa] font-bold">
                      <td colSpan="3" className="py-0.5 px-0.5 text-right text-[10px] text-[#0492C2]">
                        Subtotal
                      </td>
                      <td colSpan="2" className="py-0.5 px-0.5 text-right text-[10px] text-[#0492C2]">
                        LKR {subtotal.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Bottom Section */}
        <div className="flex-none">
          {/* Discount Section with Dropdown and Percentage Input */}
          <div className="mb-2 relative z-10">
            <label className="text-xs text-[#0492C2] font-medium mb-1 block">Discount</label>
            <div className="flex items-center gap-1">
              <select
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                className="flex-1 text-xs border-2 rounded-lg px-2 py-1.5 bg-white/90 border-[#b6e0fe] focus:outline-none focus:ring-1 focus:ring-[#0492C2] transition-all duration-300 hover:border-[#0492C2] shadow-sm"
              >
                <option value="0">Percentage</option>
                <option value="5">Senior Citizen Discount</option>
                <option value="10">Member Discount</option>
                <option value="15">Festival Offer</option>
                <option value="20">Seasonal Discount</option>
                <option value="25">Special Promotion</option>
              </select>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                className="w-16 text-xs border-2 rounded-lg px-2 py-1.5 bg-white/90 border-[#b6e0fe] focus:outline-none focus:ring-1 focus:ring-[#0492C2] transition-all duration-300 hover:border-[#0492C2] shadow-sm"
                placeholder="%"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-2 relative z-10">
            <label className="text-xs text-[#0492C2] mb-1 block font-medium">Payment Method</label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { method: 'cash', icon: <BsCashStack className="w-4 h-4" />, label: 'Cash' },
                { method: 'card', icon: <BsCreditCard2FrontFill className="w-4 h-4" />, label: 'Card' },
                { method: 'qr', icon: <BsQrCode className="w-4 h-4" />, label: 'QR' },
              ].map(({ method, icon, label }) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`relative flex flex-col items-center p-1.5 rounded-lg border-2 text-[10px] shadow-md transition-all duration-300 overflow-hidden group transform hover:-translate-y-0.5 ${
                    paymentMethod === method
                      ? 'border-[#0492C2] bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white'
                      : 'border-[#b6e0fe] hover:border-[#0492C2] bg-white/90'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] transition-transform duration-500 ${
                    paymentMethod === method ? 'translate-x-0' : '-translate-x-full'
                  }`} />
                  
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`transition-all duration-300 transform group-hover:scale-110 ${
                      paymentMethod === method ? 'text-white' : 'text-[#0492C2] group-hover:text-[#03648a]'
                    }`}>
                      {icon}
                    </div>
                    <span className={`mt-0.5 font-medium transition-colors duration-300 ${
                      paymentMethod === method ? 'text-white' : 'text-gray-600 group-hover:text-[#03648a]'
                    }`}>
                      {label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Totals with enhanced styling */}
          <div className="space-y-1 text-xs bg-white/90 rounded-lg p-2 shadow border-2 border-[#b6e0fe] mb-2 animate-totals-fadein relative z-10">
            <div className="flex justify-between text-gray-600">
              <span className="font-medium">Subtotal</span>
              <span className="font-bold">LKR {subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-[#0492C2]">
                <span className="font-medium">Discount ({discountPercentage}%)</span>
                <span className="font-bold">- LKR {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#0492C2]">
              <span className="font-medium">Tax (18%)</span>
              <span className="font-bold">LKR {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#0492C2] font-bold pt-1 border-t border-[#b6e0fe]">
              <span>Total</span>
              <span>LKR {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons with enhanced 3D styling */}
          <div className="flex gap-2 relative z-10">
            <button
              onClick={handlePaid}
              disabled={cart.length === 0 || isProcessing}
              className={`flex-1 py-2 px-2 rounded-lg font-semibold text-xs transition-all duration-300 transform hover:-translate-y-0.5 ${
                cart.length === 0 || isProcessing
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-md'
                  : 'bg-gradient-to-br from-[#0492C2] to-[#03648a] text-white shadow-lg hover:shadow-xl active:translate-y-0'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <CheckCircleIcon className="w-4 h-4 mr-1 drop-shadow-lg" />
                  Paid
                </span>
              )}
            </button>
            <button
              onClick={handlePrint}
              disabled={cart.length === 0}
              className={`flex-1 py-2 px-2 rounded-lg font-semibold text-xs transition-all duration-300 transform hover:-translate-y-0.5 ${
                cart.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-md'
                  : 'bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] text-[#0492C2] shadow-lg hover:shadow-xl active:translate-y-0'
              }`}
            >
              <span className="flex items-center justify-center">
                <PrinterIcon className="w-4 h-4 mr-1 drop-shadow-lg" />
              Print
              </span>
            </button>
            <button
              onClick={handleCancel}
              disabled={cart.length === 0}
              className={`flex-1 py-2 px-2 rounded-lg font-semibold text-xs transition-all duration-300 transform hover:-translate-y-0.5 ${
                cart.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-md'
                  : 'bg-gradient-to-br from-red-50 to-red-100 text-red-500 border-2 border-red-200 hover:border-red-300 shadow-lg hover:shadow-xl active:translate-y-0'
              }`}
            >
              <span className="flex items-center justify-center">
                <XMarkIcon className="w-4 h-4 mr-1 drop-shadow-lg" />
              Cancel
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <BillReceipt
          order={{
            id: Math.floor(Math.random() * 10000),
            customerName,
            cart,
            date: new Date(),
            paymentMethod,
            subtotal,
            discount: {
              type: 'percentage',
              value: discountPercentage,
              amount: discountAmount
            },
            tax: {
              rate: taxRate,
              amount: tax
            },
            total
          }}
          onClose={() => setShowReceipt(false)}
        />
      )}

      {/* Enhanced Styles */}
      <style>{`
        .glass-card {
          backdrop-filter: blur(8px);
          background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(228,244,250,0.95) 100%);
        }
        .bill-underline {
          flex: 1;
          height: 2px;
          background: linear-gradient(90deg, #0492C2 0%, #b6e0fe 100%);
          border-radius: 2px;
        }
        .animate-bill-slidein {
          animation: billSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes billSlideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-item-fadein {
          animation: itemFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes itemFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-totals-fadein {
          animation: totalsFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes totalsFadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .floating-circle {
          position: absolute;
          border-radius: 50%;
          opacity: 0.08;
          filter: blur(8px);
          animation: float 10s ease-in-out infinite alternate;
        }
        .floating-circle-1 {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #0492C2 0%, #b6e0fe 100%);
          top: 5%;
          left: -30px;
          animation-delay: 0s;
        }
        .floating-circle-2 {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #b6e0fe 0%, #0492C2 100%);
          top: 35%;
          right: -20px;
          animation-delay: -2s;
        }
        .floating-circle-3 {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #0492C2 0%, #e4f4fa 100%);
          bottom: 15%;
          left: 25%;
          animation-delay: -4s;
        }
        .floating-circle-4 {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #e4f4fa 0%, #0492C2 100%);
          top: 60%;
          left: 10%;
          animation-delay: -6s;
        }
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(15px, -15px) rotate(5deg); }
          100% { transform: translate(-15px, 15px) rotate(-5deg); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(228, 244, 250, 0.5);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #b6e0fe;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #0492C2;
        }
      `}</style>
    </>
  );
}