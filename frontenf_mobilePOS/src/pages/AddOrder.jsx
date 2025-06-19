import { useState } from 'react';
import { 
  ClockIcon, 
  UserIcon, 
  PhoneIcon,
  MapPinIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function AddOrder({ onClose, onAddOrder }) {
  const [orderData, setOrderData] = useState({
    customerName: '',
    phone: '',
    type: 'dine-in', // 'dine-in' or 'delivery'
    address: '',
    tableNo: '',
    status: 'pending',
    orderTime: new Date().toISOString(),
    statusChangeMinutes: 5
  });

  // Only close when clicking the backdrop (not the modal or its children)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  // Prevent closing when clicking inside the modal
  const handlePopupClick = (e) => {
    e.stopPropagation();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAddOrder) onAddOrder(orderData);
    if (onClose) onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-4 w-full max-w-sm relative card"
        onClick={handlePopupClick}
        style={{ minWidth: 0 }}
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onClose}
          title="Close"
          type="button"
        >
          <XCircleIcon className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold mb-3 text-center">Add New Order</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Customer Name
            </label>
            <div className="relative">
              <input
                type="text"
                className="input-field pl-10 text-sm"
                placeholder="Enter customer name"
                value={orderData.customerName}
                onChange={(e) => setOrderData({ ...orderData, customerName: e.target.value })}
                required
              />
              <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                className="input-field pl-10 text-sm"
                placeholder="Enter phone number"
                value={orderData.phone}
                onChange={(e) => setOrderData({ ...orderData, phone: e.target.value })}
              />
              <PhoneIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Order Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="radio"
                  name="orderType"
                  value="dine-in"
                  checked={orderData.type === 'dine-in'}
                  onChange={() => setOrderData({ ...orderData, type: 'dine-in', address: '', tableNo: '' })}
                />
                <span>Dine-in</span>
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="radio"
                  name="orderType"
                  value="delivery"
                  checked={orderData.type === 'delivery'}
                  onChange={() => setOrderData({ ...orderData, type: 'delivery', address: '', tableNo: '' })}
                />
                <span>Home Delivery</span>
              </label>
            </div>
          </div>
          {orderData.type === 'delivery' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Delivery Address
              </label>
              <div className="relative">
                <textarea
                  className="input-field pl-10 text-sm"
                  placeholder="Enter delivery address"
                  value={orderData.address}
                  onChange={(e) => setOrderData({ ...orderData, address: e.target.value })}
                  rows="2"
                  required
                />
                <MapPinIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
          )}
          {orderData.type === 'dine-in' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Table Number
              </label>
              <input
                type="text"
                className="input-field text-sm"
                placeholder="Enter table number"
                value={orderData.tableNo}
                onChange={(e) => setOrderData({ ...orderData, tableNo: e.target.value })}
                required
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="input-field text-sm"
              value={orderData.status}
              onChange={(e) => setOrderData({ ...orderData, status: e.target.value })}
              required
            >
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-2">
              Time to Change Status (minutes)
              <ClockIcon className="w-4 h-4 text-gray-400" />
            </label>
            <input
              type="number"
              className="input-field text-sm"
              min={1}
              value={orderData.statusChangeMinutes}
              onChange={e => setOrderData({ ...orderData, statusChangeMinutes: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-xs"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 rounded bg-[#0492C2] text-white hover:bg-[#036B8F] text-xs"
            >
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}