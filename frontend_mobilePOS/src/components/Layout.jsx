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
      {/* Animated Floating Elements */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="floating-shape floating-shape-1" />
      </div>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-md"
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
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
            bg-gradient-to-br from-[#e4f4fa] via-white to-[#b6e0fe]
            rounded-lg shadow-lg
            home-main-3d
          `} style={{backdropFilter: 'blur(2px)', margin: '12px'}}>
            <Outlet />
          </div>
        </div>
      </main>
      {/* Floating Shapes CSS and Layout Background */}
      <style>{`
        .layout-bg {
          background: linear-gradient(120deg, #e4f4fa 0%, #f8fbff 100%);
        }
        .floating-shape {
          position: absolute;
          border-radius: 50%;
          opacity: 0.15;
          filter: blur(2px);
          animation: float 8s ease-in-out infinite alternate;
        }
        .floating-shape-1 {
          width: 150px; height: 150px;
          background: linear-gradient(135deg, #0492C2 60%, #e4f4fa 100%);
          top: 5%; left: 5%;
          animation-delay: 0s;
        }
        @keyframes float {
          0% { transform: translateY(0) scale(1);}
          100% { transform: translateY(-20px) scale(1.05);}
        }
        .animate-fadein {
          animation: fadein 0.8s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(16px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .home-main-3d {
          box-shadow: 0 4px 24px 0 rgba(4,146,194,0.1), 0 1px 0 0 #b6e0fe;
          transition: box-shadow 0.3s cubic-bezier(.4,0,.2,1), transform 0.3s cubic-bezier(.4,0,.2,1);
          animation: homePopIn 0.6s cubic-bezier(.4,0,.2,1);
        }
        .home-main-3d:hover {
          box-shadow: 0 8px 32px 0 rgba(4,146,194,0.15), 0 2px 16px 0 #b6e0fe33;
          transform: translateY(-2px) scale(1.005) perspective(800px) rotateX(1deg);
        }
        @keyframes homePopIn {
          from { opacity: 0; transform: scale(0.98) translateY(24px);}
          to { opacity: 1; transform: scale(1) translateY(0);}
        }
      `}</style>
    </div>
  );
}