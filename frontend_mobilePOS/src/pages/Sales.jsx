import { useState } from 'react';
import SalesAnalytics from '../components/SalesAnalytics';
import SalesDetails from '../components/SalesDetails';
import { ChartBarIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

export default function Sales() {
  const [activeTab, setActiveTab] = useState('details');

  return (
    <div className="w-full flex flex-col items-center min-h-[calc(100vh-60px)] bg-gradient-to-br from-[#e4f4fa] to-[#f8fbff] py-8 px-2 gap-8">
      <div className="w-full max-w-6xl bg-white/90 rounded-2xl shadow-2xl border border-[#b6e0fe] p-6 relative animate-fadein mb-4">
        {/* Rectangle Heading */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-[#0492C2] tracking-wide flex items-center gap-2">
            <span>Sales</span>
            <span className="block w-12 md:w-16 h-1 rounded bg-gradient-to-r from-[#0492C2] to-[#b6e0fe]"></span>
          </h1>
        </div>
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-xs shadow transition-all duration-200 ${
              activeTab === 'details'
                ? 'bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white'
                : 'bg-[#f8fbff] text-[#0492C2] hover:bg-[#e4f4fa]'
            }`}
            onClick={() => setActiveTab('details')}
          >
            <ClipboardDocumentListIcon className="w-4 h-4" />
            Sales Details
          </button>
          <button
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-xs shadow transition-all duration-200 ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white'
                : 'bg-[#f8fbff] text-[#0492C2] hover:bg-[#e4f4fa]'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            <ChartBarIcon className="w-4 h-4" />
            Sales Analytics
          </button>
        </div>
        {/* Tab Content */}
        <div className="p-0">
          {activeTab === 'analytics' && (
            <div className="rounded-lg border border-[#b6e0fe] bg-white/80 shadow mb-8 p-6">
              <SalesAnalytics />
            </div>
          )}
          {activeTab === 'details' && (
            <div className="rounded-lg border border-[#b6e0fe] bg-white/80 shadow mb-8 p-6">
              <SalesDetails />
            </div>
          )}
        </div>
      </div>
      <style>{`
        .animate-fadein {
          animation: fadein 0.7s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(24px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
}