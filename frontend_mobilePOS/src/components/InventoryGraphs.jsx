import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#0492C2', '#b6e0fe', '#03648a', '#7fd8f6', '#0c7abf', '#e4f4fa', '#b6e0fe', '#0492C2'];

export default function InventoryGraphs({ inventoryReportRows }) {
  // Top 5 items by stock
  const topStock = [...inventoryReportRows]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5);

  // Top 5 items by available
  const topAvailable = [...inventoryReportRows]
    .sort((a, b) => b.available - a.available)
    .slice(0, 5);

  // Pie data for available vs sold (total)
  const totalAvailable = inventoryReportRows.reduce((sum, row) => sum + (row.available || 0), 0);
  const totalSold = inventoryReportRows.reduce((sum, row) => sum + (row.sold || 0), 0);
  const pieData = [
    { name: 'Available', value: totalAvailable },
    { name: 'Sold', value: totalSold }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      {/* Top Items by Stock */}
      <div className="bg-white/90 rounded-xl border border-[#b6e0fe] shadow p-4">
        <div className="font-semibold mb-2 text-[#03648a]">Top Items by Stock</div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={topStock}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" height={70} tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="stock" fill="#0492C2" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Top Items by Available */}
      <div className="bg-white/90 rounded-xl border border-[#b6e0fe] shadow p-4">
        <div className="font-semibold mb-2 text-[#03648a]">Top Items by Available Qty</div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={topAvailable}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" height={70} tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="available" fill="#0c7abf" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Pie Chart for Available vs Sold */}
      <div className="bg-white/90 rounded-xl border border-[#b6e0fe] shadow p-4 col-span-1 md:col-span-2">
        <div className="font-semibold mb-2 text-[#03648a]">Available vs Sold (Total)</div>
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
    </div>
  );
}
