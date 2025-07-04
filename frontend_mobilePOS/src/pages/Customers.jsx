import { Fragment, useState, useEffect } from 'react';
import { PlusIcon, XMarkIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import PayInTerms from '../components/PayInTerms';
import ReturnsRefunds from '../components/Returns&Refunds';
import api from '../utils/axios'; // Make sure this points to your axios instance

export default function Customers() {
	const [customers, setCustomers] = useState([]);
	const [showAddModal, setShowAddModal] = useState(false);
	const [newCustomer, setNewCustomer] = useState({
		name: '',
		contact: '',
		whatsapp: false,
		viber: false,
		email: '',
		address: '',
		joinedDate: '',
		paid: '',
		due: '',
		status: 'Active',
		purchases: [{ date: '', item: '', quantity: 1 }]
	});
	const [viewCustomer, setViewCustomer] = useState(null);
	const [activeTab, setActiveTab] = useState('table');
	const [loading, setLoading] = useState(false);
	const [editCustomer, setEditCustomer] = useState(null);
	const [showAddTermsForm, setShowAddTermsForm] = useState(false);
	const [showAddRefundForm, setShowAddRefundForm] = useState(false);

	// Fetch all customers from backend
	useEffect(() => {
		if (activeTab === 'table') {
			fetchCustomers();
		}
	}, [activeTab]);

	const fetchCustomers = async () => {
		setLoading(true);
		try {
			const res = await api.get('/customers');
			setCustomers(res.data);
		} catch (err) {
			setCustomers([]);
		} finally {
			setLoading(false);
		}
	};

	// Fetch single customer by id for view popup (always fresh from backend)
	const fetchCustomerById = async (id) => {
		try {
			const res = await api.get(`/customers/${id}`);
			setViewCustomer(res.data);
		} catch (err) {
			setViewCustomer(null);
		}
	};

	// Show popup after data is fetched
	useEffect(() => {
		if (viewCustomer && typeof viewCustomer === 'object' && viewCustomer.id) {
			// No-op: popup is rendered below when viewCustomer is set
		}
	}, [viewCustomer]);

	// Handle input change for customer fields
	const handleInputChange = (e) => {
		const { name, value, type, checked } = e.target;
		setNewCustomer((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value
		}));
	};

	// Handle input change for purchases
	const handlePurchaseChange = (idx, field, value) => {
		setNewCustomer((prev) => ({
			...prev,
			purchases: prev.purchases.map((p, i) =>
				i === idx ? { ...p, [field]: field === 'quantity' ? Number(value) : value } : p
			)
		}));
	};

	// Add new purchase row
	const addPurchaseRow = () => {
		setNewCustomer((prev) => ({
			...prev,
			purchases: [...prev.purchases, { date: '', item: '', quantity: 1 }]
		}));
	};

	// Remove purchase row
	const removePurchaseRow = (idx) => {
		setNewCustomer((prev) => ({
			...prev,
			purchases: prev.purchases.filter((_, i) => i !== idx)
		}));
	};

	// Delete customer
	const handleDeleteCustomer = async (id) => {
		if (!window.confirm('Are you sure you want to delete this customer?')) return;
		try {
			await api.delete(`/customers/${id}`);
			setCustomers(prev => prev.filter(c => c.id !== id));
			if (viewCustomer && viewCustomer.id === id) setViewCustomer(null);
		} catch (err) {
			alert('Failed to delete customer');
		}
	};

	// Edit customer: open modal with customer data
	const handleEditCustomer = (customer) => {
		setEditCustomer(customer);
		setShowAddModal(true);
		setNewCustomer({
			name: customer.name,
			contact: customer.contact,
			whatsapp: !!customer.whatsapp,
			viber: !!customer.viber,
			email: customer.email,
			address: customer.address,
			joinedDate: customer.joinedDate,
			paid: customer.paid,
			due: customer.due,
			status: customer.status,
			purchases: Array.isArray(customer.purchases) && customer.purchases.length > 0
				? customer.purchases
				: [{ date: '', item: '', quantity: 1 }]
		});
	};

	// Add or update customer (POST or PUT to backend)
	const handleAddCustomer = async (e) => {
		e.preventDefault();
		try {
			const payload = {
				...newCustomer,
				paid: Number(newCustomer.paid),
				due: Number(newCustomer.due),
				purchases: newCustomer.purchases.filter(p => p.date && p.item && p.quantity)
			};
			if (editCustomer) {
				await api.put(`/customers/${editCustomer.id}`, payload);
			} else {
				await api.post('/customers', payload);
			}
			setShowAddModal(false);
			setEditCustomer(null);
			setNewCustomer({
				name: '',
				contact: '',
				whatsapp: false,
				viber: false,
				email: '',
				address: '',
				joinedDate: '',
				paid: '',
				due: '',
				status: 'Active',
				purchases: [{ date: '', item: '', quantity: 1 }]
			});
			fetchCustomers();
		} catch (err) {
			alert('Failed to save customer');
		}
	};

	return (
		<div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-semibold text-[#0492C2]">Customers</h1>
				{activeTab === 'table' && (
					<button
						className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition"
						onClick={() => {
							setShowAddModal(true);
							setEditCustomer(null);
							setNewCustomer({
								name: '',
								contact: '',
								whatsapp: false,
								viber: false,
								email: '',
								address: '',
								joinedDate: '',
								paid: '',
								due: '',
								status: 'Active',
								purchases: [{ date: '', item: '', quantity: 1 }]
							});
						}}
					>
						<PlusIcon className="w-5 h-5" />
						Customer
					</button>
				)}
				{activeTab === 'terms' && (
					<button
						className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition"
						type="button"
						onClick={() => setShowAddTermsForm(true)}
					>
						<PlusIcon className="w-5 h-5" />
						Terms
					</button>
				)}
				{activeTab === 'returns' && (
					<button
						className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition"
						type="button"
						onClick={() => setShowAddRefundForm(true)}
					>
						<PlusIcon className="w-5 h-5" />
						Refund
					</button>
				)}
			</div>
			{/* Tabs */}
			<div className="flex gap-2 mb-4">
				<button
					className={`px-4 py-2 rounded-lg font-semibold text-sm shadow transition-all duration-200 ${
						activeTab === 'table'
							? 'bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white'
							: 'bg-[#f8fbff] text-[#0492C2] hover:bg-[#e4f4fa]'
					}`}
					onClick={() => setActiveTab('table')}
				>
					Customer Table
				</button>
				<button
					className={`px-4 py-2 rounded-lg font-semibold text-sm shadow transition-all duration-200 ${
						activeTab === 'terms'
							? 'bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white'
							: 'bg-[#f8fbff] text-[#0492C2] hover:bg-[#e4f4fa]'
					}`}
					onClick={() => setActiveTab('terms')}
				>
					Pay in Terms
				</button>
				<button
					className={`px-4 py-2 rounded-lg font-semibold text-sm shadow transition-all duration-200 ${
						activeTab === 'returns'
							? 'bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white'
							: 'bg-[#f8fbff] text-[#0492C2] hover:bg-[#e4f4fa]'
					}`}
					onClick={() => setActiveTab('returns')}
				>
					Returns & Refunds
				</button>
			</div>
			{/* Add Customer Form (inline, not modal) */}
			{showAddModal && (
				<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-2xl mx-auto p-8 border border-[#b6e0fe] mb-8 animate-fade-in relative z-20">
					<div className="flex flex-wrap items-center justify-between pb-2 border-b border-[#e0eefa] mb-4">
						<h2 className="text-xl font-bold text-[#03648a] flex items-center gap-3">
							<div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#0492C2]/90 to-[#b6e0fe]/90 flex items-center justify-center shadow">
								<PlusIcon className="h-5 w-5 text-white" />
							</div>
							<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0492C2] to-[#b6e0fe]">
								{editCustomer ? 'Edit Customer' : 'Add New Customer'}
							</span>
						</h2>
						<span className="text-xs font-medium px-2 py-1 bg-gradient-to-r from-white to-[#e4f4fa] text-[#0492C2] rounded-full border border-[#e0eefa]">
							All fields required
						</span>
						
					</div>
					<form onSubmit={handleAddCustomer} className="space-y-4" autoComplete="off">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="block text-sm font-medium text-[#03648a] mb-1">Customer Name</label>
								<input
									type="text"
									name="name"
									required
									className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
									value={newCustomer.name}
									onChange={handleInputChange}
									placeholder="Full name or business name"
								/>
							</div>
							<div className="space-y-2">
								<label className="block text-sm font-medium text-[#03648a] mb-1">Contact No</label>
								<input
									type="text"
									name="contact"
									required
									className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
									value={newCustomer.contact}
									onChange={handleInputChange}
									placeholder="Phone number"
								/>
								<div className="flex gap-3 mt-2">
									<label className="flex items-center gap-1 text-xs">
										<input type="checkbox" name="whatsapp" checked={newCustomer.whatsapp} onChange={handleInputChange} />
										WhatsApp
									</label>
									<label className="flex items-center gap-1 text-xs">
										<input type="checkbox" name="viber" checked={newCustomer.viber} onChange={handleInputChange} />
										Viber
									</label>
								</div>
							</div>
							<div className="space-y-2">
								<label className="block text-sm font-medium text-[#03648a] mb-1">Email</label>
								<input
									type="email"
									name="email"
									className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
									value={newCustomer.email}
									onChange={handleInputChange}
									placeholder="Email address"
								/>
							</div>
							<div className="space-y-2">
								<label className="block text-sm font-medium text-[#03648a] mb-1">Address</label>
								<input
									type="text"
									name="address"
									className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
									value={newCustomer.address}
									onChange={handleInputChange}
									placeholder="Full address or city"
								/>
							</div>
							<div className="space-y-2">
								<label className="block text-sm font-medium text-[#03648a] mb-1">Joined Date</label>
								<input
									type="date"
									name="joinedDate"
									className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
									value={newCustomer.joinedDate}
									onChange={handleInputChange}
								/>
							</div>
							<div className="space-y-2">
								<label className="block text-sm font-medium text-[#03648a] mb-1">Paid</label>
								<input
									type="number"
									name="paid"
									className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
									value={newCustomer.paid}
									onChange={handleInputChange}
									placeholder="Paid amount"
								/>
							</div>
							<div className="space-y-2">
								<label className="block text-sm font-medium text-[#03648a] mb-1">Due</label>
								<input
									type="number"
									name="due"
									className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
									value={newCustomer.due}
									onChange={handleInputChange}
									placeholder="Due amount"
								/>
							</div>
							<div className="space-y-2">
								<label className="block text-sm font-medium text-[#03648a] mb-1">Credit</label>
								<input
									type="number"
									name="credit"
									className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
									value={newCustomer.credit || ''}
									onChange={handleInputChange}
									placeholder="Credit amount"
								/>
							</div>
							<div className="space-y-2">
								<label className="block text-sm font-medium text-[#03648a] mb-1">Status</label>
								<select
									name="status"
									className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
									value={newCustomer.status}
									onChange={handleInputChange}
								>
									<option value="Active">Active</option>
									<option value="Inactive">Inactive</option>
									<option value="Banned">Banned</option>
								</select>
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium text-[#03648a] mb-1">Purchases</label>
							<div className="space-y-2">
								{newCustomer.purchases.map((p, idx) => (
									<div key={idx} className="flex gap-2 items-center">
										<input
											type="date"
											value={p.date}
											onChange={e => handlePurchaseChange(idx, 'date', e.target.value)}
											className="w-32 px-3 py-2 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent"
											required
										/>
										<input
											type="text"
											value={p.item}
											onChange={e => handlePurchaseChange(idx, 'item', e.target.value)}
											placeholder="Item"
											className="flex-1 px-3 py-2 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent"
											required
										/>
										<input
											type="number"
											min={1}
											value={p.quantity}
											onChange={e => handlePurchaseChange(idx, 'quantity', e.target.value)}
											placeholder="Qty"
											className="w-20 px-3 py-2 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent"
											required
										/>
										{newCustomer.purchases.length > 1 && (
											<button
												type="button"
												className="text-red-500 hover:text-red-700 font-bold px-2"
												onClick={() => removePurchaseRow(idx)}
											>
												×
											</button>
										)}
									</div>
								))}
								<button
									type="button"
									className="flex items-center text-[#0492C2] hover:underline text-sm mt-2"
									onClick={addPurchaseRow}
								>
									<PlusIcon className="w-4 h-4 mr-1" />
									Add Purchase
								</button>
							</div>
						</div>
						<div className="flex justify-end gap-3 pt-4">
							<button
								type="button"
								className="px-5 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 text-base font-semibold transition"
								onClick={() => {
									setShowAddModal(false);
									setEditCustomer(null);
								}}
							>
								Cancel
							</button>
							<button
								type="submit"
								className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white font-semibold hover:from-[#037ba1] hover:to-[#b6e0fe] transition"
							>
								{editCustomer ? 'Update Customer' : 'Add Customer'}
							</button>
						</div>
					</form>
				</div>
			)}
			{/* Customer Table Tab */}
			{activeTab === 'table' && (
				<div className={`overflow-x-auto rounded-lg border border-[#b6e0fe] bg-white/80 shadow mb-8 transition-all duration-300 ${showAddModal ? 'opacity-30 pointer-events-none select-none blur-sm' : ''}`}>
					<table className="min-w-full text-[11px] md:text-xs border-separate border-spacing-y-2">
						<thead className="bg-[#e4f4fa] text-[#0492C2]">
							<tr>
								<th className="px-2 py-2 font-semibold text-center">SN</th>
								<th className="px-2 py-2 font-semibold text-center">Customer Name</th>
								<th className="px-2 py-2 font-semibold text-center">Contact No</th>
								<th className="px-2 py-2 font-semibold text-center">Joined Date</th>
								<th className="px-2 py-2 font-semibold text-center">Paid</th>
								<th className="px-2 py-2 font-semibold text-center">Due</th>
								<th className="px-2 py-2 font-semibold text-center">Credit</th>
								<th className="px-2 py-2 font-semibold text-center">Status</th>
								<th className="px-2 py-2 font-semibold text-center">Actions</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr>
									<td colSpan={9} className="text-center py-6 text-[#0492C2] font-semibold">
										Loading...
									</td>
								</tr>
							) : customers.length === 0 ? (
								<tr>
									<td colSpan={9} className="text-center py-6 text-gray-400">
										No customers found.
									</td>
								</tr>
							) : (
								customers.map((c, idx) => (
									<tr
										key={c.id}
										className="items-table-row group transition-all duration-200 align-middle"
									>
										<td className="text-center align-middle font-bold text-[#0492C2]">{idx + 1}</td>
										<td className="text-center align-middle text-[#03648a]">{c.name}</td>
										<td className="text-center align-middle text-[#03648a]">
											{c.contact}
										</td>
										<td className="text-center align-middle text-[#03648a]">{c.joinedDate}</td>
										<td className="text-center align-middle font-semibold text-[#3bb6e7]">
											{c.paid ? `LKR ${Number(c.paid).toLocaleString()}` : '-'}
										</td>
										<td className="text-center align-middle font-semibold text-[#5dc6e7]">
											{c.due ? `LKR ${Number(c.due).toLocaleString()}` : '-'}
										</td>
										<td className="text-center align-middle font-semibold text-[#0492C2]">
											{c.credit ? `LKR ${Number(c.credit).toLocaleString()}` : '-'}
										</td>
										<td className="text-center align-middle">
											<span
												className={`px-2 py-1 rounded-full text-xs font-bold ${
													c.status === 'Active'
														? 'bg-[#e0f7fa] text-[#0492C2]'
														: c.status === 'Inactive'
															? 'bg-[#b6e0fe] text-[#03648a]'
															: 'bg-[#b6e0fe]/60 text-[#03648a]/80'
												}`}
											>
												{c.status}
											</span>
										</td>
										<td className="text-center align-middle">
											<div className="flex gap-1 justify-center items-center">
												<button
													className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#0492C2] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
													title="View"
													onClick={async () => {
														await fetchCustomerById(c.id);
													}}
												>
													<EyeIcon className="w-4 h-4 drop-shadow" />
												</button>
												<button
													className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#0492C2] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
													title="Edit"
													onClick={() => handleEditCustomer(c)}
												>
													<PencilIcon className="w-4 h-4 drop-shadow" />
												</button>
												<button
													className="action-btn-3d bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-400 text-red-400 hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
													title="Delete"
													onClick={() => handleDeleteCustomer(c.id)}
												>
													<TrashIcon className="w-4 h-4 drop-shadow" />
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
					<style>{`
						.items-table-row {
							border-radius: 18px !important;
							background: #fff !important;
							margin-bottom: 14px !important;
							box-shadow: 0 6px 24px 0 rgba(4,146,194,0.10), 0 1.5px 4px 0 rgba(4,146,194,0.06) !important;
							border: 1.5px solid #e0eefa !important;
							transition: 
								box-shadow 0.25s cubic-bezier(.4,0,.2,1),
								transform 0.25s cubic-bezier(.4,0,.2,1),
								background 0.2s;
						}
						.items-table-row:hover {
							box-shadow: 0 12px 32px 0 rgba(4,146,194,0.18), 0 3px 12px 0 rgba(4,146,194,0.10) !important;
							transform: translateY(-4px) scale(1.025);
							background: #f8fbff !important;
							z-index: 2;
						}
						.action-btn-3d {
							transition: all 0.2s ease;
							transform: translateY(0);
						}
						.action-btn-3d:hover {
							transform: translateY(-2px);
							box-shadow: 0 4px 6px rgba(4, 146, 194, 0.2);
						}
					`}</style>
				</div>
			)}
			{/* Pay in Terms Tab */}
			{activeTab === 'terms' && (
				<PayInTerms onView={setViewCustomer} showAddForm={showAddTermsForm} setShowAddForm={setShowAddTermsForm} />
			)}
			{/* Returns & Refunds Tab */}
			{activeTab === 'returns' && (
				<ReturnsRefunds onView={setViewCustomer} showAddForm={showAddRefundForm} setShowAddForm={setShowAddRefundForm} />
			)}
			{/* View Customer Modal */}
			{viewCustomer && viewCustomer.id && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-xl shadow-xl border border-[#b6e0fe] p-6 max-w-lg w-full">
						<div className="flex justify-between items-start mb-4">
							<h2 className="text-xl font-bold text-[#0492C2]">Customer Details</h2>
							<button
								onClick={() => setViewCustomer(null)}
								className="text-gray-500 hover:text-gray-700"
							>
								<span className="text-2xl">&times;</span>
							</button>
						</div>
						<div className="space-y-2">
							<div><span className="font-semibold text-[#03648a]">Name:</span> {viewCustomer.name}</div>
							<div><span className="font-semibold text-[#03648a]">Contact:</span> {viewCustomer.contact} {viewCustomer.whatsapp && <span className="ml-1 text-[#3bb6e7]">🟦 WhatsApp</span>} {viewCustomer.viber && <span className="ml-1 text-[#5dc6e7]">🟦 Viber</span>}</div>
							<div><span className="font-semibold text-[#03648a]">Email:</span> {viewCustomer.email || '-'}</div>
							<div><span className="font-semibold text-[#03648a]">Address:</span> {viewCustomer.address || '-'}</div>
							<div><span className="font-semibold text-[#03648a]">Joined Date:</span> {viewCustomer.joinedDate}</div>
							<div><span className="font-semibold text-[#03648a]">Paid:</span> <span className="text-[#3bb6e7]">{viewCustomer.paid ? `LKR ${Number(viewCustomer.paid).toLocaleString()}` : '-'}</span></div>
							<div><span className="font-semibold text-[#03648a]">Due:</span> <span className="text-[#5dc6e7]">{viewCustomer.due ? `LKR ${Number(viewCustomer.due).toLocaleString()}` : '-'}</span></div>
							<div><span className="font-semibold text-[#03648a]">Status:</span> <span className={
								viewCustomer.status === 'Active'
									? 'bg-[#e0f7fa] text-[#0492C2] px-2 py-1 rounded-full text-xs font-bold'
									: viewCustomer.status === 'Inactive'
										? 'bg-[#b6e0fe] text-[#03648a] px-2 py-1 rounded-full text-xs font-bold'
										: 'bg-[#b6e0fe]/60 text-[#03648a]/80 px-2 py-1 rounded-full text-xs font-bold'
							}>{viewCustomer.status}</span></div>
							<div>
								<span className="font-semibold text-[#03648a]">Purchases:</span>
								<ul className="list-disc ml-6">
									{viewCustomer.purchases && viewCustomer.purchases.length > 0 ? (
										viewCustomer.purchases.map((p, i) => (
											<li key={i}>{p.date} - {p.item} x{p.quantity}</li>
										))
									) : (
										<li>-</li>
									)}
								</ul>
							</div>
						</div>
						<div className="flex justify-end mt-6">
							<button
								onClick={() => setViewCustomer(null)}
								className="px-6 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}