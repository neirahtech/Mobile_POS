import { useMemo } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

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

// Helper: filter by time range
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

// Helper: group by date for line chart
function groupByDate(data, dateField) {
  const map = {};
  data.forEach(e => {
    const d = new Date(e[dateField]);
    const key = d.toISOString().slice(0, 10);
    if (!map[key]) map[key] = 0;
    map[key] += Number(e.amount) || 0;
  });
  return Object.entries(map)
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Helper: group by month for line chart
function groupByMonth(data, dateField) {
  const map = {};
  data.forEach(e => {
    const d = new Date(e[dateField]);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!map[key]) map[key] = 0;
    map[key] += Number(e.amount) || 0;
  });
  return Object.entries(map)
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

// Helper: group by year for line chart
function groupByYear(data, dateField) {
  const map = {};
  data.forEach(e => {
    const d = new Date(e[dateField]);
    const key = `${d.getFullYear()}`;
    if (!map[key]) map[key] = 0;
    map[key] += Number(e.amount) || 0;
  });
  return Object.entries(map)
    .map(([year, total]) => ({ year, total }))
    .sort((a, b) => a.year.localeCompare(b.year));
}

export default function ExpensesReport({ expensesData, loading, timeRange = 'day' }) {
  // Filtered data by time range
  const filteredExpenses = useMemo(
    () => filterByTimeRange(expensesData, 'date', timeRange),
    [expensesData, timeRange]
  );

  // Calculate summary
  const total = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0),
    [filteredExpenses]
  );
  const paid = useMemo(
    () => filteredExpenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + Number(e.amount), 0),
    [filteredExpenses]
  );
  const pending = useMemo(
    () => filteredExpenses.filter(e => e.status === 'Pending').reduce((sum, e) => sum + Number(e.amount), 0),
    [filteredExpenses]
  );

  // Download handler
  const handleDownload = () => {
    downloadCSV(
      `expenses-report-${timeRange}.csv`,
      filteredExpenses.map(e => ({
        date: e.date,
        expense: e.expense,
        paidTo: e.paidTo,
        amount: e.amount,
        paymentMethod: e.paymentMethod,
        status: e.status,
        balance: e.balance,
        remark: e.remark
      })),
      ['date', 'expense', 'paidTo', 'amount', 'paymentMethod', 'status', 'balance', 'remark']
    );
  };

  // Line chart data
  const expensesByDate = useMemo(() => groupByDate(filteredExpenses, 'date'), [filteredExpenses]);
  const expensesByMonth = useMemo(() => groupByMonth(filteredExpenses, 'date'), [filteredExpenses]);
  const expensesByYear = useMemo(() => groupByYear(filteredExpenses, 'date'), [filteredExpenses]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-[#0492C2]">Expenses Report</h2>
        <button
          className="btn-secondary flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-[#e4f4fa] border border-[#0492C2] hover:bg-[#b6e0fe] hover:text-[#03648a] active:bg-[#e4f4fa] active:text-[#03648a] transition"
          style={{ minHeight: 32 }}
          onClick={handleDownload}
        >
          <ArrowDownTrayIcon className="w-4 h-4 text-[#03648a]" />
          <span className="text-[#03648a] font-semibold">Download CSV</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl border-2 border-[#0492C2] bg-white/90 flex flex-col gap-2 shadow">
          <div className="text-sm text-gray-500">Total Expenses</div>
          <div className="text-2xl font-bold text-[#0492C2]">LKR {total.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
        </div>
        <div className="p-5 rounded-xl border-2 border-[#0492C2] bg-white/90 flex flex-col gap-2 shadow">
          <div className="text-sm text-gray-500">Paid</div>
          <div className="text-2xl font-bold text-green-600">LKR {paid.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
        </div>
        <div className="p-5 rounded-xl border-2 border-[#0492C2] bg-white/90 flex flex-col gap-2 shadow">
          <div className="text-sm text-gray-500">Pending</div>
          <div className="text-2xl font-bold text-red-500">LKR {pending.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
        </div>
      </div>
      {/* Line Graphs */}
      <div>
        <h3 className="font-semibold mb-2 text-[#03648a]">Expenses Over Time</h3>
        <div className="flex flex-row gap-6 overflow-x-auto pb-2" style={{scrollSnapType:'x mandatory', minWidth:0, maxWidth:'400px', WebkitOverflowScrolling:'touch', scrollbarWidth:'none'}}>
          {/* By Date */}
          <div className="bg-white/90 rounded-xl border border-[#b6e0fe] shadow p-4 min-w-[400px] w-[400px]" style={{scrollSnapAlign:'start'}}>
            <div className="font-semibold mb-2 text-[#03648a]">By Date</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={expensesByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#d32f2f" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* By Month */}
          <div className="bg-white/90 rounded-xl border border-[#b6e0fe] shadow p-4 min-w-[400px] w-[400px]" style={{scrollSnapAlign:'start'}}>
            <div className="font-semibold mb-2 text-[#03648a]">By Month</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={expensesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#d32f2f" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* By Year */}
          <div className="bg-white/90 rounded-xl border border-[#b6e0fe] shadow p-4 min-w-[400px] w-[400px]" style={{scrollSnapAlign:'start'}}>
            <div className="font-semibold mb-2 text-[#03648a]">By Year</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={expensesByYear}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#d32f2f" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="card p-6 border-2 border-[#0492C2] overflow-x-auto text-[#03648a] rounded-md">
        <h3 className="font-semibold mb-4">Expenses Table</h3>
        <table className="min-w-full text-xs">
          <thead>
            <tr>
              <th className="px-2 py-1 text-left">Date</th>
              <th className="px-2 py-1 text-left">Expense</th>
              <th className="px-2 py-1 text-left">Paid To</th>
              <th className="px-2 py-1 text-left">Amount</th>
              <th className="px-2 py-1 text-left">Payment</th>
              <th className="px-2 py-1 text-left">Status</th>
              <th className="px-2 py-1 text-left">Balance</th>
              <th className="px-2 py-1 text-left">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-[#0492C2] font-semibold">
                  Loading...
                </td>
              </tr>
            ) : filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-400">
                  No expenses found.
                </td>
              </tr>
            ) : (
              filteredExpenses.map((exp, idx) => (
                <tr key={exp.id || idx}>
                  <td className="px-2 py-1">{exp.date}</td>
                  <td className="px-2 py-1">{exp.expense}</td>
                  <td className="px-2 py-1">{exp.paidTo}</td>
                  <td className="px-2 py-1 text-right font-semibold text-[#0492C2]">LKR {Number(exp.amount).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                  <td className="px-2 py-1">{exp.paymentMethod}</td>
                  <td className="px-2 py-1">{exp.status}</td>
                  <td className="px-2 py-1">{exp.balance ? Number(exp.balance).toLocaleString(undefined, {minimumFractionDigits:2}) : '-'}</td>
                  <td className="px-2 py-1">{exp.remark}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
