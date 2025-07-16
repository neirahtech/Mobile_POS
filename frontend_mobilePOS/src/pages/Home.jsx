import { useRef, useEffect, useState } from 'react';
import BillDetails from '../components/BillDetails.jsx';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { usePOS } from '../context/POSContext';
import { useBranch } from '../context/BranchContext';
import SalesDetails from '../components/SalesDetails.jsx';
import api from '../utils/axios';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [categories, setCategories] = useState([{ id: 'all', name: 'All Items' }]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenuItems, setLoadingMenuItems] = useState(true);
  const [menuItemsError, setMenuItemsError] = useState(null);
  // Track reserved quantities for items in cart
  const [reserved, setReserved] = useState({});
  const [showSalesDetails, setShowSalesDetails] = useState(false);
  const searchInputRef = useRef(null);
  const { isSidebarCollapsed } = usePOS();
  const { selectedBranch } = useBranch();

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await api.get('/categories');
        const data = response.data;
        
        // Ensure data is an array of objects with a 'name' property
        if (Array.isArray(data) && data.length && data[0].name) {
          setCategories([{ id: 'all', name: 'All Items' }, ...data]);
          setCategoriesError(null);
        } else {
          setCategories([{ id: 'all', name: 'All Items' }]);
          setCategoriesError('No categories found');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories([{ id: 'all', name: 'All Items' }]);
        setCategoriesError('Could not load categories');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoadingMenuItems(true);
      setMenuItemsError(null);
      try {
        const branch_id = selectedBranch?.id || 1;
        const today = new Date().toISOString().slice(0, 10);

        // Fetch all items for the current branch
        const itemsRes = await api.get('/items', { params: { branch_id } });
        const items = itemsRes.data?.items || [];

        // Fetch all GRNs for the current branch
        const grnRes = await api.get('/grn', { params: { branch_id } });
        const grns = Array.isArray(grnRes.data) ? grnRes.data : grnRes.data?.grns || [];

        // Fetch all sales details for the current branch
        const salesRes = await api.get('/sales-details', { params: { branch_id } });
        const sales = Array.isArray(salesRes.data) ? salesRes.data : [];

        // Build GRN quantity map: item_code -> sum of quantity up to today
        const grnQuantityMap = {};
        const latestPriceMap = {};

        grns.forEach(grn => {
          if (!grn.invoice_date || grn.invoice_date > today) return;
          if (grn.items && Array.isArray(grn.items)) {
            grn.items.forEach(grnItem => {
              const itemCode = grnItem.item_code || grnItem.code;
              if (!itemCode) return;
              const quantity = Number(grnItem.quantity) || 0;
              grnQuantityMap[itemCode] = (grnQuantityMap[itemCode] || 0) + quantity;

              // Track latest price by invoice_date
              const retailPrice = Number(grnItem.retail_price) || 0;
              if (!latestPriceMap[itemCode] || (grn.invoice_date > (latestPriceMap[itemCode].invoice_date || ''))) {
                latestPriceMap[itemCode] = {
                  retail_price: retailPrice,
                  invoice_date: grn.invoice_date
                };
              }
            });
          }
        });

        // Build sales quantity map: item_code -> sum of sold quantity up to today
        const salesQuantityMap = {};
        sales.forEach(sale => {
          if (!sale.date || sale.date > today) return;
          if (Array.isArray(sale.items)) {
            sale.items.forEach(saleItem => {
              // Try to match by item_code, fallback to name
              let itemCode = saleItem.item_code;
              if (!itemCode && saleItem.name) {
                const found = items.find(i => i.item_name === saleItem.name || i.name === saleItem.name);
                itemCode = found ? (found.model_number || found.item_code) : '';
              }
              if (!itemCode) return;
              const qty = Number(saleItem.quantity) || 0;
              salesQuantityMap[itemCode] = (salesQuantityMap[itemCode] || 0) + qty;
            });
          }
        });

        // Map items to menu items format
        const allMenuItems = items.map(item => {
          const itemCode = item.model_number || item.item_code;
          const grnQty = grnQuantityMap[itemCode] || 0;
          const salesQty = salesQuantityMap[itemCode] || 0;
          const quantity = grnQty - salesQty;
          const priceData = latestPriceMap[itemCode] || { retail_price: 0 };

          // Build image URL
          let imageUrl = '';
          if (item.image) {
            imageUrl = item.image.startsWith('http')
              ? item.image
              : `${api.defaults.baseURL.replace('/api', '')}/uploads/${item.image}`;
          }

          return {
            id: item.id,
            name: item.item_name || item.name || '',
            price: Number(priceData.retail_price || item.retail_price || item.price || 0),
            image: imageUrl,
            available: quantity,
            barcode: item.barcode || '',
            item_code: itemCode,
            category: item.category_name || item.category || ''
          };
        });

        setMenuItems(allMenuItems);
        setMenuItemsError(null);
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setMenuItems([]);
        setMenuItemsError('Could not load menu items');
      } finally {
        setLoadingMenuItems(false);
      }
    };

    fetchMenuItems();
  }, [selectedBranch]);

  const handleQuantityChange = (itemId, delta) => {
    setQuantities((prev) => {
      const newQty = Math.max(1, (prev[itemId] || 1) + delta);
      return { ...prev, [itemId]: newQty };
    });
  };

  const handleAddToCart = (item) => {
    const qty = quantities[item.id] || 1;
    setCart((prev) => {
      const existingIdx = prev.findIndex((ci) => ci.id === item.id);
      if (existingIdx !== -1) {
        // Item already in cart, increment qty
        return prev.map((ci, i) =>
          i === existingIdx
            ? { ...ci, qty: ci.qty + qty }
            : ci
        );
      } else {
        // New item, add to cart
        return [...prev, { ...item, qty, price: item.price }];
      }
    });
    // Update reserved
    setReserved(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + qty
    }));
    setQuantities((q) => ({ ...q, [item.id]: 1 }));
  };

  const handleRemoveFromCart = (idx) => {
    setCart(cart => {
      const item = cart[idx];
      if (item) {
        setReserved(prev => ({
          ...prev,
          [item.id]: Math.max(0, (prev[item.id] || 0) - item.qty)
        }));
      }
      return cart.filter((_, i) => i !== idx);
    });
  };

  const handleIncreaseQty = (idx) => {
    setCart(cart => cart.map((item, i) =>
      i === idx ? { ...item, qty: item.qty + 1 } : item
    ));
    setReserved(prev => {
      const item = cart[idx];
      if (item) {
        return { ...prev, [item.id]: (prev[item.id] || 0) + 1 };
      }
      return prev;
    });
  };

  const handleDecreaseQty = (idx) => {
    setCart(cart => cart.map((item, i) =>
      i === idx && item.qty > 1 ? { ...item, qty: item.qty - 1 } : item
    ));
    setReserved(prev => {
      const item = cart[idx];
      if (item && item.qty > 1) {
        return { ...prev, [item.id]: Math.max(0, (prev[item.id] || 0) - 1) };
      }
      return prev;
    });
  };

  // Cancel billing: restore reserved quantities
  const handleCancel = () => {
    setCart([]);
    setReserved({});
  };

  // Checkout: clear cart and reserved, but do NOT restore available (simulate reduction)
  const handleCheckout = () => {
    setCart([]);
    setReserved({});
    alert('Order placed!');
  };

  // Filter menu items based on search term and selected category
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || 
      (item.category && item.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    const matchesSearch = searchTerm === '' || 
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.barcode && item.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.item_code && item.item_code.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Helper: get available count minus reserved
  const getDisplayAvailable = (item) => {
    return Math.max(0, (item.available || 0) - (reserved[item.id] || 0));
  };

  return (
    <div className="h-screen flex p-2 gap-2 overflow-hidden bg-white relative font-inter text-[#03648a]">
      {/* Main Content Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 64px)' }}
      >
        {/* Header Section - Fixed */}
        <div className="flex-none p-2 border-b border-[#7ed8fa]/30">
          {/* Search Bar */}
          <div className="flex justify-between items-center mb-1">
            <div className="relative w-full max-w-sm">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search items..."
                className="w-full h-8 text-sm px-8 pr-3 rounded-lg border border-[#7ed8fa]/40 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#7ed8fa]/30 focus:border-[#7ed8fa]/60 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl focus:shadow-xl search-input search-glow text-[#03648a] placeholder-[#94aefe]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontWeight: 500 }}
              />
              <MagnifyingGlassIcon className="w-4 h-4 text-[#7ed8fa] absolute left-2 top-1/2 -translate-y-1/2 transition-colors duration-300" />
            </div>
            <div className="flex items-center gap-2 ml-2">
              <img
                src="https://ui-avatars.com/api/?name=Manager&background=0492C2&color=fff"
                alt="Manager"
                className="w-5 h-5 rounded-full border-2 border-[#7ed8fa]/40 shadow-lg hover:border-[#94aefe]/60 transition-all duration-300"
              />
              <div className="hidden sm:block leading-tight text-[8px]">
                <div className="font-semibold text-[#03648a]">Manager</div>
                <div className="text-[#7ed8fa] text-[7px]">Abcde</div>
              </div>
            </div>
          </div>
          {/* Home Heading and Sales Details Button */}
          <div className="flex items-center justify-between mt-2">
            <h1 className="text-base font-bold text-[#03648a] flex items-center gap-2">
              Home
            </h1>
            <button
              className="ml-2 px-3 py-1 rounded-lg bg-gradient-to-r from-[#e4f4fa] to-[#b6e0fe] text-[#03648a] font-semibold text-xs shadow transition-all duration-200 flex items-center gap-1"
              style={{ transition: 'all 0.2s', background: 'linear-gradient(to right, #e4f4fa, #b6e0fe)' }}
              onClick={() => setShowSalesDetails(true)}
              onMouseOver={e => e.currentTarget.style.background = '#c5ecfc'}
              onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(to right, #e4f4fa, #b6e0fe)'}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
                <rect x="3" y="5" width="14" height="10" rx="2" fill="#0492C2"/>
                <rect x="3" y="5" width="14" height="10" rx="2" fill="#c5ecfc" fillOpacity="0.7"/>
                <rect x="3" y="5" width="14" height="10" rx="2" stroke="#0492C2" strokeWidth="1.5"/>
                <rect x="6" y="8" width="8" height="1.5" rx="0.75" fill="#0492C2"/>
                <rect x="6" y="11" width="5" height="1.5" rx="0.75" fill="#0492C2"/>
              </svg>
              Sales Details
            </button>
          </div>
        </div>
        {/* Main Content or Sales Details */}
        <div className="flex-1 overflow-y-auto p-2" style={{ height: 'calc(100vh - 172px)' }}>
          {showSalesDetails ? (
            <div>
              <button
                className="mb-4 px-3 py-1 rounded-lg bg-gradient-to-r from-[#e4f4fa] to-[#b6e0fe] text-[#03648a] font-semibold text-xs shadow transition-all duration-200 flex items-center gap-1"
                style={{ transition: 'all 0.2s', background: 'linear-gradient(to right, #e4f4fa, #b6e0fe)' }}
                onClick={() => setShowSalesDetails(false)}
                onMouseOver={e => e.currentTarget.style.background = '#c5ecfc'}
                onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(to right, #e4f4fa, #b6e0fe)'}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
                  <path d="M12 15l-5-5 5-5" stroke="#0492C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
              </button>
              <SalesDetails />
            </div>
          ) : (
            <>
              {/* Categories Section - Fixed */}
              <div className="flex-none p-2 border-b border-[#7ed8fa]/30">
                <h2 className="text-xs font-semibold mb-1 text-[#03648a]">Categories</h2>
                <div className="overflow-x-auto">
                  <div className="flex gap-1 w-max pb-1 px-1 h-8 items-center">
                    {loadingCategories ? (
                      <span className="text-[10px] text-[#94aefe]">Loading...</span>
                    ) : categoriesError ? (
                      <span className="text-[10px] text-red-400">{categoriesError}</span>
                    ) : (
                      categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`px-2 py-0.5 rounded-lg whitespace-nowrap text-[9px] border font-semibold shadow transition-all duration-300 flex items-center gap-1 category-btn ${
                            selectedCategory === category.id
                              ? 'bg-gradient-to-r from-[#7ed8fa]/40 to-[#94aefe]/30 text-[#03648a] border-[#7ed8fa]/60 scale-105 shadow-lg active-category'
                              : 'bg-white/80 text-[#03648a] hover:bg-[#7ed8fa]/10 hover:text-[#03648a] border-[#7ed8fa]/30 hover:border-[#94aefe]/40'
                          } hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#7ed8fa]/30`}
                          style={{ fontWeight: 600 }}
                        >
                          {category.name}
                        </button>
                      ))
                   ) }
                  </div>
                </div>
              </div>
              {/* Menu Items Section - Scrollable */}
              <h2 className="text-xs font-semibold mb-2 text-[#03648a]">Select Menu</h2>
              <div
                className={`
                  grid 
                  ${isSidebarCollapsed ? 'grid-cols-4' : 'grid-cols-3'}
                  gap-2
                  animate-menu-pop
                `}
              >
                {loadingMenuItems ? (
                  <div className="col-span-full text-center text-[#94aefe] font-semibold py-8 opacity-70">
                    Loading items...
                  </div>
                ) : menuItemsError ? (
                  <div className="col-span-full text-center text-red-400 font-semibold py-8 opacity-70">
                    {menuItemsError}
                  </div>
                ) : filteredMenuItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="menu-card p-2 rounded-xl border border-[#7ed8fa]/40 bg-white/90 backdrop-blur-sm flex flex-col items-center text-[9px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] menu-card-anim group modern-card"
                    style={{ animationDelay: `${idx * 0.04}s` }}
                  >
                    <div className="flex items-start w-full mb-1">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-10 rounded-md bg-[#7ed8fa]/10 object-cover mr-2 border-2 shadow group-hover:scale-110 transition-transform duration-300"
                        style={{ flexShrink: 0, borderColor: '#0492c2' }}
                      />
                      <div className="flex-1 flex flex-col">
                        <div className="font-semibold truncate text-[#03648a] group-hover:text-[#03648a] transition-colors duration-200 text-[8px]">{item.name}</div>
                        <div className="text-[7px] text-[#7ed8fa] font-semibold">
                          {getDisplayAvailable(item)} Avail
                        </div>
                        <div className="text-[7px] text-[#03648a] font-semibold">
                          Barcode: {item.barcode}
                        </div>
                      </div>
                    </div>
                    <div className="w-full flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[7px]">
                        <span className="font-bold text-[#03648a] group-hover:text-[#03648a] transition-colors duration-200">
                          LKR {item.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1">
                          <button
                            className="qty-btn w-3 h-3 rounded-full bg-white flex items-center justify-center text-[8px] text-[#03648a] font-bold border border-[#7ed8fa]/60 hover:bg-[#7ed8fa]/10 hover:text-[#03648a] active:bg-[#7ed8fa]/20 active:text-[#03648a] transition-all duration-200"
                            onClick={() => handleQuantityChange(item.id, -1)}
                            tabIndex={0}
                          >
                            -
                          </button>
                          <span className="text-[8px] font-semibold text-[#03648a]">{quantities[item.id] || 1}</span>
                          <button
                            className="qty-btn w-3 h-3 rounded-full bg-white flex items-center justify-center text-[8px] text-[#03648a] font-bold border border-[#7ed8fa]/60 hover:bg-[#7ed8fa]/10 hover:text-[#03648a] active:bg-[#7ed8fa]/20 active:text-[#03648a] transition-all duration-200"
                            onClick={() => handleQuantityChange(item.id, 1)}
                            tabIndex={0}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="btn-3d bg-gradient-to-r from-[#7ed8fa]/40 to-[#94aefe]/30 text-[#03648a] px-2 py-0.5 rounded-lg text-[8px] font-bold border border-[#7ed8fa]/40 hover:from-[#7ed8fa]/60 hover:to-[#94aefe]/50 hover:text-[#03648a] active:from-[#7ed8fa]/80 active:to-[#ffbdbd]/60 active:text-[#a10000] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7ed8fa]/30 scale-100 group-hover:scale-105 add-btn"
                          onClick={() => handleAddToCart(item)}
                          tabIndex={0}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {(!loadingMenuItems && !menuItemsError && filteredMenuItems.length === 0) && (
                  <div className="col-span-full text-center text-[#94aefe] font-semibold py-8 opacity-70">
                    No items found.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Bill Details Container */}
      {!showSalesDetails && (
        <div className="flex-shrink-0 w-full max-w-md h-full overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-[#e5e7eb]"
          style={{ maxHeight: 'calc(100vh - 64px)' }}>
          <BillDetails
            cart={cart}
            onRemove={handleRemoveFromCart}
            onIncrease={handleIncreaseQty}
            onDecrease={handleDecreaseQty}
            onCheckout={handleCheckout}
          />
          <div className="p-2">
            <button
              className="btn-3d bg-gradient-to-r from-[#e57373]/40 to-[#ffbdbd]/30 text-[#a10000] px-2 py-0.5 rounded-lg text-[10px] font-bold border border-[#e57373]/40 hover:from-[#e57373]/60 hover:to-[#ffbdbd]/50 hover:text-[#a10000] active:from-[#e57373]/80 active:to-[#ffbdbd]/60 active:text-[#a10000] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#e57373]/30 scale-100 group-hover:scale-105 add-btn"
              onClick={handleCancel}
              tabIndex={0}
              style={{ marginTop: 8 }}
            >
              Cancel Billing
            </button>
          </div>
        </div>
      )}
      {/* Enhanced Animations and Styles */}
      <style>{`
        .font-inter { 
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif; 
        }
        body, #root {
          background: #FFFFFF;
          min-height: 100vh;
        }
        .search-glow {
          box-shadow: 0 0 0 2px #7ed8fa, 0 0 8px 2px #94aefe;
        }
        .search-glow:focus, .search-glow:active {
          box-shadow: 0 0 0 3px #7ed8fa, 0 0 12px 4px #94aefe;
        }
        .card-glow {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.05);
        }
        .card-glow:hover, .card-glow:focus-within {
          box-shadow: 0 0 0 3px #7ed8fa, 0 0 18px 6px #94aefe;
        }

        .home-title-anim {
          animation: homeTitlePop 0.8s cubic-bezier(.4,0,.2,1);
        }
        @keyframes homeTitlePop {
          from { opacity: 0; transform: translateY(-16px) scale(0.98);}
          to { opacity: 1; transform: translateY(0) scale(1);}
        }
        .animate-menu-pop > * {
          animation: menuPop 0.7s cubic-bezier(.4,0,.2,1) both;
        }
        @keyframes menuPop {
          from { opacity: 0; transform: scale(0.97) translateY(24px);}
          to { opacity: 1; transform: scale(1) translateY(0);}
        }
        .category-btn {
          backdrop-filter: blur(8px);
        }
        .active-category {
          position: relative;
          overflow: hidden;
          border-bottom: 2px solid #03648a !important;
          box-shadow: 
            0 4px 6px rgba(3, 100, 138, 0.2),
            0 1px 0 rgba(255, 255, 255, 0.7) inset !important;
        }
        .active-category::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, #7ed8fa44, transparent);
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .modern-card {
          backdrop-filter: blur(8px);
          border: 1px solid #7ed8fa33;
        }
        .modern-card:hover {
          border-color: #7ed8fa;
          box-shadow: 
            0 20px 40px #7ed8fa22,
            0 8px 16px #94aefe22;
        }
        .add-btn {
          backdrop-filter: blur(8px);
        }
        .add-btn:hover {
          transform: translateY(-1px);
        }
        .add-btn:active {
          transform: translateY(0);
        }
        @keyframes borderGlow {
          0%, 100% { 
            border-color: #7ed8fa66;
            box-shadow: 0 0 4px 1px #7ed8fa33;
          }
          50% { 
            border-color: #94aefe;
            box-shadow: 0 0 12px 3px #94aefe55;
          }
        }
        .border-glow {
          animation: borderGlow 3s ease-in-out infinite;
        }
        /* Custom scrollbar for main content */
        .main-content-container .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        .main-content-container .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.5);
          border-radius: 2px;
        }
        .main-content-container .overflow-y-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #7ed8fa99, #94aefecc);
          border-radius: 2px;
        }
        .main-content-container .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #7ed8fa, #94aefe);
        }
        
        /* 3D Button Effects */
        .btn-3d {
          position: relative;
          border-bottom: 2px solid #03648a66;
          box-shadow: 
            0 3px 5px rgba(3, 100, 138, 0.1),
            0 1px 0 rgba(255, 255, 255, 0.7) inset;
          transition: all 0.1s ease;
        }
        
        .btn-3d:hover {
          transform: translateY(-1px);
          box-shadow: 
            0 5px 8px rgba(3, 100, 138, 0.2),
            0 1px 0 rgba(255, 255, 255, 0.7) inset;
        }
        
        .btn-3d:active {
          transform: translateY(1px);
          border-bottom-width: 1px;
          box-shadow: 
            0 1px 2px rgba(3, 100, 138, 0.1),
            0 1px 1px rgba(0,0,0,0.1) inset;
        }
        
        /* Quantity buttons */
        .qty-btn {
          position: relative;
          border-bottom: 1px solid #03648a66;
          box-shadow: 
            0 2px 3px rgba(3, 100, 138, 0.1),
            0 1px 0 rgba(255, 255, 255, 0.7) inset;
          transition: all 0.1s ease;
        }
        
        .qty-btn:hover {
          transform: translateY(-1px);
          box-shadow: 
            0 3px 4px rgba(3, 100, 138, 0.15),
            0 1px 0 rgba(255, 255, 255, 0.7) inset;
        }
        
        .qty-btn:active {
          transform: translateY(1px);
          border-bottom-width: 0.5px;
          box-shadow: 
            0 1px 1px rgba(3, 100, 138, 0.1),
            0 1px 1px rgba(0,0,0,0.1) inset;
        }
        
        /* Enhanced glow effects */
        .card-glow {
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .card-glow:hover, .card-glow:focus-within {
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }
        
        .bill-glow {
          box-shadow: 0 0 0 2px #7ed8fa, 0 0 16px 2px #94aefe, 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .bill-glow:focus-within, .bill-glow:hover {
          box-shadow: 0 0 0 3px #7ed8fa, 0 0 24px 8px #94aefe, 0 6px 12px rgba(0,0,0,0.15);
        }
        
        /* Category buttons hover effect */
        .category-btn:hover {
          transform: translateY(-1px);
          box-shadow: 
            0 4px 6px rgba(3, 100, 138, 0.15),
            0 1px 0 rgba(255, 255, 255, 0.7) inset;
        }
        
        .category-btn:active {
          transform: translateY(0);
          box-shadow: 
            0 1px 2px rgba(3, 100, 138, 0.1),
            0 1px 1px rgba(0,0,0,0.1) inset;
        }
      `}</style>
    </div>
  );
}