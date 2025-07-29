import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/home' || location.pathname === '/';

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header - Full width */}
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block w-20 h-full flex-shrink-0">
          <Sidebar />
        </div>
        
        {/* Mobile sidebar */}
        <div className="lg:hidden fixed inset-y-0 left-0 z-40">
          <Sidebar />
        </div>
        
        {/* Main content area - takes remaining width */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main content */}
          <main className="flex-1 overflow-y-auto w-full">
            <div className={`h-full w-full ${isHomePage ? 'flex flex-col lg:flex-row' : ''}`}>
              <div className={`
                w-full h-full
                ${!isHomePage ? 'p-4 animate-fadein' : 'pl-0'}
                ${!isHomePage ? 'bg-gradient-to-br from-white via-[#f8fbff] to-[#e4f4fa]' : ''}
                ${!isHomePage ? 'rounded-2xl shadow-2xl home-main-3d border border-[#0492C2]/10 backdrop-blur-sm' : ''}
              `}>
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
      
      {/* Layout Background */}
      <style>{`
        .layout-bg {
          background: linear-gradient(135deg, #f8fbff 0%, #e4f4fa 100%);
        }
        .home-main-3d {
          transform: perspective(1000px) rotateX(0.5deg);
        }
      `}</style>
    </div>
  );
}