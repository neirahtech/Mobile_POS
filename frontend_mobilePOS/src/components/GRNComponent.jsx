import React, { useState, useEffect, useRef } from 'react';
import { MdDeleteOutline, MdVisibility } from 'react-icons/md';
import { FaRegEdit } from 'react-icons/fa';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function GRNComponent({
  grns,
  setGrns,
  activeTable,
  setActiveTable,
  viewGRN,
  setViewGRN
}) {
  const [showGRNForm, setShowGRNForm] = useState(false);
  const [itemsList, setItemsList] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  
  const [grnHeader, setGrnHeader] = useState({
    supplier: '',
    invoiceNumber: '',
    invoiceDate: ''
  });
  const [debugMode, setDebugMode] = useState(false);
  
  const [grnItemForm, setGrnItemForm] = useState({
    code: '',
    itemName: '',
    costPrice: '',
    wholesalePrice: '',
    retailPrice: '',
    saleDiscount: '',
    quantity: '',
    warranty: '',
    expiry: ''
  });
  
  const [grnItems, setGrnItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [editGRN, setEditGRN] = useState(null);

  // Track GRN integer id for the session
  const grnIdCounter = useRef(1);
  const [currentGrnId, setCurrentGrnId] = useState(grnIdCounter.current);

  // Fetch the latest GRN id from the backend and set the next id
  const fetchNextGrnId = async () => {
    try {
      const response = await api.get('/grn');
      if (Array.isArray(response.data) && response.data.length > 0) {
        // Find the max grn_id in the fetched data
        const maxId = Math.max(...response.data.map(grn => Number(grn.grn_id) || 0));
        grnIdCounter.current = maxId + 1;
        setCurrentGrnId(grnIdCounter.current);
      } else {
        grnIdCounter.current = 1;
        setCurrentGrnId(1);
      }
    } catch {
      grnIdCounter.current = 1;
      setCurrentGrnId(1);
    }
  };

  useEffect(() => {
    if (showGRNForm) {
      fetchItems();
    }
  }, [showGRNForm]);

  // Fetch GRNs from backend on mount
  useEffect(() => {
    const fetchGRNs = async () => {
      try {
        const response = await api.get('/grn');
        // The backend returns an array of GRNs, each with header fields and items array.
        // To show all details in the table, display only header fields in the table.
        if (Array.isArray(response.data)) {
          setGrns(response.data);
        } else {
          setGrns([]);
        }
      } catch (error) {
        console.error('Error fetching GRNs:', error);
        setGrns([]);
      }
    };
    fetchGRNs();
    // eslint-disable-next-line
  }, []);

  const fetchItems = async () => {
    if (debugMode) console.log('[DEBUG] Starting item fetch...');
    setLoadingItems(true);
    
    try {
      if (debugMode) console.log('[DEBUG] Making API request to /items...');
      const response = await api.get('/items');
      
      if (debugMode) console.log('[DEBUG] API Response:', response);
  
      if (!response.data?.items) {
        if (debugMode) console.error('[ERROR] Invalid items data structure');
        setItemsList([]);
        return;
      }
  
      const items = response.data.items.map(item => {
        const code = item.model_number || item.item_code || `item-${item.id}`;
        if (debugMode) console.log(`[DEBUG] Mapping item ${item.id} to code:`, code);
        return {
          ...item,
          code: code
        };
      });
  
      setItemsList(items);
      if (debugMode) console.log('[DEBUG] Successfully loaded', items.length, 'items');
      
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoadingItems(false);
      if (debugMode) console.log('[DEBUG] Fetch completed');
    }
  };

  const handleItemCodeChange = (e) => {
    const code = e.target.value;
    setGrnItemForm(prev => ({ ...prev, code }));

    if (code) {
      const selectedItem = itemsList.find(item => 
        item.code === code || item.item_code === code
      );

      if (selectedItem) {
        // Only populate form, don't auto-increment here
        setGrnItemForm(prev => ({
          ...prev,
          itemName: selectedItem.name || selectedItem.item_name || '',
          quantity: prev.quantity || '1' // Keep existing quantity or default to 1
        }));
      }
    } else {
      setGrnItemForm(prev => ({ ...prev, itemName: '' }));
    }
  };

  const handleGrnHeaderChange = (e) => {
    setGrnHeader(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGrnItemFormChange = (e) => {
    setGrnItemForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addItemToGRN = () => {
    if (!grnItemForm.code || !grnItemForm.itemName) {
      toast.error('Please select an item');
      return;
    }

    const newItem = {
      ...grnItemForm,
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      supplier: grnHeader.supplier, 
      invoiceNumber: grnHeader.invoiceNumber, 
      invoiceDate: grnHeader.invoiceDate, 
      costPrice: grnItemForm.costPrice || 0,
      wholesalePrice: grnItemForm.wholesalePrice || 0,
      retailPrice: grnItemForm.retailPrice || 0,
      saleDiscount: grnItemForm.saleDiscount || 0,
      quantity: grnItemForm.quantity || 1,
      warranty: grnItemForm.warranty || '',
      expiry: grnItemForm.expiry || ''
    };

    setGrnItems([...grnItems, newItem]);
    setGrnItemForm({
      code: '',
      itemName: '',
      costPrice: '',
      wholesalePrice: '',
      retailPrice: '',
      saleDiscount: '',
      quantity: '',
      warranty: '',
      expiry: ''
    });
  };

  const handleItemFieldChange = (index, field, value) => {
    const updatedItems = [...grnItems];
    updatedItems[index][field] = value;
    setGrnItems(updatedItems);
  };

  const removeItemFromGRN = (id) => {
    setGrnItems(prev => prev.filter(item => item.id !== id));
  };

  // Calculate item total (quantity * cost_price)
  const calculateItemTotal = (item) => {
    const costPrice = parseFloat(item.costPrice) || 0;
    const quantity = parseInt(item.quantity) || 0;
    return (costPrice * quantity).toFixed(2);
  };

  // Calculate GRN total (sum of all item totals)
  const calculateGRNTotal = () => {
    return grnItems.reduce((total, item) => {
      return total + parseFloat(calculateItemTotal(item));
    }, 0).toFixed(2);
  };

  // When clicking Edit, load GRN data into form and open modal
  const handleEditGRN = (grn) => {
    setEditGRN(grn);
    setShowGRNForm(true);
    // Prefill header
    setGrnHeader({
      supplier: grn.supplier_name || '',
      invoiceNumber: grn.invoice_number || '',
      invoiceDate: grn.invoice_date ? grn.invoice_date.slice(0, 10) : ''
    });
    // Prefill items
    setGrnItems(
      (grn.items || []).map(item => ({
        id: `${Date.now()}-${Math.floor(Math.random() * 1000)}-${item.item_code}`,
        code: item.item_code || '',
        itemName: item.item_name || '',
        costPrice: item.cost_price || '',
        wholesalePrice: item.wholesale_price || '',
        retailPrice: item.retail_price || '',
        saleDiscount: item.sale_discount || '',
        quantity: item.quantity || '',
        warranty: item.warranty || '',
        expiry: item.expiry ? item.expiry.slice(0, 10) : ''
      }))
    );
    setCurrentGrnId(grn.grn_id);
  };

  const submitGRN = async () => {
    if (grnItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    if (!grnHeader.supplier || !grnHeader.invoiceNumber || !grnHeader.invoiceDate) {
      toast.error('Please fill all GRN header fields');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        grn_id: currentGrnId,
        supplier_name: grnHeader.supplier,
        invoice_number: grnHeader.invoiceNumber,
        invoice_date: grnHeader.invoiceDate,
        invoice_total: Number(calculateGRNTotal()),
        items: grnItems.map(item => ({
          item_code: item.code,
          item_name: item.itemName,
          cost_price: Number(item.costPrice),
          wholesale_price: Number(item.wholesalePrice),
          retail_price: Number(item.retailPrice),
          sale_discount: Number(item.saleDiscount),
          quantity: Number(item.quantity),
          warranty: item.warranty,
          expiry: item.expiry || null,
          item_invoice_total: Number(calculateItemTotal(item))
        }))
      };

      let response;
      if (editGRN) {
        // PUT for update
        response = await api.put(`/grn/${editGRN.grn_id}`, payload);
      } else {
        // POST for new
        response = await api.post('/grn', payload);
      }

      toast.success(editGRN ? 'GRN updated successfully!' : 'GRN saved successfully!');
      setShowGRNForm(false);
      setGrnItems([]);
      resetGrnHeaderForm();
      setEditGRN(null);
      grnIdCounter.current += 1;

      // Fetch all GRNs again to update the table
      const grnList = await api.get('/grn');
      if (Array.isArray(grnList.data)) {
        setGrns(grnList.data);
      } else {
        setGrns([]);
      }
    } catch (error) {
      toast.error(`Failed to save GRN: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // When closing the form, reset editGRN
  const closeGRNModal = () => {
    setShowGRNForm(false);
    setEditGRN(null);
    setGrnHeader({
      supplier: '',
      invoiceNumber: '',
      invoiceDate: ''
    });
    setGrnItemForm({
      code: '',
      itemName: '',
      costPrice: '',
      wholesalePrice: '',
      retailPrice: '',
      saleDiscount: '',
      quantity: '',
      warranty: '',
      expiry: ''
    });
    setGrnItems([]);
  };

  const resetGrnHeaderForm = () => {
    setGrnHeader({
      supplier: '',
      invoiceNumber: '',
      invoiceDate: ''
    });
  };

  // When opening a new GRN form, fetch and increment the GRN id
  useEffect(() => {
    if (showGRNForm) {
      fetchNextGrnId();
    }
  }, [showGRNForm]);

  const deleteGRN = async (grnId) => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to permanently delete this GRN?');
      if (!confirmDelete) return;
      
      await api.delete(`/grn/${grnId}`);
      
      // Update local state by removing the deleted GRN
      setGrns(prev => prev.filter(grn => grn.grn_id !== grnId));
      
      toast.success('GRN deleted successfully');
    } catch (error) {
      console.error('Error deleting GRN:', error);
      toast.error(`Failed to delete GRN: ${error.response?.data?.message || error.message}`);
    }
  };

  const [filters, setFilters] = useState({
    supplier: '',
    invoice: '',
    date: '',
    min: '',
    max: ''
  });

  // Filtered GRNs
  const filteredGRNs = grns.filter(grn => {
    const matchSupplier = !filters.supplier || grn.supplier_name.toLowerCase().includes(filters.supplier.toLowerCase());
    const matchInvoice = !filters.invoice || grn.invoice_number.toLowerCase().includes(filters.invoice.toLowerCase());
    const matchDate = !filters.date || grn.invoice_date === filters.date;
    const matchMin = !filters.min || Number(grn.invoice_total) >= Number(filters.min);
    const matchMax = !filters.max || Number(grn.invoice_total) <= Number(filters.max);
    return matchSupplier && matchInvoice && matchDate && matchMin && matchMax;
  });

  const renderContent = () => {
    if (!showGRNForm && !viewGRN) {
      return (
        <div>
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-3 mb-4 items-end">
            <div>
              <label className="block text-xs font-medium text-[#03648a] mb-1">Supplier</label>
              <input
                type="text"
                placeholder="Supplier name"
                value={filters.supplier}
                onChange={e => setFilters(f => ({ ...f, supplier: e.target.value }))}
                className="px-2 py-1 border border-[#e0eefa] rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#03648a] mb-1">Invoice #</label>
              <input
                type="text"
                placeholder="Invoice number"
                value={filters.invoice}
                onChange={e => setFilters(f => ({ ...f, invoice: e.target.value }))}
                className="px-2 py-1 border border-[#e0eefa] rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#03648a] mb-1">Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
                className="px-2 py-1 border border-[#e0eefa] rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#03648a] mb-1">Min Total</label>
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={filters.min}
                onChange={e => setFilters(f => ({ ...f, min: e.target.value }))}
                className="px-2 py-1 border border-[#e0eefa] rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#03648a] mb-1">Max Total</label>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={filters.max}
                onChange={e => setFilters(f => ({ ...f, max: e.target.value }))}
                className="px-2 py-1 border border-[#e0eefa] rounded-lg text-xs"
              />
            </div>
            <button
              type="button"
              className="ml-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs border border-[#e0eefa] hover:bg-gray-200"
              onClick={() => setFilters({ supplier: '', invoice: '', date: '', min: '', max: '' })}
            >
              Clear
            </button>
          </div>
          <div className="flex justify-end mb-2">
            <button
              className="px-4 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition text-xs md:text-sm"
              onClick={() => setShowGRNForm(true)}
            >
              + Add GRN
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-[#b6e0fe] bg-white/80 shadow mb-8">
            <table className="min-w-full text-[11px] md:text-xs border-separate border-spacing-y-2">
              <thead className="bg-[#e4f4fa] text-[#0492C2]">
                <tr>
                  <th className="px-2 py-2 font-semibold text-center">SN</th>
                  <th className="px-2 py-2 font-semibold text-center">GRN ID</th>
                  <th className="px-2 py-2 font-semibold text-center">Supplier</th>
                  <th className="px-2 py-2 font-semibold text-center">Invoice No</th>
                  <th className="px-2 py-2 font-semibold text-center">Invoice Date</th>
                  <th className="px-2 py-2 font-semibold text-center">Invoice Total</th>
                  <th className="px-2 py-2 font-semibold text-center">#Items</th>
                  <th className="px-2 py-2 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGRNs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-400">
                      No GRNs found.
                    </td>
                  </tr>
                ) : (
                  filteredGRNs.map((grn, idx) => (
                    <tr key={grn.grn_id} className="items-table-row group transition-all duration-200 align-middle">
                      <td className="text-center align-middle font-bold text-[#03648a]">{idx + 1}</td>
                      <td className="text-center align-middle text-[#03648a]">{grn.grn_id}</td>
                      <td className="text-center align-middle text-[#03648a]">{grn.supplier_name}</td>
                      <td className="text-center align-middle text-[#03648a]">{grn.invoice_number}</td>
                      <td className="text-center align-middle text-[#03648a]">
                        {grn.invoice_date ? new Date(grn.invoice_date).toLocaleDateString() : ""}
                      </td>
                      <td className="text-center align-middle text-[#03648a]">
                        LKR {Number(grn.invoice_total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-center align-middle text-[#03648a]">
                        {grn.items ? grn.items.length : 0}
                      </td>
                      <td className="text-center align-middle">
                        <div className="flex gap-1 justify-center items-center">
                          <button
                            className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#03648a] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                            title="View"
                            onClick={() => setViewGRN(grn)}
                          >
                            <MdVisibility className="w-4 h-4 drop-shadow" />
                          </button>
                          <button
                            className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#03648a] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                            title="Edit"
                            onClick={() => handleEditGRN(grn)}
                          >
                            <FaRegEdit className="w-4 h-4 drop-shadow" />
                          </button>
                          <button
                            className="action-btn-3d bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-400 text-red-400 hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                            title="Delete"
                            onClick={() => deleteGRN(grn.grn_id)}
                          >
                            <MdDeleteOutline className="w-4 h-4 drop-shadow" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else if (viewGRN) {
      return (
        <div className="bg-white/95 rounded-2xl shadow-2xl border-2 border-[#b6e0fe] p-8 max-w-2xl mx-auto animate-fadein">
          <h2 className="text-2xl font-bold text-[#03648a] mb-6 flex items-center gap-2">
            <MdVisibility className="w-6 h-6" />
            GRN Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-[15px]">
            <div>
              <div className="mb-2"><span className="font-semibold text-[#03648a]">GRN ID:</span> <span className="ml-2">{viewGRN.grn_id}</span></div>
              <div className="mb-2"><span className="font-semibold text-[#03648a]">Supplier:</span> <span className="ml-2">{viewGRN.supplier_name}</span></div>
              <div className="mb-2"><span className="font-semibold text-[#03648a]">Invoice Number:</span> <span className="ml-2">{viewGRN.invoice_number}</span></div>
              <div className="mb-2"><span className="font-semibold text-[#03648a]">Invoice Date:</span> <span className="ml-2">{viewGRN.invoice_date ? new Date(viewGRN.invoice_date).toLocaleDateString() : ""}</span></div>
              <div className="mb-2"><span className="font-semibold text-[#03648a]">Created At:</span> <span className="ml-2">{viewGRN.created_at ? new Date(viewGRN.created_at).toLocaleString() : ""}</span></div>
              <div className="mb-2"><span className="font-semibold text-[#03648a]">Invoice Total:</span> <span className="ml-2 text-[#0c7abf] font-bold">LKR {Number(viewGRN.invoice_total).toLocaleString(undefined, {minimumFractionDigits:2})}</span></div>
              <div className="mb-2"><span className="font-semibold text-[#03648a]">Number of Items:</span> <span className="ml-2">{viewGRN.items?.length || 0}</span></div>
            </div>
            <div>
              <div className="font-semibold text-[#03648a] mb-2">Items:</div>
              <div className="space-y-4">
                {viewGRN.items && viewGRN.items.length > 0 ? viewGRN.items.map((item, idx) => (
                  <div key={idx} className="rounded-lg border border-[#e0eefa] bg-[#f8fbfd] p-3 shadow-sm">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <div><span className="font-semibold">Code:</span> {item.item_code}</div>
                      <div><span className="font-semibold">Name:</span> {item.item_name}</div>
                      <div><span className="font-semibold">Cost:</span> {item.cost_price}</div>
                      <div><span className="font-semibold">Wholesale:</span> {item.wholesale_price}</div>
                      <div><span className="font-semibold">Retail:</span> {item.retail_price}</div>
                      <div><span className="font-semibold">Discount:</span> {item.sale_discount}</div>
                      <div><span className="font-semibold">Qty:</span> {item.quantity}</div>
                      <div><span className="font-semibold">Warranty:</span> {item.warranty}</div>
                      <div><span className="font-semibold">Expiry:</span> {item.expiry ? new Date(item.expiry).toLocaleDateString() : ""}</div>
                      <div><span className="font-semibold">Item Total:</span> {item.item_invoice_total}</div>
                    </div>
                  </div>
                )) : (
                  <div className="text-gray-400">No items found.</div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              className="px-8 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition text-base"
              onClick={() => setViewGRN(null)}
            >
              Close
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Item Code and Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#03648a] mb-1">Item Code</label>
                
                <select
                  name="code"
                  value={grnItemForm.code}
                  onChange={handleItemCodeChange}
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition text-[#03648a]"
                >
                  <option value="">{loadingItems ? 'Loading items...' : 'Select an item'}</option>
                  {itemsList.length > 0 ? (
                    itemsList.map(item => (
                      <option key={item.id} value={item.code}>
                        {item.code}
                      </option>
                    ))
                  ) : (
                    !loadingItems && <option disabled>No items available</option>
                  )}
                </select>

                {loadingItems && (
                  <div className="text-sm text-gray-500 mt-1">Loading items from server...</div>
                )}
                {itemsList.length === 0 && !loadingItems && (
                  <div className="text-sm text-red-500 mt-1">No items found in inventory</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#03648a] mb-1">Item Name</label>
                <input
                  type="text"
                  name="itemName"
                  value={grnItemForm.itemName}
                  onChange={handleGrnItemFormChange}
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition text-[#03648a]"
                  placeholder="Item name"
                  readOnly
                />
              </div>
            </div>
            
            {/* Header Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#03648a] mb-1">Supplier</label>
                <input
                  type="text"
                  name="supplier"
                  value={grnHeader.supplier}
                  onChange={handleGrnHeaderChange}
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition text-[#03648a]"
                  placeholder="Enter supplier name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#03648a] mb-1">Invoice Number</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={grnHeader.invoiceNumber}
                  onChange={handleGrnHeaderChange}
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition text-[#03648a]"
                  placeholder="Enter invoice number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#03648a] mb-1">Invoice Date</label>
                <input
                  type="date"
                  name="invoiceDate"
                  value={grnHeader.invoiceDate}
                  onChange={handleGrnHeaderChange}
                  className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition text-[#03648a]"
                />
              </div>
            </div>
            
            {/* Item Form */}
            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#03648a] mb-1">Cost Price</label>
                  <input
                    type="number"
                    name="costPrice"
                    value={grnItemForm.costPrice}
                    onChange={handleGrnItemFormChange}
                    className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition text-[#03648a]"
                    placeholder="Cost price"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#03648a] mb-1">Wholesale Price</label>
                  <input
                    type="number"
                    name="wholesalePrice"
                    value={grnItemForm.wholesalePrice}
                    onChange={handleGrnItemFormChange}
                    className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition text-[#03648a]"
                    placeholder="Wholesale price"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#03648a] mb-1">Retail Price</label>
                  <input
                    type="number"
                    name="retailPrice"
                    value={grnItemForm.retailPrice}
                    onChange={handleGrnItemFormChange}
                    className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition text-[#03648a]"
                    placeholder="Retail price"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#03648a] mb-1">Sale Discount</label>
                  <input
                    type="number"
                    name="saleDiscount"
                    value={grnItemForm.saleDiscount}
                    onChange={handleGrnItemFormChange}
                    className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition text-[#03648a]"
                    placeholder="Discount per unit"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#03648a] mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={grnItemForm.quantity}
                    onChange={handleGrnItemFormChange}
                    className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition text-[#03648a]"
                    placeholder="Quantity"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#03648a] mb-1">Warranty</label>
                  <input
                    type="text"
                    name="warranty"
                    value={grnItemForm.warranty}
                    onChange={handleGrnItemFormChange}
                    className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition text-[#03648a]"
                    placeholder="Warranty period"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#03648a] mb-1">Expiry Date</label>
                  <input
                    type="date"
                    name="expiry"
                    value={grnItemForm.expiry}
                    onChange={handleGrnItemFormChange}
                    className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition text-[#03648a]"
                  />
                </div>
              </div>
            </div>
            
            <button
              onClick={addItemToGRN}
              className="px-4 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition mb-4"
            >
              + Add Item to GRN
            </button>
            
            {/* GRN Items Table */}
            {grnItems.length > 0 && (
              <div className="overflow-x-auto mb-6 text-[10px] md:text-[11px]">
                <table className="min-w-max border border-gray-200 whitespace-nowrap">
                  <thead className="bg-gray-100">
                    <tr className="text-[#03648a]">
                      <th className="px-1 py-0.5 border font-medium">GRN Id</th>
                      <th className="px-1 py-0.5 border font-medium">Item Code</th>
                      <th className="px-1 py-0.5 border font-medium">Item Name</th>
                      <th className="px-1 py-0.5 border font-medium">Supplier</th>
                      <th className="px-1 py-0.5 border font-medium">Invoice Number</th>
                      <th className="px-1 py-0.5 border font-medium">Invoice Date</th>
                      <th className="px-1 py-0.5 border font-medium">Cost Price</th>
                      <th className="px-1 py-0.5 border font-medium">Wholesale Price</th>
                      <th className="px-1 py-0.5 border font-medium">Retail Price</th>
                      <th className="px-1 py-0.5 border font-medium">Sale Discount</th>
                      <th className="px-1 py-0.5 border font-medium">Quantity</th>
                      <th className="px-1 py-0.5 border font-medium">Warranty</th>
                      <th className="px-1 py-0.5 border font-medium">Expiry Date</th>
                      <th className="px-1 py-0.5 border font-medium">GRN Total</th>
                      <th className="px-1 py-0.5 border font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grnItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border px-1 py-0.5 text-[#03648a]">{currentGrnId}</td>
                        <td className="border px-1 py-0.5 text-[#03648a]">{item.code}</td>
                        <td className="border px-1 py-0.5 text-[#03648a]">{item.itemName}</td>
                        <td className="border px-1 py-0.5 text-[#03648a]">{item.supplier}</td>
                        <td className="border px-1 py-0.5 text-[#03648a]">{item.invoiceNumber}</td>
                        <td className="border px-1 py-0.5 text-[#03648a]">{item.invoiceDate}</td>
                        <td className="border px-1 py-0.5 text-[#03648a]">{item.costPrice}</td>
                        <td className="border px-1 py-0.5 text-[#03648a]">{item.wholesalePrice}</td>
                        <td className="border px-1 py-0.5 text-[#03648a]">{item.retailPrice}</td>
                        <td className="border px-1 py-0.5 text-[#03648a]">{item.saleDiscount}</td>
                        <td className="border px-1 py-0.5 text-[#03648a]">{item.quantity}</td>
                        <td className="border px-1 py-0.5 text-[#03648a]">{item.warranty}</td>
                        <td className="border px-1 py-0.5 text-[#03648a]">{item.expiry}</td>
                        <td className="border px-1 py-0.5 font-medium text-[#03648a]">{calculateItemTotal(item)}</td>
                        <td className="border px-1 py-0.5 text-center">
                          <button 
                            onClick={() => removeItemFromGRN(item.id)}
                            className="action-btn-3d bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-400 text-red-400 hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                            title="Remove"
                          >
                            <MdDeleteOutline className="w-4 h-4 drop-shadow" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-bold">
                      <td colSpan="13" className="border px-1 py-0.5 text-right text-[#03648a]">Invoice Total:</td>
                      <td className="border px-1 py-0.5 text-[#03648a]">{calculateGRNTotal()}</td>
                      <td className="border px-1 py-0.5"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
            
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={closeGRNModal}
                className="px-5 py-1.5 bg-gray-200 text-[#03648a] rounded-lg font-semibold text-sm shadow hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={submitGRN}
                className="px-6 py-1.5 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold text-sm shadow-md hover:from-[#037ba1] hover:to-[#b6e0fe] transition-all duration-200"
                disabled={submitting || grnItems.length === 0}
              >
                Save GRN
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  try {
    return (
      <div className="w-full">
        {renderContent()}
      </div>
    );
  } catch (error) {
    console.error('Component rendering error:', error);
    return (
      <div className="p-4 text-red-500">
        An error occurred while rendering this component. Please try again.
      </div>
    );
  }
}

