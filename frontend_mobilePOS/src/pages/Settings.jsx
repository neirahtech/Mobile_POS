import { useState, useRef, useEffect } from 'react';
import { 
  UserIcon, 
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  BellIcon,
  UserGroupIcon,
  CloudIcon
} from '@heroicons/react/24/outline';
import api from '../utils/axios';
import BranchManager from '../components/BranchManager';
import BranchSelector from '../components/BranchSelector';
import UserManagement from '../components/UserManagement';
import BillSettings from '../components/BillSettings';
import { useBranch } from '../context/BranchContext';
import { useStore } from '../context/StoreContext';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    email: '',
    businessType: '',
    logo: null,
    logoPreview: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fileInputRef = useRef();
  const { selectedBranch } = useBranch();
  const { storeInfo, updateStoreInfo } = useStore();

  // Initialize form data when storeInfo is available
  useEffect(() => {
    if (storeInfo) {
      setFormData({
        name: storeInfo.name || '',
        code: storeInfo.code || '',
        email: storeInfo.email || '',
        businessType: storeInfo.businessType || '',
        logo: null,
        logoPreview: storeInfo.logo || null,
      });
      setLoading(false);
    }
  }, [storeInfo]);

  const handleStoreInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logo: file,
          logoPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoRemove = () => {
    setFormData(prev => ({
      ...prev,
      logo: null,
      logoPreview: null
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveStoreInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('code', formData.code);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('businessType', formData.businessType);
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }

      const response = await api.post('/store', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.store) {
        // Update the global store info with the complete store object from the server
        updateStoreInfo(response.data.store);

        // Update local form data
        setFormData(prev => ({
          ...prev,
          logoPreview: response.data.store.logo || prev.logoPreview
        }));

        toast.success('Store information updated successfully!', {
          position: 'bottom-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      console.error('Error updating store info:', err);
      setError(err.response?.data?.message || 'Failed to update store information');
      toast.error('Failed to update store information', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'store', name: 'Store Settings', icon: BuildingStorefrontIcon },
    { id: 'users', name: 'User Management', icon: UserGroupIcon },
    { id: 'billing', name: 'Billing', icon: CurrencyDollarIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'backup', name: 'Backup', icon: CloudIcon },
  ];

  return (
    <div className="max-w-5xl mx-auto border rounded-lg bg-white shadow-sm">
      {/* Container for heading */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
      </div>

      {/* Tabs on next line */}
      <nav className="border-b border-gray-200 px-6 flex space-x-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              inline-flex items-center px-4 py-2 border-b-2 
              transition-colors whitespace-nowrap
              ${
                activeTab === tab.id
                  ? 'border-[#0277bd] text-[#01579b] font-semibold bg-blue-50'
                  : 'border-transparent text-gray-800 hover:text-[#0277bd] hover:border-[#0277bd]'
              }
            `}
          >
            <tab.icon className="w-5 h-5 mr-2" />
            {tab.name}
          </button>
        ))}
      </nav>

      {loading && (
        <div className="p-8 text-center text-gray-700">Loading...</div>
      )}
      {error && (
        <div className="p-4 text-center text-red-600">{error}</div>
      )}
      {!loading && !error && (
        <div className="card p-6 border-2 border-[#E6F4F9]">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Profile Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Full Name
                  </label>
                  <input type="text" className="input-field" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Email
                  </label>
                  <input type="email" className="input-field" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Phone
                  </label>
                  <input type="tel" className="input-field" placeholder="+94XXXXXXXXX" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
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
            <>
              <form className="space-y-10" onSubmit={handleSaveStoreInfo}>
                {/* Store Info */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Store Info</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Store Name
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        name="name"
                        value={formData.name}
                        onChange={handleStoreInfoChange}
                        placeholder="My Store"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Store Code
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        name="code"
                        value={formData.code}
                        onChange={handleStoreInfoChange}
                        placeholder="ST001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        className="input-field"
                        name="email"
                        value={formData.email}
                        onChange={handleStoreInfoChange}
                        placeholder="store@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Business Type
                      </label>
                      <select
                        className="input-field"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleStoreInfoChange}
                      >
                        <option value="">Select</option>
                        <option>Retail</option>
                        <option>Restaurant</option>
                        <option>Wholesale</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Logo Upload
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          className="input-field"
                          style={{ width: 'auto' }}
                          ref={fileInputRef}
                          onChange={handleLogoChange}
                        />
                        {formData.logoPreview && (
                          <div className="relative">
                            <img
                              src={formData.logoPreview}
                              alt="Logo Preview"
                              className="w-16 h-16 object-cover rounded border"
                            />
                            <button
                              type="button"
                              className="absolute -top-2 -right-2 bg-white border rounded-full p-1 text-xs"
                              onClick={handleLogoRemove}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Branch Selection */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Branch Management</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Current Branch
                    </label>
                    <BranchSelector />
                    {selectedBranch && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Branch Code: {selectedBranch.code}</p>
                        <p>Address: {selectedBranch.address}</p>
                        <p>Contact: {selectedBranch.tel}</p>
                        <p>Manager: {selectedBranch.manager}</p>
                        <p>Status: 
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            selectedBranch.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedBranch.active ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                  <div className="flex gap-4">
                    <button className="btn-secondary" type="button" onClick={() => {
                      // Reset form to current store info
                      if (storeInfo) {
                        setFormData({
                          name: storeInfo.name || '',
                          code: storeInfo.code || '',
                          email: storeInfo.email || '',
                          businessType: storeInfo.businessType || '',
                          logo: null,
                          logoPreview: storeInfo.logo || null,
                        });
                      }
                    }}>
                      Cancel
                    </button>
                    <button className="btn-primary" type="submit">
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
              {/* Branch Management Section - Only show when store tab is active */}
              {activeTab === 'store' && (
                <div className="mt-6 mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Manage All Branches</h4>
                  <BranchManager />
                </div>
              )}
            </>
          )}

          {/* User Management Tab */}
          {activeTab === 'users' && (
            <div className="mt-6 mb-6">
              <UserManagement />
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Billing Settings</h2>
              <BillSettings />
            </div>
          )}

          {/* Notifications Tab */}
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
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0492C2]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Backup Tab */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Backup & Restore</h2>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Last Backup</h3>
                    <p className="text-sm text-gray-500">July 5, 2023 at 11:59 PM</p>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md">
                    Create Backup Now
                  </button>
                </div>
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Restore from Backup</h3>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    <button className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50">
                      Restore
                    </button>
                  </div>
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
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Default Printer
                  </label>
                  <select className="input-field">
                    <option>Thermal Printer</option>
                    <option>Laser Printer</option>
                    <option>Inkjet Printer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Paper Size
                  </label>
                  <select className="input-field">
                    <option>80mm</option>
                    <option>58mm</option>
                    <option>A4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Print Copies
                  </label>
                  <input type="number" className="input-field" placeholder="1" min="1" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
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
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Backup Frequency
                      </label>
                      <select className="input-field">
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
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
      )}
    </div>
  );
}