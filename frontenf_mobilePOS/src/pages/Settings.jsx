import { useState } from 'react';
import { 
  UserIcon, 
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  BellIcon,
  PrinterIcon,
  CloudIcon
} from '@heroicons/react/24/outline';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'store', name: 'Store Settings', icon: BuildingStorefrontIcon },
    { id: 'billing', name: 'Billing', icon: CurrencyDollarIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'printer', name: 'Printer', icon: PrinterIcon },
    { id: 'backup', name: 'Backup', icon: CloudIcon },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>

      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex gap-4 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors border-2 ${
                activeTab === tab.id
                  ? 'bg-[#0492C2] text-white border-[#0492C2]'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border-[#0492C2]'
              }`}
            >
              <tab.icon className="w-5 h-5 inline-block mr-2" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6 border-2 border-[#E6F4F9]">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Profile Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input type="text" className="input-field" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input type="email" className="input-field" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input type="tel" className="input-field" placeholder="+94XXXXXXXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select className="input-field">
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>Cashier</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'store' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Store Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name
                </label>
                <input type="text" className="input-field" placeholder="My Store" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select className="input-field">
                  <option>LKR (Sri Lankan Rupee)</option>
                  <option>$ (USD)</option>
                  <option>€ (EUR)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Rate (%)
                </label>
                <input type="number" className="input-field" placeholder="18" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Zone
                </label>
                <select className="input-field">
                  <option>Asia/Colombo</option>
                  <option>UTC</option>
                  <option>Asia/Singapore</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Billing Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Payment Method
                </label>
                <select className="input-field">
                  <option>Cash</option>
                  <option>Card</option>
                  <option>QR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Prefix
                </label>
                <input type="text" className="input-field" placeholder="INV-" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Discount (%)
                </label>
                <input type="number" className="input-field" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receipt Footer Message
                </label>
                <textarea className="input-field" placeholder="Thank you for your business!" rows="3"></textarea>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Notification Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Low Stock Alerts</h3>
                  <p className="text-sm text-gray-500">Get notified when items are running low</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0492C2]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Daily Reports</h3>
                  <p className="text-sm text-gray-500">Receive daily sales reports</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0492C2]"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'printer' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Printer Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Printer
                </label>
                <select className="input-field">
                  <option>Thermal Printer</option>
                  <option>Laser Printer</option>
                  <option>Inkjet Printer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paper Size
                </label>
                <select className="input-field">
                  <option>80mm</option>
                  <option>58mm</option>
                  <option>A4</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Print Copies
                </label>
                <input type="number" className="input-field" placeholder="1" min="1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-Print
                </label>
                <div className="flex items-center mt-2">
                  <input type="checkbox" className="rounded text-[#0492C2]" />
                  <span className="ml-2 text-sm text-gray-600">Print receipt automatically after sale</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Backup & Restore</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Automatic Backup</h3>
                <p className="text-sm text-gray-500 mb-4">Configure automatic backup settings</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Backup Frequency
                    </label>
                    <select className="input-field">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Retention Period (days)
                    </label>
                    <input type="number" className="input-field" placeholder="30" />
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Manual Backup</h3>
                <p className="text-sm text-gray-500 mb-4">Create or restore backups manually</p>
                <div className="flex gap-4">
                  <button className="btn-primary">
                    Backup Now
                  </button>
                  <button className="btn-secondary">
                    Restore
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
          <div className="flex gap-4">
            <button className="btn-secondary">
              Cancel
            </button>
            <button className="btn-primary">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 