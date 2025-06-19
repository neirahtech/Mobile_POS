import { useState } from 'react';
import { 
  ChartBarIcon, 
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const reportTypes = [
  {
    id: 'sales',
    name: 'Sales Report',
    description: 'View detailed sales analytics and trends',
    icon: ChartBarIcon
  },
  {
    id: 'inventory',
    name: 'Inventory Report',
    description: 'Track stock levels and movement',
    icon: DocumentChartBarIcon
  },
  {
    id: 'customers',
    name: 'Customer Report',
    description: 'Analyze customer behavior and preferences',
    icon: ChartBarIcon
  }
];

const salesData = {
  daily: 15000,
  weekly: 85000,
  monthly: 350000,
  yearlyGrowth: 25,
  topProducts: [
    { name: 'Product A', sales: 1200 },
    { name: 'Product B', sales: 950 },
    { name: 'Product C', sales: 850 }
  ]
};

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState('sales');
  const [timeRange, setTimeRange] = useState('This Week');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Reports</h1>
        <div className="flex items-center gap-4">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field"
          >
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
          <button className="btn-secondary">
            <ArrowDownTrayIcon className="w-5 h-5 text-gray-500" />
            <span>Export</span>
          </button>
          <button className="btn-secondary">
            <ArrowPathIcon className="w-5 h-5 text-gray-500" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className={`card p-6 text-left border-2 transition-colors ${
              selectedReport === report.id
                ? 'border-[#0492C2] bg-[#E6F4F9]'
                : 'border-[#E6F4F9] hover:border-[#0492C2]'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-lg">
                <report.icon className="w-6 h-6 text-[#0492C2]" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">{report.name}</h3>
                <p className="text-sm text-gray-500">{report.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Report Content */}
      {selectedReport === 'sales' && (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 border-2 border-[#0492C2]">
              <h3 className="text-sm text-gray-500 mb-2">Total Sales</h3>
              <div className="text-2xl font-semibold">₹{salesData.monthly.toLocaleString()}</div>
              <div className="text-sm text-green-600 mt-2">+{salesData.yearlyGrowth}% from last year</div>
            </div>
            
            <div className="card p-6 border-2 border-[#0492C2]">
              <h3 className="text-sm text-gray-500 mb-2">Average Order Value</h3>
              <div className="text-2xl font-semibold">₹580</div>
              <div className="text-sm text-green-600 mt-2">+8% from last month</div>
            </div>
            
            <div className="card p-6 border-2 border-[#0492C2]">
              <h3 className="text-sm text-gray-500 mb-2">Total Orders</h3>
              <div className="text-2xl font-semibold">256</div>
              <div className="text-sm text-green-600 mt-2">+15% from last month</div>
            </div>
          </div>

          {/* Top Products */}
          <div className="card p-6 border-2 border-[#0492C2]">
            <h3 className="font-semibold mb-4">Top Products</h3>
            <div className="space-y-4">
              {salesData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#E6F4F9] rounded-lg flex items-center justify-center">
                      <span className="text-sm font-medium text-[#0492C2]">#{index + 1}</span>
                    </div>
                    <span className="font-medium">{product.name}</span>
                  </div>
                  <span className="text-gray-500">{product.sales} sales</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'inventory' && (
        <div className="card p-6 border-2 border-[#0492C2]">
          <h3 className="font-semibold mb-4">Inventory Status</h3>
          {/* Add inventory report content */}
        </div>
      )}

      {selectedReport === 'customers' && (
        <div className="card p-6 border-2 border-[#0492C2]">
          <h3 className="font-semibold mb-4">Customer Analytics</h3>
          {/* Add customer report content */}
        </div>
      )}
    </div>
  );
} 