import React, { useMemo, useState, useEffect, useCallback } from 'react';
import './UserProfile.css';

const UserProfile = ({ profile, onToggleAI, expanded = false }) => {
  const [showAddChecklistModal, setShowAddChecklistModal] = useState(false);
  const [checklistForm, setChecklistForm] = useState({ name: '', icon: '✓' });
  const [userChecklists, setUserChecklists] = useState(() => {
    // Initialize state from localStorage immediately
    try {
      const saved = localStorage.getItem('userChecklists');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading checklists:', error);
      return [];
    }
  });

  // Save checklists to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userChecklists', JSON.stringify(userChecklists));
    console.log('Checklists saved:', userChecklists);
    console.log('LocalStorage content:', localStorage.getItem('userChecklists'));
  }, [userChecklists]);
  // Calculate gamification stats
  const stats = useMemo(() => {
    const visitedCount = profile.beenThere.length;
    const wishlistCount = profile.wantToGo.length;
    
    // Extract unique regions from visited places
    const uniqueRegions = new Set(profile.beenThere.map(id => {
      // Extract region from location id (assuming format like "boracay-aklan")
      const parts = id.split('-');
      return parts[parts.length - 1];
    }));
    
    return {
      visited: visitedCount,
      wishlist: wishlistCount,
      regions: uniqueRegions.size,
      totalInteractions: visitedCount + wishlistCount
    };
  }, [profile]);

  // Define achievement badges
  const badges = [
    {
      id: 'explorer',
      name: 'Explorer',
      icon: '🗺️',
      description: 'Visit your first place',
      requirement: 1,
      current: stats.visited,
      unlocked: stats.visited >= 1
    },
    {
      id: 'adventurer',
      name: 'Adventurer',
      icon: '🎒',
      description: 'Visit 3 different places',
      requirement: 3,
      current: stats.visited,
      unlocked: stats.visited >= 3
    },
    {
      id: 'traveler',
      name: 'Traveler',
      icon: '✈️',
      description: 'Visit 5 different places',
      requirement: 5,
      current: stats.visited,
      unlocked: stats.visited >= 5
    },
    {
      id: 'globetrotter',
      name: 'Globetrotter',
      icon: '🌍',
      description: 'Visit 10 different places',
      requirement: 10,
      current: stats.visited,
      unlocked: stats.visited >= 10
    },
    {
      id: 'regional',
      name: 'Regional Explorer',
      icon: '🏝️',
      description: 'Visit 3 different regions',
      requirement: 3,
      current: stats.regions,
      unlocked: stats.regions >= 3
    },
    {
      id: 'wishlist-master',
      name: 'Dream Planner',
      icon: '⭐',
      description: 'Add 5 places to wishlist',
      requirement: 5,
      current: stats.wishlist,
      unlocked: stats.wishlist >= 5
    }
  ];

  const unlockedBadges = badges.filter(b => b.unlocked);
  const nextBadge = badges.find(b => !b.unlocked);

  // Icon options for checklist
  const iconOptions = ['✓', '📋', '📝', '✈️', '🎒', '🗺️', '📅', '🏨', '🎫', '📕', '🛡️', '⭐'];

  // Handle add checklist button click
  const handleAddChecklistClick = () => {
    setShowAddChecklistModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowAddChecklistModal(false);
    setChecklistForm({ name: '', icon: '✓' });
  };

  // Handle form input change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setChecklistForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle icon selection
  const handleIconSelect = (icon) => {
    setChecklistForm(prev => ({ ...prev, icon }));
  };

  // Handle form submission
  const handleAddChecklist = () => {
    if (checklistForm.name.trim()) {
      const newChecklist = {
        id: Date.now(),
        ...checklistForm,
        completed: false
      };
      console.log('Adding new checklist:', newChecklist);
      setUserChecklists(prev => {
        const updated = [...prev, newChecklist];
        console.log('Updated checklists:', updated);
        return updated;
      });
      handleCloseModal();
    }
  };

  // Handle checkbox toggle
  const handleToggleChecklistItem = (id) => {
    setUserChecklists(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // Handle delete checklist item
  const handleDeleteChecklistItem = (id) => {
    setUserChecklists(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className={`user-profile ${expanded ? 'expanded' : ''}`}>
      <div className="profile-header">
        <div className="avatar">👤</div>
        <div className="profile-info">
          <h3>My Travel Journey</h3>
          <p className="profile-subtitle">Track your adventures</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card visited">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <span className="stat-number">{stats.visited}</span>
            <span className="stat-label">Visited</span>
          </div>
        </div>
        <div className="stat-card wishlist">
          <div className="stat-icon">♡</div>
          <div className="stat-content">
            <span className="stat-number">{stats.wishlist}</span>
            <span className="stat-label">Wishlist</span>
          </div>
        </div>
        <div className="stat-card regions">
          <div className="stat-icon">🏝️</div>
          <div className="stat-content">
            <span className="stat-number">{stats.regions}</span>
            <span className="stat-label">Regions</span>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="profile-section badges-section">
        <div className="section-header">
          <h4>🏆 Achievements</h4>
        </div>
        
        <div className="badges-column">
          <div className="badges-grid">
            {badges.map(badge => (
              <div 
                key={badge.id} 
                className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`}
                title={badge.description}
              >
                <div className="badge-icon">{badge.icon}</div>
                <div className="badge-info">
                  <span className="badge-name">{badge.name}</span>
                  {!badge.unlocked && (
                    <div className="badge-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${(badge.current / badge.requirement) * 100}%` }}
                        />
                      </div>
                      <span className="progress-text">{badge.current}/{badge.requirement}</span>
                    </div>
                  )}
                </div>
                {badge.unlocked && <div className="badge-checkmark">✓</div>}
              </div>
            ))}
          </div>
          <span className="badge-count">{unlockedBadges.length}/{badges.length}</span>
        </div>

        {/* Right side placeholder for future content */}
        <div className="badges-right-column">
          {/* Checklist Section */}
          <div className="checklist-container">
            <h4 className="checklist-title">✓ Travel Checklist</h4>
            <button onClick={handleAddChecklistClick} className="add-checklist-btn">
              <span className="btn-icon">+</span>
              <span className="btn-text">Add Checklist Item</span>
            </button>
            {/* Display added checklists */}
            <div className="checklist-items">
              {userChecklists.map(item => (
                <div key={item.id} className={`checklist-item ${item.completed ? 'completed' : ''}`}>
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleChecklistItem(item.id)}
                    className="checklist-checkbox"
                  />
                  <span className="checklist-icon">{item.icon}</span>
                  <span className="checklist-text">{item.name}</span>
                  <button
                    onClick={() => handleDeleteChecklistItem(item.id)}
                    className="checklist-delete-btn"
                    title="Delete this checklist item"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Checklist Modal */}
      {showAddChecklistModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Checklist Item</h3>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="checklist-name">Item Name</label>
                <input
                  type="text"
                  id="checklist-name"
                  name="name"
                  placeholder="Enter checklist item name"
                  value={checklistForm.name}
                  onChange={handleFormChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Select Icon</label>
                <div className="icon-picker">
                  {iconOptions.map(icon => (
                    <button
                      key={icon}
                      className={`icon-option ${checklistForm.icon === icon ? 'selected' : ''}`}
                      onClick={() => handleIconSelect(icon)}
                      title={`Select ${icon}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={handleCloseModal} className="btn-cancel">Cancel</button>
                <button onClick={handleAddChecklist} className="btn-add">Add Item</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Next Badge Hint - Moved below both sections */}
      {nextBadge && (
        <div className="next-badge-hint">
          <span className="hint-icon">🎯</span>
          <span className="hint-text">
            Next: {nextBadge.name} - {nextBadge.description}
          </span>
        </div>
      )}

      {/* AI Assistant Button */}
      <button onClick={onToggleAI} className="ai-toggle-btn">
        <span className="btn-icon">🤖</span>
        <span className="btn-text">AI Assistant</span>
      </button>

      {/* Places Lists */}
      <div className="profile-section places-section">
        <h4>✅ Places Visited</h4>
        <div className="location-list">
          {profile.beenThere.length === 0 ? (
            <p className="empty-state">Start your journey!</p>
          ) : (
            profile.beenThere.map((locationId) => (
              <div key={locationId} className="location-item visited">
                <span className="location-icon">📍</span>
                <span className="location-name">{locationId}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="profile-section places-section">
        <h4>⭐ Bucket List</h4>
        <div className="location-list">
          {profile.wantToGo.length === 0 ? (
            <p className="empty-state">Add places to explore</p>
          ) : (
            profile.wantToGo.map((locationId) => (
              <div key={locationId} className="location-item wishlist">
                <span className="location-icon">🌟</span>
                <span className="location-name">{locationId}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
