import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

const COLORS = ['#0492C2', '#b6e0fe', '#03648a', '#7fd8f6', '#0c7abf', '#e4f4fa', '#b6e0fe', '#0492C2'];

export default function CustomerGraphs({ customerReportRows, salesData }) {
  // Top 5 customers by total spent
  const topSpent = [...customerReportRows]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

  // Top 5 customers by orders
  const topOrders = [...customerReportRows]
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5);

  // Pie data for orders vs spent (total)
  const totalOrders = customerReportRows.reduce((sum, row) => sum + (row.orders || 0), 0);
  const totalSpent = customerReportRows.reduce((sum, row) => sum + (row.spent || 0), 0);
  const pieData = [
    { name: 'Orders', value: totalOrders },
    { name: 'Spent', value: totalSpent }
  ];

  // --- Revenue by Date for Customers (like Sales Report) ---
  const revenueByDate = useMemo(() => {
    if (!salesData || salesData.length === 0) return [];
    const dateMap = {};
    salesData.forEach(sale => {
      const date = sale.date ? sale.date.slice(0, 10) : '';
      if (!date) return;
      dateMap[date] = (dateMap[date] || 0) + Number(sale.total || 0);
    });
    return Object.entries(dateMap)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [salesData]);

  // --- Simplified Customer vs Spent Over Time ---
  // Instead of one line per customer, show top N customers as lines, group others as "Other"
  const MAX_CUSTOMER_LINES = 3;
  const customerSpentOverTime = useMemo(() => {
    if (!salesData || salesData.length === 0) return [];
    // Calculate total spent per customer
    const totals = {};
    salesData.forEach(sale => {
      const cust = sale.customer || 'Unknown';
      totals[cust] = (totals[cust] || 0) + Number(sale.total || 0);
    });
    // Get top N customers
    const topCustomers = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_CUSTOMER_LINES)
      .map(([name]) => name);

    // Group sales by date
    const dateMap = {};
    salesData.forEach(sale => {
      const date = sale.date ? sale.date.slice(0, 10) : '';
      if (!date) return;
      if (!dateMap[date]) dateMap[date] = {};
      const cust = sale.customer || 'Unknown';
      if (topCustomers.includes(cust)) {
        dateMap[date][cust] = (dateMap[date][cust] || 0) + Number(sale.total || 0);
      } else {
        dateMap[date]['Other'] = (dateMap[date]['Other'] || 0) + Number(sale.total || 0);
      }
    });
    // Build array for recharts
    const dates = Object.keys(dateMap).sort();
    return dates.map(date => {
      const entry = { date };
      topCustomers.forEach(cust => {
        entry[cust] = dateMap[date][cust] || 0;
      });
      entry['Other'] = dateMap[date]['Other'] || 0;
      return entry;
    });
  }, [salesData]);

  // For legend/lines
  const topCustomerKeys = useMemo(() => {
    if (!salesData || salesData.length === 0) return [];
    const totals = {};
    salesData.forEach(sale => {
      const cust = sale.customer || 'Unknown';
      totals[cust] = (totals[cust] || 0) + Number(sale.total || 0);
    });
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_CUSTOMER_LINES)
      .map(([name]) => name)
      .concat('Other');
  }, [salesData]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      {/* Top Customers by Total Spent */}
      <div className="bg-white/90 rounded-xl border border-[#b6e0fe] shadow p-4">
        <div className="font-semibold mb-2 text-[#03648a]">Top Customers by Total Spent</div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={topSpent}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" height={70} tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="spent" fill="#0492C2" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Top Customers by Orders */}
      <div className="bg-white/90 rounded-xl border border-[#b6e0fe] shadow p-4">
        <div className="font-semibold mb-2 text-[#03648a]">Top Customers by Orders</div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={topOrders}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" height={70} tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="orders" fill="#0c7abf" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Pie Chart for Orders vs Spent */}
      <div className="bg-white/90 rounded-xl border border-[#b6e0fe] shadow p-4 col-span-1 md:col-span-2">
        <div className="font-semibold mb-2 text-[#03648a]">Orders vs Spent (Total)</div>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#0492C2"
              label
            >
              {pieData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Simplified Line Chart: Customer vs Spent Over Time */}
      <div className="bg-white/90 rounded-xl border border-[#b6e0fe] shadow p-4 col-span-1 md:col-span-2">
        <div className="font-semibold mb-2 text-[#03648a]">Customer vs Spent Over Time (Top {MAX_CUSTOMER_LINES} + Other)</div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={customerSpentOverTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {topCustomerKeys.map((cust, idx) => (
              <Line
                key={cust}
                type="monotone"
                dataKey={cust}
                stroke={COLORS[idx % COLORS.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
