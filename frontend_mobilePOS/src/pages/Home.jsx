import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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

  // Alias for handleRemoveFromCart to maintain backward compatibility
  const handleRemoveItem = handleRemoveFromCart;

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
    <div className="w-full h-full flex">
      {/* Main Content Area - Reduced width */}
      <div className="w-2/3 flex flex-col h-full overflow-hidden">
        {/* Header Section - Fixed */}
        <div className="flex-none p-2 border-b border-[#7ed8fa]/30 pl-6 pr-4">
          <div className="flex justify-between items-center">
           {/* Search Bar */}
<div className="relative w-full max-w-sm">
  <div className="flex items-center justify-start w-full max-w-md px-2 py-1 bg-[#ffff] rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15),0_2px_8px_rgba(11,39,177,0.2)]">
    
    {/* Left Icon */}
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0492c2] shadow-[inset_1px_1px_3px_rgba(255,255,255,0.4),inset_-1px_-1px_3px_rgba(0,0,0,0.1)] mr-2">
      <MagnifyingGlassIcon className="w-4 h-4 text-white" />
    </div>

  {/* Input */}
<input
  ref={searchInputRef}
  type="text"
  placeholder="Search items..."
  className="w-full bg-white text-[#03648a] placeholder-[#7ed8fa] text-sm font-medium rounded-full px-3 py-1 shadow-[inset_0_0_6px_rgba(0,0,0,0.15),inset_0_0_4px_rgba(255,255,255,0.6)] outline-none focus:outline-none focus:ring-0 focus:border-0 transition duration-200"
/>


  </div>
</div>

            {/* Sales Details Button - 3D / Embossed */}
            <button 
  className="relative px-4 py-1.5 rounded-xl bg-gradient-to-br from-[#0492c2] via-[#107cd1] to-[#0b27b1] text-white
    shadow-[inset_0_6px_10px_rgba(0,0,0,0.7),0_6px_10px_#0b27b1]
    border border-white/20 text-sm font-medium ml-2
    hover:brightness-110 transition-all duration-300 active:translate-y-px"
  onClick={() => navigate('/sales')}
>
  Sales Details
</button>


          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-2">
          {false ? (
            <div>
              <button
                className="mb-4 px-3 py-1 rounded-lg bg-gradient-to-r from-[#e4f4fa] to-[#b6e0fe] text-[#03648a] font-semibold text-xs shadow transition-all duration-200 flex items-center gap-1"
                style={{ transition: 'all 0.2s', background: 'linear-gradient(to right, #e4f4fa, #b6e0fe)' }}
                onClick={() => {}}
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
            <div className="h-full">
              {/* Categories Tabs Section */}
              <div className="relative flex-none py-1.5 bg-white/90">
                <div className="relative flex items-center px-2">
                  {/* Left Scroll Button */}
                  <button 
                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white border border-[#0492c2]/30 hover:bg-[#0492c2]/5 text-[#0492c2] shadow-sm mr-1 transition-all duration-200"
                    onClick={(e) => {
                      const container = e.currentTarget.closest('.categories-container').querySelector('.categories-scroll');
                      container.scrollBy({ left: -150, behavior: 'smooth' });
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  
                  {/* Categories Container */}
                  <div className="flex-1 overflow-hidden">
                    <div 
                      className="flex space-x-1.5 pb-1 overflow-x-auto scrollbar-hide categories-scroll"
                      onScroll={(e) => {
                        // Update scroll position state if needed
                      }}
                    >
                      {loadingCategories ? (
                        <div className="px-4 py-2 text-sm text-[#94aefe]">Loading categories...</div>
                      ) : categoriesError ? (
                        <div className="px-4 py-2 text-sm text-red-400">{categoriesError}</div>
                      ) : (
                        <div className="flex space-x-1.5 categories-container">
                          {categories.map((category) => (
                            <button
                              key={category.id}
                              onClick={() => setSelectedCategory(category.id)}
                              className={`min-w-max px-4 py-1.5 text-xs font-semibold transition-all duration-200 whitespace-nowrap rounded-full ${
                                selectedCategory === category.id
                                  ? 'bg-gradient-to-b from-blue-100 to-blue-50 text-blue-700 shadow-inner border border-blue-200/80'
                                  : 'bg-white text-slate-600 hover:bg-blue-50 border border-blue-100 hover:border-blue-200/80 shadow-sm hover:text-blue-600'
                              }`}
                            >
                              {category.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Right Scroll Button */}
                  <button 
                    className="ml-1.5 flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white border border-[#0492c2]/30 hover:bg-[#0492c2]/5 text-[#0492c2] shadow-sm transition-all duration-200"
                    onClick={(e) => {
                      const container = e.currentTarget.closest('.categories-container').querySelector('.categories-scroll');
                      container.scrollBy({ left: 150, behavior: 'smooth' });
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
                
                {/* Fade effects for both edges */}
                <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent pointer-events-none" />
              </div>
              {/* Custom scrollbar hide utility */}
              <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}</style>
              {/* Menu Items Section - Scrollable */}
              <div className="relative w-full mb-2 pl-2 mt-1">
                <div className="flex items-center justify-start">
                  <div className="
                    w-[140px] h-[36px]
                    flex items-center justify-center
                    rounded-full
                    bg-white
                    shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
                    <div className="
                      w-[130px] h-[30px]
                      flex items-center justify-center
                      rounded-full
                      bg-white
                      border border-[#d0d7f2]
                      text-[#0b27b1] text-[13px] font-semibold -mt-0.5
                      shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.8)]
                    ">
                      Select Menu
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`
                  grid 
                  ${isSidebarCollapsed ? 'grid-cols-7' : 'grid-cols-6'}
                  gap-2
                  animate-menu-pop
                  px-1.5 py-1
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
                    className="relative p-1.5 rounded-2xl group"
                    style={{ animationDelay: `${idx * 0.03}s` }}
                  >
                    {/* Outer container with inner shadow */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white to-gray-50/90 border border-gray-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.9)]"></div>
                    
                    {/* Inner container with outer shadow */}
                    <div className="relative w-full h-full rounded-xl p-1.5 flex flex-col z-10 bg-white/80 backdrop-blur-sm">
                      <div className="absolute inset-0 rounded-xl bg-white/90 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.1)] pointer-events-none"></div>
                      
                      {/* Content */}
                      <div className="relative z-10">
                        <div className="flex items-start w-full mb-1">
                          <div className="relative w-11 h-11 flex-shrink-0 mr-2">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)] overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col min-w-0">
                            <div className="font-extrabold truncate text-[#0b27b1] text-[10px] leading-none mb-0.5 tracking-tight">{item.name}</div>
                            <div className="flex items-center mb-0.5 gap-1.5">
                              <div className="relative h-6 flex items-center">
                                <span 
                                  className="text-[19px] font-black relative z-10 leading-none"
                                  style={{
                                    textShadow: '0 1px 3px rgba(255, 255, 255, 0.95), 0 2px 4px rgba(0, 0, 0, 0.2)',
                                    WebkitTextStroke: '0.5px rgba(255, 255, 255, 0.98)',
                                    lineHeight: '0.9',
                                    display: 'inline-block',
                                    transform: 'translateY(1px) scale(1.05)',
                                    letterSpacing: '-1px',
                                    filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.15))',
                                    textStroke: '0.5px rgba(255, 255, 255, 0.98)',
                                    textRendering: 'geometricPrecision',
                                    WebkitFontSmoothing: 'antialiased',
                                    MozOsxFontSmoothing: 'grayscale',
                                    minWidth: '20px',
                                    textAlign: 'center',
                                    transformOrigin: 'center center',
                                    color: 'transparent',
                                    background: 'linear-gradient(to bottom, #0b27b1, #1a3ac9)',
                                    WebkitBackgroundClip: 'text',
                                    backgroundClip: 'text',
                                    textShadow: '0 1px 0 rgba(255, 255, 255, 0.5)'
                                  }}
                                >
                                  {getDisplayAvailable(item)}
                                </span>
                              </div>
                              <span className="text-[10px] text-[#0b27b1]/80 font-semibold mt-0.5">Avail</span>
                            </div>
                            <div className="text-[7px] text-[#0b27b1]/60 font-medium truncate bg-blue-50/30 px-1.5 py-0.5 rounded-full border border-blue-100/50">
                              {item.barcode}
                            </div>
                          </div>
                        </div>
                        <div className="w-full flex flex-col gap-1.5 mt-1.5 pt-1 border-t border-blue-100/50">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-extrabold text-[#03648a] bg-gradient-to-r from-blue-50 to-transparent px-1.5 py-0.5 -ml-1.5 rounded-r-full">
                              LKR {item.price.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-1 bg-white/80 rounded-lg p-0.5 border border-blue-100/60 shadow-sm">
                              <button
                                className="qty-btn w-5 h-5 flex items-center justify-center rounded-md bg-gradient-to-b from-white to-blue-50 text-[#0b27b1] text-xs font-bold hover:from-blue-50 hover:to-blue-100 active:from-blue-100 active:to-blue-200 transition-all duration-150 shadow-[0_1px_1px_rgba(0,0,0,0.05)] hover:shadow-[0_1px_2px_rgba(11,39,177,0.2)]"
                                onClick={() => handleQuantityChange(item.id, -1)}
                                disabled={!quantities[item.id] || quantities[item.id] <= 0}
                              >
                                <span className="relative -top-px">−</span>
                              </button>
                              <span className="text-[11px] w-6 text-center font-extrabold text-[#0b27b1] bg-blue-50/50 rounded-sm py-0.5">
                                {quantities[item.id] || 0}
                              </span>
                              <button
                                className="qty-btn w-5 h-5 flex items-center justify-center rounded-md bg-gradient-to-b from-[#0b27b1] to-[#0492c2] text-white text-xs font-bold hover:from-[#1a3ad9] hover:to-[#0b27b1] active:from-[#142f9c] active:to-[#0b27b1] transition-all duration-150 shadow-[0_1px_1px_rgba(0,0,0,0.1)] hover:shadow-[0_1px_3px_rgba(11,39,177,0.3)]"
                                onClick={() => handleQuantityChange(item.id, 1)}
                              >
                                <span className="relative -top-px">+</span>
                              </button>
                            </div>
                            <button
                              className="bg-gradient-to-b from-white/90 to-blue-50 text-[#0492c2] px-2.5 py-1 rounded-lg text-[10px] font-bold border border-blue-100 hover:from-white hover:to-blue-100 active:from-blue-100 active:to-blue-200 transition-all duration-150 shadow-[0_1px_2px_rgba(4,146,194,0.1),inset_0_1px_1px_rgba(255,255,255,0.8)] hover:shadow-[0_2px_4px_rgba(4,146,194,0.15)] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-1 focus:ring-[#0492c2]/30 active:translate-y-px flex items-center justify-center min-w-[45px] h-6"
                              onClick={() => handleAddToCart(item)}
                              tabIndex={0}
                            >
                              <span className="relative top-px">Add</span>
                            </button>
                          </div>
                        </div>
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
            </div>
          )}
        </div>
      </div>
      
      {/* Bill Details Section */}
      <div className="w-[470px] flex flex-col h-[85vh] my-auto relative">
     {/* Hole Effect Header (Wider) */}
<div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
  {/* Outer ring (raised border around the hole) */}
  <div className="
    w-[200px] h-[56px]
    flex items-center justify-center
    rounded-full
    bg-white
    shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
    
    {/* Inner sunken button (actual hole) */}
    <div className="
      w-[180px] h-[44px]
      flex items-center justify-center
      rounded-full
      bg-white
      border border-[#d0d7f2]
      text-[#0b27b1] text-sm font-semibold
      shadow-[inset_4px_4px_6px_rgba(0,0,0,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]
    ">
      Bill Details
    </div>
  </div>


</div>







          
          <div className="mt-6 rounded-xl border border-[#d0d7f2] p-5 shadow-[inset_4px_4px_6px_rgba(0,0,0,0.08),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]">
            <BillDetails 
              cart={cart}
              onRemoveItem={handleRemoveItem}
              onIncreaseQty={handleIncreaseQty}
              onDecreaseQty={handleDecreaseQty}
              onCancel={handleCancel}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
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
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .card-glow:hover, .card-glow:focus-within {
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
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
      `}
    </style>
  </div>
  );
}