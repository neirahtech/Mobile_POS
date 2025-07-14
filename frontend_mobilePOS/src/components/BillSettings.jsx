import { useState, useEffect } from 'react';
import api from '../utils/axios';
import { useBranch } from '../context/BranchContext';

export default function BillSettings() {
  const { selectedBranch } = useBranch();
  const [settings, setSettings] = useState({
    defaultPaymentMethod: 'Cash',
    defaultDiscountType: 'percentage',
    defaultDiscountValue: 0,
    taxPercentage: 18,
    receiptFooter: 'Thank you for your business!',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line
  }, [selectedBranch?.id]);

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/billing-settings', {
        params: { branch_id: selectedBranch?.id || 1 }
      });
      if (res.data) setSettings(res.data);
    } catch (err) {
      setError('Failed to load billing settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/billing-settings', { ...settings, branch_id: selectedBranch?.id || 1 });
      setSuccess('Settings saved successfully!');
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSave}>
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Payment Method
          </label>
          <select
            className="input-field"
            name="defaultPaymentMethod"
            value={settings.defaultPaymentMethod}
            onChange={handleChange}
          >
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="QR">QR</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Discount Type
          </label>
          <select
            className="input-field"
            name="defaultDiscountType"
            value={settings.defaultDiscountType}
            onChange={handleChange}
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed (LKR)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Discount Value
          </label>
          <input
            type="number"
            className="input-field"
            name="defaultDiscountValue"
            value={settings.defaultDiscountValue}
            onChange={handleChange}
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tax Percentage (%)
          </label>
          <input
            type="number"
            className="input-field"
            name="taxPercentage"
            value={settings.taxPercentage}
            onChange={handleChange}
            min="0"
            max="100"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Receipt Footer Text
          </label>
          <textarea
            className="input-field min-h-[80px]"
            name="receiptFooter"
            value={settings.receiptFooter || ''}
            onChange={handleChange}
            placeholder="Enter receipt footer text"
            rows="3"
            maxLength="255"
          />
          <p className="mt-1 text-xs text-gray-500">
            {settings.receiptFooter?.length || 0}/255 characters
          </p>
        </div>
      </div>
      <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
        <button
          className="btn-primary"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
