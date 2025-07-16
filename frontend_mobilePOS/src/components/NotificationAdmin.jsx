import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Check, XCircle } from 'lucide-react';
import api from '../utils/axios';

const NotificationAdmin = () => {
  const [templates, setTemplates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'SMS',
    triggerEvent: '',
    message: '',
    status: true
  });

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      const res = await api.get('/notification-templates');
      setTemplates(res.data);
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await api.put(`/notification-templates/${editingTemplate.id}`, formData);
      } else {
        await api.post('/notification-templates', formData);
      }
      setShowModal(false);
      setEditingTemplate(null);
      setFormData({
        name: '',
        type: 'SMS',
        triggerEvent: '',
        message: '',
        status: true
      });
      fetchTemplates();
    } catch (err) {
      console.error('Error saving template:', err);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      triggerEvent: template.trigger_event,
      message: template.template_text,
      status: template.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await api.delete(`/notification-templates/${id}`);
        fetchTemplates();
      } catch (err) {
        console.error('Error deleting template:', err);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#0492C2]">Notification Templates</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold shadow hover:from-[#037ba1] hover:to-[#b6e0fe] transition"
        >
          <Plus className="w-5 h-5" />
          Add Template
        </button>
      </div>

      {/* Templates Table */}
      <div className="bg-white rounded-lg border border-[#b6e0fe] shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-[#0492C2]">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="p-6 text-center text-gray-400">No templates found.</div>
        ) : (
          <table className="min-w-full divide-y divide-[#e0eefa]">
            <thead className="bg-[#e4f4fa]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#03648a] uppercase tracking-wider">
                  Template Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#03648a] uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#03648a] uppercase tracking-wider">
                  Trigger Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#03648a] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#03648a] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#e0eefa]">
              {templates.map((template) => (
                <tr key={template.id} className="hover:bg-[#f8fbff]">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#03648a]">
                    {template.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#03648a]">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      template.type === 'SMS' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {template.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#03648a]">
                    {template.trigger_event}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      template.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(template)}
                      className="text-[#0492C2] hover:text-[#037ba1] mr-3"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#03648a]">
                  {editingTemplate ? 'Edit Template' : 'Add New Template'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingTemplate(null);
                    setFormData({
                      name: '',
                      type: 'SMS',
                      triggerEvent: '',
                      message: '',
                      status: true
                    });
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#03648a] mb-1">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                    placeholder="e.g., EMI Reminder"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#03648a] mb-1">
                      Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                      required
                    >
                      <option value="SMS">SMS</option>
                      <option value="WhatsApp">WhatsApp</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#03648a] mb-1">
                      Trigger Event *
                    </label>
                    <select
                      name="triggerEvent"
                      value={formData.triggerEvent}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                      required
                    >
                      <option value="">Select an event</option>
                      <option value="EMI_DUE">EMI Due Reminder</option>
                      <option value="WARRANTY_EXPIRY">Warranty Expiry</option>
                      <option value="SERVICE_UPDATE">Service Update</option>
                      <option value="BIRTHDAY_GREETING">Birthday Greeting</option>
                      <option value="PROMOTION">Promotional Offer</option>
                      <option value="CUSTOM">Custom</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#03648a] mb-1">
                    Message Template *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition"
                    placeholder="Example: Dear {name}, your {product} warranty expires on {expiry_date}."
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Available variables: {'{name}'}, {'{order_id}'}, {'{due_date}'}, {'{amount}'}, etc.
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="status"
                    name="status"
                    checked={formData.status}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-[#0492C2] focus:ring-[#0492C2] border-[#e0eefa] rounded"
                  />
                  <label htmlFor="status" className="ml-2 block text-sm text-[#03648a]">
                    Active Template
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingTemplate(null);
                      setFormData({
                        name: '',
                        type: 'SMS',
                        triggerEvent: '',
                        message: '',
                        status: true
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-[#0492C2] to-[#b6e0fe] text-white rounded-lg font-semibold hover:from-[#037ba1] hover:to-[#b6e0fe] transition"
                  >
                    {editingTemplate ? 'Update Template' : 'Save Template'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationAdmin;