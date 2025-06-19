import { useRef, useEffect, useState } from 'react';
import BillDetails from '../components/BillDetails.jsx';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import {
  Square2StackIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  Battery50Icon,
  WifiIcon,
} from '@heroicons/react/24/outline';
import { GiSmartphone, GiLaptop, GiHeadphones, GiBatteryPack, GiNetworkBars } from 'react-icons/gi';

const categories = [
  { id: 'all', name: 'All Items', icon: GiSmartphone },
  { id: 'phones', name: 'Phones', icon: GiSmartphone },
  { id: 'laptops', name: 'Laptops', icon: GiLaptop },
  { id: 'accessories', name: 'Accessories', icon: GiHeadphones },
  { id: 'monitors', name: 'Monitors', icon: GiLaptop },
  { id: 'batteries', name: 'Batteries', icon: GiBatteryPack },
  { id: 'network', name: 'Networking', icon: GiNetworkBars },
];

const menuItems = [
  {
    id: 1,
    name: 'iPhone 16 Pro Max',
    price: 245000.0,
    image:
      'https://images.unsplash.com/photo-1726587912121-ea21fcc57ff8?q=80&w=2080',
    category: 'smartphone',
    available: 10,
    sold: 4,
  },
  {
    id: 2,
    name: 'Samsung Galaxy S23 Ultra',
    price: 130500.0,
    image:
      'https://images.unsplash.com/photo-1676115724686-476a7337dfb6?q=80&w=1923',
    category: 'smartphone',
    available: 8,
    sold: 5,
  },
  {
    id: 3,
    name: 'iPhone 16',
    price: 190100.0,
    image:
      'https://images.unsplash.com/photo-1726828537956-61ae115d7d7a?q=80&w=1932',
    category: 'smartphone',
    available: 6,
    sold: 2,
  },
  {
    id: 4,
    name: 'iPhone 16',
    price: 190100.0,
    image:
      'https://images.unsplash.com/photo-1726828537956-61ae115d7d7a?q=80&w=1932',
    category: 'smartphone',
    available: 6,
    sold: 2,
  },
  {
    id: 5,
    name: 'OnePlus 12',
    price: 100950.0,
    image:
      'https://images.unsplash.com/photo-1673718424091-5fb734062c05?q=80&w=1965',
    category: 'smartphone',
    available: 9,
    sold: 3,
  },
  {
    id: 6,
    name: 'iPhone 16',
    price: 190100.0,
    image:
      'https://images.unsplash.com/photo-1726828537956-61ae115d7d7a?q=80&w=1932',
    category: 'smartphone',
    available: 6,
    sold: 2,
  },
  {
    id: 7,
    name: 'iPhone 16',
    price: 190100.0,
    image:
      'https://images.unsplash.com/photo-1726828537956-61ae115d7d7a?q=80&w=1932',
    category: 'smartphone',
    available: 6,
    sold: 2,
  },
  {
    id: 8,
    name: 'iPhone 16',
    price: 190100.0,
    image:
      'https://images.unsplash.com/photo-1726828537956-61ae115d7d7a?q=80&w=1932',
    category: 'smartphone',
    available: 6,
    sold: 2,
  },
  {
    id: 9,
    name: 'iPhone 16',
    price: 190100.0,
    image:
      'https://images.unsplash.com/photo-1726828537956-61ae115d7d7a?q=80&w=1932',
    category: 'smartphone',
    available: 6,
    sold: 2,
  },
  {
    id: 10,
    name: 'iPhone 16',
    price: 190100.0,
    image:
      'https://images.unsplash.com/photo-1726828537956-61ae115d7d7a?q=80&w=1932',
    category: 'smartphone',
    available: 6,
    sold: 2,
  },
  {
    id: 11,
    name: 'iPhone 16',
    price: 190100.0,
    image:
      'https://images.unsplash.com/photo-1726828537956-61ae115d7d7a?q=80&w=1932',
    category: 'smartphone',
    available: 6,
    sold: 2,
  },
  {
    id: 12,
    name: 'iPhone 16',
    price: 190100.0,
    image:
      'https://images.unsplash.com/photo-1726828537956-61ae115d7d7a?q=80&w=1932',
    category: 'smartphone',
    available: 6,
    sold: 2,
  },
  {
    id: 13,
    name: 'iPhone 16',
    price: 190100.0,
    image:
      'https://images.unsplash.com/photo-1726828537956-61ae115d7d7a?q=80&w=1932',
    category: 'smartphone',
    available: 6,
    sold: 2,
  },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [quantities, setQuantities] = useState({});
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

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
    setQuantities((q) => ({ ...q, [item.id]: 1 }));
  };

  const handleRemoveFromCart = (idx) => {
    setCart(cart => cart.filter((_, i) => i !== idx));
  };

  const handleIncreaseQty = (idx) => {
    setCart(cart => cart.map((item, i) =>
      i === idx ? { ...item, qty: item.qty + 1 } : item
    ));
  };

  const handleDecreaseQty = (idx) => {
    setCart(cart => cart.map((item, i) =>
      i === idx && item.qty > 1 ? { ...item, qty: item.qty - 1 } : item
    ));
  };

  const handleCheckout = () => {
    setCart([]);
    alert('Order placed!');
  };

  // Filter menu items based on search term and selected category
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'phones' && item.category === 'smartphone') ||
      (selectedCategory === 'laptops' && item.category === 'laptop') ||
      (selectedCategory === 'accessories' && item.category === 'accessory') ||
      (selectedCategory === 'monitors' && item.category === 'monitor') ||
      (selectedCategory === 'batteries' && item.category === 'battery') ||
      (selectedCategory === 'network' && item.category === 'network');
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#e4f4fa] to-[#f8fbff] overflow-x-hidden">
      {/* Main Content */}
      <main className="flex-1 min-w-0 px-4 py-6 overflow-y-auto max-w-full transition-all duration-300">
        {/* Search Bar */}
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full max-w-md">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search items..."
              className="w-full h-12 text-base px-12 pr-3 rounded-xl border border-blue-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white transition-all duration-200 hover:shadow-xl focus:shadow-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ boxShadow: '0 2px 16px 0 #b6e0fe33' }}
            />
            <MagnifyingGlassIcon className="w-6 h-6 text-blue-300 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
          <div className="flex items-center gap-2 ml-4">
            <img
              src="https://ui-avatars.com/api/?name=Manager&background=0492C2&color=fff"
              alt="Manager"
              className="w-8 h-8 rounded-full border-2 border-[#b6e0fe] shadow"
              style={{ boxShadow: '0 2px 8px 0 #b6e0fe33' }}
            />
            <div className="hidden sm:block leading-tight text-[11px]">
              <div className="font-semibold text-[#0492C2]">Manager</div>
              <div className="text-gray-500 text-[10px]">Abcde</div>
            </div>
          </div>
        </div>

        {/* Home Heading */}
        <h1 className="text-2xl font-bold mb-4 text-[#0492C2] tracking-wide drop-shadow home-title-anim">Home</h1>

        {/* Categories */}
        <div className="mb-5">
          <h2 className="text-xs font-semibold mb-2 text-[#0492C2]">Categories</h2>
         <div className="overflow-x-auto">
  <div className="flex gap-2 w-max pb-1 px-1 h-16 items-center">
    {categories.map((category) => (
      <button
        key={category.id}
        onClick={() => setSelectedCategory(category.id)}
        className={`px-2 py-1 rounded-xl whitespace-nowrap text-[12px] border font-semibold shadow transition-all duration-200 flex items-center gap-1 ${
          selectedCategory === category.id
            ? 'bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white border-[#0492C2] scale-105 shadow-lg'
            : 'bg-white text-[#0492C2] hover:bg-[#e4f4fa] border-[#b6e0fe]'
        } hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0492C2]`}
        style={{
          boxShadow: selectedCategory === category.id
            ? '0 2px 12px 0 #b6e0fe55'
            : undefined,
        }}
      >
        <category.icon className="w-5 h-5 drop-shadow" />
        {category.name}
      </button>
    ))}
  </div>
</div>

        </div>

        {/* Menu Items */}
        <div>
          <h2 className="text-xs font-semibold mb-3 text-[#0492C2]">Select Menu</h2>
          <div
            className="
              grid 
              grid-cols-[repeat(auto-fit,minmax(170px,1fr))]
              gap-4
              animate-menu-pop
            "
          >
            {filteredMenuItems.map((item, idx) => (
              <div
                key={item.id}
                className="menu-card p-3 rounded-2xl border border-[#b6e0fe] bg-gradient-to-br from-[#f8fbff] to-[#e4f4fa] flex flex-col items-center text-[12px] overflow-hidden max-w-[200px] shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.04] menu-card-anim group"
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <div className="flex items-center w-full mb-2">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-10 rounded-xl bg-blue-50 object-cover mr-2 border border-[#b6e0fe] shadow group-hover:scale-110 transition-transform duration-300"
                    style={{ boxShadow: '0 2px 8px 0 #b6e0fe33' }}
                  />
                  <div className="font-semibold truncate text-[#0492C2] group-hover:text-blue-700 transition-colors duration-200">{item.name}</div>
                </div>
                <div className="w-full flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-blue-400 font-semibold group-hover:text-[#0492C2] transition-colors duration-200">
                      {item.available} Avail • {item.sold} Sold
                    </span>
                    <span className="font-bold text-[#0492C2] group-hover:text-blue-700 transition-colors duration-200">
                      LKR {item.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1">
                      <button
                        className="w-6 h-6 rounded-full bg-[#e4f4fa] flex items-center justify-center text-[14px] text-[#0492C2] font-bold border border-[#b6e0fe] hover:bg-[#b6e0fe] hover:text-white transition"
                        onClick={() => handleQuantityChange(item.id, -1)}
                        tabIndex={0}
                      >
                        -
                      </button>
                      <span className="text-[13px] font-semibold">{quantities[item.id] || 1}</span>
                      <button
                        className="w-6 h-6 rounded-full bg-[#e4f4fa] flex items-center justify-center text-[14px] text-[#0492C2] font-bold border border-[#b6e0fe] hover:bg-[#b6e0fe] hover:text-white transition"
                        onClick={() => handleQuantityChange(item.id, 1)}
                        tabIndex={0}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white px-3 py-1 rounded-xl text-[12px] font-bold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0492C2] scale-100 group-hover:scale-105"
                      onClick={() => handleAddToCart(item)}
                      tabIndex={0}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredMenuItems.length === 0 && (
              <div className="col-span-full text-center text-[#0492C2] font-semibold py-8 opacity-70">
                No items found.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bill Details Sidebar - right side */}
      <section className="flex-shrink-0 w-full max-w-md border-l border-gray-200 bg-white p-0 sm:p-4 overflow-y-auto flex flex-col justify-start z-10 shadow-2xl animate-fadein">
        <BillDetails
          cart={cart}
          onRemove={handleRemoveFromCart}
          onIncrease={handleIncreaseQty}
          onDecrease={handleDecreaseQty}
          onCheckout={handleCheckout}
        />
      </section>
      {/* Animations for home page */}
      <style>{`
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
        .animate-fadein {
          animation: fadein 1.2s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(24px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
}
