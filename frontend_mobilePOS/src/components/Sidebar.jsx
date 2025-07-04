import {
  BsBoxSeamFill, BsStack, BsBarChartFill, BsGearFill,
  BsPeopleFill, BsBuilding, BsFillPieChartFill, BsArrowRightSquareFill,
  BsClipboard2CheckFill, BsBox2Fill, BsTagFill
} from 'react-icons/bs';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
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

export default function Sidebar() {
  const location = useLocation();
  const { isSidebarCollapsed, setIsSidebarCollapsed } = usePOS();
  const [openDropdown, setOpenDropdown] = useState(null);
  const sidebarRef = useRef(null);

  const handleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div 
      ref={sidebarRef}
      className={`${
        isSidebarCollapsed ? 'w-16' : 'w-52'
      } h-screen flex flex-col transition-all duration-300 ease-in-out relative cursor-pointer sidebar-modern border-r border-[#7ed8fa]/40 shadow-xl sidebar-glow`}
      style={{
        background: 'linear-gradient(135deg, #f8fbff 0%, #e4f4fa 100%)',
        boxShadow: '0 8px 32px #7ed8fa33, 0 4px 16px #94aefe22, 0 0 0 2px #7ed8fa44'
      }}
    >
      {/* Header */}
      <div className="p-3 border-b border-[#7ed8fa]/40 header-section flex items-center justify-between">
        <div className="flex items-center gap-2 w-full">
          <span
            className={`text-xl font-bold sidebar-logo-text tracking-wide ${isSidebarCollapsed ? 'text-center w-full' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            POS
          </span>
        </div>
        {/* Removed collapse/expand icon */}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-1 mt-2">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={(e) => e.stopPropagation()}
                className={`nav-link group flex items-center gap-3 rounded-xl px-3 py-2 font-medium transition-all duration-300 sidebar-link-glow ${
                  isActive
                    ? 'bg-gradient-to-r from-[#7ed8fa]/40 to-[#94aefe]/30 text-[#0492C2] shadow-lg border border-[#7ed8fa]/60 active-nav'
                    : 'hover:bg-[#7ed8fa]/10 text-[#0492C2]/80 hover:text-[#0492C2] hover:shadow-md hover:border hover:border-[#7ed8fa]/40'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title={isSidebarCollapsed ? item.name : ''}
                style={{
                  boxShadow: isActive ? '0 4px 16px #7ed8fa33' : undefined
                }}
              >
                <item.icon className={`transition-all duration-300 group-hover:scale-110 drop-shadow-lg ${
                  isActive ? 'text-[#0492C2]' : 'text-[#0492C2]/70 group-hover:text-[#0492C2]'
                } w-6 h-6`} />
                {!isSidebarCollapsed && <span className="ml-1 text-sm font-semibold">{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="mt-auto p-2 border-t-0">
        <div className="mb-8">
          <div className="flex justify-center">
            <div
              className="w-12 h-1 rounded-full decoration-line"
              style={{
                background: 'linear-gradient(to right, #7ed8fa66, #94aefe 60%, #7ed8fa66)',
                opacity: 1,
                filter: 'blur(1px)'
              }}
            />
          </div>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            /* Add logout logic here */
          }}
          className={`w-full flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-lg border border-[#7ed8fa]/40 text-[#0492C2] hover:bg-gradient-to-r hover:from-[#e4f4fa] hover:to-[#b6e0fe] hover:text-[#03648a] rounded-xl transition-all duration-300 group shadow-lg neumorph-logout hover:shadow-xl ${
            isSidebarCollapsed ? 'justify-center' : ''
          }`}
          title={isSidebarCollapsed ? 'Logout' : ''}
          style={{
            boxShadow: '0 4px 12px #7ed8fa22'
          }}
        >
          <div className="relative">
            <BsArrowRightSquareFill className="w-5 h-5 transition-all duration-300 group-hover:translate-x-1 text-[#0492C2] group-hover:text-[#03648a] drop-shadow-lg" />
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#0492C2] rounded-full border-1.5 border-white pulse-dot"></div>
          </div>
          {!isSidebarCollapsed && <span className="font-semibold tracking-wide text-xs">Logout</span>}
        </button>
      </div>

      {/* Enhanced Styles */}
      <style>{`
        .sidebar-modern {
          background: linear-gradient(135deg, #f8fbff 0%, #e4f4fa 100%);
          backdrop-filter: blur(10px);
        }
        .sidebar-glow {
          box-shadow: 0 0 0 2px #7ed8fa, 0 0 16px 2px #94aefe;
        }
        .sidebar-logo-text {
          background: linear-gradient(135deg, #7ed8fa 0%, #94aefe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: logoGlow 2s ease-in-out infinite alternate;
          letter-spacing: 2px;
        }
        @keyframes logoGlow {
          from { filter: drop-shadow(0 0 2px #7ed8fa88); }
          to { filter: drop-shadow(0 0 8px #94aefe); }
        }
        .sidebar-link-glow {
          box-shadow: 0 0 0 1px #7ed8fa22;
        }
        .sidebar-link-glow:hover, .sidebar-link-glow:focus-within {
          box-shadow: 0 0 0 2px #7ed8fa, 0 0 8px 2px #94aefe;
        }
        .active-nav {
          position: relative;
          overflow: hidden;
        }
        .active-nav::before {
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
        .decoration-line {
          animation: lineGlow 3s ease-in-out infinite;
        }
        @keyframes lineGlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .pulse-dot {
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        .neumorph-logout {
          box-shadow:
            0 4px 12px #7ed8fa22,
            0 2px 4px #94aefe11;
        }
        .nav-link:hover {
          transform: translateY(-1px);
        }
        .nav-link:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
