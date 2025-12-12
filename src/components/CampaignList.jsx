import React, { useState, useEffect, useRef } from 'react';
import './CampaignList.css';
import ConfirmationModal from './modals/ConfirmationModal';
import EditCampaignModal from './modals/EditCampaignModal';

/**
 * CampaignList Component
 * Displays all published campaigns with payout progress tracking.
 *
 * Props:
 *   - campaigns: array of campaign objects (required)
 *     Each campaign should contain:
 *       {
 *         id: string,
 *         name: string,
 *         description: string,
 *         imageUrl: string,
 *         platform: 'TikTok' | 'YouTube',
 *         total_payout: number (budget),
 *         distributed_payout: number (amount paid to creators),
 *         rpm: number,
 *         createdAt: ISO string
 *       }
 *   - onCreate: function called when "Create Campaign" button is clicked
 *   - onDelete: function called when delete is confirmed
 *   - onUpdate: async function(campaignId, updatedData) => void for updating campaigns
 *
 * Features:
 *   - Responsive grid layout (1-3 columns based on screen size)
 *   - Payout progress bar showing distributed vs total budget
 *   - Smooth animations and hover effects
 *   - Full accessibility support
 *   - Expanded campaign details modal
 *
 * Example Usage:
 * <CampaignList campaigns={campaignArray} onCreate={() => openModal()} />
 */

// TikTok Logo Icon
const TikTokIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.82 2.89 2.89 0 0 1 5.1-1.81V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 5.1 2.81 6.59 6.59 0 0 0 5.87-3.8A6.45 6.45 0 0 0 19 14.9V9.35a8.16 8.16 0 0 0 2.91 2.04v-3.72a4.3 4.3 0 0 1-.32-.03z"/>
  </svg>
);

// YouTube Logo Icon
const YouTubeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

// Edit Icon
const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

// Delete Icon
const DeleteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const CampaignList = ({ campaigns, onCreate, onDelete, onUpdate }) => {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, campaignId: null });
  const [editingCampaign, setEditingCampaign] = useState(null);

  // If campaigns is empty or not provided, return null
  if (!campaigns || campaigns.length === 0) {
    return null;
  }

  /**
   * Compute distributed payout if not provided by backend.
   * Formula: total_impressions * rpm / 1000
   * If neither distributed_payout nor impressions available, returns 0.
   */
  const getDistributedPayout = (campaign) => {
    if (campaign.distributed_payout !== undefined && campaign.distributed_payout !== null) {
      return campaign.distributed_payout;
    }
    // Fallback: compute from impressions and RPM if available
    if (campaign.total_impressions && campaign.rpm) {
      return (campaign.total_impressions * campaign.rpm) / 1000;
    }
    // Default: no payout distributed yet
    return 0;
  };

  /**
   * Calculate payout percentage for progress bar.
   */
  const getPayoutPercentage = (campaign) => {
    const distributed = getDistributedPayout(campaign);
    const total = campaign.total_payout || campaign.budget || 0;
    if (total === 0) return 0;
    return Math.min((distributed / total) * 100, 100);
  };

  /**
   * Format date to readable format (e.g., "Dec 12, 2024")
   */
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  /**
   * Truncate text to specified length with ellipsis.
   */
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleViewDetails = (campaign, e) => {
    e.stopPropagation();
    setSelectedCampaign(campaign);
  };

  const handleCloseDetails = () => {
    setSelectedCampaign(null);
  };

  const handleMenuToggle = (campaignId, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === campaignId ? null : campaignId);
  };

  const handleEditCampaign = (campaign, e) => {
    e.stopPropagation();
    setEditingCampaign(campaign);
    setOpenMenuId(null);
  };

  const handleDeleteCampaign = (campaignId, e) => {
    e.stopPropagation();
    setDeleteConfirm({ isOpen: true, campaignId });
    setOpenMenuId(null);
  };

  const handleConfirmDelete = () => {
    const campaignId = deleteConfirm.campaignId;
    if (onDelete && typeof onDelete === 'function') {
      const success = onDelete(campaignId);
      if (success) {
        console.log('Campaign deleted successfully:', campaignId);
        // Close details modal if it's open for this campaign
        if (selectedCampaign?.id === campaignId) {
          setSelectedCampaign(null);
        }
      } else {
        alert('Failed to delete campaign. Please try again.');
      }
    } else {
      console.error('onDelete callback not provided or not a function');
    }
    setDeleteConfirm({ isOpen: false, campaignId: null });
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, campaignId: null });
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };

    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  // Campaigns Grid
  return (
    <div className="campaign-list">
      <div className="campaigns-grid">
        {/* Create Campaign Button - First Item in Grid */}
        {onCreate && (
          <div className="campaign-create-card" onClick={onCreate} role="button" tabIndex={0} aria-label="Create a new campaign" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCreate(); } }}>
            <div className="create-card-icon">✨</div>
            <h3>Create New Campaign</h3>
            <p>Launch a new marketing campaign</p>
          </div>
        )}
        
        {campaigns.map((campaign) => {
          const distributedPayout = getDistributedPayout(campaign);
          const totalPayout = campaign.total_payout || campaign.budget || 0;
          const payoutPercentage = getPayoutPercentage(campaign);

          return (
            <article
              key={campaign.id}
              className="campaign-card"
              role="region"
              aria-label={`Campaign: ${campaign.name}`}
            >
              {/* Menu Button */}
              <div className="campaign-menu-container">
                <button
                  className="campaign-menu-button"
                  onClick={(e) => handleMenuToggle(campaign.id, e)}
                  aria-label="Campaign options menu"
                  type="button"
                >
                  ⋮
                </button>
                {openMenuId === campaign.id && (
                  <div className="campaign-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="campaign-menu-item"
                      onClick={(e) => handleEditCampaign(campaign, e)}
                      type="button"
                    >
                      <EditIcon />
                      <span>Edit</span>
                    </button>
                    <button
                      className="campaign-menu-item delete"
                      onClick={(e) => handleDeleteCampaign(campaign.id, e)}
                      type="button"
                    >
                      <DeleteIcon />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Campaign Image */}
              <div className="campaign-image-container">
                {campaign.imageUrl ? (
                  <img
                    src={campaign.imageUrl}
                    alt={`Campaign: ${campaign.name}`}
                    className="campaign-image"
                  />
                ) : (
                  <div className="campaign-image-placeholder">📸</div>
                )}
              </div>

              {/* Campaign Content */}
              <div className="campaign-content">
                {/* Platform Badge */}
                <div className="campaign-platform-badge">
                  {campaign.platform === 'TikTok' ? <TikTokIcon /> : <YouTubeIcon />}
                  <span>{campaign.platform}</span>
                </div>

                {/* Campaign Name */}
                <h3 className="campaign-name">{campaign.name}</h3>

                {/* Campaign Metadata */}
                <div className="campaign-metadata">
                  <div className="metadata-item">
                    <span className="metadata-label">Budget:</span>
                    <span className="metadata-value">₱{totalPayout.toLocaleString()}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Price per 1K Views:</span>
                    <span className="metadata-value">₱{campaign.rpm.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payout Progress Bar */}
                <div className="payout-section">
                  <div className="payout-label">
                    <span className="payout-title">Payout Progress</span>
                    <span className="payout-amount">
                      ₱{distributedPayout.toLocaleString(undefined, { maximumFractionDigits: 2 })} / ₱{totalPayout.toLocaleString()}
                    </span>
                  </div>
                  <div
                    className="payout-progress-container"
                    role="progressbar"
                    aria-valuenow={Math.round(payoutPercentage)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Payout progress: ${Math.round(payoutPercentage)}%`}
                  >
                    <div className="payout-progress-background">
                      <div
                        className="payout-progress-fill"
                        style={{ width: `${payoutPercentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="payout-percentage">
                    {Math.round(payoutPercentage)}% distributed
                  </div>
                </div>

                {/* View Details Button */}
                <button
                  onClick={(e) => handleViewDetails(campaign, e)}
                  className="view-details-btn"
                  aria-label={`View details for campaign: ${campaign.name}`}
                >
                  View Details
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div className="campaign-details-overlay" onClick={handleCloseDetails} onKeyDown={(e) => { if (e.key === 'Escape') handleCloseDetails(); }}>
          <div className="campaign-details-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="campaign-details-close"
              onClick={(e) => { e.stopPropagation(); handleCloseDetails(); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); handleCloseDetails(); } }}
              aria-label="Close campaign details"
              type="button"
            >
              ✕
            </button>

            {/* Modal Content */}
            <div className="campaign-details-content">
              {/* Campaign Image - Large */}
              <div className="details-image-container">
                {selectedCampaign.imageUrl ? (
                  <img
                    src={selectedCampaign.imageUrl}
                    alt={`Campaign: ${selectedCampaign.name}`}
                    className="details-image"
                  />
                ) : (
                  <div className="details-image-placeholder">📸</div>
                )}
              </div>

              {/* Campaign Info */}
              <div className="details-info">
                {/* Header Section */}
                <div className="details-header">
                  <div className="details-platform-badge">
                    {selectedCampaign.platform === 'TikTok' ? <TikTokIcon /> : <YouTubeIcon />}
                    <span>{selectedCampaign.platform}</span>
                  </div>
                  <h2 className="details-title">{selectedCampaign.name}</h2>
                  <p className="details-created">Created: {formatDate(selectedCampaign.createdAt)}</p>
                </div>

                {/* Description Section */}
                <div className="details-section">
                  <h3 className="details-section-title">Description</h3>
                  <p className="details-description">{selectedCampaign.description}</p>
                </div>

                {/* Campaign Details Grid */}
                <div className="details-grid">
                  <div className="details-item">
                    <span className="details-label">Total Budget</span>
                    <span className="details-value">₱{(selectedCampaign.total_payout || selectedCampaign.budget || 0).toLocaleString()}</span>
                  </div>
                  <div className="details-item">
                    <span className="details-label">Revenue Per 1K Views</span>
                    <span className="details-value">₱{selectedCampaign.rpm.toFixed(2)}</span>
                  </div>
                  <div className="details-item">
                    <span className="details-label">Distributed Payout</span>
                    <span className="details-value">₱{getDistributedPayout(selectedCampaign).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="details-item">
                    <span className="details-label">Remaining Budget</span>
                    <span className="details-value">₱{((selectedCampaign.total_payout || selectedCampaign.budget || 0) - getDistributedPayout(selectedCampaign)).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Payout Progress Section */}
                <div className="details-payout-section">
                  <h3 className="details-section-title">Payout Progress</h3>
                  <div className="payout-label">
                    <span className="payout-title">Distribution Status</span>
                    <span className="payout-amount">
                      ₱{getDistributedPayout(selectedCampaign).toLocaleString(undefined, { maximumFractionDigits: 2 })} / ₱{(selectedCampaign.total_payout || selectedCampaign.budget || 0).toLocaleString()}
                    </span>
                  </div>
                  <div
                    className="payout-progress-container"
                    role="progressbar"
                    aria-valuenow={Math.round(getPayoutPercentage(selectedCampaign))}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Payout progress: ${Math.round(getPayoutPercentage(selectedCampaign))}%`}
                  >
                    <div className="payout-progress-background">
                      <div
                        className="payout-progress-fill"
                        style={{ width: `${getPayoutPercentage(selectedCampaign)}%` }}
                      />
                    </div>
                  </div>
                  <div className="payout-percentage">
                    {Math.round(getPayoutPercentage(selectedCampaign))}% distributed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Campaign"
        message="Are you sure you want to delete this campaign? This action cannot be undone and all campaign data will be permanently removed."
        confirmText="Delete Campaign"
        cancelText="Keep Campaign"
        confirmButtonType="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Edit Campaign Modal */}
      <EditCampaignModal
        campaign={editingCampaign}
        isOpen={!!editingCampaign}
        onClose={() => setEditingCampaign(null)}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default CampaignList;
