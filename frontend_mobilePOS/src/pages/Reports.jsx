import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  UserGroupIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import api from '../utils/axios';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid, Legend } from 'recharts';
import InventoryGraphs from '../components/InventoryGraphs';
import CustomerGraphs from '../components/CustomerGraphs';
import ExpensesReport from '../components/ExpensesReport';

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
  },
  {
    id: 'expenses',
    name: 'Expenses Report',
    description: 'Analyze and export expense records',
    icon: ArrowDownTrayIcon
  }
];

const timeRanges = [
  { id: 'day', label: 'Today' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' }
];

function formatDate(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function filterByTimeRange(data, dateField, range) {
  const now = new Date();
  return data.filter(row => {
    const d = new Date(row[dateField]);
    if (range === 'day') {
      return d.toDateString() === now.toDateString();
    }
    if (range === 'month') {
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }
    if (range === 'year') {
      return d.getFullYear() === now.getFullYear();
    }
    return true;
  });
}

// Helper: get end date for a time range
function getRangeEnd(range) {
  const now = new Date();
  if (range === 'day') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  }
  if (range === 'month') {
    return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // last day of month
  }
  if (range === 'year') {
    return new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  }
  return now;
}

// Helper: filter records up to and including the end of the selected range
function filterUpToTimeRange(data, dateField, range) {
  const end = getRangeEnd(range);
  return data.filter(row => {
    const d = new Date(row[dateField]);
    return d <= end;
  });
}

function downloadCSV(filename, rows, headers) {
  const csv =
    headers.join(',') +
    '\n' +
    rows
      .map(row =>
        headers
          .map(h => {
            let v = row[h];
            if (typeof v === 'string' && v.includes(',')) v = `"${v}"`;
            return v;
          })
          .join(',')
      )
      .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState('sales');
  const [timeRange, setTimeRange] = useState('day');
  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [grnData, setGrnData] = useState([]);
  const [expensesData, setExpensesData] = useState([]);

  // Fetch all data on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/sales-details'),
      api.get('/grn'),
      api.get('/customers'),
      api.get('/expenses')
    ])
      .then(([salesRes, grnRes, customersRes, expensesRes]) => {
        setSalesData(salesRes.data || []);
        setGrnData(Array.isArray(grnRes.data) ? grnRes.data : []);
        // --- Inventory calculation using only GRN table for item names and stock qty ---
        const grns = Array.isArray(grnRes.data) ? grnRes.data : [];
        // Build a map of item_code => { name, code, category, stock }
        const grnItemMap = {};
        grns.forEach(grn => {
          (grn.items || []).forEach(item => {
            const code = item.item_code || item.code;
            if (!grnItemMap[code]) {
              grnItemMap[code] = {
                name: item.item_name || item.name || code,
                code: code,
                category: item.category_name || item.Category_name || '',
                stock: 0
              };
            }
            grnItemMap[code].stock += Number(item.quantity || 0);
          });
        });
        // Subtract sold quantity from sales
        const soldQtyMap = {};
        (salesRes.data || []).forEach(sale => {
          (sale.items || []).forEach(item => {
            const code = item.name || item.item_code || item.code;
            soldQtyMap[code] = (soldQtyMap[code] || 0) + Number(item.quantity || 0);
          });
        });
        // Compose inventory rows using only GRN items
        const inventoryRows = Object.values(grnItemMap).map(item => {
          const soldQty = soldQtyMap[item.code] || 0;
          return {
            ...item,
            sold: soldQty,
            available: item.stock - soldQty
          };
        });
        setInventoryData(inventoryRows);
        setCustomerData(customersRes.data || []);
        setExpensesData(expensesRes.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // --- SALES REPORT ---
  const filteredSales = filterByTimeRange(salesData, 'date', timeRange);
  const totalSales = filteredSales.reduce((sum, s) => sum + Number(s.total || 0), 0);
  const totalOrders = filteredSales.length;
  const avgOrderValue = totalOrders ? (totalSales / totalOrders) : 0;
  // Top products by quantity sold
  const productSalesMap = {};
  filteredSales.forEach(sale => {
    (sale.items || []).forEach(item => {
      if (!productSalesMap[item.name]) productSalesMap[item.name] = 0;
      productSalesMap[item.name] += Number(item.quantity || 0);
    });
  });
  const topProducts = Object.entries(productSalesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty]) => ({ name, sales: qty }));

  // --- INVENTORY REPORT ---
  // Calculate sold quantity for each item (cumulative up to end of period)
  const soldQtyMapPeriod = {};
  filterUpToTimeRange(salesData, 'date', timeRange).forEach(sale => {
    (sale.items || []).forEach(item => {
      if (!soldQtyMapPeriod[item.name]) soldQtyMapPeriod[item.name] = 0;
      soldQtyMapPeriod[item.name] += Number(item.quantity || 0);
    });
  });

  // Calculate stock quantity for each item from GRN (cumulative up to end of period)
  const stockQtyMapPeriod = {};
  // Find the correct date field in GRN (invoice_date, date, etc)
  let grnDateField = 'invoice_date';
  if (grnData.length && !grnData[0].invoice_date && grnData[0].date) {
    grnDateField = 'date';
  }
  if (grnData.length && !grnData[0][grnDateField]) {
    const dateField = Object.keys(grnData[0]).find(
      k => typeof grnData[0][k] === 'string' && /^\d{4}-\d{2}-\d{2}/.test(grnData[0][k])
    );
    if (dateField) grnDateField = dateField;
  }

  // Build a map of code->name from inventoryData for fallback
  const codeToNameMap = {};
  inventoryData.forEach(inv => {
    if (inv.code && inv.name) {
      codeToNameMap[inv.code] = inv.name;
    }
  });

  // Build a set of all codes in inventoryData for matching
  const allInventoryCodes = new Set(inventoryData.map(inv => inv.code));

  if (grnData.length && grnData[0][grnDateField]) {
    filterUpToTimeRange(grnData, grnDateField, timeRange).forEach(grn => {
      let items = grn.items;
      if (!Array.isArray(items)) {
        if (typeof items === 'string') {
          try {
            items = JSON.parse(items);
          } catch {
            items = [];
          }
        } else {
          items = [];
        }
      }
      (items || []).forEach(item => {
        // Try all possible name fields and normalize
        let name = item.item_name || item.name || item.model_name || '';
        name = typeof name === 'string' ? name.trim() : '';
        let code = item.item_code || item.code || '';
        code = typeof code === 'string' ? code.trim() : '';

        // If name is missing, try to get from inventoryData by code
        if (!name && code && codeToNameMap[code]) {
          name = codeToNameMap[code];
        }

        // If still no name, try to match by code directly to inventoryData
        if (!name && code && allInventoryCodes.has(code)) {
          const inv = inventoryData.find(i => i.code === code);
          if (inv) name = inv.name;
        }

        // If still no name, fallback to code as name (to avoid missing keys)
        if (!name && code) {
          name = code;
        }

        // If still no name, skip
        if (!name) return;

        // Now, sum by name
        if (!stockQtyMapPeriod[name]) stockQtyMapPeriod[name] = 0;
        stockQtyMapPeriod[name] += Number(item.quantity || 0);
      });
    });
  }

  // Compose inventory rows using all unique item names from GRN and sales
  const allItemNames = Array.from(
    new Set([
      ...Object.keys(stockQtyMapPeriod),
      ...Object.keys(soldQtyMapPeriod),
      ...inventoryData.map(i => i.name)
    ])
  );

  const inventoryReportRows = allItemNames.map(name => {
    const inv = inventoryData.find(i => i.name === name) || {};
    const stockQty = stockQtyMapPeriod[name] || 0;
    const soldQty = soldQtyMapPeriod[name] || 0;
    // Set available to 0 if less than or equal to 0
    const available = stockQty - soldQty > 0 ? stockQty - soldQty : 0;
    return {
      name,
      code: inv.code || '',
      category: inv.category || '',
      stock: stockQty,
      sold: soldQty,
      available
    };
  });

  // Debug: log the result to check if stockQtyMapPeriod is being populated
  // Remove/comment out after debugging
  console.log('stockQtyMapPeriod:', stockQtyMapPeriod);
  console.log('inventoryReportRows:', inventoryReportRows);

  // --- CUSTOMER REPORT ---
  // For each customer, count orders and total spent
  const customerMap = {};
  salesData.forEach(sale => {
    const name = sale.customer || 'Unknown';
    if (!customerMap[name]) customerMap[name] = { orders: 0, spent: 0 };
    customerMap[name].orders += 1;
    customerMap[name].spent += Number(sale.total || 0);
  });
  const customerReportRows = Object.entries(customerMap).map(([name, data]) => ({
    name,
    orders: data.orders,
    spent: data.spent
  }));
  // Filter by time range
  const customerMapPeriod = {};
  filteredSales.forEach(sale => {
    const name = sale.customer || 'Unknown';
    if (!customerMapPeriod[name]) customerMapPeriod[name] = { orders: 0, spent: 0 };
    customerMapPeriod[name].orders += 1;
    customerMapPeriod[name].spent += Number(sale.total || 0);
  });
  const customerReportRowsPeriod = Object.entries(customerMapPeriod).map(([name, data]) => ({
    name,
    orders: data.orders,
    spent: data.spent
  }));

  // --- Download handlers ---
  const handleDownloadSales = () => {
    downloadCSV(
      `sales-report-${timeRange}.csv`,
      filteredSales.map(s => ({
        date: s.date,
        customer: s.customer,
        items: (s.items || []).map(i => `${i.name} x${i.quantity}`).join('; '),
        total: s.total
      })),
      ['date', 'customer', 'items', 'total']
    );
  };
  const handleDownloadInventory = () => {
    downloadCSV(
      `inventory-report-${timeRange}.csv`,
      inventoryReportRows.map(row => ({
        name: row.name,
        code: row.code,
        category: row.category,
        stock: row.stock,
        sold: soldQtyMapPeriod[row.name] || 0,
        available: row.available
      })),
      ['name', 'code', 'category', 'stock', 'sold', 'available']
    );
  };
  const handleDownloadCustomers = () => {
    downloadCSV(
      `customer-report-${timeRange}.csv`,
      customerReportRowsPeriod,
      ['name', 'orders', 'spent']
    );
  };

  // --- SALES ANALYTICS LOGIC (from SalesAnalytics.jsx) ---
  // Compute summary, top items, top customers, and chart data from salesData
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalQuantity: 0,
    avgSalePerCustomer: 0,
    daily: 0,
    monthly: 0,
  });
  const [topItems, setTopItems] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [salesOverTime, setSalesOverTime] = useState([]);
  const [itemsBar, setItemsBar] = useState([]);
  const [salesByMonth, setSalesByMonth] = useState([]);
  const [salesByYear, setSalesByYear] = useState([]);

  useEffect(() => {
    // Only process analytics if salesData is loaded
    if (!salesData || salesData.length === 0) {
      setSummary({
        totalSales: 0,
        totalOrders: 0,
        totalQuantity: 0,
        avgSalePerCustomer: 0,
        daily: 0,
        monthly: 0,
      });
      setTopItems([]);
      setTopCustomers([]);
      setSalesOverTime([]);
      setItemsBar([]);
      setSalesByMonth([]);
      setSalesByYear([]);
      return;
    }

    // --- Sales Summary ---
    let totalSales = 0;
    let totalOrders = salesData.length;
    let totalQuantity = 0;
    let customerTotals = {};
    let today = new Date().toISOString().slice(0, 10);
    let thisMonth = today.slice(0, 7);
    let daily = 0;
    let monthly = 0;

    salesData.forEach(sale => {
      const saleTotal = Number(sale.total);
      totalSales += saleTotal;
      if (sale.date === today) daily += saleTotal;
      if (sale.date && sale.date.startsWith(thisMonth)) monthly += saleTotal;
      if (!customerTotals[sale.customer]) customerTotals[sale.customer] = 0;
      customerTotals[sale.customer] += saleTotal;
      sale.items.forEach(item => {
        totalQuantity += Number(item.quantity);
      });
    });

    const avgSalePerCustomer = Object.keys(customerTotals).length
      ? (totalSales / Object.keys(customerTotals).length)
      : 0;

    setSummary({
      totalSales,
      totalOrders,
      totalQuantity,
      avgSalePerCustomer,
      daily,
      monthly,
    });

    // --- Top Selling Items ---
    const itemMap = {};
    salesData.forEach(sale => {
      sale.items.forEach(item => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        }
        itemMap[item.name].quantity += Number(item.quantity);
        itemMap[item.name].revenue += (Number(sale.total) / sale.items.length) * Number(item.quantity);
      });
    });
    const itemsArr = Object.values(itemMap);
    itemsArr.sort((a, b) => b.quantity - a.quantity);
    setTopItems(itemsArr.slice(0, 5));

    // --- Top Customers ---
    const customersArr = Object.entries(customerTotals).map(([name, total]) => ({
      name,
      total,
    }));
    customersArr.sort((a, b) => b.total - a.total);
    setTopCustomers(customersArr.slice(0, 5));

    // --- Sales Over Time (Line Chart) ---
    const dateMap = {};
    salesData.forEach(sale => {
      if (!dateMap[sale.date]) dateMap[sale.date] = 0;
      dateMap[sale.date] += Number(sale.total);
    });
    const salesTimeArr = Object.entries(dateMap)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));
    setSalesOverTime(salesTimeArr);

    // --- Items Bar Chart (Bar: items vs quantity) ---
    const itemsBarArr = itemsArr
      .map(item => ({ name: item.name, quantity: item.quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 7);
    setItemsBar(itemsBarArr);

    // --- Revenue by Month ---
    const monthMap = {};
    salesData.forEach(sale => {
      if (sale.date) {
        const month = sale.date.slice(0, 7); // YYYY-MM
        if (!monthMap[month]) monthMap[month] = 0;
        monthMap[month] += Number(sale.total);
      }
    });
    const salesMonthArr = Object.entries(monthMap)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));
    setSalesByMonth(salesMonthArr);

    // --- Revenue by Year ---
    const yearMap = {};
    salesData.forEach(sale => {
      if (sale.date) {
        const year = sale.date.slice(0, 4); // YYYY
        if (!yearMap[year]) yearMap[year] = 0;
        yearMap[year] += Number(sale.total);
      }
    });
    const salesYearArr = Object.entries(yearMap)
      .map(([year, revenue]) => ({ year, revenue }))
      .sort((a, b) => a.year.localeCompare(b.year));
    setSalesByYear(salesYearArr);
  }, [salesData]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Reports</h1>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="input-field text-[#03648a] border border-[#0492C2] font-semibold bg-white"
            style={{ minWidth: 120 }}
          >
            {timeRanges.map(r => (
              <option key={r.id} value={r.id} className="text-[#03648a] bg-white">{r.label}</option>
            ))}
          </select>
          <button
            className="btn-secondary flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-[#e4f4fa] border border-[#0492C2] hover:bg-[#b6e0fe] hover:text-[#03648a] active:bg-[#e4f4fa] active:text-[#03648a] transition"
            style={{ minHeight: 32 }}
            onClick={handleDownloadSales}
          >
            <ArrowDownTrayIcon className="w-4 h-4 text-[#03648a]" />
            <span className="text-[#03648a] font-semibold">Download CSV</span>
          </button>
          <button
            className="btn-secondary flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-[#e4f4fa] border border-[#0492C2] hover:bg-[#b6e0fe] hover:text-[#03648a] active:bg-[#e4f4fa] active:text-[#03648a] transition"
            style={{ minHeight: 32 }}
            onClick={() => window.location.reload()}>
            <ArrowPathIcon className="w-4 h-4 text-[#03648a]" />
            <span className="text-[#03648a] font-semibold">Refresh</span>
          </button>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[#03648a]">
        {reportTypes.map((report) => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className={`card p-6 text-left border-2 rounded-md transition-colors ${
              selectedReport === report.id
                ? 'border-[#0492C2] bg-[#E6F4F9]'
                : 'border-[#E6F4F9] hover:border-[#0492C2]'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-md">
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
          {/* --- Sales Analytics Summary Cards --- */}
          <div>
            <h2 className="text-xl font-bold text-[#0492C2] mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-6 h-6" /> Sales Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-xl border-2 border-[#0492C2] bg-white/90 flex flex-col gap-2 shadow">
                <div className="text-sm text-gray-500">Total Sales (All Time)</div>
                <div className="text-2xl font-bold text-[#0492C2]">LKR {summary.totalSales.toLocaleString()}</div>
              </div>
              <div className="p-5 rounded-xl border-2 border-[#0492C2] bg-white/90 flex flex-col gap-2 shadow">
                <div className="text-sm text-gray-500">Total Orders</div>
                <div className="text-2xl font-bold text-[#0492C2]">{summary.totalOrders}</div>
              </div>
              <div className="p-5 rounded-xl border-2 border-[#0492C2] bg-white/90 flex flex-col gap-2 shadow">
                <div className="text-sm text-gray-500">Total Quantity Sold</div>
                <div className="text-2xl font-bold text-[#0492C2]">{summary.totalQuantity}</div>
              </div>
              <div className="p-5 rounded-xl border-2 border-[#0492C2] bg-white/90 flex flex-col gap-2 shadow">
                <div className="text-sm text-gray-500">Avg Sale per Customer</div>
                <div className="text-2xl font-bold text-[#0492C2]">LKR {summary.avgSalePerCustomer.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="p-5 rounded-xl border border-[#b6e0fe] bg-[#f8fbff] flex flex-col gap-2 shadow">
                <div className="text-sm text-gray-500">Today's Sales</div>
                <div className="text-xl font-bold text-[#0492C2]">LKR {summary.daily.toLocaleString()}</div>
              </div>
              <div className="p-5 rounded-xl border border-[#b6e0fe] bg-[#f8fbff] flex flex-col gap-2 shadow">
                <div className="text-sm text-gray-500">This Month's Sales</div>
                <div className="text-xl font-bold text-[#0492C2]">LKR {summary.monthly.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* --- Top Selling Items --- */}
          <div>
            <h2 className="text-xl font-bold text-[#0492C2] mb-4 flex items-center gap-2">
              <CubeIcon className="w-6 h-6" /> Top Selling Items
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-[400px] w-full bg-white/90 rounded-xl border border-[#b6e0fe] shadow">
                <thead className="bg-[#e4f4fa] text-[#0492C2]">
                  <tr>
                    <th className="px-4 py-2 text-left">Item</th>
                    <th className="px-4 py-2 text-left">Quantity Sold</th>
                    <th className="px-4 py-2 text-left">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topItems.map(item => (
                    <tr key={item.name} className="border-b border-[#e0eefa] text-[#03648a]">
                      <td className="px-4 py-2">{item.name}</td>
                      <td className="px-4 py-2">{item.quantity}</td>
                      <td className="px-4 py-2">LKR {item.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                  {topItems.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center text-gray-400 py-4">No data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- Top Customers --- */}
          <div>
            <h2 className="text-xl font-bold text-[#0492C2] mb-4 flex items-center gap-2">
              <UserGroupIcon className="w-6 h-6" /> Top Customers
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-[400px] w-full bg-white/90 rounded-xl border border-[#b6e0fe] shadow">
                <thead className="bg-[#e4f4fa] text-[#0492C2]">
                  <tr>
                    <th className="px-4 py-2 text-left">Customer</th>
                    <th className="px-4 py-2 text-left">Total Purchase</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map(cust => (
                    <tr key={cust.name} className="border-b border-[#e0eefa] text-[#03648a]">
                      <td className="px-4 py-2">{cust.name}</td>
                      <td className="px-4 py-2">LKR {cust.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                  {topCustomers.length === 0 && (
                    <tr>
                      <td colSpan={2} className="text-center text-gray-400 py-4">No data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- Sales Over Time Chart --- */}
          <div>
            <h2 className="text-xl font-bold text-[#0492C2] mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-6 h-6" /> Sales Over Time
            </h2>
            <div className="flex flex-row gap-6">
              {/* Scrollable Revenue Charts */}
              <div
                className="flex gap-6 overflow-x-auto pb-2"
                style={{
                  scrollSnapType: 'x mandatory',
                  minWidth: 0,
                  maxWidth: '400px',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none'
                }}
              >
                {/* Revenue by Date */}
                <div
                  className="bg-white/90 rounded-xl border border-[#b6e0fe] shadow p-4 min-w-[400px] w-[400px]"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="font-semibold mb-2 text-[#03648a]">Revenue by Date</div>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={salesOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#0492C2" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {/* Revenue by Month */}
                <div
                  className="bg-white/90 rounded-xl border border-[#b6e0fe] shadow p-4 min-w-[400px] w-[400px]"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="font-semibold mb-2 text-[#03648a]">Revenue by Month</div>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={salesByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#0492C2" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {/* Revenue by Year */}
                <div
                  className="bg-white/90 rounded-xl border border-[#b6e0fe] shadow p-4 min-w-[400px] w-[400px]"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="font-semibold mb-2 text-[#03648a]">Revenue by Year</div>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={salesByYear}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#0492C2" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Top Items by Quantity Bar Chart */}
              <div className="w-[350px] flex-shrink-0">
                <div className="bg-white/90 rounded-xl border border-[#b6e0fe] shadow p-4 h-full flex flex-col">
                  <div className="font-semibold mb-2 text-[#03648a]">Top Items by Quantity</div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={itemsBar}
                      margin={{ left: 0, right: 0, top: 10, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        interval={0}
                        angle={-35}
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="quantity" fill="#0492C2" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            {/* Hide scrollbar for horizontal scroll */}
            <style>{`
              .overflow-x-auto::-webkit-scrollbar {
                display: none;
              }
              .overflow-x-auto {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>
          </div>
          {/* Sales Table */}
          <div className="card p-6 border-2 border-[#0492C2] overflow-x-auto text-[#03648a] rounded-md">
            <h3 className="font-semibold mb-4">Sales Transactions</h3>
            <table className="min-w-full text-xs">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">Date</th>
                  <th className="px-2 py-1 text-left">Customer</th>
                  <th className="px-2 py-1 text-left">Items</th>
                  <th className="px-2 py-1 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-400 py-4">No sales found.</td>
                  </tr>
                ) : filteredSales.map((s, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1">{formatDate(s.date)}</td>
                    <td className="px-2 py-1">{s.customer}</td>
                    <td className="px-2 py-1">{(s.items || []).map(it => `${it.name} x${it.quantity}`).join(', ')}</td>
                    <td className="px-2 py-1">LKR {Number(s.total).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedReport === 'inventory' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[#0492C2]">Inventory Report ({timeRanges.find(r => r.id === timeRange)?.label})</h2>
            <button
              className="btn-secondary flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-[#e4f4fa] border border-[#0492C2] hover:bg-[#b6e0fe] hover:text-[#03648a] active:bg-[#e4f4fa] active:text-[#03648a] transition"
              style={{ minHeight: 32 }}
              onClick={handleDownloadInventory}
            >
              <ArrowDownTrayIcon className="w-4 h-4 text-[#03648a]" />
              <span className="text-[#03648a] font-semibold">Download CSV</span>
            </button>
          </div>
          <div className="card p-6 border-2 border-[#0492C2] overflow-x-auto text-[#03648a] rounded-md">
            <h3 className="font-semibold mb-4">Inventory Status</h3>
            <table className="min-w-full text-xs">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">Item Name</th>
                  <th className="px-2 py-1 text-left">Code</th>
                  {/* <th className="px-2 py-1 text-left">Category</th> */}
                  <th className="px-2 py-1 text-left">Stock Qty</th>
                  <th className="px-2 py-1 text-left">Sold ({timeRanges.find(r => r.id === timeRange)?.label})</th>
                  <th className="px-2 py-1 text-left">Available</th>
                </tr>
              </thead>
              <tbody>
                {inventoryReportRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-[#03648a]">No inventory data.</td>
                  </tr>
                ) : inventoryReportRows.map((row, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1">{row.name}</td>
                    <td className="px-2 py-1">{row.code}</td>
                    {/* <td className="px-2 py-1">{row.category}</td> */}
                    <td className="px-2 py-1">{row.stock}</td>
                    <td className="px-2 py-1">{soldQtyMapPeriod[row.name] || 0}</td>
                    <td className="px-2 py-1">{row.available}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Inventory Graphs Section */}
          <InventoryGraphs inventoryReportRows={inventoryReportRows} />
        </div>
      )}

      {selectedReport === 'customers' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[#0492C2]">Customer Report ({timeRanges.find(r => r.id === timeRange)?.label})</h2>
            <button
              className="btn-secondary flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-[#e4f4fa] border border-[#0492C2] hover:bg-[#b6e0fe] hover:text-[#03648a] active:bg-[#e4f4fa] active:text-[#03648a] transition"
              style={{ minHeight: 32 }}
              onClick={handleDownloadCustomers}
            >
              <ArrowDownTrayIcon className="w-4 h-4 text-[#03648a]" />
              <span className="text-[#03648a] font-semibold">Download CSV</span>
            </button>
          </div>
          <div className="card p-6 border-2 border-[#0492C2] overflow-x-auto text-[#03648a] rounded-md">
            <h3 className="font-semibold mb-4">Customer Analytics</h3>
            <table className="min-w-full text-xs">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left text-[#03648a]">Customer Name</th>
                  <th className="px-2 py-1 text-left text-[#03648a]">Orders</th>
                  <th className="px-2 py-1 text-left text-[#03648a]">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {customerReportRowsPeriod.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-gray-400 py-4">No customer data.</td>
                  </tr>
                ) : customerReportRowsPeriod.map((row, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1 text-[#03648a]">{row.name}</td>
                    <td className="px-2 py-1 text-[#03648a]">{row.orders}</td>
                    <td className="px-2 py-1 text-[#03648a]">LKR {Number(row.spent).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Customer Graphs Section */}
          <CustomerGraphs
            customerReportRows={customerReportRowsPeriod}
            salesData={filteredSales}
          />
        </div>
      )}
      {selectedReport === 'expenses' && (
        <ExpensesReport expensesData={expensesData} loading={loading} timeRange={timeRange} />
      )}
    </div>
  );
}