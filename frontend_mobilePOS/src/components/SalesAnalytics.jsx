import { useEffect, useState, useRef } from 'react';
import api from '../utils/axios';

export default function SalesAnalytics() {
  return null;

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const chartScrollRef = useRef(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sales-details');
      setSales(res.data);
      processAnalytics(res.data);
    } catch (err) {
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const processAnalytics = (data) => {
    if (!data || data.length === 0) {
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
    let totalOrders = data.length;
    let totalQuantity = 0;
    let customerTotals = {};
    let today = new Date().toISOString().slice(0, 10);
    let thisMonth = today.slice(0, 7);
    let daily = 0;
    let monthly = 0;

    data.forEach(sale => {
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
    data.forEach(sale => {
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
    data.forEach(sale => {
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
    data.forEach(sale => {
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
    data.forEach(sale => {
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
  };

  return (
    <div className="space-y-8">
      {/* Sales Summary */}
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

      {/* Top Selling Items */}
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

      {/* Top Customers */}
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

      {/* Sales Over Time Chart */}
      <div>
        <h2 className="text-xl font-bold text-[#0492C2] mb-4 flex items-center gap-2">
          <ChartBarIcon className="w-6 h-6" /> Sales Over Time
        </h2>
        <div className="relative flex flex-col md:flex-row gap-6">
          {/* Scrollable Revenue Charts */}
          <div
            className="flex gap-6 overflow-x-auto pb-2 md:w-[calc(100%-370px)]"
            ref={chartScrollRef}
            style={{ scrollSnapType: 'x mandatory', minWidth: 0 }}
          >
            {/* Revenue by Date */}
            <div className="bg-white/90 rounded-xl border border-[#b6e0fe] shadow p-4 min-w-[350px] max-w-[500px] w-full scroll-snap-align-start">
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
            <div className="bg-white/90 rounded-xl border border-[#b6e0fe] shadow p-4 min-w-[350px] max-w-[500px] w-full scroll-snap-align-start">
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
            <div className="bg-white/90 rounded-xl border border-[#b6e0fe] shadow p-4 min-w-[350px] max-w-[500px] w-full scroll-snap-align-start">
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
          {/* Fixed Top Items by Quantity Bar Chart */}
          <div className="md:sticky md:top-24 md:self-start md:w-[350px] w-full">
            <div className="bg-white/90 rounded-xl border border-[#b6e0fe] shadow p-4">
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
      </div>
    </div>
  );

}