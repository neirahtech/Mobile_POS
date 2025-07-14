import { useState, useEffect } from 'react';
import { BsClipboard2CheckFill, BsBox2Fill, BsQrCode, BsBoxSeamFill } from 'react-icons/bs';
import { PlusIcon } from '@heroicons/react/24/outline';
import { FaRegEdit } from 'react-icons/fa';
import { MdDeleteOutline, MdVisibility } from 'react-icons/md';
import axios from 'axios';
import api from '../utils/axios';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { TagIcon } from '@heroicons/react/24/solid';
import { useBranch } from '../context/BranchContext';
import GRNComponent from '../components/GRNComponent';
import StockComponent from '../components/StockComponent';

// Example GRN data for the table
const hardcodedGRNs = [
  {
    id: 101,
    sn: 1,
    supplier_name: 'Apple Lanka',
    invoice_number: 'INV-001',
    invoice_date: '2024-06-02',
    content: 3, // number of items bought
    invoice_total: 485000,
  },
  {
    id: 102,
    sn: 2,
    supplier_name: 'Samsung Sri Lanka',
    invoice_number: 'INV-002',
    invoice_date: '2024-06-03',
    content: 2,
    invoice_total: 260000,
  },
  {
    id: 103,
    sn: 3,
    supplier_name: 'OnePlus Ceylon',
    invoice_number: 'INV-003',
    invoice_date: '2024-06-04',
    content: 1,
    invoice_total: 100950,
  },
];



export default function Inventory() {
  const { selectedBranch } = useBranch();
  const [activeTable, setActiveTable] = useState('items'); // Set default to 'items'
  const [showStockForm, setShowStockForm] = useState(false);
  const [showBarcodeForm, setShowBarcodeForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewGRN, setViewGRN] = useState(null); // For viewing GRN details
  const [grns, setGrns] = useState(hardcodedGRNs);
  
  // Add Stock form state
  const [stockForm, setStockForm] = useState({
    item_name: '',
    Category_name: '',
    model_number: '',
    barcode: '',
    description: '',
    image: null,
    variants: [], // Changed to array of objects
  });
  
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemForm, setItemForm] = useState({
    name: '',
    categoryCode: '',
    retailPrice: '',
    costPrice: '',
    wholesalePrice: '',
    model: '',
    barcode: '',
    description: '',
    inStock: '',
    lowStockAlert: '',
    image: null,
    variantType: '',
    variantOptions: '',
    variantPrice: '',
  });
  
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [errorCategories, setErrorCategories] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [trackStock, setTrackStock] = useState(false);
  const [variantsEnabled, setVariantsEnabled] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);

  // Barcode form state
  const [barcodeForm, setBarcodeForm] = useState({
    barcode: '',
    item_code: '',
    item_name: '',
    description: '',
  });

  // Hardcoded barcode data
  const hardcodedBarcodes = [
    {
      id: 1,
      barcode: '8901234567890',
      item_code: 'IP16PM',
      item_name: 'iPhone 16 Pro Max',
      description: 'Apple flagship smartphone',
    },
    {
      id: 2,
      barcode: '8901234567891',
      item_code: 'SGS23U',
      item_name: 'Samsung Galaxy S23 Ultra',
      description: 'Samsung flagship smartphone',
    },
    {
      id: 3,
      barcode: '8901234567892',
      item_code: 'OP12',
      item_name: 'OnePlus 12',
      description: 'OnePlus premium smartphone',
    },
  ];

  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [errorItems, setErrorItems] = useState(null);

  // Variant states
  const [variantTypes, setVariantTypes] = useState([]);
  const [variantOptions, setVariantOptions] = useState({});
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [errorVariants, setErrorVariants] = useState(null);
  const [isAddingVariantType, setIsAddingVariantType] = useState(false);
  const [isAddingVariantOption, setIsAddingVariantOption] = useState(false);
  const [showVariantTypeModal, setShowVariantTypeModal] = useState(false);
  const [showVariantOptionModal, setShowVariantOptionModal] = useState(false);
  const [newVariantType, setNewVariantType] = useState('');
  const [newVariantOption, setNewVariantOption] = useState('');
  const [selectedVariantType, setSelectedVariantType] = useState('');

  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const [viewItem, setViewItem] = useState(null);
  const [loadingItemDetails, setLoadingItemDetails] = useState(false);

  useEffect(() => {
    fetchVariants();
  }, []);

  const fetchVariants = async () => {
    try {
      setLoadingVariants(true);
      setErrorVariants(null);
      const response = await api.get('/variants');
      setVariantTypes(response.data.types);
      setVariantOptions(response.data.options);
      // Optionally: setAllVariants(response.data.variants); // if you want to keep in state
    } catch (error) {
      console.error('Error fetching variants:', error);
      setErrorVariants('Failed to fetch variants. Please try again.');
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleAddVariantType = async () => {
    if (!newVariantType.trim()) return;

    try {
      setIsAddingVariantType(true);
      const response = await api.post('/variants', {
        variant_type: newVariantType.trim(),
        variant_option: 'default' // Adding a default option as placeholder
      });
      
      if (response.data) {
        // Update local state
        setVariantTypes(prev => [...new Set([...prev, newVariantType.trim()])]);
        setVariantOptions(prev => ({
          ...prev,
          [newVariantType.trim()]: []
        }));

    setShowVariantTypeModal(false);
    setNewVariantType('');
      }
    } catch (error) {
      console.error('Error adding variant type:', error);
      alert(error.response?.data?.message || 'Failed to add variant type. Please try again.');
    } finally {
      setIsAddingVariantType(false);
    }
  };

  const handleAddVariantOption = async () => {
    if (!newVariantOption.trim() || !selectedVariantType) return;

    try {
      setIsAddingVariantOption(true);
      const response = await api.post('/variants', {
        variant_type: selectedVariantType,
        variant_option: newVariantOption.trim()
      });
      
      if (response.data) {
        // Update local state
        setVariantOptions(prev => ({
          ...prev,
          [selectedVariantType]: [...(prev[selectedVariantType] || []), newVariantOption.trim()]
        }));

    setShowVariantOptionModal(false);
    setNewVariantOption('');
      }
    } catch (error) {
      console.error('Error adding variant option:', error);
      alert(error.response?.data?.message || 'Failed to add variant option. Please try again.');
    } finally {
      setIsAddingVariantOption(false);
    }
  };

  // Fetch items from backend
  const fetchItems = async () => {
    setLoadingItems(true);
    setErrorItems(null);
    try {
      const response = await api.get('/items');
      // Make sure to use the backend's response as-is, including category_name
      const items = response.data.items.map(item => ({
        ...item,
        image: item.image ? `http://localhost:3000/uploads/${item.image}` : null
        // category_name is already present if backend sends it
      }));
      setItems(items);
    } catch (error) {
      console.error('Error fetching items:', error);
      setErrorItems('Failed to fetch items');
    } finally {
      setLoadingItems(false);
    }
  };

  // Fetch items when Items tab is active or after adding
  useEffect(() => {
    if (activeTable === 'items') {
      fetchItems();
    }
  }, [activeTable]);

  const fetchItemDetails = async (id) => {
    try {
      setLoadingItemDetails(true);
      const response = await api.get(`/items/${id}`);
      setViewItem({
        ...response.data,
        image: response.data.image ? `http://localhost:3000/uploads/${response.data.image}` : null
      });
    } catch (error) {
      console.error('Error fetching item details:', error);
    } finally {
      setLoadingItemDetails(false);
    }
  };

  // --- Stock handlers ---
  const handleStockChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setStockForm(prev => ({
        ...prev,
        image: file
      }));
      // Create preview URL for the image
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setStockForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Add a new variant set
  const addVariant = () => {
    setStockForm(prev => ({
      ...prev,
      variants: [...prev.variants, { type: '', option: '' }]
    }));
  };

  // Remove a variant set
  const removeVariant = (index) => {
    setStockForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  // Update variant type in a variant set
  const updateVariantType = (index, type) => {
    const newVariants = [...stockForm.variants];
    newVariants[index].type = type;
    setStockForm(prev => ({ ...prev, variants: newVariants }));
  };

  // Update variant option in a variant set
  const updateVariantOption = (index, option) => {
    const newVariants = [...stockForm.variants];
    newVariants[index].option = option;
    setStockForm(prev => ({ ...prev, variants: newVariants }));
  };

  const [editItemId, setEditItemId] = useState(null);

  const handleEditItem = (item) => {
    setShowItemForm(true);
    setEditItemId(item.id);
    
    // Convert old single variant to new array format
    const variants = item.variant_type ? 
      [{ type: item.variant_type, option: item.variant_option }] : 
      [];
    
    setStockForm({
      item_name: item.item_name || '',
      Category_name: item.Category_name || item.category_name || '',
      model_number: item.model_number || '',
      barcode: item.barcode || '',
      description: item.description || '',
      image: null, // don't prefill file input
      variants: variants,
    });
    
    setImagePreview(item.image ? (item.image.startsWith('http') ? item.image : `http://localhost:3000/uploads/${item.image}`) : null);
    setVariantsEnabled(variants.length > 0);
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!stockForm.item_name || !stockForm.model_number || !stockForm.Category_name) {
        alert('Item Name, Model Number, and Category are required fields');
        return;
      }

      const formData = new FormData();
      formData.append('item_name', stockForm.item_name.trim());
      formData.append('Category_name', stockForm.Category_name.trim());
      formData.append('model_number', stockForm.model_number.trim());
      formData.append('barcode', stockForm.barcode.trim());
      formData.append('description', stockForm.description.trim());
      
      // Convert variants array to string for backend compatibility
      const variantsString = stockForm.variants
        .filter(v => v.type && v.option)
        .map(v => `${v.type}:${v.option}`)
        .join(';');
      
      formData.append('variant_type', variantsString);
      
      if (stockForm.image) {
        formData.append('image', stockForm.image);
      }

      if (editItemId) {
        // Edit mode: PUT request
        await api.put(`/items/${editItemId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setEditItemId(null);
      } else {
        // Add mode: POST request
        await api.post('/items', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setShowItemForm(false);
      setStockForm({
        item_name: '',
        Category_name: '',
        model_number: '',
        barcode: '',
        description: '',
        image: null,
        variants: [],
      });
      setImagePreview(null);
      setVariantsEnabled(false);
      fetchItems();
      alert(editItemId ? 'Item updated successfully!' : 'Item added successfully!');
    } catch (error) {
      console.error('Error adding item:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add item';
      const errorDetails = error.response?.data?.details ? `\n\nDetails: ${error.response.data.details}` : '';
      alert(errorMessage + errorDetails);
    }
  };

  const handleItemChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setItemForm((prev) => ({
        ...prev,
        image: files[0],
      }));
      if (files[0]) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(files[0]);
      }
    } else {
      setItemForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('model_name', itemForm.name); // maps to model_name
      formData.append('model_number', itemForm.model); // maps to model_number
      formData.append('barcode', itemForm.barcode); // maps to barcode
      formData.append('description', itemForm.description); // maps to description
      formData.append('category_id', itemForm.categoryCode); // maps to category_id
      
      formData.append('variant_type', itemForm.variantType); // maps to variant_type
      formData.append('variant_option', itemForm.variantOptions); // maps to variant_option
      
      if (itemForm.image) {
        formData.append('image', itemForm.image);
      }

      console.log('Submitting form data:', Object.fromEntries(formData));
      
      const response = await api.post('/api/items', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Item added successfully:', response.data);
      
      // Reset form
      setItemForm({
        name: '',
        categoryCode: '',
        retailPrice: '',
        costPrice: '',
        wholesalePrice: '',
        model: '',
        barcode: '',
        description: '',
        inStock: '',
        lowStockAlert: '',
        image: null,
        variantType: '',
        variantOptions: '',
        variantPrice: '',
      });
      setImagePreview(null);
      setShowItemForm(false);
      
      // Refresh items list
      fetchItems();
    } catch (error) {
      console.error('Error adding item:', error);
      console.log('Error details:', error.response?.data);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      setIsAddingCategory(true);
      // FIX: Remove /api prefix
      const response = await api.post('/categories', { name: newCategory.trim() });
      if (response.data) {
        setCategories([...categories, { 
          value: response.data.category.id.toString(),
          label: response.data.category.name 
        }]);
        setShowCategoryModal(false);
        setNewCategory('');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert(error.response?.data?.message || 'Failed to add category. Please try again.');
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      // FIX: Remove /api prefix
      await api.delete(`/categories/${id}`);
      setCategories(prev => prev.filter(cat => cat.value !== id.toString()));
      setStockForm(prev => ({
        ...prev,
        Category_name: prev.Category_name === id.toString() ? '' : prev.Category_name
      }));
      setShowCategoriesDropdown(false);
      alert('Category deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Failed to delete category');
    }
  };

  // --- Barcode handlers ---
  const handleBarcodeChange = (e) => {
    const { name, value } = e.target;
    setBarcodeForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    alert('Barcode added!\n' + JSON.stringify(barcodeForm, null, 2));
    setShowBarcodeForm(false);
    setBarcodeForm({
      barcode: '',
      item_code: '',
      item_name: '',
      description: '',
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      setErrorCategories(null);
      const response = await api.get('/categories');
      setCategories(response.data.map(cat => ({
        value: cat.id.toString(),
        label: cat.name
      })));
    } catch (error) {
      console.error('Error fetching categories:', error);
      setErrorCategories('Failed to fetch categories. Please try again.');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Add this function to handle item deletion
  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/items/${id}`);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      alert('Failed to delete item');
      console.error('Delete error:', error);
    }
  };

  const [activeTab, setActiveTab] = useState('items'); // or your default tab

  // --- Permanent delete handlers for variant types/options ---
  const handleDeleteVariantType = async (type) => {
    if (!window.confirm(`Delete variant type "${type}" and all its options?`)) return;
    try {
      // Find all variant rows for this type and delete them one by one
      const res = await api.get('/variants');
      // Backend returns: { types, options, variants: [{id, variant_type, variant_option}] }
      const allVariants = res.data.variants || [];
      const typeVariants = allVariants.filter(v => v.variant_type === type);
      // Delete all variants of this type
      for (const v of typeVariants) {
        await api.delete(`/variants/${v.id}`);
      }
      setVariantTypes(prev => prev.filter(t => t !== type));
      setVariantOptions(prev => {
        const updated = { ...prev };
        delete updated[type];
        return updated;
      });
      setStockForm(prev => ({
        ...prev,
        variants: prev.variants.filter(v => v.type !== type)
      }));
    } catch (error) {
      alert('Failed to delete variant type');
      console.error(error);
    }
  };

  const handleDeleteVariantOption = async (type, option) => {
    // If deleting "default", delete the whole type
    if (option === 'default') {
      await handleDeleteVariantType(type);
      return;
    }
    if (!window.confirm(`Delete option "${option}" from type "${type}"?`)) return;
    try {
      // Find the variant row for this type+option and delete it
      const res = await api.get('/variants');
      const allVariants = res.data.variants || [];
      const variantRow = allVariants.find(v => v.variant_type === type && v.variant_option === option);
      if (!variantRow) {
        alert('Could not find variant option id');
        return;
      }
      await api.delete(`/variants/${variantRow.id}`);
      // Remove from frontend state
      setVariantOptions(prev => {
        const updated = { ...prev };
        updated[type] = updated[type].filter(opt => opt !== option);
        // If no options left, remove the type as well
        if (updated[type].length === 0) {
          delete updated[type];
          setVariantTypes(types => types.filter(t => t !== type));
        }
        return updated;
      });
      setStockForm(prev => ({
        ...prev,
        variants: prev.variants.filter(v => !(v.type === type && v.option === option))
      }));
    } catch (error) {
      alert('Failed to delete variant option');
      console.error(error);
    }
  };

  // Filters for Items tab
  const [itemFilters, setItemFilters] = useState({
    name: '',
    code: '',
    barcode: '',
    category: '',
    variant: ''
  });

  // Filtered items for Items tab
  const filteredItems = items.filter(item => {
    const matchName = !itemFilters.name || (item.item_name || '').toLowerCase().includes(itemFilters.name.toLowerCase());
    const matchCode = !itemFilters.code || (item.model_number || '').toLowerCase().includes(itemFilters.code.toLowerCase());
    const matchBarcode = !itemFilters.barcode || (item.barcode || '').toLowerCase().includes(itemFilters.barcode.toLowerCase());
    const matchCategory = !itemFilters.category || (item.category_name || '').toLowerCase().includes(itemFilters.category.toLowerCase());
    const matchVariant = !itemFilters.variant || (item.variant_type || '').toLowerCase().includes(itemFilters.variant.toLowerCase());
    return matchName && matchCode && matchBarcode && matchCategory && matchVariant;
  });

  return (
    <div className="w-full flex flex-col items-center min-h-[calc(100vh-60px)] bg-gradient-to-br from-[#e4f4fa] to-[#f8fbff] py-8 px-2 gap-8">
      <div className="w-full max-w-6xl bg-white/90 rounded-2xl shadow-2xl border border-[#b6e0fe] p-6 relative animate-fadein mb-4">
        {/* Rectangle Heading */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-[#0492C2] tracking-wide flex items-center gap-2">
            <span>Inventory</span>
            <span className="block w-12 md:w-16 h-1 rounded bg-gradient-to-r from-[#0492C2] to-[#b6e0fe]"></span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-xs shadow transition-all duration-200 ${
              activeTable === 'items'
                ? 'bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white'
                : 'bg-[#f8fbff] text-[#0492C2] hover:bg-[#e4f4fa]'
            }`}
            onClick={() => { setActiveTable('items'); setShowStockForm(false); setShowBarcodeForm(false); }}
          >
            <BsBoxSeamFill className="w-4 h-4" />
            Items
          </button>
          <button
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-xs shadow transition-all duration-200 ${
              activeTable === 'grn'
                ? 'bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white'
                : 'bg-[#f8fbff] text-[#0492C2] hover:bg-[#e4f4fa]'
            }`}
            onClick={() => { setActiveTable('grn'); setShowStockForm(false); setShowBarcodeForm(false); }}
          >
            <BsClipboard2CheckFill className="w-4 h-4" />
            GRN
          </button>
          {/* Add Stock tab button back */}
          <button
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-xs shadow transition-all duration-200 ${
              activeTable === 'stock'
                ? 'bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white'
                : 'bg-[#f8fbff] text-[#0492C2] hover:bg-[#e4f4fa]'
            }`}
            onClick={() => { setActiveTable('stock'); setShowStockForm(false); setShowBarcodeForm(false); }}
          >
            <BsBox2Fill className="w-4 h-4" />
            Stock
          </button>
        </div>

        {/* Items Tab */}
        {activeTable === 'items' && (
          <div>
            <div className="flex justify-end mb-2">
              <button
                className={`px-4 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition-all duration-200`}
                onClick={() => setShowItemForm(true)}
                aria-hidden={showItemForm}
                tabIndex={showItemForm ? -1 : 0}
              >
                + Add Item
              </button>
            </div>
            {/* Filter Controls for Items Table */}
            <div className="flex flex-wrap gap-3 mb-4 items-end">
              <div>
                <label className="block text-xs font-medium text-[#03648a] mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Item name"
                  value={itemFilters.name}
                  onChange={e => setItemFilters(f => ({ ...f, name: e.target.value }))}
                  className="px-2 py-1 border border-[#e0eefa] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#03648a] mb-1">Code</label>
                <input
                  type="text"
                  placeholder="Item code"
                  value={itemFilters.code}
                  onChange={e => setItemFilters(f => ({ ...f, code: e.target.value }))}
                  className="px-2 py-1 border border-[#e0eefa] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#03648a] mb-1">Barcode</label>
                <input
                  type="text"
                  placeholder="Barcode"
                  value={itemFilters.barcode}
                  onChange={e => setItemFilters(f => ({ ...f, barcode: e.target.value }))}
                  className="px-2 py-1 border border-[#e0eefa] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#03648a] mb-1">Category</label>
                <input
                  type="text"
                  placeholder="Category"
                  value={itemFilters.category}
                  onChange={e => setItemFilters(f => ({ ...f, category: e.target.value }))}
                  className="px-2 py-1 border border-[#e0eefa] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#03648a] mb-1">Variant</label>
                <input
                  type="text"
                  placeholder="Variant"
                  value={itemFilters.variant}
                  onChange={e => setItemFilters(f => ({ ...f, variant: e.target.value }))}
                  className="px-2 py-1 border border-[#e0eefa] rounded-lg text-xs"
                />
              </div>
              <button
                type="button"
                className="ml-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs border border-[#e0eefa] hover:bg-gray-200"
                onClick={() => setItemFilters({ name: '', code: '', barcode: '', category: '', variant: '' })}
              >
                Clear
              </button>
            </div>
            {!showItemForm ? (
              <div className="overflow-x-auto rounded-lg border border-[#b6e0fe] bg-white/80 shadow mb-8">
                <table className="min-w-full text-[11px] md:text-xs border-separate border-spacing-y-2">
                  <thead className="bg-[#e4f4fa] text-[#0492C2]">
                    <tr>
                      <th className="px-2 py-2 font-semibold text-center">SN</th>
                      <th className="px-2 py-2 font-semibold text-center">Image</th>
                      <th className="px-2 py-2 font-semibold text-center">Item Code</th>
                      <th className="px-2 py-2 font-semibold text-center">Barcode</th>
                      <th className="px-2 py-2 font-semibold text-center">Item Name</th>
                      <th className="px-2 py-2 font-semibold text-center">Category</th>
                      <th className="px-2 py-2 font-semibold text-center">Variants</th>
                      <th className="px-2 py-2 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item, idx) => (
                      <tr
                        key={item.id}
                        className="items-table-row group transition-all duration-200 align-middle"
                        style={{
                          // Add spacing between rows
                          boxShadow: '0 2px 8px 0 rgba(4,146,194,0.06), 0 1.5px 4px 0 rgba(4,146,194,0.06) !important',
                        }}
                      >
                        <td className="text-center align-middle font-bold text-[#0492C2]">{idx + 1}</td>
                        <td className="text-center align-middle">
                          <img
                            src={
                              item.image
                                ? (item.image.startsWith('http') ? item.image : `http://localhost:3000/uploads/${item.image}`)
                                : '/no-image.png'
                            }
                            alt={item.item_name}
                            className="w-10 h-7 object-cover rounded-md border border-[#e0eefa] bg-[#f8fbff] mx-auto"
                            onError={e => { e.target.onerror = null; e.target.src = '/no-image.png'; }}
                          />
                        </td>
                        <td className="text-center align-middle text-[#03648a]">{item.model_number}</td>
                        <td className="text-center align-middle text-[#03648a]">{item.barcode}</td>
                        <td className="text-center align-middle text-[#03648a]">{item.item_name}</td>
                        <td className="text-center align-middle text-[#03648a]">
                          {/* Display category_name from backend as Category */}
                          {item.category_name || '-'}
                        </td>
                        <td className="text-center align-middle text-[#03648a]">
                          {item.variant_type ? (
                            // Only show the variant types (before the colon in each pair)
                            item.variant_type.split(';').map((v, i) => {
                              const type = v.split(':')[0];
                              return (
                                <span key={i} className="bg-[#e4f4fa] text-[#03648a] px-2 py-0.5 rounded-full text-xs mr-1">
                                  {type}
                                </span>
                              );
                            })
                          ) : '-'}
                        </td>
                        <td className="text-center align-middle">
                          <div className="flex gap-1 justify-center items-center">
                            <button
                              className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#0492C2] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                              title="View"
                              onClick={() => fetchItemDetails(item.id)}
                            >
                              <MdVisibility className="w-4 h-4 drop-shadow" />
                            </button>
                            <button
                              className="action-btn-3d bg-gradient-to-br from-[#e4f4fa] to-[#b6e0fe] hover:from-[#b6e0fe] hover:to-[#0492C2] text-[#0492C2] hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                              title="Edit"
                              onClick={() => handleEditItem(item)}
                            >
                              <FaRegEdit className="w-4 h-4 drop-shadow" />
                            </button>
                            <button
                              className="action-btn-3d bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-400 text-red-400 hover:text-white rounded-full p-1.5 shadow-md transition-all duration-200"
                              title="Delete"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <MdDeleteOutline className="w-4 h-4 drop-shadow" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <form onSubmit={handleStockSubmit} className="space-y-6 relative z-10">
                <div className="bg-white/80 backdrop-blur-sm p-5 space-y-5 rounded-xl shadow border border-[#e0eefa] transition-all hover:shadow-lg">
                  <div className="flex flex-wrap items-center justify-between pb-2 border-b border-[#e0eefa]">
                    <h2 className="text-xl font-bold text-[#03648a] flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#0492C2]/90 to-[#b6e0fe]/90 flex items-center justify-center shadow">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                        </svg>
                      </div>
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0492C2] to-[#b6e0fe]">
                        Add Item
                      </span>
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-1 bg-gradient-to-r from-white to-[#e4f4fa] text-[#0492C2] rounded-full border border-[#e0eefa]">
                        All fields required
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[#03648a] mb-1">Item Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                        placeholder="Enter model name"
                        name="item_name"
                        value={stockForm.item_name}
                        onChange={handleStockChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[#03648a] mb-1 flex items-center">
                        Category
                        <button
                          type="button"
                          className="ml-2 text-[#0492C2] hover:text-[#03648a] hover:underline flex items-center text-sm font-medium"
                          onClick={() => setShowCategoryModal(true)}
                        >
                          <PlusIcon className="w-4 h-4 mr-1" />
                          Add
                        </button>
                      </label>
                      <div className="relative">
                        <div
                          className={`w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition ${
                            errorCategories ? 'border-red-300 ring-2 ring-red-100 bg-red-50' : ''
                          } ${loadingCategories ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
                        >
                          {stockForm.Category_name 
                            ? categories.find(c => c.value === stockForm.Category_name)?.label || 'Select a category'
                            : 'Select a category'}
                        </div>
                        {showCategoriesDropdown && (
                          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg py-1 border border-[#e0eefa]">
                            {categories.map(cat => (
                              <div 
                                key={cat.value} 
                                className="flex justify-between items-center px-4 py-2 hover:bg-[#f0f9ff] cursor-pointer"
                                onClick={() => {
                                  setStockForm(prev => ({...prev, Category_name: cat.value}));
                                  setShowCategoriesDropdown(false);
                                }}
                              >
                                <span>{cat.label}</span>
                                <button 
                                  type="button"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCategory(cat.value);
                                  }}
                                >
                                  <MdDeleteOutline className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {loadingCategories && (
                        <div className="absolute right-3 top-3">
                          <svg className="animate-spin h-5 w-5 text-[#0492C2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                      {errorCategories && (
                        <p className="text-red-500 text-sm mt-1">{errorCategories}</p>
                      )}
                    </div>
                  
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[#03648a] mb-1">Item Code</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                        placeholder="Enter model number"
                        name="model_number"
                        value={stockForm.model_number}
                        onChange={handleStockChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[#03648a] mb-1">Barcode</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border rounded-lg border-[#e0eefa] hover:border-[#b6e0fe] focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                        placeholder="Enter barcode number"
                        name="barcode"
                        value={stockForm.barcode}
                        onChange={handleStockChange}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-sm font-medium text-[#03648a] mb-1">Description</label>
                      <textarea
                        className="w-full px-4 py-2.5 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition hover:border-[#b6e0fe]"
                        placeholder="Enter item description"
                        rows={4}
                        name="description"
                        value={stockForm.description}
                        onChange={handleStockChange}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Image Upload Section */}
                <div className="bg-white/80 backdrop-blur-sm p-5 space-y-5 rounded-xl shadow border border-[#e0eefa] transition-all hover:shadow-lg">
                  <h2 className="text-xl font-bold text-[#03648a] flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#0492C2]/90 to-[#b6e0fe]/90 flex items-center justify-center shadow">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0492C2] to-[#b6e0fe]">
                      Product Image
                    </span>
                  </h2>
                  <div 
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                      imagePreview ? 'border-[#b6e0fe] bg-[#f0f9ff]/50' : 'border-[#e0eefa] hover:border-[#b6e0fe] bg-[#f8fbff]/50 hover:bg-[#f0f9ff]/50'
                    }`}
                  >
                    <input
                      type="file"
                      className="hidden"
                      id="item-image-upload"
                      accept="image/*"
                      name="image"
                      onChange={handleStockChange}
                    />
                    <label htmlFor="item-image-upload" className="cursor-pointer flex flex-col items-center justify-center">
                      {imagePreview ? (
                        <div className="relative w-48 h-48 mx-auto overflow-hidden rounded-lg shadow border border-[#e0eefa]">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-20 flex flex-col items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white mb-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 5a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                            </svg>
                            <span className="text-white font-medium">Change Image</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-gradient-to-r from-[#0492C2]/90 to-[#b6e0fe]/90 rounded-lg flex items-center justify-center mx-auto mb-3 shadow">
                            <PlusIcon className="w-8 h-8 text-white" />
                          </div>
                          <div className="mb-3">
                            <p className="text-sm text-[#7f8c8d] font-medium">Click to upload or drag and drop</p>
                            <p className="text-xs text-[#95a5a6] mt-1">PNG, JPG up to 5MB</p>
                          </div>
                          <button 
                            type="button"
                            className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-[#e0eefa] rounded-lg text-[#0492C2] font-medium hover:bg-[#e4f4fa] hover:border-[#b6e0fe] transition"
                          >
                            Browse Files
                          </button>
                        </>
                      )}
                    </label>
                  </div>
                </div>
                {/* Variants Section */}
                <div className="bg-white/80 backdrop-blur-sm p-5 space-y-5 rounded-xl shadow border border-[#e0eefa] transition-all hover:shadow-lg">
                  <div className="flex flex-wrap items-center justify-between pb-2 border-b border-[#e0eefa]">
                    <h2 className="text-xl font-bold text-[#03648a] flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#0492C2]/90 to-[#b6e0fe]/90 flex items-center justify-center shadow">
                        <TagIcon className="h-5 w-5 text-white" />
                      </div>
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0492C2] to-[#b6e0fe]">
                        Product Variants
                      </span>
                    </h2>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={variantsEnabled}
                        onChange={() => {
                          const newValue = !variantsEnabled;
                          setVariantsEnabled(newValue);
                          if (newValue && stockForm.variants.length === 0) {
                            addVariant();
                          }
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-offset-2 peer-focus:ring-[#b6e0fe]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#0492C2] peer-checked:to-[#b6e0fe]"></div>
                      <span className="ml-3 text-sm font-medium text-[#03648a]">Enable variants</span>
                    </label>
                  </div>

                  {variantsEnabled && (
                    <div className="space-y-4">
                      {stockForm.variants.map((variant, index) => (
                        <div key={index} className="bg-[#f8fbff] p-4 rounded-lg border border-[#e0eefa]">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-medium text-[#03648a]">Variant {index + 1}</h3>
                            <button
                              type="button"
                              onClick={() => removeVariant(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Variant Type Dropdown with Delete */}
                            <div>
                              <label className="block text-sm font-medium text-[#03648a] mb-1 flex items-center justify-between">
                                <span>Type</span>
                                <button
                                  type="button"
                                  className="text-[#0492C2] hover:text-[#03648a] hover:underline flex items-center text-xs font-medium"
                                  onClick={() => setShowVariantTypeModal(true)}
                                >
                                  <PlusIcon className="w-3 h-3 mr-1" />
                                  Add Type
                                </button>
                              </label>
                              <div className="relative">
                                <div className="w-full">
                                  <div className="relative">
                                    <button
                                      type="button"
                                      className={`w-full px-4 py-2.5 border border-[#e0eefa] rounded-lg text-left focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition hover:border-[#b6e0fe] bg-white`}
                                      onClick={() => setStockForm(prev => ({
                                        ...prev,
                                        [`showTypeDropdown${index}`]: !prev[`showTypeDropdown${index}`]
                                      }))}
                                    >
                                      {variant.type || 'Choose a variant type'}
                                    </button>
                                    {stockForm[`showTypeDropdown${index}`] && (
                                      <div className="absolute z-20 mt-1 w-full bg-white shadow-lg rounded-lg py-1 border border-[#e0eefa] max-h-48 overflow-auto">
                                        {variantTypes.map(type => (
                                          <div
                                            key={type}
                                            className="flex justify-between items-center px-4 py-2 hover:bg-[#f0f9ff] cursor-pointer"
                                            onClick={() => {
                                              updateVariantType(index, type);
                                              setStockForm(prev => ({
                                                ...prev,
                                                [`showTypeDropdown${index}`]: false
                                              }));
                                            }}
                                          >
                                            <span>{type}</span>
                                            <button
                                              type="button"
                                              className="text-red-500 hover:text-red-700 ml-2"
                                              onClick={async e => {
                                                e.stopPropagation();
                                                await handleDeleteVariantType(type);
                                              }}
                                              tabIndex={-1}
                                            >
                                              <MdDeleteOutline className="h-4 w-4" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {loadingVariants && (
                                  <div className="absolute right-3 top-3">
                                    <svg className="animate-spin h-5 w-5 text-[#0492C2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  </div>
                                )}
                              </div>
                              {errorVariants && (
                                <p className="text-red-500 text-sm mt-1">{errorVariants}</p>
                              )}
                            </div>
                            {/* Variant Option Dropdown with Delete */}
                            <div>
                              <label className="block text-sm font-medium text-[#03648a] mb-1 flex items-center justify-between">
                                <span>Option</span>
                                <button
                                  type="button"
                                  className="text-[#0492C2] hover:text-[#03648a] hover:underline flex items-center text-xs font-medium"
                                  onClick={() => {
                                    if (!variant.type) {
                                      alert('Please select a variant type first');
                                      return;
                                    }
                                    setSelectedVariantType(variant.type);
                                    setShowVariantOptionModal(true);
                                  }}
                                >
                                  <PlusIcon className="w-3 h-3 mr-1" />
                                  Add Option
                                </button>
                              </label>
                              <div className="relative">
                                <button
                                  type="button"
                                  className={`w-full px-4 py-2.5 border border-[#e0eefa] rounded-lg text-left focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition hover:border-[#b6e0fe] bg-white`}
                                  onClick={() => setStockForm(prev => ({
                                    ...prev,
                                    [`showOptionDropdown${index}`]: !prev[`showOptionDropdown${index}`]
                                  }))}
                                  disabled={!variant.type}
                                >
                                  {variant.option || (variant.type && variantOptions[variant.type]?.length > 0
                                    ? `Select an option for ${variant.type}`
                                    : 'No options available')}
                                </button>
                                {stockForm[`showOptionDropdown${index}`] && variant.type && (
                                  <div className="absolute z-20 mt-1 w-full bg-white shadow-lg rounded-lg py-1 border border-[#e0eefa] max-h-48 overflow-auto">
                                    {(variantOptions[variant.type] || []).map(option => (
                                      <div
                                        key={option}
                                        className="flex justify-between items-center px-4 py-2 hover:bg-[#f0f9ff] cursor-pointer"
                                        onClick={() => {
                                          updateVariantOption(index, option);
                                          setStockForm(prev => ({
                                            ...prev,
                                            [`showOptionDropdown${index}`]: false
                                          }));
                                        }}
                                      >
                                        <span>{option}</span>
                                        <button
                                          type="button"
                                          className="text-red-500 hover:text-red-700 ml-2"
                                          onClick={async e => {
                                            e.stopPropagation();
                                            await handleDeleteVariantOption(variant.type, option);
                                          }}
                                          tabIndex={-1}
                                        >
                                          <MdDeleteOutline className="h-4 w-4" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={addVariant}
                        className="flex items-center text-sm font-medium text-[#0492C2] hover:text-[#03648a] hover:underline"
                      >
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Add Another Variant
                      </button>
                    </div>
                  )}
                </div>
                {/* Ensure action buttons are always visible at the bottom */}
                <div className="flex justify-end mt-4 gap-2 sticky bottom-0 bg-white/90 z-20 py-3 px-2 rounded-b-xl shadow-lg border-t border-[#e0eefa]">
                  <button
                    type="button"
                    className="px-5 py-1.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm shadow hover:bg-gray-300 transition"
                    onClick={() => setShowItemForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-1.5 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold text-sm shadow-md hover:from-[#037ba1] hover:to-[#b6e0fe] transition-all duration-200"
                  >
                    Save Item
                  </button>
                </div>
                {/* Variant Modal */}
                {showVariantTypeModal && (
                  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity">
                    <div className="bg-white/90 backdrop-blur-lg rounded-xl p-5 w-96 max-w-full border border-[#e0eefa] shadow-xl">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-[#03648a]">Add Variant Type</h3>
                        <button 
                          onClick={() => {
                            setShowVariantTypeModal(false);
                            setNewVariantType('');
                          }}
                          className="text-[#95a5a6] hover:text-[#7f8c8d]"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition mb-3"
                        placeholder="Enter variant type (e.g., Color, Size)"
                        value={newVariantType}
                        onChange={(e) => setNewVariantType(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddVariantType()}
                        disabled={isAddingVariantType}
                        autoFocus
                      />
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          className="px-4 py-2 text-[#03648a] font-medium rounded-lg border border-[#e0eefa] bg-white/80 backdrop-blur-sm hover:bg-[#e4f4fa] transition"
                          onClick={() => {
                            setShowVariantTypeModal(false);
                            setNewVariantType('');
                          }}
                          disabled={isAddingVariantType}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2.5 bg-gradient-to-r from-[#0492C2]/90 to-[#b6e0fe]/90 text-white font-bold rounded-lg shadow hover:shadow-md transition flex items-center gap-2 disabled:opacity-70"
                          onClick={handleAddVariantType}
                          disabled={isAddingVariantType || !newVariantType.trim()}
                        >
                          {isAddingVariantType ? (
                            <>
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Adding...
                            </>
                          ) : (
                            <>
                          <PlusIcon className="w-4 h-4 text-white" />
                              Add Type
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Variant Option Modal */}
                {showVariantOptionModal && (
                  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity">
                    <div className="bg-white/90 backdrop-blur-lg rounded-xl p-5 w-96 max-w-full border border-[#e0eefa] shadow-xl">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-[#03648a]">
                          Add Option for <span className="font-semibold">{selectedVariantType}</span>
                        </h3>
                        <button 
                          onClick={() => {
                            setShowVariantOptionModal(false);
                            setNewVariantOption('');
                          }}
                          className="text-[#95a5a6] hover:text-[#7f8c8d]"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-[#95a5a6]">
                          Current options: {variantOptions[selectedVariantType]?.join(', ') || 'None'}
                        </p>
                      </div>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition mb-3"
                        placeholder={`Enter option for ${selectedVariantType} (e.g., Red, Large)`}
                        value={newVariantOption}
                        onChange={(e) => setNewVariantOption(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddVariantOption()}
                        disabled={isAddingVariantOption}
                        autoFocus
                      />
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          className="px-4 py-2 text-[#03648a] font-medium rounded-lg border border-[#e0eefa] bg-white/80 backdrop-blur-sm hover:bg-[#e4f4fa] transition"
                          onClick={() => {
                            setShowVariantOptionModal(false);
                            setNewVariantOption('');
                          }}
                          disabled={isAddingVariantOption}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2.5 bg-gradient-to-r from-[#0492C2]/90 to-[#b6e0fe]/90 text-white font-bold rounded-lg shadow hover:shadow-md transition flex items-center gap-2 disabled:opacity-70"
                          onClick={handleAddVariantOption}
                          disabled={isAddingVariantOption || !newVariantOption.trim()}
                        >
                          {isAddingVariantOption ? (
                            <>
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Adding...
                            </>
                          ) : (
                            <>
                          <PlusIcon className="w-4 h-4 text-white" />
                              Add Option
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        )}

        {/* GRN Table */}
        {activeTable === 'grn' && (
          <GRNComponent 
            grns={grns}
            setGrns={setGrns}
            activeTable={activeTable}
            setActiveTable={setActiveTable}
            viewGRN={viewGRN}
            setViewGRN={setViewGRN}
            selectedBranch={selectedBranch}
            // Pass filter props for GRNComponent to implement its own filters
            filtersEnabled={true}
          />
        )}

        {/* Stock Tab - New Component */}
        {activeTable === 'stock' && (
          <StockComponent
            // Pass filter props for StockComponent to implement its own filters
            filtersEnabled={true}
          />
        )}
        {/* Add Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Category</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="newCategory" className="block text-sm font-medium text-gray-700">
                    Category Name
                  </label>
              <input
               
                type="text"
                    id="newCategory"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[#0492C2] focus:outline-none focus:ring-1 focus:ring-[#0492C2] sm:text-sm"
                    placeholder="Enter category name"
                    disabled={isAddingCategory}
              />
                </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setNewCategory('');
                  }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0492C2]"
                    disabled={isAddingCategory}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCategory}
                    disabled={isAddingCategory || !newCategory.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#0492C2] hover:bg-[#037ba3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0492C2] disabled:opacity-50"
                  >
                    {isAddingCategory ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </>
                    ) : (
                      'Add Category'
                    )}
                </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Any GRN-related inputs in Inventory page */}
        <style>{`
          .grn-input {
            color: #03648a;
            background-color: transparent;
            border-color: #03648a;
          }
        `}</style>

        {viewItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl border border-[#b6e0fe] p-6 max-w-lg w-full">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-[#0492C2]">Item Details</h2>
                <button 
                  onClick={() => setViewItem(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {viewItem.image && (
                  <div className="md:col-span-2 flex justify-center">
                    <img 
                      src={viewItem.image} 
                      alt={viewItem.item_name}
                      className="h-40 object-contain rounded-lg"
                    />
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-[#03648a]">Item Name</p>
                  <p className="text-gray-800">{viewItem.item_name}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-[#03648a]">Model Number</p>
                  <p className="text-gray-800">{viewItem.model_number}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-[#03648a]">Barcode</p>
                  <p className="text-gray-800">{viewItem.barcode}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-[#03648a]">Category</p>
                  <p className="text-gray-800">{viewItem.category_name}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-[#03648a]">Variant Type</p>
                  <p className="text-gray-800">{viewItem.variant_type}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-[#03648a]">Variant Option</p>
                  <p className="text-gray-800">{viewItem.variant_option}</p>
                </div>
                
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-[#03648a]">Description</p>
                  <p className="text-gray-800">{viewItem.description}</p>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setViewItem(null)}
                  className="px-6 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition"
                >
                  Close
                </button>
              </div>
            </div>
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
            transition: all 0.2s ease;
            transform: translateY(0);
          }
          .action-btn-3d:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px rgba(4, 146, 194, 0.2);
          }
          /* 3D rectangle effect for items table rows */
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
        `}</style>
      </div>
    </div>
  );
}