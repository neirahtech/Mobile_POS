import { PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

export default function AddItem() {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([
    { value: 'smartphones', label: 'Smartphones' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'tablets', label: 'Tablets' }
  ]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [trackStock, setTrackStock] = useState(false);
  const [variantsEnabled, setVariantsEnabled] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const selectedCategory = watch('category', '');

  const handleAddCategory = () => {
    if (
      newCategory.trim() &&
      !categories.some(c => c.label.toLowerCase() === newCategory.trim().toLowerCase())
    ) {
      const value = newCategory.trim().toLowerCase().replace(/\s+/g, '-');
      setCategories([...categories, { value, label: newCategory.trim() }]);
    }
    setShowCategoryModal(false);
    setNewCategory('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      
      // Append all form data except image
      Object.keys(data).forEach(key => {
        if (key === 'image') {
          if (data[key] && data[key][0]) {
            formData.append('image', data[key][0]);
          }
        } else {
          formData.append(key, data[key]);
        }
      });

      // Add stock-related fields if tracking is enabled
      if (trackStock) {
        formData.append('inStock', data.inStock || '0');
        formData.append('lowStockAlert', data.lowStockAlert || '0');
      }

      const response = await axios.post('http://localhost:5000/api/items', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        alert('Item added successfully!');
        navigate('/items');
      }
    } catch (error) {
      console.error('Error details:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to add item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fbff] to-[#e4f4fa] py-6 px-4 overflow-hidden">
      {/* Floating Elements Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Floating bubbles */}
        {[...Array(15)].map((_, i) => (
          <div 
            key={i} 
            className="absolute rounded-full opacity-10 animate-float"
            style={{
              backgroundColor: '#b6e0fe',
              width: `${Math.random() * 100 + 30}px`,
              height: `${Math.random() * 100 + 30}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 15 + 15}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
        
        {/* Floating triangles */}
        {[...Array(8)].map((_, i) => (
          <div 
            key={`tri-${i}`} 
            className="absolute opacity-5 animate-float"
            style={{
              width: 0,
              height: 0,
              borderLeft: `${Math.random() * 30 + 20}px solid transparent`,
              borderRight: `${Math.random() * 30 + 20}px solid transparent`,
              borderBottom: `${Math.random() * 50 + 30}px solid #0492C2`,
              top: `${Math.random() * 100}%`,
              right: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 20 + 20}s`,
              animationDelay: `${Math.random() * 5}s`,
              animationDirection: 'reverse'
            }}
          />
        ))}
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-5 bg-white/80 backdrop-blur-sm rounded-xl shadow border border-[#e0eefa]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/inventory')}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-[#e0eefa] rounded-lg hover:bg-[#f0f9ff] transition-all duration-300 shadow-sm hover:shadow text-[#0492C2] font-medium hover:border-[#b6e0fe]"
              type="button"
            >
              <ArrowLeftIcon className="w-5 h-5 text-[#0492C2]" />
              <span>Back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#03648a]">Add New Stock</h1>
              <p className="text-[#7f8c8d] mt-1 text-sm">Fill out the details below to add a new stock</p>
            </div>
          </div>
          <button
            className="px-5 py-3 bg-gradient-to-r from-[#0492C2]/90 to-[#b6e0fe]/90 text-white font-bold rounded-lg shadow hover:shadow-md transition-all duration-300 flex items-center gap-2 disabled:opacity-70 group"
            type="submit"
            form="add-item-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-white transform transition-transform group-hover:scale-110" 
                  viewBox="0 0 20 20"
                  style={{ filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.3))" }}
                >
                  <path 
                    fillRule="evenodd" 
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                    clipRule="evenodd"
                    fill="currentColor"
                  />
                </svg>
                Save Product
              </>
            )}
          </button>
        </div>

        <form id="add-item-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
          {/* Item Details Card */}
          <div className="bg-white/80 backdrop-blur-sm p-5 space-y-5 rounded-xl shadow border border-[#e0eefa] transition-all hover:shadow-lg">
            <div className="flex flex-wrap items-center justify-between pb-2 border-b border-[#e0eefa]">
              <h2 className="text-xl font-bold text-[#03648a] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#0492C2]/90 to-[#b6e0fe]/90 flex items-center justify-center shadow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0492C2] to-[#b6e0fe]">
                  Stock Details
                </span>
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-2 py-1 bg-gradient-to-r from-white to-[#e4f4fa] text-[#0492C2] rounded-full border border-[#e0eefa]">
                  All fields required
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Model Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">Model Name</label>
                <input
                  type="text"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition ${
                    errors.name ? 'border-red-300 ring-2 ring-red-100 bg-red-50' : 'border-[#e0eefa] hover:border-[#b6e0fe]'
                  }`}
                  placeholder="Enter model name"
                  {...register('name', { required: 'Model Name is required' })}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1 flex items-center">
                  Category
                  <button
                    type="button"
                    className="ml-2 text-[#0492C2] hover:text-[#03648a] hover:underline flex items-center text-sm font-medium"
                    onClick={() => setShowCategoryModal(true)}
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Add
                  </button>
                </label>
                <select
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition ${
                    errors.categoryCode ? 'border-red-300 ring-2 ring-red-100 bg-red-50' : 'border-[#e0eefa] hover:border-[#b6e0fe]'
                  }`}
                  {...register('categoryCode', { required: 'Category is required' })}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {errors.categoryCode && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.categoryCode.message}
                  </p>
                )}
              </div>

              

             

              {/* Model */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">Model</label>
                <input
                  type="text"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition ${
                    errors.model ? 'border-red-300 ring-2 ring-red-100 bg-red-50' : 'border-[#e0eefa] hover:border-[#b6e0fe]'
                  }`}
                  placeholder="Enter model number"
                  {...register('model', { required: 'Model is required' })}
                />
                {errors.model && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.model.message}
                  </p>
                )}
              </div>

              {/* Barcode */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">Barcode</label>
                <input
                  type="text"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition ${
                    errors.barcode ? 'border-red-300 ring-2 ring-red-100 bg-red-50' : 'border-[#e0eefa] hover:border-[#b6e0fe]'
                  }`}
                  placeholder="Enter barcode number"
                  {...register('barcode')}
                />
                {errors.barcode && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.barcode.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-[#03648a] mb-1">Description</label>
                <textarea
                  className={`w-full px-4 py-2.5 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition hover:border-[#b6e0fe] ${
                    errors.description ? 'border-red-300 ring-2 ring-red-100 bg-red-50' : ''
                  }`}
                  placeholder="Enter item description"
                  rows={4}
                  {...register('description')}
                />
              </div>
            </div>
          </div>

          {/* Inventory Section */}
          <div className="bg-white/80 backdrop-blur-sm p-5 space-y-5 rounded-xl shadow border border-[#e0eefa] transition-all hover:shadow-lg">
            <div className="flex flex-wrap items-center justify-between pb-2 border-b border-[#e0eefa]">
              <h2 className="text-xl font-bold text-[#03648a] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#0492C2]/90 to-[#b6e0fe]/90 flex items-center justify-center shadow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0492C2] to-[#b6e0fe]">
                  Inventory Management
                </span>
              </h2>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={trackStock}
                  onChange={() => setTrackStock(!trackStock)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#b6e0fe]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#0492C2] peer-checked:to-[#b6e0fe]"></div>
                <span className="ml-3 text-sm font-medium text-[#03648a]">Track stock</span>
              </label>
            </div>

            {trackStock && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#03648a] mb-1">In stock</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition hover:border-[#b6e0fe]"
                    placeholder="Enter quantity"
                    {...register('inStock', {
                      required: trackStock ? 'In stock quantity required' : false,
                      min: { value: 0, message: 'Cannot be negative' }
                    })}
                  />
                  {errors.inStock && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.inStock.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#03648a] mb-1">Low stock alert</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition hover:border-[#b6e0fe]"
                    placeholder="Enter minimum quantity"
                    {...register('lowStockAlert', {
                      required: trackStock ? 'Low stock alert required' : false,
                      min: { value: 0, message: 'Cannot be negative' }
                    })}
                  />
                  {errors.lowStockAlert && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.lowStockAlert.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Image Upload Section */}
          <div className="bg-white/80 backdrop-blur-sm p-5 space-y-5 rounded-xl shadow border border-[#e0eefa] transition-all hover:shadow-lg">
            <h2 className="text-xl font-bold text-[#03648a] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#0492C2]/90 to-[#b6e0fe]/90 flex items-center justify-center shadow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0492C2] to-[#b6e0fe]">
                Product Image
              </span>
            </h2>
            <div 
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                imagePreview ? 'border-[#b6e0fe] bg-[#f0f9ff]/50' : 'border-[#e0eefa] hover:border-[#b6e0fe] bg-[#f8fbff]/50 hover:bg-[#f0f9ff]/50'
              }`}
            >
              <input
                type="file"
                className="hidden"
                id="image-upload"
                accept="image/*"
                {...register('image', { required: 'Image is required' })}
                onChange={handleImageChange}
              />
              <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center">
                {imagePreview ? (
                  <div className="relative w-48 h-48 mx-auto overflow-hidden rounded-lg shadow border border-[#e0eefa]">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex flex-col items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white mb-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-white font-medium">Change Image</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gradient-to-r from-[#0492C2]/90 to-[#b6e0fe]/90 rounded-lg flex items-center justify-center mx-auto mb-3 shadow">
                      <PlusIcon className="w-8 h-8 text-white" />
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-[#7f8c8d] font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-[#95a5a6] mt-1">PNG, JPG up to 5MB</p>
                    </div>
                    <button 
                      type="button"
                      className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-[#e0eefa] rounded-lg text-[#0492C2] font-medium hover:bg-[#e4f4fa] hover:border-[#b6e0fe] transition"
                    >
                      Browse Files
                    </button>
                  </>
                )}
              </label>
              {errors.image && (
                <p className="text-red-500 text-sm mt-4 flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.image.message}
                </p>
              )}
            </div>
          </div>

          {/* Variants Section */}
          <div className="bg-white/80 backdrop-blur-sm p-5 space-y-5 rounded-xl shadow border border-[#e0eefa] transition-all hover:shadow-lg">
            <div className="flex flex-wrap items-center justify-between pb-2 border-b border-[#e0eefa]">
              <h2 className="text-xl font-bold text-[#03648a] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#0492C2]/90 to-[#b6e0fe]/90 flex items-center justify-center shadow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0492C2] to-[#b6e0fe]">
                  Product Variants
                </span>
              </h2>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={variantsEnabled}
                  onChange={() => setVariantsEnabled(!variantsEnabled)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#b6e0fe]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#0492C2] peer-checked:to-[#b6e0fe]"></div>
                <span className="ml-3 text-sm font-medium text-[#03648a]">Enable specs</span>
              </label>
            </div>

            {variantsEnabled && (
              <div className="space-y-4 bg-[#f0f9ff]/50 p-4 rounded-lg border border-[#e0eefa]">
                <div>
                  <label className="block text-sm font-medium text-[#03648a] mb-2">
                    Select Variant Type
                  </label>
                  <select className="w-full px-4 py-2.5 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition hover:border-[#b6e0fe]">
                    <option value="" disabled>
                      Choose a variant type
                    </option>
                    <option value="color">Color</option>
                    <option value="storage">Storage Capacity</option>
                    <option value="ram">RAM Size</option>
                    <option value="network">Network Support</option>
                    <option value="warranty">Warranty Period</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#03648a] mb-2">
                    Variant Options (comma separated)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition hover:border-[#b6e0fe]"
                    placeholder="e.g., Black, White, Blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#03648a] mb-2">
                    Price Adjustment (optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition hover:border-[#b6e0fe]"
                    placeholder="e.g., 50.00"
                  />
                  <p className="text-xs text-[#95a5a6] mt-2">
                    Extra cost added for this variant option.
                  </p>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Add Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity">
            <div className="bg-white/90 backdrop-blur-lg rounded-xl p-5 w-96 max-w-full border border-[#e0eefa] shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-[#03648a]">Add Category</h3>
                <button 
                  onClick={() => {
                    setShowCategoryModal(false);
                    setNewCategory('');
                  }}
                  className="text-[#95a5a6] hover:text-[#7f8c8d]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-[#e0eefa] rounded-lg focus:ring-2 focus:ring-[#0492C2] focus:border-transparent transition mb-3"
                placeholder="Category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 text-[#03648a] font-medium rounded-lg border border-[#e0eefa] bg-white/80 backdrop-blur-sm hover:bg-[#e4f4fa] transition"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setNewCategory('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2.5 bg-gradient-to-r from-[#0492C2]/90 to-[#b6e0fe]/90 text-white font-bold rounded-lg shadow hover:shadow-md transition flex items-center gap-2 disabled:opacity-70"
                  onClick={handleAddCategory}
                  disabled={!newCategory.trim()}
                >
                  <PlusIcon className="w-4 h-4 text-white" />
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Animation Styles */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
          100% {
            transform: translateY(0) rotate(0deg);
          }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}