import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import PhilippinesMap from './components/PhilippinesMap';
import AIAssistant from './components/AIAssistant';
import UserProfile from './components/UserProfile';
import LocationModal from './components/LocationModal';
import ExploreSection from './components/ExploreSection';
import FloatingAIButton from './components/FloatingAIButton';
import CommunityFeed from './components/CommunityFeed';

function App() {
  const [currentPage, setCurrentPage] = useState('map');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userProfile, setUserProfile] = useState({
    beenThere: [],
    wantToGo: []
  });
  const [showAIChat, setShowAIChat] = useState(false);
  const [focusLocation, setFocusLocation] = useState(null);

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    setShowModal(true);
    // If clicking from explore page, switch to map page
    if (currentPage === 'explore') {
      setCurrentPage('map');
    }
  };

  const handleMarkLocation = (location, type) => {
    const newProfile = { ...userProfile };
    const locationId = location?.id || selectedLocation?.id;
    
    if (!locationId) return;
    
    if (type === 'been') {
      if (!newProfile.beenThere.includes(locationId)) {
        newProfile.beenThere.push(locationId);
        // Remove from want to go if it exists
        newProfile.wantToGo = newProfile.wantToGo.filter(id => id !== locationId);
      }
    } else if (type === 'want') {
      if (!newProfile.wantToGo.includes(locationId)) {
        newProfile.wantToGo.push(locationId);
      }
    }
    
    setUserProfile(newProfile);
    
    // Close modal only if marking from modal
    if (!location) {
      setShowModal(false);
    }
  };

  const handleAskAI = () => {
    setShowAIChat(true);
    setShowModal(false);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    // Close AI chat when navigating to different pages
    setShowAIChat(false);
  };

  const toggleAIChat = () => {
    setShowAIChat(!showAIChat);
  };

  const handleViewOnMap = (location) => {
    setCurrentPage('map');
    setFocusLocation(location);
    setShowModal(false);
    // Clear focus after animation
    setTimeout(() => setFocusLocation(null), 3000);
  };

  return (
    <div className="App">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      <div className="app-content">
        {/* Map Page - Main Focus */}
        {currentPage === 'map' && (
          <div className="page map-page">
            <div className="map-layout">
              <div className="map-sidebar">
                <UserProfile 
                  profile={userProfile}
                  onToggleAI={() => setShowAIChat(!showAIChat)}
                  compactMode={true}
                />
              </div>

              <div className="map-main">
                <PhilippinesMap
                  onLocationClick={handleLocationClick}
                  userProfile={userProfile}
                  focusLocation={focusLocation}
                />
              </div>
            </div>
          </div>
        )}

        {/* Explore Page - Categories and Carousels */}
        {currentPage === 'explore' && (
          <div className="page explore-page">
            <ExploreSection 
              onLocationClick={handleLocationClick}
              onMarkLocation={handleMarkLocation}
              userProfile={userProfile}
            />
          </div>
        )}

        {/* Profile Page - User's Travel Statistics */}
        {currentPage === 'profile' && (
          <div className="page profile-page">
            <div className="profile-container">
              <UserProfile 
                profile={userProfile}
                onToggleAI={() => setShowAIChat(!showAIChat)}
                expanded={true}
              />
            </div>
          </div>
        )}

        {/* Community Page - Posts and Chat */}
        {currentPage === 'community' && (
          <div className="page community-page">
            <CommunityFeed />
          </div>
        )}
      </div>

      {/* Location Modal - Global */}
      {showModal && (
        <LocationModal
          location={selectedLocation}
          onClose={() => setShowModal(false)}
          onMarkBeen={() => handleMarkLocation(null, 'been')}
          onMarkWant={() => handleMarkLocation(null, 'want')}
          onAskAI={handleAskAI}
        />
      )}

      {/* Floating AI Button - Always visible */}
      <FloatingAIButton onClick={toggleAIChat} isActive={showAIChat} />

      {/* AI Assistant Overlay - Global */}
      {showAIChat && (
        <div className="ai-overlay" onClick={() => setShowAIChat(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <AIAssistant
              selectedLocation={selectedLocation}
              onClose={() => setShowAIChat(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
