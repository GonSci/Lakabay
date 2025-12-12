import React, { useState, useRef, useEffect } from 'react';
import './EditCampaignModal.css';

/**
 * EditCampaignModal Component
 * Modal for editing existing campaigns with pre-filled data
 * 
 * Props:
 *   - campaign: campaign object to edit (required)
 *   - isOpen: boolean to show/hide modal
 *   - onClose: function called when modal closes
 *   - onUpdate: async function(campaignId, updatedData) => void
 */

// Image Upload Icon
const ImageUploadIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const EditCampaignModal = ({ campaign, isOpen, onClose, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [hasImageChanged, setHasImageChanged] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    rpm: '',
    platform: 'TikTok'
  });

  // Validation State
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Refs for focus management
  const modalContentRef = useRef(null);
  const nameInputRef = useRef(null);

  // Initialize form with campaign data when modal opens
  useEffect(() => {
    if (isOpen && campaign) {
      setFormData({
        name: campaign.name || '',
        description: campaign.description || '',
        budget: campaign.total_payout || campaign.budget || '',
        rpm: campaign.rpm || '',
        platform: campaign.platform || 'TikTok'
      });
      setImagePreviewUrl(campaign.imageUrl || null);
      setImageFile(null);
      setHasImageChanged(false);
      setErrors({});
      setTouched({});
      
      // Focus on first input after modal opens
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, campaign]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

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

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
      setImageFile(file);
      setHasImageChanged(true);
      // Clear error if there was one
      setErrors(prev => prev.image ? { ...prev, image: '' } : prev);
      
      // Reset file input
      e.target.value = '';
    }
  };

  // Handle image removal
  const handleRemoveImage = (e) => {
    if (e) {
      e.preventDefault();
    }
    setImagePreviewUrl(null);
    setImageFile(null);
    setHasImageChanged(true);
    
    // Reset the file input
    const fileInput = document.getElementById('edit-campaign-image');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    // Clean up preview URL if it's a blob URL
    if (imageFile && imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    setImageFile(null);
    setHasImageChanged(false);
    if (onClose) {
      onClose();
    }
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

    // Prepare updated data
    const updatedData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      budget: parseFloat(formData.budget),
      rpm: parseFloat(formData.rpm),
      platform: formData.platform,
      imageFile: imageFile || null, // null if no new image, file object if new image
      imageUrl: imageFile ? null : imagePreviewUrl, // keep old image if no new image
      hasImageChanged: hasImageChanged
    };

    try {
      setIsLoading(true);

      // Call onUpdate callback if provided
      if (typeof onUpdate === 'function') {
        await onUpdate(campaign.id, updatedData);
      }

      // Close modal on success
      handleCloseModal();
    } catch (error) {
      console.error('Error updating campaign:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to update campaign. Please try again.'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !campaign) {
    return null;
  }

  // Determine if submit button should be disabled
  const isSubmitDisabled = isLoading || !formData.name.trim() || !formData.description.trim() || !formData.budget || !formData.rpm;

  return (
    <div
      className="edit-campaign-modal-overlay"
      onClick={handleBackdropClick}
      onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); handleCloseModal(); } }}
      role="presentation"
      tabIndex={-1}
    >
      {/* Modal Content */}
      <div
        className="edit-campaign-modal"
        ref={modalContentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-campaign-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="edit-campaign-modal-header">
          <h2 id="edit-campaign-modal-title">Edit Campaign</h2>
          <button
            className="edit-campaign-modal-close"
            onClick={(e) => { e.stopPropagation(); handleCloseModal(); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); handleCloseModal(); } }}
            aria-label="Close dialog"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="edit-campaign-modal-body">
          <form onSubmit={handleSubmit} className="edit-campaign-form">
            {/* Campaign Name */}
            <div className="form-group">
              <label htmlFor="edit-campaign-name">Campaign Name *</label>
              <input
                ref={nameInputRef}
                id="edit-campaign-name"
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
                aria-describedby={errors.name ? 'edit-name-error' : undefined}
              />
              <div className="char-counter">
                {formData.name.length}/100
              </div>
              {errors.name && (
                <p className="error-message" id="edit-name-error">{errors.name}</p>
              )}
            </div>

            {/* Campaign Image */}
            <div className="form-group">
              <label htmlFor="edit-campaign-image">Campaign Image</label>
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
                  <label htmlFor="edit-campaign-image" className="image-upload-label">
                    <ImageUploadIcon />
                    <p>Click to upload image</p>
                    <span className="image-upload-hint">JPG, PNG (max 5MB)</span>
                    <span className="image-upload-hint">Recommended: 1200x680px</span>
                  </label>
                )}
                <input
                  id="edit-campaign-image"
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="image-input"
                  aria-describedby={errors.image ? 'edit-image-error' : undefined}
                />
              </div>
              {errors.image && (
                <p className="error-message" id="edit-image-error">{errors.image}</p>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="edit-campaign-description">Description / Requirements *</label>
              <textarea
                id="edit-campaign-description"
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
                aria-describedby={errors.description ? 'edit-description-error' : undefined}
              />
              <div className="char-counter">
                {formData.description.length}/500
              </div>
              {errors.description && (
                <p className="error-message" id="edit-description-error">{errors.description}</p>
              )}
            </div>

            {/* Budget and RPM in two columns */}
            <div className="form-row">
              {/* Budget */}
              <div className="form-group">
                <label htmlFor="edit-campaign-budget">Total Payout / Budget (₱) *</label>
                <input
                  id="edit-campaign-budget"
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
                  aria-describedby={errors.budget ? 'edit-budget-error' : undefined}
                />
                {errors.budget && (
                  <p className="error-message" id="edit-budget-error">{errors.budget}</p>
                )}
              </div>

              {/* RPM */}
              <div className="form-group">
                <div className="label-with-tooltip">
                  <label htmlFor="edit-campaign-rpm">RPM (₱) *</label>
                  <span
                    className="tooltip-icon"
                    title="Revenue Per 1000 views. Example: 15.00 = ₱15 per 1000 views"
                    role="tooltip"
                  >
                    ⓘ
                  </span>
                </div>
                <input
                  id="edit-campaign-rpm"
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
                  aria-describedby={errors.rpm ? 'edit-rpm-error' : undefined}
                />
                <p className="rpm-hint">
                  Revenue per 1000 views (e.g., 15.00 = ₱15 per 1k views)
                </p>
                {errors.rpm && (
                  <p className="error-message" id="edit-rpm-error">{errors.rpm}</p>
                )}
              </div>
            </div>

            {/* Platform Selector */}
            <div className="form-group">
              <label htmlFor="edit-campaign-platform">Platform *</label>
              <select
                id="edit-campaign-platform"
                name="platform"
                value={formData.platform}
                onChange={handleInputChange}
                className="platform-select"
              >
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
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
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCampaignModal;
