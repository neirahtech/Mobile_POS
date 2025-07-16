import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import api from '../utils/axios';

export default function NotificationModal({ isOpen, onClose, customerId }) {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Track last loaded template text to avoid overwriting user edits
  const lastLoadedTemplateText = useRef('');

  // Fetch notification templates
  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      setSelectedTemplate('');
      setCustomMessage('');
      lastLoadedTemplateText.current = '';
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/notification-templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  // Fetch template content when a template is selected
  useEffect(() => {
    const fetchTemplateContent = async () => {
      if (!selectedTemplate) {
        setCustomMessage('');
        lastLoadedTemplateText.current = '';
        return;
      }
      try {
        const res = await api.get(`/notification-templates/${selectedTemplate}`);
        const templateText = res.data.template_text || '';
        // Only update if the textarea is empty or matches the last loaded template
        if (
          !customMessage ||
          customMessage === lastLoadedTemplateText.current
        ) {
          setCustomMessage(templateText);
        }
        lastLoadedTemplateText.current = templateText;
      } catch (error) {
        setCustomMessage('');
        lastLoadedTemplateText.current = '';
        console.error('Failed to fetch template content:', error);
      }
    };
    fetchTemplateContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate]);

  const handleSendNotification = async () => {
    if (!customerId) return;

    setLoading(true);
    try {
      // Fetch customer data to replace template placeholders
      const customerRes = await api.get(`/customers/${customerId}`);
      const customer = customerRes.data;

      // Replace template placeholders with customer data
      let finalMessage = customMessage;
      if (customer) {
        // Replace common placeholders
        finalMessage = finalMessage
          .replace('{name}', customer.name || 'Customer')
          .replace('{year}', new Date().getFullYear())
          .replace('{discount}', customer.discount || '10%') // Default to 10% if not specified
          .replace('{birthday}', customer.dateOfBirth || '');
      }

      await api.post('/notifications', {
        customerId,
        message: finalMessage,
        templateId: selectedTemplate || null
      });

      alert('Notification sent successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to send notification:', error);
      
      // Log the full error response for debugging
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        // Show detailed error message from backend if available
        const errorMessage = error.response.data?.message || 'Failed to send notification';
        const errorDetails = error.response.data?.error || '';
        const twilioCode = error.response.data?.twilioCode ? ` (Code: ${error.response.data.twilioCode})` : '';
        
        alert(`${errorMessage}${twilioCode}\n${errorDetails}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        alert('No response from server. Please check your connection.');
      } else {
        console.error('Error setting up request:', error.message);
        alert('Error setting up notification request');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Send Notification</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message Template</label>
            <div className="relative">
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()} // Prevent event bubbling
                onMouseDown={(e) => e.stopPropagation()} // Prevent event bubbling
                onClick={(e) => e.stopPropagation()} // Prevent event bubbling
                placeholder="Type your message or select a template..."
                className="w-full p-2 border rounded h-32 focus:ring-2 focus:ring-[#0492C2] focus:border-transparent"
                rows={6}
                style={{ minHeight: '8rem' }}
              />
              {customMessage && (
                <button
                  type="button"
                  onClick={() => setCustomMessage('')}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  title="Clear message"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Available placeholders: {'{'}&#123;name&#125;{'}, '}
              {'{'}&#123;year&#125;{'}, '}
              {'{'}&#123;discount&#125;{'}, '}
              {'{'}&#123;birthday&#125;{'}'}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSendNotification}
              disabled={loading}
              className="px-4 py-2 bg-[#0492C2] text-white rounded hover:bg-[#037ba1] disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}