import { useState, useEffect } from 'react';
import { FaRegEdit } from 'react-icons/fa';
import { MdDeleteOutline, MdVisibility, MdAddCircleOutline, MdAssignmentReturn, MdReceipt, MdAccountBalanceWallet } from 'react-icons/md';
import SupplierForm from '../components/SupplierForm';
import PurchaseOrderForm from '../components/PurchaseOrderForm';
import PurchaseReturnForm from '../components/PurchaseReturnForm';
import DebtorStatementForm from '../components/DebtorStatementForm';
import api from '../utils/axios';

export default function Suppliers() {
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAddPurchaseOrder, setShowAddPurchaseOrder] = useState(false);
  const [showAddPurchaseReturn, setShowAddPurchaseReturn] = useState(false);
  const [showAddDebtorStatement, setShowAddDebtorStatement] = useState(false);
  const [activeTab, setActiveTab] = useState('suppliers');

  // Data state for each table
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [purchaseReturns, setPurchaseReturns] = useState([]);
  const [debtorStatements, setDebtorStatements] = useState([]);

  // View/Edit state
  const [viewSupplier, setViewSupplier] = useState(null);
  const [editSupplier, setEditSupplier] = useState(null);

  const [viewPurchaseOrder, setViewPurchaseOrder] = useState(null);
  const [editPurchaseOrder, setEditPurchaseOrder] = useState(null);

  const [viewPurchaseReturn, setViewPurchaseReturn] = useState(null);
  const [editPurchaseReturn, setEditPurchaseReturn] = useState(null);

  const [viewDebtorStatement, setViewDebtorStatement] = useState(null);
  const [editDebtorStatement, setEditDebtorStatement] = useState(null);

  // Fetch data from backend
  useEffect(() => {
    if (activeTab === 'suppliers') fetchSuppliers();
    if (activeTab === 'purchaseOrders') fetchPurchaseOrders();
    if (activeTab === 'purchaseReturns') fetchPurchaseReturns();
    if (activeTab === 'debtorStatement') fetchDebtorStatements();
  }, [activeTab]);

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data);
    } catch {
      setSuppliers([]);
    }
  };
  const fetchPurchaseOrders = async () => {
    try {
      const res = await api.get('/purchase-orders');
      setPurchaseOrders(res.data);
    } catch {
      setPurchaseOrders([]);
    }
  };
  const fetchPurchaseReturns = async () => {
    try {
      const res = await api.get('/purchase-returns');
      setPurchaseReturns(res.data);
    } catch {
      setPurchaseReturns([]);
    }
  };
  const fetchDebtorStatements = async () => {
    try {
      const res = await api.get('/debtor-statements');
      setDebtorStatements(res.data);
    } catch {
      setDebtorStatements([]);
    }
  };

  // Edit handlers
  const handleEditSupplier = (s) => {
    setEditSupplier(s);
    setShowAddSupplier(true);
  };
  const handleEditPurchaseOrder = (po) => {
    setEditPurchaseOrder(po);
    setShowAddPurchaseOrder(true);
  };
  const handleEditPurchaseReturn = (pr) => {
    setEditPurchaseReturn(pr);
    setShowAddPurchaseReturn(true);
  };
  const handleEditDebtorStatement = (ds) => {
    setEditDebtorStatement(ds);
    setShowAddDebtorStatement(true);
  };

  // View handlers
  const handleViewSupplier = (s) => setViewSupplier(s);
  const handleViewPurchaseOrder = (po) => setViewPurchaseOrder(po);
  const handleViewPurchaseReturn = (pr) => setViewPurchaseReturn(pr);
  const handleViewDebtorStatement = (ds) => setViewDebtorStatement(ds);

  // Delete handlers
  const handleDeleteSupplier = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    await api.delete(`/suppliers/${id}`);
    fetchSuppliers();
  };
  const handleDeletePurchaseOrder = async (id) => {
    if (!window.confirm('Are you sure you want to delete this purchase order?')) return;
    await api.delete(`/purchase-orders/${id}`);
    fetchPurchaseOrders();
  };
  const handleDeletePurchaseReturn = async (id) => {
    if (!window.confirm('Are you sure you want to delete this purchase return?')) return;
    await api.delete(`/purchase-returns/${id}`);
    fetchPurchaseReturns();
  };
  const handleDeleteDebtorStatement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this debtor statement?')) return;
    await api.delete(`/debtor-statements/${id}`);
    fetchDebtorStatements();
  };

  // Save handlers (add or update)
  const handleSaveSupplier = async (data) => {
    if (editSupplier) {
      await api.put(`/suppliers/${editSupplier.id}`, data);
      setEditSupplier(null);
    } else {
      await api.post('/suppliers', data);
    }
    setShowAddSupplier(false);
    fetchSuppliers();
  };
  const handleSavePurchaseOrder = async (data) => {
    if (editPurchaseOrder) {
      await api.put(`/purchase-orders/${editPurchaseOrder.id}`, data);
      setEditPurchaseOrder(null);
    } else {
      await api.post('/purchase-orders', data);
    }
    setShowAddPurchaseOrder(false);
    fetchPurchaseOrders();
  };
  const handleSavePurchaseReturn = async (data) => {
    if (editPurchaseReturn) {
      await api.put(`/purchase-returns/${editPurchaseReturn.id}`, data);
      setEditPurchaseReturn(null);
    } else {
      await api.post('/purchase-returns', data);
    }
    setShowAddPurchaseReturn(false);
    fetchPurchaseReturns();
  };
  const handleSaveDebtorStatement = async (data) => {
    if (editDebtorStatement) {
      await api.put(`/debtor-statements/${editDebtorStatement.id}`, data);
      setEditDebtorStatement(null);
    } else {
      await api.post('/debtor-statements', data);
    }
    setShowAddDebtorStatement(false);
    fetchDebtorStatements();
  };

  return (
    <div className="w-full flex flex-col items-center min-h-[calc(100vh-60px)] bg-gradient-to-br from-[#e4f4fa] to-[#f8fbff] py-8 px-2 gap-8">
      <div className="w-full max-w-5xl bg-white/90 rounded-2xl shadow-2xl border border-[#b6e0fe] p-6 relative animate-fadein mb-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-[#0492C2] tracking-wide flex items-center gap-2">
            <span>Suppliers</span>
            <span className="block w-12 md:w-16 h-1 rounded bg-gradient-to-r from-[#0492C2] to-[#b6e0fe]"></span>
          </h1>
        </div>
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-xs shadow transition-all duration-200 ${
              activeTab === 'suppliers'
                ? 'bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white'
                : 'bg-[#f8fbff] text-[#0492C2] hover:bg-[#e4f4fa]'
            }`}
            onClick={() => { setActiveTab('suppliers'); setShowAddSupplier(false); }}
          >
            <MdAddCircleOutline className="w-4 h-4" />
            Suppliers
          </button>
          <button
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-xs shadow transition-all duration-200 ${
              activeTab === 'purchaseOrders'
                ? 'bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white'
                : 'bg-[#f8fbff] text-[#0492C2] hover:bg-[#e4f4fa]'
            }`}
            onClick={() => { setActiveTab('purchaseOrders'); setShowAddPurchaseOrder(false); }}
          >
            <MdReceipt className="w-4 h-4" />
            Purchase Orders
          </button>
          <button
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-xs shadow transition-all duration-200 ${
              activeTab === 'purchaseReturns'
                ? 'bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white'
                : 'bg-[#f8fbff] text-[#0492C2] hover:bg-[#e4f4fa]'
            }`}
            onClick={() => { setActiveTab('purchaseReturns'); setShowAddPurchaseReturn(false); }}
          >
            <MdAssignmentReturn className="w-4 h-4" />
            Purchase Returns
          </button>
          <button
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-xs shadow transition-all duration-200 ${
              activeTab === 'debtorStatement'
                ? 'bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white'
                : 'bg-[#f8fbff] text-[#0492C2] hover:bg-[#e4f4fa]'
            }`}
            onClick={() => { setActiveTab('debtorStatement'); setShowAddDebtorStatement(false); }}
          >
            <MdAccountBalanceWallet className="w-4 h-4" />
            Debtor Statement
          </button>
        </div>
        {/* Suppliers Table */}
        {activeTab === 'suppliers' && (
          <>
            <div className="flex justify-end mb-2">
              <button
                className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition text-xs md:text-sm"
                onClick={() => { setShowAddSupplier((v) => !v); setEditSupplier(null); }}
              >
                <MdAddCircleOutline className="w-5 h-5" />
                Add Supplier
              </button>
            </div>
            {showAddSupplier && (
              <SupplierForm
                onClose={() => { setShowAddSupplier(false); setEditSupplier(null); }}
                onSave={handleSaveSupplier}
                editData={editSupplier}
              />
            )}
            <div className="overflow-x-auto rounded-lg border border-[#b6e0fe] bg-white/80 shadow mb-8">
              <table className="min-w-full text-[11px] md:text-xs">
                <thead className="bg-[#e4f4fa] text-[#0492C2]">
                  <tr>
                    <th className="px-2 py-2 font-semibold text-center">Supplier ID</th>
                    <th className="px-2 py-2 font-semibold text-center">Supplier Name</th>
                    <th className="px-2 py-2 font-semibold text-center">Contact Number</th>
                    <th className="px-2 py-2 font-semibold text-center">Total Purchase</th>
                    <th className="px-2 py-2 font-semibold text-center">Paid</th>
                    <th className="px-2 py-2 font-semibold text-center">Discount</th>
                    <th className="px-2 py-2 font-semibold text-center">Balance Pay</th>
                    <th className="px-2 py-2 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => (
                    <tr key={s.id} className="border-b border-[#e4f4fa] hover:bg-[#f0f9ff] transition group text-[#03648a]">
                      <td className="px-2 py-2 text-center font-bold">{s.id}</td>
                      <td className="px-2 py-2 text-center font-semibold ">{s.name}</td>
                      <td className="px-2 py-2 text-center">{s.contact}</td>
                      <td className="px-2 py-2 text-center">LKR {Number(s.total_purchase).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                      <td className="px-2 py-2 text-center">LKR {Number(s.paid).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                      <td className="px-2 py-2 text-center">LKR {Number(s.discount).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                      <td className="px-2 py-2 text-center font-semibold text-[#0492C2]">LKR {Number(s.balance).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                      <td className="px-2 py-2 text-center flex gap-1 justify-center items-center">
                        <button
                          className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#0492C2] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                          title="View"
                          onClick={() => handleViewSupplier(s)}
                        >
                          <MdVisibility className="w-4 h-4 drop-shadow" />
                        </button>
                        <button
                          className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#0492C2] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                          title="Edit"
                          onClick={() => handleEditSupplier(s)}
                        >
                          <FaRegEdit className="w-4 h-4 drop-shadow" />
                        </button>
                        <button
                          className="action-btn-3d bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-400 text-red-400 hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                          title="Delete"
                          onClick={() => handleDeleteSupplier(s.id)}
                        >
                          <MdDeleteOutline className="w-4 h-4 drop-shadow" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* View Supplier Modal */}
            {viewSupplier && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl border border-[#b6e0fe] p-6 max-w-lg w-full">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-[#0492C2]">Supplier Details</h2>
                    <button
                      onClick={() => setViewSupplier(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <span className="text-2xl">&times;</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div><span className="font-semibold text-[#03648a]">Name:</span> {viewSupplier.name}</div>
                    <div><span className="font-semibold text-[#03648a]">Contact:</span> {viewSupplier.contact}</div>
                    <div><span className="font-semibold text-[#03648a]">Total Purchase:</span> LKR {Number(viewSupplier.total_purchase).toLocaleString()}</div>
                    <div><span className="font-semibold text-[#03648a]">Paid:</span> LKR {Number(viewSupplier.paid).toLocaleString()}</div>
                    <div><span className="font-semibold text-[#03648a]">Discount:</span> LKR {Number(viewSupplier.discount).toLocaleString()}</div>
                    <div><span className="font-semibold text-[#03648a]">Balance:</span> LKR {Number(viewSupplier.balance).toLocaleString()}</div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => setViewSupplier(null)}
                      className="px-6 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Purchase Orders Table */}
        {activeTab === 'purchaseOrders' && (
          <div className="mb-8">
            <div className="flex justify-end mb-2">
              <button
                className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition text-xs md:text-sm"
                onClick={() => { setShowAddPurchaseOrder((v) => !v); setEditPurchaseOrder(null); }}
              >
                <MdAddCircleOutline className="w-5 h-5" />
                Add Purchase Order
              </button>
            </div>
            {showAddPurchaseOrder && (
              <PurchaseOrderForm
                onClose={() => { setShowAddPurchaseOrder(false); setEditPurchaseOrder(null); }}
                onSave={handleSavePurchaseOrder}
                editData={editPurchaseOrder}
              />
            )}
            <div className="overflow-x-auto rounded-lg border border-[#b6e0fe] bg-white/80 shadow">
              <table className="min-w-full text-[11px] md:text-xs">
                <thead className="bg-[#e4f4fa] text-[#0492C2]">
                  <tr>
                    <th className="px-2 py-2 font-semibold text-center">Order No</th>
                    <th className="px-2 py-2 font-semibold text-center">Supplier</th>
                    <th className="px-2 py-2 font-semibold text-center">Date</th>
                    <th className="px-2 py-2 font-semibold text-center">Status</th>
                    <th className="px-2 py-2 font-semibold text-center">Amount</th>
                    <th className="px-2 py-2 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="border-b border-[#e4f4fa] hover:bg-[#f0f9ff] transition group text-[#03648a]">
                      <td className="px-2 py-2 text-center">{po.orderNo}</td>
                      <td className="px-2 py-2 text-center">{po.supplier}</td>
                      <td className="px-2 py-2 text-center">{po.date}</td>
                      <td className="px-2 py-2 text-center">{po.status}</td>
                      <td className="px-2 py-2 text-center">LKR {Number(po.amount).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                      <td className="px-2 py-2 text-center flex gap-1 justify-center items-center">
                        <button className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#0492C2] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200" title="View"
                          onClick={() => handleViewPurchaseOrder(po)}
                        >
                          <MdVisibility className="w-4 h-4 drop-shadow" />
                        </button>
                        <button className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#0492C2] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200" title="Edit"
                          onClick={() => handleEditPurchaseOrder(po)}
                        >
                          <FaRegEdit className="w-4 h-4 drop-shadow" />
                        </button>
                        <button className="action-btn-3d bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-400 text-red-400 hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200" title="Delete"
                          onClick={() => handleDeletePurchaseOrder(po.id)}
                        >
                          <MdDeleteOutline className="w-4 h-4 drop-shadow" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* View Purchase Order Modal */}
            {viewPurchaseOrder && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl border border-[#b6e0fe] p-6 max-w-lg w-full">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-[#0492C2]">Purchase Order Details</h2>
                    <button
                      onClick={() => setViewPurchaseOrder(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <span className="text-2xl">&times;</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div><span className="font-semibold text-[#03648a]">Order No:</span> {viewPurchaseOrder.orderNo}</div>
                    <div><span className="font-semibold text-[#03648a]">Supplier:</span> {viewPurchaseOrder.supplier}</div>
                    <div><span className="font-semibold text-[#03648a]">Date:</span> {viewPurchaseOrder.date}</div>
                    <div><span className="font-semibold text-[#03648a]">Status:</span> {viewPurchaseOrder.status}</div>
                    <div><span className="font-semibold text-[#03648a]">Amount:</span> LKR {Number(viewPurchaseOrder.amount).toLocaleString()}</div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => setViewPurchaseOrder(null)}
                      className="px-6 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Purchase Returns Table */}
        {activeTab === 'purchaseReturns' && (
          <div className="mb-8">
            <div className="flex justify-end mb-2">
              <button
                className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition text-xs md:text-sm"
                onClick={() => { setShowAddPurchaseReturn((v) => !v); setEditPurchaseReturn(null); }}
              >
                <MdAddCircleOutline className="w-5 h-5" />
                Add Purchase Return
              </button>
            </div>
            {showAddPurchaseReturn && (
              <PurchaseReturnForm
                onClose={() => { setShowAddPurchaseReturn(false); setEditPurchaseReturn(null); }}
                onSave={handleSavePurchaseReturn}
                editData={editPurchaseReturn}
              />
            )}
            <div className="overflow-x-auto rounded-lg border border-[#b6e0fe] bg-white/80 shadow">
              <table className="min-w-full text-[11px] md:text-xs">
                <thead className="bg-[#e4f4fa] text-[#0492C2]">
                  <tr>
                    <th className="px-2 py-2 font-semibold text-center">Return No</th>
                    <th className="px-2 py-2 font-semibold text-center">Supplier</th>
                    <th className="px-2 py-2 font-semibold text-center">Date</th>
                    <th className="px-2 py-2 font-semibold text-center">Reason</th>
                    <th className="px-2 py-2 font-semibold text-center">Amount</th>
                    <th className="px-2 py-2 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseReturns.map((pr) => (
                    <tr key={pr.id} className="border-b border-[#e4f4fa] hover:bg-[#f0f9ff] transition group text-[#03648a]">
                      <td className="px-2 py-2 text-center">{pr.returnNo}</td>
                      <td className="px-2 py-2 text-center">{pr.supplier}</td>
                      <td className="px-2 py-2 text-center">{pr.date}</td>
                      <td className="px-2 py-2 text-center">{pr.reason}</td>
                      <td className="px-2 py-2 text-center">LKR {Number(pr.amount).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                      <td className="px-2 py-2 text-center flex gap-1 justify-center items-center">
                        <button className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#0492C2] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200" title="View"
                          onClick={() => handleViewPurchaseReturn(pr)}
                        >
                          <MdVisibility className="w-4 h-4 drop-shadow" />
                        </button>
                        <button className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#0492C2] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200" title="Edit"
                          onClick={() => handleEditPurchaseReturn(pr)}
                        >
                          <FaRegEdit className="w-4 h-4 drop-shadow" />
                        </button>
                        <button className="action-btn-3d bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-400 text-red-400 hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200" title="Delete"
                          onClick={() => handleDeletePurchaseReturn(pr.id)}
                        >
                          <MdDeleteOutline className="w-4 h-4 drop-shadow" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* View Purchase Return Modal */}
            {viewPurchaseReturn && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl border border-[#b6e0fe] p-6 max-w-lg w-full">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-[#0492C2]">Purchase Return Details</h2>
                    <button
                      onClick={() => setViewPurchaseReturn(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <span className="text-2xl">&times;</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div><span className="font-semibold text-[#03648a]">Return No:</span> {viewPurchaseReturn.returnNo}</div>
                    <div><span className="font-semibold text-[#03648a]">Supplier:</span> {viewPurchaseReturn.supplier}</div>
                    <div><span className="font-semibold text-[#03648a]">Date:</span> {viewPurchaseReturn.date}</div>
                    <div><span className="font-semibold text-[#03648a]">Reason:</span> {viewPurchaseReturn.reason}</div>
                    <div><span className="font-semibold text-[#03648a]">Amount:</span> LKR {Number(viewPurchaseReturn.amount).toLocaleString()}</div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => setViewPurchaseReturn(null)}
                      className="px-6 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Debtor Statement Table */}
        {activeTab === 'debtorStatement' && (
          <div>
            <div className="flex justify-end mb-2">
              <button
                className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition text-xs md:text-sm"
                onClick={() => { setShowAddDebtorStatement((v) => !v); setEditDebtorStatement(null); }}
              >
                <MdAddCircleOutline className="w-5 h-5" />
                Add Debtor Statement
              </button>
            </div>
            {showAddDebtorStatement && (
              <DebtorStatementForm
                onClose={() => { setShowAddDebtorStatement(false); setEditDebtorStatement(null); }}
                onSave={handleSaveDebtorStatement}
                editData={editDebtorStatement}
              />
            )}
            <div className="overflow-x-auto rounded-lg border border-[#b6e0fe] bg-white/80 shadow">
              <table className="min-w-full text-[11px] md:text-xs">
                <thead className="bg-[#e4f4fa] text-[#0492C2]">
                  <tr>
                    <th className="px-2 py-2 font-semibold text-center">SN</th>
                    <th className="px-2 py-2 font-semibold text-center">Supplier</th>
                    <th className="px-2 py-2 font-semibold text-center">Date</th>
                    <th className="px-2 py-2 font-semibold text-center">Description</th>
                    <th className="px-2 py-2 font-semibold text-center">Debit</th>
                    <th className="px-2 py-2 font-semibold text-center">Credit</th>
                    <th className="px-2 py-2 font-semibold text-center">Balance</th>
                    <th className="px-2 py-2 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {debtorStatements.map((ds, idx) => (
                    <tr key={ds.id} className="border-b border-[#e4f4fa] hover:bg-[#f0f9ff] transition group text-[#03648a]">
                      <td className="px-2 py-2 text-center font-bold">{idx + 1}</td>
                      <td className="px-2 py-2 text-center">{ds.supplier}</td>
                      <td className="px-2 py-2 text-center">{ds.date}</td>
                      <td className="px-2 py-2 text-center">{ds.description}</td>
                      <td className="px-2 py-2 text-center">{ds.debit ? `LKR ${Number(ds.debit).toLocaleString(undefined, {minimumFractionDigits:2})}` : '-'}</td>
                      <td className="px-2 py-2 text-center">{ds.credit ? `LKR ${Number(ds.credit).toLocaleString(undefined, {minimumFractionDigits:2})}` : '-'}</td>
                      <td className="px-2 py-2 text-center font-semibold text-[#0492C2]">LKR {Number(ds.balance).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                      <td className="px-2 py-2 text-center flex gap-1 justify-center items-center">
                        <button className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#0492C2] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200" title="View"
                          onClick={() => handleViewDebtorStatement(ds)}
                        >
                          <MdVisibility className="w-4 h-4 drop-shadow" />
                        </button>
                        <button className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#0492C2] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200" title="Edit"
                          onClick={() => handleEditDebtorStatement(ds)}
                        >
                          <FaRegEdit className="w-4 h-4 drop-shadow" />
                        </button>
                        <button className="action-btn-3d bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-400 text-red-400 hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200" title="Delete"
                          onClick={() => handleDeleteDebtorStatement(ds.id)}
                        >
                          <MdDeleteOutline className="w-4 h-4 drop-shadow" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* View Debtor Statement Modal */}
            {viewDebtorStatement && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl border border-[#b6e0fe] p-6 max-w-lg w-full">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-[#0492C2]">Debtor Statement Details</h2>
                    <button
                      onClick={() => setViewDebtorStatement(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <span className="text-2xl">&times;</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div><span className="font-semibold text-[#03648a]">Supplier:</span> {viewDebtorStatement.supplier}</div>
                    <div><span className="font-semibold text-[#03648a]">Date:</span> {viewDebtorStatement.date}</div>
                    <div><span className="font-semibold text-[#03648a]">Description:</span> {viewDebtorStatement.description}</div>
                    <div><span className="font-semibold text-[#03648a]">Debit:</span> LKR {Number(viewDebtorStatement.debit).toLocaleString()}</div>
                    <div><span className="font-semibold text-[#03648a]">Credit:</span> LKR {Number(viewDebtorStatement.credit).toLocaleString()}</div>
                    <div><span className="font-semibold text-[#03648a]">Balance:</span> LKR {Number(viewDebtorStatement.balance).toLocaleString()}</div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => setViewDebtorStatement(null)}
                      className="px-6 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <style>{`
          .animate-fadein {
            animation: fadein 0.7s cubic-bezier(.4,0,.2,1);
          }
          @keyframes fadein {
            from { opacity: 0; transform: translateY(24px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .action-btn-3d {
            box-shadow: 0 2px 8px 0 #b6e0fe33, 0 1px 0 0 #b6e0fe;
            transform: perspective(400px) translateZ(0);
          }
          .action-btn-3d:active {
            transform: scale(0.95) perspective(400px) translateZ(0);
          }
          .input {
            width: 100%;
            padding: 0.5rem;
            border-radius: 0.5rem;
            border: 1.5px solid #b6e0fe;
            background: #f8fbff;
            margin-top: 0.25rem;
            font-size: 1rem;
          }
          .input:focus {
            outline: none;
            border-color: #0492C2;
            background: #fff;
          }
        `}</style>
      </div>
    </div>
  );
}

