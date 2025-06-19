import {
  BsHouseDoorFill, BsBoxSeamFill, BsStack, BsBarChartFill, BsGearFill, 
  BsPeopleFill, BsTagFill, BsFillPieChartFill, BsArrowRightSquareFill,
  BsClipboard2CheckFill, BsBox2Fill
} from 'react-icons/bs';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const navigation = [
  { name: 'Home', icon: BsHouseDoorFill, path: '/' },
  { name: 'Items', icon: BsBoxSeamFill, path: '/items' },
  { name: 'GRN', icon: BsClipboard2CheckFill, path: '/grn' },
  { name: 'Stock', icon: BsBox2Fill, path: '/stock' },
  { name: 'Order list', icon: BsStack, path: '/orders' },
  { name: 'Sales', icon: BsBarChartFill, path: '/sales' },
  { name: 'Customers', icon: BsPeopleFill, path: '/customers' },
  { name: 'Discounts', icon: BsTagFill, path: '/discounts' },
  { name: 'Reports', icon: BsFillPieChartFill, path: '/reports' },
  { name: 'Settings', icon: BsGearFill, path: '/settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div 
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } h-screen flex flex-col transition-all duration-300 ease-in-out relative sidebar-modern`}
      style={{
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: '0 8px 32px 0 rgba(4,146,194,0.12), 0 1.5px 0 0 #e0eefa'
      }}
    >
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-12 bg-white border border-blue-100 rounded-full p-1.5 hover:bg-blue-50 shadow-md"
      >
        {isCollapsed ? (
          <ChevronRightIcon className="w-4 h-4 text-blue-400" />
        ) : (
          <ChevronLeftIcon className="w-4 h-4 text-blue-400" />
        )}
      </button>

      {/* Header - reduced padding */}
      <div className="p-3 border-b border-blue-100">
        <div className="flex items-center gap-2">
          <span className={`text-xl font-bold text-[#0492C2] floating-logo drop-shadow-md tracking-wide ${isCollapsed ? 'text-center w-full' : ''}`}>
            {isCollapsed ? 'POS' : 'POS'}
          </span>
        </div>
      </div>

      {/* Navigation - increased gap between items */}
      <nav className="flex-1 px-2 py-1">
        <div className="space-y-2"> {/* Increased from space-y-0.5 to space-y-2 */}
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`nav-link group flex items-center gap-2 rounded-xl px-3 py-2 font-medium ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0492C2]/90 to-[#b6e0fe]/90 text-white shadow-lg'
                    : 'hover:bg-blue-100/60 text-[#0492C2] hover:shadow-md'
                } ${isCollapsed ? 'justify-center' : ''} transition-all duration-200`}
                title={isCollapsed ? item.name : ''}
                style={{
                  boxShadow: isActive ? '0 2px 12px 0 rgba(4,146,194,0.13)' : undefined
                }}
              >
                {/* Fixed icon size - same in both states */}
                <item.icon className={`transition-transform duration-300 group-hover:scale-110 drop-shadow-lg ${
                  isActive ? 'text-white' : 'text-[#0492C2]'
                } w-6 h-6`} />
                {!isCollapsed && <span className="ml-1 text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer - reduced padding */}
      <div className="mt-auto p-2 border-t-0">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-1 rounded-full bg-gradient-to-r from-[#b6e0fe] via-[#0492C2] to-[#b6e0fe] opacity-60 blur-[1px]" />
        </div>
        <button 
          onClick={() => {/* Add logout logic here */}}
          className={`w-full flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-lg border border-blue-100 text-[#0492C2] hover:bg-gradient-to-r hover:from-[#e4f4fa] hover:to-[#b6e0fe] hover:text-[#03648a] rounded-xl transition-all duration-200 group shadow-lg neumorph-logout ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Logout' : ''}
          style={{
            boxShadow: '0 2px 12px 0 rgba(4,146,194,0.13)'
          }}
        >
          <div className="relative">
            <BsArrowRightSquareFill className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1 text-[#0492C2] group-hover:text-[#03648a] drop-shadow-lg" />
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-400 rounded-full border-1.5 border-white"></div>
          </div>
          {!isCollapsed && <span className="font-semibold tracking-wide text-xs">Logout</span>}
        </button>
      </div>
      
      {/* Floating logo animation and sidebar background */}
      <style>{`
        .floating-logo {
          animation: floatingLogo 3.5s ease-in-out infinite alternate;
        }
        @keyframes floatingLogo {
          0% { transform: translateY(0);}
          100% { transform: translateY(-8px);}
        }
        .sidebar-modern {
          background: linear-gradient(135deg, #f8fbff 60%, #e4f4fa 100%);
          border-right: 1.5px solid #e0eefa;
        }
        .neumorph-logout {
          box-shadow:
            0 2px 12px 0 rgba(4,146,194,0.13),
            0 1.5px 0 0 #e0eefa,
            0 1.5px 8px 0 #b6e0fe33;
        }
      `}</style>
    </div>
  );
}