import React, { useState, useRef, useEffect } from 'react';
import './CampaignSection.css';

/**
 * CampaignSection Component
 * Provides a UI for business owners to create marketing campaigns.
 * 
 * Props:
 *   - onCreate: async function(formData) => void
 *     Called when campaign form is submitted.
 *     formData contains: { name, description, budget, rpm, platform, imageFile, imagePreviewUrl }
 *     If not provided, logs formData to console.
 * 
 * Example Usage:
 * <CampaignSection onCreate={async (data) => {
 *   // Upload image to Firebase Storage or backend
 *   // const uploadedImageUrl = await uploadToFirebase(data.imageFile);
 *   // Then save campaign to backend:
 *   // await fetch("/api/campaigns", {
 *   //   method: "POST",
 *   //   headers: { "Content-Type": "application/json" },
 *   //   body: JSON.stringify({
 *   //     name: data.name,
 *   //     description: data.description,
 *   //     budget: data.budget,
 *   //     rpm: data.rpm,
 *   //     platform: data.platform,
 *   //     imageUrl: uploadedImageUrl
 *   //   })
 *   // });
 * }} />
 */

const CampaignSection = ({ onCreate, hideHeader = false, onClose }) => {
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(hideHeader ? true : false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    rpm: '',
    platform: 'TikTok',
    imageFile: null
  });

  // Validation State
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Refs for focus management
  const createButtonRef = useRef(null);
  const modalContentRef = useRef(null);
  const nameInputRef = useRef(null);

  // Modal open handler - focus on first input
  const handleOpenModal = () => {
    setIsModalOpen(true);
    setErrors({});
    setTouched({});
    // Focus on first input after modal opens
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 100);
  };

  // Modal close handler - return focus to button
  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
    // Always call parent's onClose callback if provided
    if (onClose) {
      onClose();
    }
    if (createButtonRef.current && !hideHeader) {
      createButtonRef.current.focus();
    }
  };

  // Consolidated effect for keyboard and modal focus handling
  useEffect(() => {
    if (!isModalOpen && !hideHeader) return;

    // Handle ESC key to close modal
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
    };

    // Focus on name input when modal opens
    const focusTimer = setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 100);

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      clearTimeout(focusTimer);
    };
  }, [isModalOpen, hideHeader]);

  // Handle click outside modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      e.stopPropagation();
      handleCloseModal();
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Campaign name must be 100 characters or less';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }

    if (!formData.budget) {
      newErrors.budget = 'Budget is required';
    } else if (isNaN(parseFloat(formData.budget)) || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'Budget must be a positive number';
    }

    if (!formData.rpm) {
      newErrors.rpm = 'RPM is required';
    } else if (isNaN(parseFloat(formData.rpm)) || parseFloat(formData.rpm) <= 0) {
      newErrors.rpm = 'RPM must be a positive number';
    }

    return newErrors;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (touched[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle field blur to mark as touched
  const handleFieldBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    // Run validation on this field
    const newErrors = validateForm();
    if (newErrors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: newErrors[name]
      }));
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file is an image
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          image: 'Please select a valid image file'
        }));
        return;
      }

      // Clean up previous preview URL
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }

      // Create new preview and update both states together
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
      setImageFile(file);
      // Only update error if there was one
      setErrors(prev => prev.image ? { ...prev, image: '' } : prev);
      
      // Reset file input
      e.target.value = '';
    }
  };

  // Handle image replacement
  const handleRemoveImage = (e) => {
    if (e) {
      e.preventDefault();
    }
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    setImageFile(null);
    
    // Reset the file input
    const fileInput = document.getElementById('campaign-image');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      budget: '',
      rpm: '',
      platform: 'TikTok',
      imageFile: null
    });
    setErrors({});
    setTouched({});
    handleRemoveImage();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched to show validation errors
    const allFields = ['name', 'description', 'budget', 'rpm'];
    setTouched(allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));

    // Validate form
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare form data for submission
    const submissionData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      budget: parseFloat(formData.budget),
      rpm: parseFloat(formData.rpm),
      platform: formData.platform,
      imageFile: imageFile  // Pass the actual file object
    };

    try {
      setIsLoading(true);

      // Call onCreate callback if provided, otherwise log to console
      if (typeof onCreate === 'function') {
        await onCreate(submissionData);
      } else {
        console.log('Campaign form submitted:', submissionData);
      }

      // Close modal and reset form on success
      handleCloseModal();
    } catch (error) {
      console.error('Error submitting campaign:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to create campaign. Please try again.'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Determine if submit button should be disabled
  const isSubmitDisabled = isLoading || !formData.name.trim() || !formData.description.trim() || !formData.budget || !formData.rpm;

  return (
    <div className="campaign-section">
      {/* Campaign Header Section - Hidden when hideHeader is true */}
      {!hideHeader && (
        <div className="campaign-header">
          <div className="campaign-header-content">
            <h1>Marketing Campaigns</h1>
            <p>Create and manage your brand marketing campaigns with creators</p>
            <button
              ref={createButtonRef}
              onClick={handleOpenModal}
              className="create-campaign-btn"
              aria-label="Create a new marketing campaign"
            >
              ✨ Create Campaign
            </button>
          </div>
        </div>
      )}

      {/* Modal Overlay - Always show when hideHeader is true */}
      {(isModalOpen || hideHeader) && (
        <div
          className="campaign-modal-overlay"
          onClick={handleBackdropClick}
          onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); handleCloseModal(); } }}
          role="presentation"
          tabIndex={-1}
        >
          {/* Modal Content */}
          <div
            className="campaign-modal"
            ref={modalContentRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="campaign-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="campaign-modal-header">
              <h2 id="campaign-modal-title">Create Marketing Campaign</h2>
              <button
                className="campaign-modal-close"
                onClick={(e) => { e.stopPropagation(); handleCloseModal(); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); handleCloseModal(); } }}
                aria-label="Close dialog"
                type="button"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="campaign-modal-body">
              <form onSubmit={handleSubmit} className="campaign-form">
                {/* Campaign Name */}
                <div className="form-group">
                  <label htmlFor="campaign-name">Campaign Name *</label>
                  <input
                    ref={nameInputRef}
                    id="campaign-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    maxLength="100"
                    placeholder="e.g., Summer Beach Collection"
                    className={errors.name ? 'input-error' : ''}
                    required
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  <div className="char-counter">
                    {formData.name.length}/100
                  </div>
                  {errors.name && (
                    <p className="error-message" id="name-error">{errors.name}</p>
                  )}
                </div>

                {/* Campaign Image */}
                <div className="form-group">
                  <label htmlFor="campaign-image">Campaign Image</label>
                  <div className="image-upload-container">
                    {imagePreviewUrl ? (
                      <div className="image-preview-wrapper">
                        <img
                          src={imagePreviewUrl}
                          alt="Campaign preview"
                          className="image-preview"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="remove-image-btn"
                          aria-label="Remove image"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="campaign-image" className="image-upload-label">
                        <div className="image-upload-icon">📷</div>
                        <p>Click to upload image</p>
                        <span className="image-upload-hint">JPG, PNG (max 5MB)</span>
                        <span className="image-upload-hint">Recommended: 1200x628px</span>
                      </label>
                    )}
                    <input
                      id="campaign-image"
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="image-input"
                      aria-describedby={errors.image ? 'image-error' : undefined}
                    />
                  </div>
                  {errors.image && (
                    <p className="error-message" id="image-error">{errors.image}</p>
                  )}
                </div>

                {/* Description */}
                <div className="form-group">
                  <label htmlFor="campaign-description">Description / Requirements *</label>
                  <textarea
                    id="campaign-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    maxLength="500"
                    placeholder="Describe your campaign, target audience, and specific requirements..."
                    rows="6"
                    className={errors.description ? 'input-error' : ''}
                    required
                    aria-invalid={!!errors.description}
                    aria-describedby={errors.description ? 'description-error' : undefined}
                  />
                  <div className="char-counter">
                    {formData.description.length}/500
                  </div>
                  {errors.description && (
                    <p className="error-message" id="description-error">{errors.description}</p>
                  )}
                </div>

                {/* Budget and RPM in two columns */}
                <div className="form-row">
                  {/* Budget */}
                  <div className="form-group">
                    <label htmlFor="campaign-budget">Total Payout / Budget (₱) *</label>
                    <input
                      id="campaign-budget"
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      step="0.01"
                      min="0"
                      placeholder="e.g., 5000.00"
                      className={errors.budget ? 'input-error' : ''}
                      required
                      aria-invalid={!!errors.budget}
                      aria-describedby={errors.budget ? 'budget-error' : undefined}
                    />
                    {errors.budget && (
                      <p className="error-message" id="budget-error">{errors.budget}</p>
                    )}
                  </div>

                  {/* RPM */}
                  <div className="form-group">
                    <div className="label-with-tooltip">
                      <label htmlFor="campaign-rpm">RPM (₱) *</label>
                      <span
                        className="tooltip-icon"
                        title="Revenue Per 1000 views. Example: 15.00 = ₱15 per 1000 views"
                        role="tooltip"
                      >
                        ⓘ
                      </span>
                    </div>
                    <input
                      id="campaign-rpm"
                      type="number"
                      name="rpm"
                      value={formData.rpm}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      step="0.01"
                      min="0"
                      placeholder="e.g., 15.00"
                      className={errors.rpm ? 'input-error' : ''}
                      required
                      aria-invalid={!!errors.rpm}
                      aria-describedby={errors.rpm ? 'rpm-error' : undefined}
                    />
                    <p className="rpm-hint">
                      Revenue per 1000 views (e.g., 15.00 = ₱15 per 1k views)
                    </p>
                    {errors.rpm && (
                      <p className="error-message" id="rpm-error">{errors.rpm}</p>
                    )}
                  </div>
                </div>

                {/* Platform Selector */}
                <div className="form-group">
                  <label htmlFor="campaign-platform">Platform *</label>
                  <select
                    id="campaign-platform"
                    name="platform"
                    value={formData.platform}
                    onChange={handleInputChange}
                    className="platform-select"
                  >
                    <option value="TikTok">🎵 TikTok</option>
                    <option value="YouTube">▶️ YouTube</option>
                  </select>
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="error-alert">
                    <p>{errors.submit}</p>
                  </div>
                )}

                {/* Form Actions */}
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCloseModal(); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); handleCloseModal(); } }}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmitDisabled}
                    aria-busy={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create Campaign'}
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

export default CampaignSection;


