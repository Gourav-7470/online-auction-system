import React, { useState, useRef } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import {
  PlusCircle,
  DollarSign,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Upload,
  Trash2,
  Star,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Camera,
} from 'lucide-react';
import auctionApi from '../api/auctionApi';
import Input from '../components/Input';
import Button from '../components/Button';
import {
  AUCTION_CATEGORIES,
  getAuctionImage,
  saveAuctionPhotos,
  validateProductPhotos,
  getCategorySamplePhotos,
} from '../utils/imageMapper';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export function CreateAuction() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const toast = useToast();

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Set default start time to now and end time to +3 days
  const now = new Date();
  const nowLocalString = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const future = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const futureLocalString = new Date(future.getTime() - future.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: AUCTION_CATEGORIES[1],
    startingPrice: '',
    startTime: nowLocalString,
    endTime: futureLocalString,
  });

  // Photos state for compulsory 2 or more product photos
  const [photos, setPhotos] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [urlInputError, setUrlInputError] = useState('');
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Primary validation function including compulsory 2+ photos requirement
  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Product name is required.';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Product name must be at least 3 characters.';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Item description is required.';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description should be at least 10 characters.';
    }

    const price = parseFloat(formData.startingPrice);
    if (!formData.startingPrice || isNaN(price) || price <= 0) {
      newErrors.startingPrice = 'Starting price must be a positive number greater than 0.';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Auction start date and time is required.';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'Auction end date and time is required.';
    } else if (formData.startTime && new Date(formData.endTime) <= new Date(formData.startTime)) {
      newErrors.endTime = 'End time must be set after the start time.';
    }

    // Compulsory check: minimum 2 product photos required
    const photoValidation = validateProductPhotos(photos);
    if (!photoValidation.isValid) {
      newErrors.photos = photoValidation.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Process and read local image files
  const handleFilesSelected = (files) => {
    if (!files || files.length === 0) return;
    const validFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));

    if (validFiles.length === 0) {
      toast.warning('Please select image files (JPEG, PNG, WEBP, etc.)');
      return;
    }

    const readPromises = validFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then((newImages) => {
      setPhotos((prev) => {
        const updated = [...prev, ...newImages];
        if (updated.length >= 2) {
          setErrors((errs) => ({ ...errs, photos: '' }));
        }
        return updated;
      });
      toast.success(`Added ${newImages.length} photo(s).`);
    });
  };

  const handleFileInputChange = (e) => {
    handleFilesSelected(e.target.files);
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer?.files) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  // Add photo via direct URL
  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setUrlInputError('Please enter an image URL.');
      return;
    }
    if (!/^https?:\/\/.+/i.test(trimmed)) {
      setUrlInputError('Please enter a valid HTTP or HTTPS image URL.');
      return;
    }

    setUrlInputError('');
    setPhotos((prev) => {
      const updated = [...prev, trimmed];
      if (updated.length >= 2) {
        setErrors((errs) => ({ ...errs, photos: '' }));
      }
      return updated;
    });
    setUrlInput('');
    toast.success('Photo added.');
  };

  // Fill sample high-res photos for category
  const handleAddSamplePhotos = () => {
    const samples = getCategorySamplePhotos(formData.category);
    setPhotos((prev) => {
      const combined = [...prev];
      for (const s of samples) {
        if (!combined.includes(s)) {
          combined.push(s);
        }
      }
      if (combined.length >= 2) {
        setErrors((errs) => ({ ...errs, photos: '' }));
      }
      return combined;
    });
    toast.info(`Loaded sample high-res photos for "${formData.category}".`);
  };

  // Remove photo
  const handleRemovePhoto = (indexToRemove) => {
    setPhotos((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      if (activePreviewIndex >= updated.length) {
        setActivePreviewIndex(Math.max(0, updated.length - 1));
      }
      if (updated.length < 2) {
        setErrors((errs) => ({
          ...errs,
          photos: 'Product photos are compulsory: You must add at least 2 photos to sell this product.',
        }));
      }
      return updated;
    });
  };

  // Set selected photo as primary cover photo (index 0)
  const handleSetCoverPhoto = (index) => {
    if (index === 0) return;
    setPhotos((prev) => {
      const target = prev[index];
      const remaining = prev.filter((_, idx) => idx !== index);
      return [target, ...remaining];
    });
    setActivePreviewIndex(0);
    toast.success('Primary cover photo updated.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      const photoCheck = validateProductPhotos(photos);
      if (!photoCheck.isValid) {
        toast.error(photoCheck.message);
        const section = document.getElementById('product-photos-section');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    try {
      setLoading(true);

      // Format ISO LocalDateTime expected by Java: "YYYY-MM-DDTHH:mm:ss"
      const formatLocalDateTime = (val) => {
        if (!val) return null;
        return val.length === 16 ? `${val}:00` : val;
      };

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startingPrice: Number(formData.startingPrice),
        currentPrice: Number(formData.startingPrice),
        startTime: formatLocalDateTime(formData.startTime),
        endTime: formatLocalDateTime(formData.endTime),
        status: new Date(formData.startTime) > new Date() ? 'UPCOMING' : 'ACTIVE',
      };

      const created = await auctionApi.createAuction(payload);

      // Persist compulsory 2+ product photos for this auction listing
      saveAuctionPhotos(created.id, photos);

      toast.success(`Auction "${created.title}" published successfully with ${photos.length} photos!`);
      navigate(`/auctions/${created.id}`);
    } catch (err) {
      console.error('Create auction error:', err);
      const msg =
        err.userMessage ||
        (err.response?.status === 403
          ? 'Access Denied: Backend Security policy requires an ADMIN role to create auctions. Please log in with an ADMIN account.'
          : 'Failed to create auction. Please check your input fields.');
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const previewImage =
    photos.length > 0
      ? photos[activePreviewIndex] || photos[0]
      : getAuctionImage({ title: formData.title, category: formData.category });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/auctions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Auctions</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Create New Auction Listing
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          List your luxury goods or collectibles with verified starting bids.
        </p>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-sm font-medium flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">{serverError}</div>
        </div>
      )}

      {/* Main Form and Preview Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Form Inputs (7 cols) */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <Input
            label="Product Name / Title"
            id="title"
            name="title"
            placeholder="e.g. 2024 Rolex Submariner Date 41mm"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            required
          />

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:border-indigo-600 bg-white dark:bg-slate-800"
              >
                {AUCTION_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Describe condition, specifications, provenance, and included accessories..."
              value={formData.description}
              onChange={handleChange}
              className={`w-full p-3.5 rounded-xl border text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 bg-white dark:bg-slate-800 sm:text-sm ${
                errors.description
                  ? 'border-rose-300 dark:border-rose-700 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/40'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.description}</p>
            )}
          </div>

          <Input
            label="Starting Reserve Price (₹)"
            id="startingPrice"
            name="startingPrice"
            type="number"
            step="any"
            placeholder="e.g. 15000"
            value={formData.startingPrice}
            onChange={handleChange}
            error={errors.startingPrice}
            icon={DollarSign}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startTime"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Start Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                id="startTime"
                name="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 bg-white dark:bg-slate-800"
              />
              {errors.startTime && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.startTime}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="endTime"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                End Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                id="endTime"
                name="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 bg-white dark:bg-slate-800"
              />
              {errors.endTime && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* COMPULSORY PRODUCT PHOTOS SECTION (2 or More Photos Compulsory) */}
          <div
            id="product-photos-section"
            className={`rounded-2xl border p-5 transition-all ${
              errors.photos
                ? 'border-rose-300 dark:border-rose-700 bg-rose-50/30 dark:bg-rose-950/20 ring-2 ring-rose-200 dark:ring-rose-900/40'
                : photos.length >= 2
                ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/15 dark:bg-emerald-950/20'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40'
            }`}
          >
            {/* Header & Status Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Product Photos</span>
                  </label>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    2+ Compulsory
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  At least <strong>2 photos</strong> are compulsory to verify condition and protect buyers.
                </p>
              </div>

              {/* Requirement Met Status Pill */}
              {photos.length >= 2 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-sm animate-fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{photos.length} Photos Added (Requirement Met)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-sm animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>
                    {photos.length === 0
                      ? '0 / 2 photos (2 compulsory)'
                      : '1 / 2 photos (1 more compulsory)'}
                  </span>
                </span>
              )}
            </div>

            {/* Drag & Drop File Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 bg-white dark:bg-slate-900 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/50 scale-[1.01]'
                  : errors.photos
                  ? 'border-rose-300 dark:border-rose-700 hover:border-rose-400 bg-rose-50/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileInputChange}
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span className="text-indigo-600 dark:text-indigo-400 underline">Upload photos from device</span> or drag & drop here
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Supports multiple JPG, PNG, WEBP files
                  </p>
                </div>
              </div>
            </div>

            {/* Quick URL Input and Sample Pack */}
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setUrlInputError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddUrl();
                      }
                    }}
                    placeholder="Or paste image URL (https://...)"
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                      urlInputError ? 'border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/30' : 'border-slate-300 dark:border-slate-700'
                    } text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 bg-white dark:bg-slate-800`}
                  />
                  {urlInputError && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{urlInputError}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 rounded-xl transition-colors shrink-0 shadow-sm"
                >
                  + Add URL
                </button>
                <button
                  type="button"
                  onClick={handleAddSamplePhotos}
                  className="px-3.5 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl transition-colors flex items-center justify-center gap-1.5 shrink-0"
                  title="Automatically add high-resolution sample photos for testing"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Sample Photos Pack</span>
                </button>
              </div>
            </div>

            {/* Compulsory Photo Error Alert */}
            {errors.photos && (
              <div className="mt-3 p-3 rounded-xl bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2 animate-bounce">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{errors.photos}</span>
              </div>
            )}

            {/* Added Photos Gallery Grid */}
            {photos.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Attached Product Photos ({photos.length})
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    Photo #1 is featured as the Cover Photo
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((photo, index) => {
                    const isCover = index === 0;
                    return (
                      <div
                        key={`${index}-${photo.slice(-20)}`}
                        className={`group relative rounded-xl overflow-hidden border-2 transition-all bg-slate-900 ${
                          isCover
                            ? 'border-indigo-600 shadow-md ring-2 ring-indigo-200 dark:ring-indigo-900/60'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <img
                          src={photo}
                          alt={`Product photo ${index + 1}`}
                          className="w-full h-24 sm:h-28 object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Badges */}
                        <div className="absolute top-1.5 left-1.5">
                          {isCover ? (
                            <span className="inline-flex items-center gap-1 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              Cover
                            </span>
                          ) : (
                            <span className="bg-slate-900/80 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded backdrop-blur-sm">
                              #{index + 1}
                            </span>
                          )}
                        </div>

                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                          {!isCover && (
                            <button
                              type="button"
                              onClick={() => handleSetCoverPhoto(index)}
                              className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-sm"
                              title="Set as main cover photo"
                            >
                              <Star className="w-3 h-3" />
                              <span>Make Cover</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="p-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-sm"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Link to="/auctions">
              <Button variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              icon={PlusCircle}
            >
              Publish Auction
            </Button>
          </div>
        </div>

        {/* Live Preview Card (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Live Card Preview
            </span>
            {photos.length >= 2 ? (
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                {photos.length} Photos Ready
              </span>
            ) : (
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                Compulsory: {2 - photos.length} more needed
              </span>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md flex flex-col">
            <div className="relative h-52 w-full overflow-hidden bg-slate-900 group">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Live Preview</span>
              </div>

              {photos.length > 0 && (
                <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-white/10">
                  {photos.length} Photo{photos.length > 1 ? 's' : ''}
                </div>
              )}

              {/* Prev / Next buttons in preview if multiple photos */}
              {photos.length > 1 && (
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setActivePreviewIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
                    }}
                    className="p-1 rounded-full bg-slate-900/80 text-white pointer-events-auto hover:bg-slate-900 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setActivePreviewIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
                    }}
                    className="p-1 rounded-full bg-slate-900/80 text-white pointer-events-auto hover:bg-slate-900 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Thumbnail Strip inside preview */}
              {photos.length > 1 && (
                <div className="absolute bottom-2 inset-x-2 flex items-center justify-center gap-1.5 p-1 bg-slate-950/70 backdrop-blur-sm rounded-lg">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActivePreviewIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        activePreviewIndex === i ? 'w-5 bg-indigo-400' : 'w-1.5 bg-white/60'
                      }`}
                      aria-label={`View photo ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 space-y-2">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                {formData.category}
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1">
                {formData.title || 'Untitled Auction Item'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2">
                {formData.description || 'Item description will appear here on the listing page.'}
              </p>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block uppercase">
                    Starting Bid
                  </span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    ₹{formData.startingPrice || '0'}
                  </span>
                </div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Explore Item</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateAuction;
