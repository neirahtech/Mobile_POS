import { useState } from 'react';
import { ChartBarIcon, CurrencyDollarIcon, ShoppingBagIcon, UsersIcon } from '@heroicons/react/24/outline';

const salesData = {
  daily: 15000,
  weekly: 85000,
  monthly: 350000,
  totalOrders: 125,
  totalCustomers: 45
};

const recentTransactions = [
  { id: 1, customer: 'John Doe', amount: 950.00, items: 3, time: '15:30' },
  { id: 2, customer: 'Jane Smith', amount: 630.00, items: 2, time: '14:45' },
  // Add more transactions as needed
];

export default function Sales() {
  const [timeRange, setTimeRange] = useState('Today');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Sales Analytics</h1>
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input-field w-full sm:w-40"
        >
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
          <option>This Year</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Daily Sales Card */}
        <div className="card p-6 border-2 border-[#0492C2]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Daily Sales</p>
              <h3 className="text-2xl font-semibold mt-1">LKR {salesData.daily.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-[#E6F4F9] rounded-full">
              <CurrencyDollarIcon className="w-6 h-6 text-[#0492C2]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-green-600">+12% from yesterday</div>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="card p-6 border-2 border-[#0492C2]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-semibold mt-1">{salesData.totalOrders}</h3>
            </div>
            <div className="p-3 bg-[#E6F4F9] rounded-full">
              <ShoppingBagIcon className="w-6 h-6 text-[#0492C2]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-green-600">+5% from last week</div>
          </div>
        </div>

        {/* Total Customers Card */}
        <div className="card p-6 border-2 border-[#0492C2]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <h3 className="text-2xl font-semibold mt-1">{salesData.totalCustomers}</h3>
            </div>
            <div className="p-3 bg-[#E6F4F9] rounded-full">
              <UsersIcon className="w-6 h-6 text-[#0492C2]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-green-600">+8% new customers</div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card p-6 border-2 border-[#E6F4F9]">
        <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Items</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm">#{transaction.id}</td>
                  <td className="py-3 px-4 text-sm">{transaction.customer}</td>
                  <td className="py-3 px-4 text-sm">LKR {transaction.amount.toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm">{transaction.items}</td>
                  <td className="py-3 px-4 text-sm">{transaction.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 