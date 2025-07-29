import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  PrinterIcon,
  XMarkIcon,
  CheckCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { BsCashStack, BsCreditCard2FrontFill, BsQrCode } from 'react-icons/bs';

import { toast } from 'react-toastify';
import BillReceipt from './BillReceipt';
import api from '../utils/axios';
import { useBranch } from '../context/BranchContext';

export default function BillDetails({
  cart = [],
  onRemoveItem,
  onIncreaseQty,
  onDecreaseQty,
  onCheckout,
}) {
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showReceipt, setShowReceipt] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paidAmount, setPaidAmount] = useState('');
  const [futureCredit, setFutureCredit] = useState(0);
  const [discounts, setDiscounts] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState('');
  const [billingSettings, setBillingSettings] = useState({
    defaultPaymentMethod: 'cash',
    defaultDiscountType: 'percentage',
    defaultDiscountValue: 0,
    taxPercentage: 18
  });
  const { selectedBranch } = useBranch();
  
  // Fetch billing settings and discounts on component mount
  useEffect(() => {
    const fetchBillingSettings = async () => {
      try {
        const response = await api.get('/billing-settings', {
          params: { branch_id: selectedBranch?.id || 1 }
        });
        if (response.data) {
          setBillingSettings(prev => ({
            ...prev,
            ...response.data
          }));
          // Apply default payment method from settings (case-insensitive)
          const defaultMethod = (response.data.defaultPaymentMethod || 'cash').toLowerCase();
          setPaymentMethod(defaultMethod);
          // Apply default discount if set
          if (response.data.defaultDiscountType === 'percentage' && response.data.defaultDiscountValue) {
            setDiscountPercentage(parseFloat(response.data.defaultDiscountValue));
          }
        }
      } catch (error) {
        console.error('Error fetching billing settings:', error);
        toast.error('Failed to load billing settings');
      }
    };

    const fetchDiscounts = async () => {
      try {
        const response = await api.get('/discounts');
        setDiscounts((response.data || []).map(d => ({
          ...d,
          items: typeof d.items === 'string' ? JSON.parse(d.items) : (d.items || [])
        })));
      } catch (error) {
        console.error('Error fetching discounts:', error);
        toast.error('Failed to load discounts');
        setDiscounts([]);
      }
    };

    fetchBillingSettings();
    fetchDiscounts();
  }, [selectedBranch?.id]);

  // Handle discount selection
  const handleDiscountChange = (e) => {
    const discountId = e.target.value;
    setSelectedDiscount(discountId);
    
    if (!discountId) {
      setDiscountPercentage(0);
      return;
    }
    
    const selected = discounts.find(d => d.id === discountId);
    if (selected) {
      setDiscountPercentage(parseFloat(selected.value) || 0);
    }
  };

  // Payment methods configuration
  const paymentMethods = [
    { method: 'cash', icon: <BsCashStack className="w-4 h-4" />, label: 'Cash' },
    { method: 'card', icon: <BsCreditCard2FrontFill className="w-4 h-4" />, label: 'Card' },
    { method: 'qr', icon: <BsQrCode className="w-4 h-4" />, label: 'QR' },
  ].map(method => ({
    ...method,
    isActive: paymentMethod === method.method
  }));

  // Handle payment method change
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method.toLowerCase());
  };

  // Get tax rate from billing settings
  const taxRate = (billingSettings.taxPercentage || 18) / 100;

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountAmount = (subtotal * (discountPercentage / 100));
  const taxAmount = (subtotal - discountAmount) * taxRate;
  const grandTotal = subtotal - discountAmount + taxAmount;
  const total = subtotal - discountAmount + taxAmount;

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
    const paid = parseFloat(paidAmount);
    if (isNaN(paid) || paid < 0) {
      toast.error('Please enter a valid paid amount');
      return;
    }
    if (paid < grandTotal) {
      toast.error('Paid amount is less than total. Please collect full payment.');
      return;
    }

    setIsProcessing(true);
    try {
      let credit = 0;
      if (paid > grandTotal) {
        credit = paid - grandTotal;
        setFutureCredit(credit);
        toast.info(`Extra LKR ${credit.toFixed(2)} will be kept for future purchases.`, {
          position: 'bottom-right',
          className: 'bg-[#0492C2] text-white'
        });
      } else {
        setFutureCredit(0);
      }

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
          amount: taxAmount
        },
        total: grandTotal,
        paidAmount: paid,
        futureCredit: credit,
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
    setTimeout(() => {
      window.print();
      setShowReceipt(false); // Auto-close after print dialog
    }, 100);
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
      <div className="w-full h-full px-3 py-3 animate-bill-slidein relative overflow-hidden rounded-xl flex flex-col bg-white border border-gray-200 shadow-md">
        {/* Customer Name with enhanced styling */}
        <div className="mb-2 relative z-10">
          <label className="text-sm text-[#03648a] mb-1.5 block font-semibold">Customer Name</label>
          <div className="relative group">
            <input
              type="text"
              placeholder="Enter customer name"
              className="pl-10 pr-4 py-2 text-sm border-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#0492C2] bg-white/90 transition-all duration-300 group-hover:border-[#03648a] shadow-sm"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <UserIcon className="w-5 h-5 text-[#03648a] absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 group-hover:text-[#024b6e]" />
          </div>
        </div>

        {/* Scrollable Cart Items Section with hole effect */}
        <div className="flex-grow mb-2 relative z-10">
          <div className="flex items-center justify-center w-full">
            {/* Outer ring (raised border around the hole) */}
            <div className="w-full max-w-[410px] rounded-2xl bg-white shadow-[0_4px_12px_rgba(0,0,0,0.12)] px-2 py-2 mx-auto">
              {/* Inner sunken container (actual hole) */}
              <div
                className="w-full rounded-xl bg-gradient-to-br from-white to-blue-50/80 border border-blue-100/80 shadow-[inset_0_2px_4px_rgba(4,146,194,0.15)] p-0 flex flex-col backdrop-blur-sm"
                style={{ height: '140px', overflow: 'hidden' }} // adjusted height to be more compact
              >
                {/* Cart Items Table */}
                {cart.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 animate-fade-in h-full flex flex-col justify-center border-2 border-blue-100/50 rounded-lg bg-white/80 backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mx-auto mb-2 opacity-60 text-blue-300" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M17 18c-1.11 0-2 .89-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2M1 2v2h2l3.6 7.59l-1.36 2.45c-.15.28-.24.61-.24.96a2 2 0 0 0 2 2h12v-2H7.42a.25.25 0 0 1-.25-.25c0-.05.01-.09.03-.12L8.1 13h7.45c.75 0 1.41-.42 1.75-1.03l3.58-6.47c.07-.16.12-.33.12-.5a1 1 0 0 0-1-1H5.21l-.94-2M7 18c-1.11 0-2 .89-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2Z"/>
                    </svg>
                    <p className="text-xs font-semibold text-blue-500/80">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="bg-white/90 rounded-lg border border-blue-100/50 overflow-hidden flex-1 flex flex-col backdrop-blur-sm shadow-sm">
                    {/* Items scroll area */}
                    <div className="overflow-y-auto custom-scrollbar flex-1 w-full" style={{ maxHeight: '100px' }}>
                      <table className="w-full">
                        <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-50/80 to-blue-100/30 backdrop-blur-sm">
                          <tr className="border-b border-blue-100/50">
                            <th className="py-1.5 px-1 text-center text-[10px] font-bold text-[#03648a] uppercase w-[8%] tracking-wide">#</th>
                            <th className="py-1.5 px-1 text-left text-[10px] font-bold text-[#03648a] uppercase w-[35%] tracking-wide">Item</th>
                            <th className="py-1.5 px-1 text-center text-[10px] font-bold text-[#03648a] uppercase w-[20%] tracking-wide">Qty</th>
                            <th className="py-1.5 px-1 text-right text-[10px] font-bold text-[#03648a] uppercase w-[18%] tracking-wide">Price</th>
                            <th className="py-1.5 px-1 text-right text-[10px] font-bold text-[#03648a] uppercase w-[19%] tracking-wide">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cart.map((item, index) => (
                            <tr 
                              key={`${item.id}-${index}`}
                              className="border-t border-blue-100/50 hover:bg-blue-50/50 group transition-colors duration-150"
                            >
                              <td className="py-1 px-1 text-center align-middle relative">
                                <button
                                  onClick={() => onRemoveItem(index)}
                                  className="w-full h-full flex items-center justify-center transition-all duration-200"
                                  title="Remove item"
                                >
                                  <span className="text-[9px] font-medium text-gray-700 group-hover:opacity-0 transition-opacity">
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
                              <td className="py-1.5 px-1 text-[10px] font-bold text-gray-800 align-middle truncate group-hover:text-[#03648a] transition-colors">{item.name}</td>
                              <td className="py-1.5 px-1 align-middle">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onDecreaseQty(index); }}
                                    className="p-0.5 rounded-md bg-white border border-blue-200 hover:bg-blue-50 text-[#03648a] disabled:opacity-30 transition-colors shadow-sm"
                                    disabled={item.qty <= 1}
                                    title="Decrease quantity"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                                      <path d="M19 13H5v-2h14v2z" />
                                    </svg>
                                  </button>
                                  <span className="text-[10px] font-extrabold w-5 text-center text-[#03648a] bg-blue-50/50 rounded px-1 py-0.5">
                                    {item.qty}
                                  </span>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onIncreaseQty(index); }}
                                    className="p-0.5 rounded-md bg-white border border-blue-200 hover:bg-blue-50 text-[#03648a] transition-colors shadow-sm"
                                    title="Increase quantity"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                              <td className="py-1.5 px-1 text-right text-[10px] font-bold text-[#03648a] align-middle group-hover:text-[#024b6e] transition-colors">
                                LKR {item.price.toFixed(2)}
                              </td>
                              <td className="py-1.5 px-1 text-right text-[10px] font-extrabold text-[#03648a] align-middle group-hover:text-[#024b6e] transition-colors">
                                LKR {(item.price * item.qty).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Subtotal fixed at bottom with margin top */}
                    <div className="mt-1">
                      <div className="bg-gradient-to-r from-blue-500/5 to-blue-600/10 backdrop-blur-sm border-t border-blue-200/50 font-bold w-full sticky bottom-0 z-20">
                        <table className="w-full">
                          <tfoot>
                            <tr>
                              <td colSpan="3" className="py-1.5 px-1 text-right text-[9px] font-semibold text-blue-700">
                                Subtotal
                              </td>
                              <td colSpan="2" className="py-1.5 px-1 text-right text-[9px] font-semibold text-blue-700">
                                LKR {subtotal.toFixed(2)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Section */}
        <div className="flex-none">
          {/* Discount Section with Dropdown and Percentage Input */}
          <div className="mb-2 relative z-10">
            <label className="text-xs text-[#03648a] font-semibold mb-1.5 block">Discount</label>
            <div className="flex items-center gap-2">
              <select
                value={selectedDiscount}
                onChange={handleDiscountChange}
                className="flex-1 text-[11px] border-2 rounded-lg px-3 py-1.5 bg-white/90 border-blue-200 text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#03648a] focus:border-[#03648a] transition-all duration-200 hover:border-[#03648a] shadow-sm [&_option]:text-gray-800 [&_option]:bg-white"
              >
                <option value="">Select Discount</option>
                {discounts.map((discount) => (
                  <option key={discount.id} value={discount.id}>
                    {discount.name} ({discount.value}%)
                  </option>
                ))}
              </select>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercentage}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : Number(e.target.value);
                    setDiscountPercentage(value);
                    if (value > 0) setSelectedDiscount('');
                  }}
                  className="w-16 text-center text-[11px] font-semibold border-2 rounded-lg pl-2 pr-6 py-1.5 bg-white/90 border-blue-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0492C2] focus:border-[#03648a] transition-all duration-200 hover:border-[#03648a] shadow-sm placeholder:text-gray-500/70 appearance-none [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ WebkitTextFillColor: '#1f2937' }}
                  placeholder="0"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#03648a]">%</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-2 relative z-10">
            <div className="grid grid-cols-3 gap-1.5">
              {paymentMethods.map(({ method, icon, label, isActive }) => (
                <button
                  key={method}
                  onClick={() => handlePaymentMethodChange(method)}
                  className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-br from-[#0492c2] via-[#107cd1] to-[#0b27b1] shadow-[inset_0_4px_8px_rgba(0,0,0,0.7),0_4px_8px_rgba(11,39,177,0.5)] border border-white/20' 
                      : 'bg-gradient-to-br from-white via-blue-600/10 to-blue-600/20 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(4,146,194,0.2)] border border-white/30 hover:shadow-[0_4px_10px_rgba(4,146,194,0.15)]'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center -my-0.5">
                    <div className={`${isActive ? 'text-white' : 'text-[#0b27b1]'}`}>
                      {React.cloneElement(icon, { className: 'w-4 h-4' })}
                    </div>
                    <span className={`text-[10px] font-bold leading-none ${isActive ? 'text-white/95' : 'text-[#0b27b1]'}`}>
                      {label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Totals with enhanced styling */}
          <div className="space-y-2.5 text-sm bg-white/95 rounded-xl p-3 shadow-[0_4px_12px_rgba(4,146,194,0.12)] border border-blue-100/70 mb-3 animate-totals-fadein relative z-10 backdrop-blur-sm">
            <div className="flex justify-between text-gray-700">
              <span className="font-semibold text-[11px]">Subtotal</span>
              <span className="font-bold text-[11px] text-[#03648a]">LKR {subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="font-semibold text-[11px] text-[#03648a]">Discount ({discountPercentage}%)</span>
                <span className="font-bold text-[11px] text-[#e53e3e] bg-red-50/70 px-1.5 py-0.5 rounded">- LKR {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#03648a]">
              <span className="font-semibold text-[11px]">Tax ({(billingSettings.taxPercentage || 18)}%)</span>
              <span className="font-bold text-[11px]">LKR {taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#03648a] font-extrabold pt-2 border-t border-blue-100/50">
              <span className="text-[12px]">TOTAL</span>
              <span className="text-[13px] text-[#024b6e]">LKR {grandTotal.toFixed(2)}</span>
            </div>
            {/* Paid Amount Input */}
            <div className="flex justify-between items-center mt-2.5">
              <label className="font-semibold text-[11px] text-[#03648a]">Paid Amount</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#03648a]/80">LKR</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paidAmount}
                  onChange={e => setPaidAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-28 pl-8 pr-2 py-1.5 border border-blue-200/80 rounded-lg text-[11px] font-semibold text-right text-[#03648a] focus:ring-1 focus:ring-[#0492C2] focus:border-[#0492C2] transition-all bg-white/90 shadow-sm"
                />
              </div>
            </div>
            {/* Show info if paid is less or more */}
            {paidAmount && parseFloat(paidAmount) < grandTotal && (
              <div className="text-[10px] text-red-500 mt-1.5 font-semibold bg-red-50/70 px-2 py-1 rounded-md border border-red-100">
                Collect LKR {(grandTotal - parseFloat(paidAmount)).toFixed(2)} more
              </div>
            )}
            {paidAmount && parseFloat(paidAmount) > grandTotal && (
              <div className="text-[10px] text-green-600 mt-1.5 font-semibold bg-green-50/70 px-2 py-1 rounded-md border border-green-100">
                Return LKR {(parseFloat(paidAmount) - grandTotal).toFixed(2)} to customer
              </div>
            )}
          </div>

          {/* Action Buttons with enhanced 3D styling */}
          <div className="flex gap-2.5 relative z-10">
            <button
              onClick={handlePaid}
              disabled={cart.length === 0 || isProcessing}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all duration-200 ${
                cart.length === 0 || isProcessing
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-inner'
                  : 'bg-gradient-to-br from-[#0492C2] to-[#03648a] text-white shadow-[0_4px_0_rgba(3,100,138,0.8)] hover:shadow-[0_6px_0_rgba(3,100,138,0.8)] hover:-translate-y-0.5 active:shadow-[0_2px_0_rgba(3,100,138,0.8)] active:translate-y-0.5'
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
              type="button"
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
        <div>
          <BillReceipt
            order={{
              id: Math.floor(Math.random() * 10000),
              customerName,
              cart,
              date: new Date().toISOString(),
              paymentMethod: paymentMethod,
              subtotal: subtotal,
              discount: {
                type: 'percentage',
                value: discountPercentage,
                amount: discountAmount
              },
              tax: {
                rate: taxRate,
                amount: taxAmount
              },
              total: grandTotal,
              paidAmount: parseFloat(paidAmount) || 0,
              futureCredit: futureCredit,
              billingSettings: {
                ...billingSettings,
                receiptFooter: billingSettings.receiptFooter || 'Thank you for your business!',
                defaultPaymentMethod: billingSettings.defaultPaymentMethod || 'cash',
                defaultDiscountType: billingSettings.defaultDiscountType || 'percentage',
                defaultDiscountValue: billingSettings.defaultDiscountValue || 0,
                taxPercentage: billingSettings.taxPercentage || 18
              }
            }}
            onClose={() => setShowReceipt(false)}
            printMode={true}
          />
          {/* Overlay for print mode to ensure visibility */}
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              .print-receipt, .print-receipt * {
                visibility: visible !important;
              }
              .print-receipt {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
              }
              .print-receipt, .print-receipt * {
                visibility: visible !important;
              }
              .print-receipt {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background: white !important;
                box-shadow: none !important;
                z-index: 99999 !important;
              }
            }
          `}</style>
        </div>
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