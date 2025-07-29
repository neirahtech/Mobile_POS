import {
  BsBoxSeamFill, BsStack, BsBarChartFill, BsGearFill,
  BsPeopleFill, BsBuilding, BsFillPieChartFill, BsArrowRightSquareFill,
  BsClipboard2CheckFill, BsBox2Fill, BsTagFill
} from 'react-icons/bs';
import { Link, useLocation } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Sales', icon: ChartBarIcon, path: '/' },
  { name: 'Inventory', icon: BsBoxSeamFill, path: '/inventory' },
  { name: 'Expenses', icon: BsStack, path: '/orders' },
  { name: 'Discounts', icon: BsTagFill, path: '/discounts' },
  { name: 'Customers', icon: BsPeopleFill, path: '/customers' },
  { name: 'Suppliers', icon: BsBuilding, path: '/suppliers' },
  { name: 'Reports', icon: BsFillPieChartFill, path: '/reports' },
  { name: 'Settings', icon: BsGearFill, path: '/settings' },
];

// ... (previous imports remain the same)

export default function Sidebar() {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes silver-blink {
        0% { opacity: 0.9; background-position: 0% 0%; filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.7)) brightness(1); }
        25% { opacity: 1; background-position: 50% 50%; filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.9)) brightness(1.1); }
        50% { opacity: 0.95; background-position: 100% 100%; filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.8)) brightness(1.05); }
        75% { opacity: 1; background-position: 50% 50%; filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.9)) brightness(1.1); }
        100% { opacity: 0.9; background-position: 0% 0%; filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.7)) brightness(1); }
      }

      .glass-silver-border {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(14px) saturate(180%);
        -webkit-backdrop-filter: blur(14px) saturate(180%);
        border-radius: 0.75rem;
        position: relative;
        border: none;
        overflow: hidden;
        box-shadow: 
          inset 1px 1px 2px rgba(255, 255, 255, 0.2),
          inset -1px -1px 2px rgba(0, 0, 0, 0.1),
          0 4px 8px rgba(0, 0, 0, 0.05);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        padding: 0.25rem; /* Reduced inner padding */
      }
      
      .glass-silver-border:hover {
        transform: translate3d(0, -2px, 10px) scale(1.02);
        box-shadow: 
          inset 2px 2px 4px rgba(255, 255, 255, 0.25),
          inset -2px -2px 4px rgba(0, 0, 0, 0.15),
          0 8px 16px rgba(0, 0, 0, 0.1);
        z-index: 10;
      }
      
      .glass-silver-border::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 0.7rem;
        padding: 5px; /* Increased border width */
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.9) 0%,
          rgba(230, 230, 230, 0.95) 15%,
          rgba(192, 192, 192, 0.95) 30%,
          rgba(150, 150, 150, 0.95) 50%,
          rgba(192, 192, 192, 0.95) 70%,
          rgba(230, 230, 230, 0.95) 85%,
          rgba(255, 255, 255, 0.9) 100%
        );
        -webkit-mask: 
          linear-gradient(#fff 0 0) content-box, 
          linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        animation: silver-blink 4s ease-in-out infinite;
      }
      
      .active-nav-item {
        background: linear-gradient(135deg, #7ed8fa 0%, #94aefe 100%);
        color: white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
      
      .active-nav-item .text-gray-700 {
        color: white;
      }
      
      .active-nav-item .text-gray-500 {
        color: white;
      }

      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      
      .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div 
      ref={sidebarRef}
      className="w-20 h-full flex flex-col bg-white/80 backdrop-blur-lg border-r border-gray-200/50 shadow-sm py-3 px-1.5 overflow-hidden"
    >
      {/* Navigation Items */}
      <div className="flex-1 flex flex-col space-y-2 overflow-y-auto no-scrollbar">
        {navigation.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative group flex flex-col items-center justify-center p-1 aspect-square w-full rounded-xl transition-all duration-300 overflow-hidden ${
                isActive 
                  ? 'bg-gradient-to-b from-[#0492c2] to-[#0b27b1] text-white shadow-[inset_0_6px_10px_rgba(0,0,0,0.7),0_0_12px_rgba(255,255,255,0.3)]'
                  : 'bg-white/80 text-gray-700 hover:text-[#0b27b1] shadow-[inset_0_0_6px_rgba(0,0,0,0.15),inset_0_0_4px_rgba(255,255,255,0.6)] hover:shadow-[inset_0_0_8px_rgba(0,0,0,0.2),inset_0_0_6px_rgba(255,255,255,0.7)]'
              }`}
              title={item.name}
            >
              <item.icon
                className={`w-6 h-6 mb-1 ${
                  isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
                }`}
                aria-hidden="true"
              />
              <span className="text-[10px] font-bold text-center leading-tight tracking-tight">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
      
      {/* Footer */}
      <div className="mt-auto pt-2 border-t border-gray-200/50">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            /* Add logout logic here */
          }}
          className="w-full flex flex-col items-center justify-center p-1.5 aspect-square rounded-xl transition-all duration-300 overflow-hidden bg-white/80 text-gray-700 hover:text-[#0b27b1] shadow-[inset_0_0_6px_rgba(0,0,0,0.15),inset_0_0_4px_rgba(255,255,255,0.6)] hover:shadow-[inset_0_0_8px_rgba(0,0,0,0.2),inset_0_0_6px_rgba(255,255,255,0.7)]"
          title="Logout"
        >
          <BsArrowRightSquareFill className="w-6 h-6 mb-1 text-gray-500 group-hover:text-[#0b27b1]" />
          <span className="text-[10px] font-bold leading-tight tracking-tight">Logout</span>
        </button>
      </div>
    </div>
  );
}