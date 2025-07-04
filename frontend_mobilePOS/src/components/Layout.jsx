import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/home' || location.pathname === '/';

  return (
    <div className="flex h-screen overflow-hidden relative layout-bg">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-md border border-[#0492C2]/20 hover:border-[#0492C2]/40 transition-all duration-300"
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="w-6 h-6 text-[#0492C2]" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-[#0492C2]" />
        )}
      </button>

      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 lg:relative lg:translate-x-0
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar />
      </div>
      
      <main className="flex-1 relative w-full z-10 overflow-hidden">
        <div className={`h-full flex ${isHomePage ? 'flex-col lg:flex-row' : ''}`}>
          {/* Main content area */}
          <div className={`
            flex-1 overflow-y-auto
            ${isHomePage ? 'p-2 lg:p-4' : 'p-2 lg:p-4'}
            ${isHomePage ? 'mt-14 lg:mt-0' : 'mt-14 lg:mt-0'}
            ${!isHomePage ? 'max-w-full' : ''}
            animate-fadein
            bg-gradient-to-br from-white via-[#f8fbff] to-[#e4f4fa]
            rounded-2xl shadow-2xl
            home-main-3d
            border border-[#0492C2]/10
            backdrop-blur-sm
          `} style={{margin: '12px'}}>
            <Outlet />
          </div>
        </div>
      </main>
      {/* Layout Background */}
      <style>{`
        .layout-bg {
          background: linear-gradient(135deg, #ffffff 0%, #f8fbff 50%, #e4f4fa 100%);
        }
        .animate-fadein {
          animation: fadein 0.8s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(16px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .home-main-3d {
          box-shadow: 
            0 20px 40px rgba(4,146,194,0.08),
            0 8px 16px rgba(4,146,194,0.06),
            0 0 0 1px rgba(4,146,194,0.05);
          transition: all 0.3s cubic-bezier(.4,0,.2,1);
          animation: homePopIn 0.6s cubic-bezier(.4,0,.2,1);
        }
        .home-main-3d:hover {
          box-shadow: 
            0 25px 50px rgba(4,146,194,0.12),
            0 12px 24px rgba(4,146,194,0.08),
            0 0 0 1px rgba(4,146,194,0.1);
          transform: translateY(-2px) scale(1.005);
        }
        @keyframes homePopIn {
          from { opacity: 0; transform: scale(0.98) translateY(24px);}
          to { opacity: 1; transform: scale(1) translateY(0);}
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(4,146,194,0.1); }
          50% { border-color: rgba(4,146,194,0.3); }
        }
        .border-glow {
          animation: borderGlow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}