import { useState } from 'react';
import { PlusIcon, PencilSquareIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { BsGrid, BsPhone, BsWatch, BsPlug } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

export default function Items() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('Collection');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

  const menuItems = [
    {
      id: 1,
      name: 'iPhone 16 Pro Max',
      price: 245000.0,
      image: 'https://images.unsplash.com/photo-1726587912121-ea21fcc57ff8?q=80&w=2080',
      category: 'smartphone',
      available: 10,
      sold: 4,
    },
    {
      id: 2,
      name: 'Samsung Galaxy S23 Ultra',
      price: 130500.0,
      image: 'https://images.unsplash.com/photo-1676115724686-476a7337dfb6?q=80&w=1923',
      category: 'smartphone',
      available: 8,
      sold: 5,
    },
    {
      id: 3,
      name: 'Apple Watch Series 8',
      price: 65000.0,
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1964',
      category: 'Accessory',
      available: 15,
      sold: 12,
    },
    {
      id: 4,
      name: 'Samsung Galaxy S23 Ultra',
      price: 130500.0,
      image: 'https://images.unsplash.com/photo-1676115724686-476a7337dfb6?q=80&w=1923',
      category: 'smartphone',
      available: 8,
      sold: 28,
    },
    {
      id: 5,
      name: 'Sony Wireless Headphones',
      price: 28000.0,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070',
      category: 'Accessory',
      available: 7,
      sold: 15,
    },
  ];

  // Sorting function
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting
  const sortedItems = [...menuItems].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Filtering
  const filteredItems = sortedItems.filter((item) => {
    return item.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get sort indicator
  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? '↑' : '↓';
    }
    return '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 min-h-screen bg-gradient-to-br from-[#f0f9ff] to-[#e1f5fe]">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i} 
            className="absolute rounded-full opacity-5 animate-float"
            style={{
              backgroundColor: '#0492C2',
              width: `${Math.random() * 60 + 20}px`,
              height: `${Math.random() * 60 + 20}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 15 + 15}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Page Header */}
      
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3">
          {[
            { id: 'Collection', name: 'Collection', icon: <BsGrid className="w-4 h-4" /> },
            { id: 'Inventory', name: 'Inventory', icon: <BsPhone className="w-4 h-4" /> },
            { id: 'Variants', name: 'Variants', icon: <BsWatch className="w-4 h-4" /> },
            { id: 'Gift Cards', name: 'Gift Cards', icon: <BsPlug className="w-4 h-4" /> },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white shadow'
                  : 'bg-white text-[#03648a] hover:bg-[#e4f4fa] border border-[#e0eefa]'
              }`}
            >
              {section.icon}
              {section.name}
            </button>
          ))}
        </div>
        <div className="space-y-6 pt-2">
      
        
        {/* Search and Add Button */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search items..."
              className="text-sm border border-[#e0eefa] rounded-lg pl-10 pr-4 py-2.5 w-full bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-[#b6e0fe] focus:border-transparent transition hover:border-[#b6e0fe] shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MagnifyingGlassIcon className="w-4 h-4 text-[#7f8c8d] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          
          <button
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg shadow hover:shadow-md transition-all"
          >
            <PlusIcon className="w-4 h-4 text-white" />
            <span className="font-medium text-sm">Add Item</span>
          </button>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow border border-[#e0eefa] overflow-hidden">
        <div className="p-4 border-b border-[#e0eefa] flex justify-between items-center">
          <h2 className="text-base font-bold text-[#03648a]">Product List</h2>
          <div className="flex items-center gap-1">
            <button className="text-[#03648a] hover:text-[#0492C2] p-1.5 rounded-md hover:bg-[#e4f4fa]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="text-[#03648a] hover:text-[#0492C2] p-1.5 rounded-md hover:bg-[#e4f4fa]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M7 12h10M5 18h14" />
              </svg>
            </button>
          </div>
        </div>
        
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-[#0492C2]/10 to-[#b6e0fe]/10 border-b border-[#e0eefa]">
            <tr>
              <th 
                className="text-left py-3 px-4 text-xs font-medium text-[#03648a] uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('name')}
              >
                <div className="flex items-center gap-1">
                  Item {getSortIndicator('name')}
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 text-xs font-medium text-[#03648a] uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('price')}
              >
                <div className="flex items-center gap-1">
                  Price {getSortIndicator('price')}
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 text-xs font-medium text-[#03648a] uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('available')}
              >
                <div className="flex items-center gap-1">
                  Stock {getSortIndicator('available')}
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 text-xs font-medium text-[#03648a] uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('category')}
              >
                <div className="flex items-center gap-1">
                  Category {getSortIndicator('category')}
                </div>
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-[#03648a] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e0eefa]/50">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-[#f0f9ff]/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#e0eefa] shadow-sm">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[#03648a] font-medium block text-sm">{item.name}</span>
                        <span className="text-xs text-[#7f8c8d]">ID: {item.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#03648a] font-medium text-sm">Rs. {item.price.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.available > 5 
                          ? 'bg-green-100 text-green-800' 
                          : item.available > 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {item.available} pcs
                      </span>
                      <div className="w-20 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            item.available > 5 ? 'bg-green-500' : item.available > 0 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, (item.available / (item.available + item.sold)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#e4f4fa] text-[#03648a] border border-[#e0eefa]">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => navigate(`/items/edit/${item.id}`)}
                        className="p-1.5 rounded-md bg-[#e4f4fa] text-[#03648a] hover:bg-[#b6e0fe] transition-colors"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-md bg-[#e4f4fa] text-[#03648a] hover:bg-[#b6e0fe] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-12 text-[#7f8c8d]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#b6e0fe]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-lg font-medium text-[#03648a]">No items found</p>
                    <p className="text-xs max-w-md text-center">Try adjusting your search or filter to find what you're looking for</p>
                    <button 
                      className="mt-2 px-3 py-1.5 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg shadow hover:shadow-md transition text-sm"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear Search
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Animation Styles */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-12px) rotate(3deg);
          }
          100% {
            transform: translateY(0) rotate(0deg);
          }
        }
        
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}