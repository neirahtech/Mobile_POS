import { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
} from 'chart.js';
import api from '../utils/axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
);

export default function ExpenseReports() {
  const [activeTab, setActiveTab] = useState('category');
  const [timePeriod, setTimePeriod] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get('/branches');
        setBranches(res.data);
      } catch (err) {
        console.error('Error fetching branches:', err);
      }
    };
    fetchBranches();
  }, []);

  // Fetch report data when filters change
  useEffect(() => {
    if (activeTab) {
      fetchReportData();
    }
  }, [activeTab, timePeriod, startDate, endDate, branchId]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      let url = '';
      const params = new URLSearchParams();
      
      if (branchId) params.append('branch_id', branchId);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      switch (activeTab) {
        case 'category':
          url = `/expense-reports/summary/category?${params.toString()}`;
          break;
        case 'time':
          params.append('period', timePeriod);
          url = `/expense-reports/summary/time?${params.toString()}`;
          break;
        case 'branches':
          url = `/expense-reports/summary/branches?${params.toString()}`;
          break;
        default:
          return;
      }
      
      const res = await api.get(url);
      setReportData(res.data);
    } catch (err) {
      console.error('Error fetching report data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare chart data based on active tab
  const getChartData = () => {
    if (!reportData || reportData.length === 0) {
      return null;
    }

    switch (activeTab) {
      case 'category':
        return {
          labels: reportData.map(item => item.category || 'Uncategorized'),
          datasets: [{
            label: 'Total Amount',
            data: reportData.map(item => item.total_amount || 0),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          }]
        };
      
      case 'time':
        return {
          labels: reportData.map(item => item.period),
          datasets: [{
            label: 'Total Expenses',
            data: reportData.map(item => item.total_amount || 0),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
            fill: true
          }]
        };
      
      case 'branches':
        return {
          labels: reportData.map(item => item.branch_name || 'Unknown'),
          datasets: [{
            label: 'Total Expenses',
            data: reportData.map(item => item.total_amount || 0),
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
            ],
            borderWidth: 1,
          }]
        };
      
      default:
        return null;
    }
  };

  const chartData = getChartData();

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: activeTab === 'category' ? 'Expenses by Category' :
              activeTab === 'time' ? `Expenses by ${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}` :
              'Expenses by Branch',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Expense Reports</h2>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 ${activeTab === 'category' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('category')}
        >
          By Category
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'time' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('time')}
        >
          By Time Period
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'branches' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('branches')}
        >
          By Branch
        </button>
      </div>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
          <select
            className="w-full p-2 border rounded"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
          >
            <option value="">All Branches</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        
        {activeTab === 'time' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select
              className="w-full p-2 border rounded"
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        )}
      </div>
      
      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        {isLoading ? (
          <div className="text-center py-10">Loading...</div>
        ) : chartData ? (
          <div className="h-96">
            {activeTab === 'time' ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">No data available for the selected filters</div>
        )}
      </div>
      
      {/* Data Table */}
      {reportData && reportData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === 'category' ? 'Category' : activeTab === 'time' ? 'Period' : 'Branch'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Count
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {activeTab === 'category' ? (item.category || 'Uncategorized') :
                       activeTab === 'time' ? item.period :
                       (item.branch_name || 'Unknown')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {item.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                      ${Number(item.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    Total
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                    {reportData.reduce((sum, item) => sum + (item.count || 0), 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                    ${reportData.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
