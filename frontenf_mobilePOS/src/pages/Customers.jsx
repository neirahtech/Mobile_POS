import { useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

const customers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    totalOrders: 15,
    totalSpent: 12500,
    lastOrder: '2024-03-15'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1234567891',
    totalOrders: 8,
    totalSpent: 6800,
    lastOrder: '2024-03-14'
  },
  // Add more customers as needed
];

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    totalOrders: '',
    totalSpent: '',
    lastOrder: '',
    itemsPurchased: ''
  });

  const handleInputChange = (e) => {
    setNewCustomer({ ...newCustomer, [e.target.name]: e.target.value });
  };

  const handleAddCustomer = (e) => {
    e.preventDefault();
    setShowAddModal(false);
    setNewCustomer({
      name: '',
      email: '',
      phone: '',
      totalOrders: '',
      totalSpent: '',
      lastOrder: '',
      itemsPurchased: ''
    });
    // Optionally show a toast or update customer list
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Customers</h1>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search customers..."
              className="input-field pl-10 pr-4 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <PlusIcon className="w-5 h-5" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-fade-in"
            style={{ maxHeight: '98vh', minHeight: '520px', overflowY: 'auto' }}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-[#0492C2] transition-colors"
              onClick={() => setShowAddModal(false)}
              type="button"
              aria-label="Close"
            >
              <XMarkIcon className="w-7 h-7" />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-[#0492C2] text-center tracking-tight">
              Add New Customer
            </h2>
            <form onSubmit={handleAddCustomer} className="space-y-4" autoComplete="off">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input-field w-full text-base px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-[#0492C2] transition"
                    value={newCustomer.name}
                    onChange={handleInputChange}
                    placeholder="Customer Name"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="input-field w-full text-base px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-[#0492C2] transition"
                    value={newCustomer.phone}
                    onChange={handleInputChange}
                    placeholder="Phone Number"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  className="input-field w-full text-base px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-[#0492C2] transition"
                  value={newCustomer.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Total Orders
                  </label>
                  <input
                    type="number"
                    name="totalOrders"
                    min="0"
                    className="input-field w-full text-base px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-[#0492C2] transition"
                    value={newCustomer.totalOrders}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Total Spent (₹)
                  </label>
                  <input
                    type="number"
                    name="totalSpent"
                    min="0"
                    className="input-field w-full text-base px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-[#0492C2] transition"
                    value={newCustomer.totalSpent}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Last Order Date
                  </label>
                  <input
                    type="date"
                    name="lastOrder"
                    className="input-field w-full text-base px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-[#0492C2] transition"
                    value={newCustomer.lastOrder}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Items Purchased
                </label>
                <input
                  type="text"
                  name="itemsPurchased"
                  className="input-field w-full text-base px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-[#0492C2] transition"
                  value={newCustomer.itemsPurchased}
                  onChange={handleInputChange}
                  placeholder="e.g. iPhone 16, Samsung S23 Ultra"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="px-5 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 text-base font-semibold transition"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0492C2] text-white font-semibold hover:bg-[#036B8F] transition"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => (
          <div key={customer.id} className="card p-6 border-2 border-[#E6F4F9]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">{customer.name}</h3>
                <p className="text-sm text-gray-500">{customer.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#E6F4F9] flex items-center justify-center">
                <span className="text-[#0492C2] font-semibold">
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-sm font-medium">{customer.phone}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-sm font-medium">{customer.totalOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="text-sm font-medium">₹{customer.totalSpent.toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Last Order</p>
                <p className="text-sm font-medium">{customer.lastOrder}</p>
              </div>
            </div>

            <button className="w-full mt-4 py-2 text-sm text-[#0492C2] hover:text-[#036B8F] transition-colors">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}