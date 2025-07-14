import React, { useState, useEffect, useRef } from 'react';
import { MdDeleteOutline, MdVisibility } from 'react-icons/md';
import { FaRegEdit } from 'react-icons/fa';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useBranch } from '../context/BranchContext';

export default function GRNComponent({
  grns,
  setGrns,
  activeTable,
  setActiveTable,
  viewGRN,
  setViewGRN,
  selectedBranch
}) {
  const { selectedBranch: contextBranch } = useBranch();
  const currentBranch = selectedBranch || contextBranch;
  
  const [showGRNForm, setShowGRNForm] = useState(false);
  const [itemsList, setItemsList] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  
  const [grnHeader, setGrnHeader] = useState({
    supplier: '',
    invoiceNumber: '',
    invoiceDate: ''
  });
  
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

  // Filters state
  const [filters, setFilters] = useState({
    supplier: '',
    invoice: '',
    date: '',
    minTotal: '',
    maxTotal: ''
  });

  // Fetch the latest GRN id from the backend and set the next id
  const fetchNextGrnId = async () => {
    if (!currentBranch?.id) return;
    
    try {
      const response = await api.get('/grn', { 
        params: { branch_id: currentBranch.id } 
      });
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        const maxId = Math.max(...response.data.map(grn => Number(grn.grn_id) || 0));
        grnIdCounter.current = maxId + 1;
        setCurrentGrnId(grnIdCounter.current);
      } else {
        grnIdCounter.current = 1;
        setCurrentGrnId(1);
      }
    } catch (error) {
      console.error('Error fetching next GRN ID:', error);
      grnIdCounter.current = 1;
      setCurrentGrnId(1);
    }
  };

  // Fetch items when form opens
  useEffect(() => {
    if (showGRNForm) {
      fetchItems();
      if (!editGRN) {
        fetchNextGrnId();
      }
    }
  }, [showGRNForm]);

  // Fetch GRNs when branch changes
  useEffect(() => {
    if (currentBranch?.id) {
      fetchGRNs();
    } else {
      setGrns([]);
    }
  }, [currentBranch?.id, setGrns]);

  const fetchGRNs = async () => {
    if (!currentBranch?.id) return;
    
    try {
      const response = await api.get('/grn', {
        params: { branch_id: currentBranch.id }
      });
      
      if (Array.isArray(response.data)) {
        setGrns(response.data);
      } else {
        setGrns([]);
      }
    } catch (error) {
      console.error('Error fetching GRNs:', error);
      setGrns([]);
      toast.error('Failed to fetch GRNs');
    }
  };

  const fetchItems = async () => {
    setLoadingItems(true);
    
    try {
      const response = await api.get('/items', {
        params: { branch_id: currentBranch?.id }
      });
  
      if (response.data?.items) {
        const items = response.data.items.map(item => ({
          ...item,
          code: item.model_number || item.item_code || `item-${item.id}`
        }));
        setItemsList(items);
      } else {
        setItemsList([]);
      }
      
    } catch (error) {
      console.error('Error fetching items:', error);
      setItemsList([]);
      toast.error('Failed to fetch items');
    } finally {
      setLoadingItems(false);
    }
  };

  const handleItemCodeChange = (e) => {
    const code = e.target.value;
    setGrnItemForm(prev => ({ ...prev, code }));

    if (code) {
      const selectedItem = itemsList.find(item => 
        item.code === code || item.model_number === code
      );

      if (selectedItem) {
        setGrnItemForm(prev => ({
          ...prev,
          itemName: selectedItem.item_name || selectedItem.name || '',
          quantity: prev.quantity || '1'
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

  const addItemToGRN = () => {
    if (!grnItemForm.code || !grnItemForm.itemName) {
      toast.error('Please select an item');
      return;
    }

    if (!grnItemForm.quantity || parseInt(grnItemForm.quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const itemTotal = calculateItemTotal(grnItemForm);

    const newItem = {
      ...grnItemForm,
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      itemInvoiceTotal: itemTotal
    };

    setGrnItems([...grnItems, newItem]);
    
    // Reset form
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

  const removeItemFromGRN = (id) => {
    setGrnItems(prev => prev.filter(item => item.id !== id));
  };

  const handleEditItem = (index, field, value) => {
    const updatedItems = [...grnItems];
    updatedItems[index][field] = value;
    
    // Recalculate item total when quantity or cost price changes
    if (field === 'quantity' || field === 'costPrice') {
      updatedItems[index].itemInvoiceTotal = calculateItemTotal(updatedItems[index]);
    }
    
    setGrnItems(updatedItems);
  };

  const handleEditGRN = async (grn) => {
    setEditGRN(grn);
    setCurrentGrnId(grn.grn_id);
    
    // Prefill header
    setGrnHeader({
      supplier: grn.supplier_name || '',
      invoiceNumber: grn.invoice_number || '',
      invoiceDate: grn.invoice_date ? grn.invoice_date.slice(0, 10) : ''
    });
    
    // Prefill items
    setGrnItems(
      (grn.items || []).map((item, index) => ({
        id: `edit-${index}-${item.item_code}`,
        code: item.item_code || '',
        itemName: item.item_name || '',
        costPrice: item.cost_price || '',
        wholesalePrice: item.wholesale_price || '',
        retailPrice: item.retail_price || '',
        saleDiscount: item.sale_discount || '',
        quantity: item.quantity || '',
        warranty: item.warranty || '',
        expiry: item.expiry ? item.expiry.slice(0, 10) : '',
        itemInvoiceTotal: item.item_invoice_total || calculateItemTotal({
          costPrice: item.cost_price || 0,
          quantity: item.quantity || 0
        })
      }))
    );
    
    setShowGRNForm(true);
  };

  const handleViewGRN = async (grnId) => {
    try {
      const response = await api.get(`/grn/${grnId}`);
      setViewGRN(response.data);
    } catch (error) {
      console.error('Error fetching GRN details:', error);
      toast.error('Failed to fetch GRN details');
    }
  };

  const submitGRN = async () => {
    if (!currentBranch?.id) {
      toast.error('Please select a branch first');
      return;
    }

    if (!grnHeader.supplier || !grnHeader.invoiceNumber || !grnHeader.invoiceDate) {
      toast.error('Please fill in all required header fields');
      return;
    }

    if (grnItems.length === 0) {
      toast.error('Please add at least one item to the GRN');
      return;
    }

    setSubmitting(true);

    try {
      const totalAmount = parseFloat(calculateGRNTotal());
      
      const payload = {
        grn_id: currentGrnId,
        supplier_name: grnHeader.supplier,
        invoice_number: grnHeader.invoiceNumber,
        invoice_date: grnHeader.invoiceDate,
        invoice_total: totalAmount,
        branch_id: currentBranch.id,
        items: grnItems.map(item => ({
          code: item.code,
          productName: item.itemName,
          costPrice: parseFloat(item.costPrice) || 0,
          wholesalePrice: parseFloat(item.wholesalePrice) || 0,
          retailPrice: parseFloat(item.retailPrice) || 0,
          saleDiscount: parseFloat(item.saleDiscount) || 0,
          quantity: parseInt(item.quantity) || 0,
          warranty: item.warranty || null,
          expiry: item.expiry || null,
          invoiceTotal: parseFloat(item.itemInvoiceTotal) || 0
        }))
      };

      let response;
      if (editGRN) {
        response = await api.put(`/grn/${editGRN.grn_id}`, payload);
        toast.success('GRN updated successfully!');
      } else {
        response = await api.post('/grn', payload);
        toast.success('GRN created successfully!');
        grnIdCounter.current += 1;
        setCurrentGrnId(grnIdCounter.current);
      }

      // Close form and reset
      closeGRNModal();
      
      // Refresh GRNs list
      await fetchGRNs();
      
    } catch (error) {
      console.error('Error saving GRN:', error);
      toast.error(`Failed to save GRN: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteGRN = async (grnId) => {
    if (!currentBranch?.id) {
      toast.error('No branch selected');
      return;
    }
    
    const confirmDelete = window.confirm('Are you sure you want to delete this GRN? This action cannot be undone.');
    if (!confirmDelete) return;
    
    try {
      await api.delete(`/grn/${grnId}`);
      toast.success('GRN deleted successfully');
      await fetchGRNs(); // Refresh the list
    } catch (error) {
      console.error('Error deleting GRN:', error);
      toast.error(`Failed to delete GRN: ${error.response?.data?.message || error.message}`);
    }
  };

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

  // Filtered GRNs
  const filteredGRNs = grns.filter(grn => {
    const matchSupplier = !filters.supplier || 
      grn.supplier_name.toLowerCase().includes(filters.supplier.toLowerCase());
    const matchInvoice = !filters.invoice || 
      grn.invoice_number.toLowerCase().includes(filters.invoice.toLowerCase());
    const matchDate = !filters.date || grn.invoice_date.slice(0, 10) === filters.date;
    const matchMinTotal = !filters.minTotal || 
      Number(grn.invoice_total) >= Number(filters.minTotal);
    const matchMaxTotal = !filters.maxTotal || 
      Number(grn.invoice_total) <= Number(filters.maxTotal);
    
    return matchSupplier && matchInvoice && matchDate && matchMinTotal && matchMaxTotal;
  });

  if (viewGRN) {
    return (
      <div className="bg-white/95 rounded-2xl shadow-2xl border-2 border-[#b6e0fe] p-8 max-w-4xl mx-auto animate-fadein">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#03648a] flex items-center gap-2">
            <MdVisibility className="w-6 h-6" />
            GRN Details - {viewGRN.grn_id}
          </h2>
          <button
            onClick={() => setViewGRN(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <div><span className="font-semibold text-[#03648a]">Supplier:</span> {viewGRN.supplier_name}</div>
            <div><span className="font-semibold text-[#03648a]">Invoice Number:</span> {viewGRN.invoice_number}</div>
            <div><span className="font-semibold text-[#03648a]">Invoice Date:</span> {new Date(viewGRN.invoice_date).toLocaleDateString()}</div>
            <div><span className="font-semibold text-[#03648a]">Invoice Total:</span> <span className="text-[#0492C2] font-bold">LKR {Number(viewGRN.invoice_total).toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
            <div><span className="font-semibold text-[#03648a]">Created At:</span> {new Date(viewGRN.created_at).toLocaleString()}</div>
          </div>
        </div>

        {viewGRN.items && viewGRN.items.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-[#03648a] mb-3">Items ({viewGRN.items.length})</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border border-[#e0eefa] rounded-lg">
                <thead className="bg-[#e4f4fa]">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-[#0492C2]">Code</th>
                    <th className="px-3 py-2 text-left font-semibold text-[#0492C2]">Name</th>
                    <th className="px-3 py-2 text-right font-semibold text-[#0492C2]">Qty</th>
                    <th className="px-3 py-2 text-right font-semibold text-[#0492C2]">Cost</th>
                    <th className="px-3 py-2 text-right font-semibold text-[#0492C2]">Wholesale</th>
                    <th className="px-3 py-2 text-right font-semibold text-[#0492C2]">Retail</th>
                    <th className="px-3 py-2 text-right font-semibold text-[#0492C2]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewGRN.items.map((item, index) => (
                    <tr key={index} className="border-b border-[#e0eefa]">
                      <td className="px-3 py-2">{item.item_code}</td>
                      <td className="px-3 py-2">{item.item_name}</td>
                      <td className="px-3 py-2 text-right">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">{Number(item.cost_price).toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">{Number(item.wholesale_price).toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">{Number(item.retail_price).toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-semibold">{Number(item.item_invoice_total || (item.cost_price * item.quantity)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setViewGRN(null)}
            className="px-6 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (showGRNForm) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-[#e0eefa] p-6 rounded-t-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#03648a]">
                {editGRN ? `Edit GRN ${editGRN.grn_id}` : `Add New GRN ${currentGrnId}`}
              </h2>
              <button
                onClick={closeGRNModal}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Header Form */}
            <div className="bg-[#f8fbff] border border-[#e0eefa] rounded-lg p-4">
              <h3 className="text-md font-semibold text-[#03648a] mb-3">GRN Header Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#03648a] mb-1">Supplier Name *</label>
                  <input
                    type="text"
                    name="supplier"
                    value={grnHeader.supplier}
                    onChange={handleGrnHeaderChange}
                    className="w-full px-3 py-2 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent"
                    placeholder="Enter supplier name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#03648a] mb-1">Invoice Number *</label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={grnHeader.invoiceNumber}
                    onChange={handleGrnHeaderChange}
                    className="w-full px-3 py-2 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent"
                    placeholder="Enter invoice number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#03648a] mb-1">Invoice Date *</label>
                  <input
                    type="date"
                    name="invoiceDate"
                    value={grnHeader.invoiceDate}
                    onChange={handleGrnHeaderChange}
                    className="w-full px-3 py-2 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Add Item Form */}
            <div className="bg-[#f8fbff] border border-[#e0eefa] rounded-lg p-4">
              <h3 className="text-md font-semibold text-[#03648a] mb-3">Add Item to GRN</h3>
              
              {/* Item Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#03648a] mb-1">Item Code *</label>
                  <select
                    name="code"
                    value={grnItemForm.code}
                    onChange={handleItemCodeChange}
                    className="w-full px-3 py-2 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent"
                  >
                    <option value="">{loadingItems ? 'Loading items...' : 'Select an item'}</option>
                    {itemsList.map(item => (
                      <option key={item.id} value={item.code}>
                        {item.code} - {item.item_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#03648a] mb-1">Item Name</label>
                  <input
                    type="text"
                    name="itemName"
                    value={grnItemForm.itemName}
                    onChange={handleGrnItemFormChange}
                    className="w-full px-3 py-2 border border-[#e0eefa] rounded-lg bg-gray-50"
                    placeholder="Item name"
                    readOnly
                  />
                </div>
              </div>
              
              {/* Pricing Fields */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#03648a] mb-1">Cost Price *</label>
                  <input
                    type="number"
                    name="costPrice"
                    value={grnItemForm.costPrice}
                    onChange={handleGrnItemFormChange}
                    className="w-full px-3 py-2 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#03648a] mb-1">Wholesale Price</label>
                  <input
                    type="number"
                    name="wholesalePrice"
                    value={grnItemForm.wholesalePrice}
                    onChange={handleGrnItemFormChange}
                    className="w-full px-3 py-2 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#03648a] mb-1">Retail Price</label>
                  <input
                    type="number"
                    name="retailPrice"
                    value={grnItemForm.retailPrice}
                    onChange={handleGrnItemFormChange}
                    className="w-full px-3 py-2 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#03648a] mb-1">Sale Discount</label>
                  <input
                    type="number"
                    name="saleDiscount"
                    value={grnItemForm.saleDiscount}
                    onChange={handleGrnItemFormChange}
                    className="w-full px-3 py-2 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              
              {/* Other Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#03648a] mb-1">Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={grnItemForm.quantity}
                    onChange={handleGrnItemFormChange}
                    className="w-full px-3 py-2 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent"
                    placeholder="1"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#03648a] mb-1">Warranty</label>
                  <input
                    type="text"
                    name="warranty"
                    value={grnItemForm.warranty}
                    onChange={handleGrnItemFormChange}
                    className="w-full px-3 py-2 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent"
                    placeholder="e.g., 1 year"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#03648a] mb-1">Expiry Date</label>
                  <input
                    type="date"
                    name="expiry"
                    value={grnItemForm.expiry}
                    onChange={handleGrnItemFormChange}
                    className="w-full px-3 py-2 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent"
                  />
                </div>
              </div>
              
              <button
                onClick={addItemToGRN}
                className="px-4 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Add Item to GRN
              </button>
            </div>

            {/* Items Table */}
            {grnItems.length > 0 && (
              <div>
                <h3 className="text-md font-semibold text-[#03648a] mb-3">GRN Items ({grnItems.length})</h3>
                <div className="overflow-x-auto border border-[#e0eefa] rounded-lg">
                  <table className="min-w-full text-xs">
                    <thead className="bg-[#e4f4fa]">
                      <tr>
                        <th className="px-2 py-2 text-left font-semibold text-[#0492C2]">Code</th>
                        <th className="px-2 py-2 text-left font-semibold text-[#0492C2]">Name</th>
                        <th className="px-2 py-2 text-right font-semibold text-[#0492C2]">Cost</th>
                        <th className="px-2 py-2 text-right font-semibold text-[#0492C2]">Wholesale</th>
                        <th className="px-2 py-2 text-right font-semibold text-[#0492C2]">Retail</th>
                        <th className="px-2 py-2 text-right font-semibold text-[#0492C2]">Discount</th>
                        <th className="px-2 py-2 text-right font-semibold text-[#0492C2]">Qty</th>
                        <th className="px-2 py-2 text-right font-semibold text-[#0492C2]">Item Total</th>
                        <th className="px-2 py-2 text-center font-semibold text-[#0492C2]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grnItems.map((item, index) => (
                        <tr key={item.id} className="border-b border-[#e0eefa] hover:bg-[#f8fbff]">
                          <td className="px-2 py-2">{item.code}</td>
                          <td className="px-2 py-2">{item.itemName}</td>
                          <td className="px-2 py-2 text-right">
                            <input
                              type="number"
                              value={item.costPrice}
                              onChange={(e) => handleEditItem(index, 'costPrice', e.target.value)}
                              className="w-16 px-1 py-1 text-xs border border-[#e0eefa] rounded text-right"
                              step="0.01"
                            />
                          </td>
                          <td className="px-2 py-2 text-right">
                            <input
                              type="number"
                              value={item.wholesalePrice}
                              onChange={(e) => handleEditItem(index, 'wholesalePrice', e.target.value)}
                              className="w-16 px-1 py-1 text-xs border border-[#e0eefa] rounded text-right"
                              step="0.01"
                            />
                          </td>
                          <td className="px-2 py-2 text-right">
                            <input
                              type="number"
                              value={item.retailPrice}
                              onChange={(e) => handleEditItem(index, 'retailPrice', e.target.value)}
                              className="w-16 px-1 py-1 text-xs border border-[#e0eefa] rounded text-right"
                              step="0.01"
                            />
                          </td>
                          <td className="px-2 py-2 text-right">
                            <input
                              type="number"
                              value={item.saleDiscount}
                              onChange={(e) => handleEditItem(index, 'saleDiscount', e.target.value)}
                              className="w-16 px-1 py-1 text-xs border border-[#e0eefa] rounded text-right"
                              step="0.01"
                            />
                          </td>
                          <td className="px-2 py-2 text-right">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleEditItem(index, 'quantity', e.target.value)}
                              className="w-12 px-1 py-1 text-xs border border-[#e0eefa] rounded text-right"
                              min="1"
                            />
                          </td>
                          <td className="px-2 py-2 text-right font-semibold">
                            {item.itemInvoiceTotal}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <button
                              onClick={() => removeItemFromGRN(item.id)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                              title="Remove item"
                            >
                              <MdDeleteOutline className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-[#e4f4fa] font-bold">
                        <td colSpan="7" className="px-2 py-2 text-right text-[#03648a]">GRN Total:</td>
                        <td className="px-2 py-2 text-right text-[#03648a]">LKR {calculateGRNTotal()}</td>
                        <td className="px-2 py-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          
          {/* Form Actions */}
          <div className="sticky bottom-0 bg-white border-t border-[#e0eefa] p-6 rounded-b-xl">
            <div className="flex justify-end gap-3">
              <button
                onClick={closeGRNModal}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={submitGRN}
                disabled={submitting || grnItems.length === 0}
                className="px-6 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : (editGRN ? 'Update GRN' : 'Save GRN')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main GRN List View
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
            value={filters.minTotal}
            onChange={e => setFilters(f => ({ ...f, minTotal: e.target.value }))}
            className="px-2 py-1 border border-[#e0eefa] rounded-lg text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#03648a] mb-1">Max Total</label>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxTotal}
            onChange={e => setFilters(f => ({ ...f, maxTotal: e.target.value }))}
            className="px-2 py-1 border border-[#e0eefa] rounded-lg text-xs"
          />
        </div>
        <button
          type="button"
          className="ml-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs border border-[#e0eefa] hover:bg-gray-200"
          onClick={() => setFilters({ supplier: '', invoice: '', date: '', minTotal: '', maxTotal: '' })}
        >
          Clear
        </button>
      </div>

      {/* Add GRN Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowGRNForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Add GRN
        </button>
      </div>

      {/* GRN Table */}
      <div className="overflow-x-auto rounded-lg border border-[#b6e0fe] bg-white/80 shadow">
        <table className="min-w-full text-xs border-separate border-spacing-y-2">
          <thead className="bg-[#e4f4fa] text-[#0492C2]">
            <tr>
              <th className="px-3 py-2 font-semibold text-center">SN</th>
              <th className="px-3 py-2 font-semibold text-center">GRN ID</th>
              <th className="px-3 py-2 font-semibold text-center">Supplier</th>
              <th className="px-3 py-2 font-semibold text-center">Invoice No</th>
              <th className="px-3 py-2 font-semibold text-center">Invoice Date</th>
              <th className="px-3 py-2 font-semibold text-center">Items</th>
              <th className="px-3 py-2 font-semibold text-center">Total Amount</th>
              <th className="px-3 py-2 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGRNs.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  {currentBranch ? 'No GRNs found for this branch.' : 'Please select a branch to view GRNs.'}
                </td>
              </tr>
            ) : (
              filteredGRNs.map((grn, idx) => (
                <tr 
                  key={grn.grn_id} 
                  className="items-table-row group transition-all duration-200 align-middle hover:bg-[#f8fbff]"
                  style={{
                    borderRadius: '18px',
                    background: '#fff',
                  }}
                >
                  <td className="text-center align-middle font-bold text-[#03648a]">{idx + 1}</td>
                  <td className="text-center align-middle text-[#03648a] font-semibold">{grn.grn_id}</td>
                  <td className="text-center align-middle text-[#03648a]">{grn.supplier_name}</td>
                  <td className="text-center align-middle text-[#03648a]">{grn.invoice_number}</td>
                  <td className="text-center align-middle text-[#03648a]">
                    {new Date(grn.invoice_date).toLocaleDateString()}
                  </td>
                  <td className="text-center align-middle text-[#03648a]">
                    <span className="bg-[#e4f4fa] text-[#03648a] px-2 py-1 rounded-full text-xs">
                      {grn.items ? grn.items.length : 0}
                    </span>
                  </td>
                  <td className="text-center align-middle text-[#03648a] font-semibold">
                    LKR {Number(grn.invoice_total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-center align-middle">
                    <div className="flex gap-1 justify-center items-center">
                      <button
                        onClick={() => handleViewGRN(grn.grn_id)}
                        className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#03648a] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                        title="View GRN"
                      >
                        <MdVisibility className="w-4 h-4 drop-shadow" />
                      </button>
                      <button
                        onClick={() => handleEditGRN(grn)}
                        className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#03648a] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                        title="Edit GRN"
                      >
                        <FaRegEdit className="w-4 h-4 drop-shadow" />
                      </button>
                      <button
                        onClick={() => deleteGRN(grn.grn_id)}
                        className="action-btn-3d bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-400 text-red-400 hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                        title="Delete GRN"
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
}