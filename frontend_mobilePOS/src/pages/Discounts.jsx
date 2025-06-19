import { useState } from 'react';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  TagIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  XMarkIcon // <-- Add this import
} from '@heroicons/react/24/outline';

const discountTypes = [
  { id: 'percentage', name: 'Percentage', icon: TagIcon },
  { id: 'fixed', name: 'Fixed Amount', icon: CurrencyDollarIcon },
  { id: 'bogo', name: 'Buy One Get One', icon: UserGroupIcon },
  { id: 'seasonal', name: 'Seasonal', icon: CalendarDaysIcon },
];

const sampleDiscounts = [
  {
    id: 1,
    name: 'New Year Special',
    type: 'percentage',
    value: 20,
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    status: 'active',
    applicableItems: ['All items'],
  },
  {
    id: 2,
    name: 'Lunch Time Deal',
    type: 'fixed',
    value: 250,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    applicableItems: ['Rice', 'Noodles'],
  },
  {
    id: 3,
    name: 'Coffee Monday',
    type: 'bogo',
    value: null,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'inactive',
    applicableItems: ['Coffee'],
  },
];

export default function Discounts() {
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDiscount, setNewDiscount] = useState({
    name: '',
    type: 'percentage',
    value: '',
    startDate: '',
    endDate: '',
    applicableItems: '',
    status: 'active'
  });

  const handleDiscountInput = (e) => {
    setNewDiscount({ ...newDiscount, [e.target.name]: e.target.value });
  };

  const handleAddDiscount = (e) => {
    e.preventDefault();
    setShowAddModal(false);
    setNewDiscount({
      name: '',
      type: 'percentage',
      value: '',
      startDate: '',
      endDate: '',
      applicableItems: '',
      status: 'active'
    });
    // Optionally show a toast or update discount list
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Discounts</h1>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search discounts..."
              className="input-field pl-10 pr-4 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <PlusIcon className="w-5 h-5" />
            <span>New Discount</span>
          </button>
        </div>
      </div>

      {/* Add Discount Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative" style={{ maxHeight: '98vh', minHeight: '420px', overflowY: 'auto' }}>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-[#0492C2] transition-colors"
              onClick={() => setShowAddModal(false)}
              type="button"
              aria-label="Close"
            >
              <XMarkIcon className="w-7 h-7" />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-[#0492C2] text-center tracking-tight">
              Add New Discount
            </h2>
            <form onSubmit={handleAddDiscount} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Discount Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="input-field w-full text-base px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-[#0492C2] transition"
                  value={newDiscount.name}
                  onChange={handleDiscountInput}
                  placeholder="Discount Name"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    name="type"
                    className="input-field w-full text-base px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-[#0492C2] transition"
                    value={newDiscount.type}
                    onChange={handleDiscountInput}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="bogo">Buy One Get One</option>
                    <option value="seasonal">Seasonal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Value {newDiscount.type === 'percentage' ? '(%)' : newDiscount.type === 'fixed' ? '(LKR)' : ''}
                  </label>
                  <input
                    type={newDiscount.type === 'bogo' ? 'text' : 'number'}
                    name="value"
                    className="input-field w-full text-base px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-[#0492C2] transition"
                    value={newDiscount.value}
                    onChange={handleDiscountInput}
                    placeholder={newDiscount.type === 'bogo' ? 'N/A' : 'Value'}
                    disabled={newDiscount.type === 'bogo'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    className="input-field w-full text-base px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-[#0492C2] transition"
                    value={newDiscount.startDate}
                    onChange={handleDiscountInput}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    className="input-field w-full text-base px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-[#0492C2] transition"
                    value={newDiscount.endDate}
                    onChange={handleDiscountInput}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Applicable Items
                </label>
                <input
                  type="text"
                  name="applicableItems"
                  className="input-field w-full text-base px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-[#0492C2] transition"
                  value={newDiscount.applicableItems}
                  onChange={handleDiscountInput}
                  placeholder="e.g. All items, Rice, Noodles"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  className="input-field w-full text-base px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-[#0492C2] transition"
                  value={newDiscount.status}
                  onChange={handleDiscountInput}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
                  Add Discount
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex gap-4 min-w-max">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors border-2 ${
              selectedType === 'all'
                ? 'bg-[#0492C2] text-white border-[#0492C2]'
                : 'bg-white text-gray-600 hover:bg-gray-50 border-[#0492C2]'
            }`}
          >
            All Discounts
          </button>
          {discountTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors border-2 ${
                selectedType === type.id
                  ? 'bg-[#0492C2] text-white border-[#0492C2]'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border-[#0492C2]'
              }`}
            >
              <type.icon className="w-5 h-5 inline-block mr-2" />
              {type.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleDiscounts.map((discount) => (
          <div key={discount.id} className="bg-white rounded-lg border-2 border-[#E6F4F9] p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{discount.name}</h3>
                <div className="text-sm text-gray-500">
                  {discount.type === 'percentage' && `${discount.value}% off`}
                  {discount.type === 'fixed' && `LKR ${discount.value} off`}
                  {discount.type === 'bogo' && 'Buy 1 Get 1 Free'}
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                discount.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {discount.status}
              </span>
            </div>

            <div>
              <div className="text-sm text-gray-500">Valid Period</div>
              <div className="text-sm">
                {new Date(discount.startDate).toLocaleDateString()} - {new Date(discount.endDate).toLocaleDateString()}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Applicable Items</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {discount.applicableItems.map((item, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-[#E6F4F9] text-[#0492C2] rounded text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button className="btn-secondary">
                <PencilSquareIcon className="w-5 h-5 text-gray-500" />
                <span>Edit</span>
              </button>
              <button className="btn-secondary text-red-600 hover:text-red-700">
                <TrashIcon className="w-5 h-5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}