import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import PhilippinesMap from './components/PhilippinesMap';
import AIAssistant from './components/AIAssistant';
import UserProfile from './components/UserProfile';
import LocationModal from './components/LocationModal';
import ExploreSection from './components/ExploreSection';
import FloatingAIButton from './components/FloatingAIButton';
import CommunityFeed from './components/CommunityFeed';

// --> Firebase Imports <-- //
import { auth, db } from './firebase'; // check who is logged in and read/write user data
import { onAuthStateChanged } from 'firebase/auth'; // detects login/logout
import { doc, getDoc, setDoc } from 'firebase/firestore'; // create and save documents in firestore

function App() {
  const [currentPage, setCurrentPage] = useState('map');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userProfile, setUserProfile] = useState({
    // Ito yung array kung saan natin ise-save yung data ng users, like been there and want to go
    beenThere: [],
    wantToGo: [],
    checklists: [], 
    savedTemplates: [],
    lastPreloadedTemplateId: null
  });
  const [showAIChat, setShowAIChat] = useState(false);
  const [focusLocation, setFocusLocation] = useState(null);

  // --> New States for Firebase <-- //
  const [currentUser, setCurrentUser] = useState(null); // Iniistore nito yung information about sa logged in user
  const [loading, setLoading] = useState(true); // Loading state lang to while checing Auth status

  // --> Dito ko na ilalagay yung useEffect para sa user login/logout tracking <-- //
     // Nag rurun to as soon as the app loads, tinatrack nito yung login/logout, if user is logs in niloload nito yung firebase profile nila. If no profile exists, create.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // User is logged in
        try {
          // Check natin if existing si user sa Firestore
          const userDocRef = doc(db, 'users', user.uid);

          // kunin natin ung users data from Firestore
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            // If exists, load the profile data
            setUserProfile(userDocSnap.data());
          } else {
            // First time user, create a new profile
            const newProfile = {
              beenThere: [],
              wantToGo: [],
              checklists: [],
              savedTemplates: [],
              lastPreloadedTemplateId: null,
              email: user.email,
              displayName: user.displayName || 'Traveler',
              photoURL: user.photoURL || '',
              createdAt: new Date().toISOString()
            };

            // Save na natin yung new profile sa FireStore
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error("Error fetching or creating user profile:", error);
        }
      } else {
        // If user is logged out, reset natin to guest profile
        setUserProfile({
          beenThere: [],
          wantToGo: [],
          checklists: [],
          savedTemplates: [],
          lastPreloadedTemplateId: null
        });
      }

      setLoading(false);
    });

    // Cleanup function - unmounting
    return () => unsubscribe();
  }, []); 


  // --> New Function para masave yung user profile data sa Firebase <-- //
  // If nag mark si user ng place as "been there" or "want to go" this function saves it.
  const saveProfileToFirebase = async (newProfile) => {
    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);

        // Save to Firestore with merge option para hindi maoverwrite lahat
        await setDoc(userDocRef, {
          ...newProfile,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        // Pang check lang, console log natin
        console.log('Profile saved to Firebase!')

      } catch (error) {
        console.error("Error saving user profile:", error);
      }
    } else {
      console.log('No user logged in, data not saved')
    }
  };


  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    setShowModal(true);
    // If clicking from explore page, switch to map page
    if (currentPage === 'explore') {
      setCurrentPage('map');
    }
  };

  // --> Inupdate ko tong function para mag save sa Firebase everytime magmark yung user <-- //

  const handleMarkLocation = async (location, type) => {
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

    // --> Save to firebase after maupdate yung state <--//
    await saveProfileToFirebase(newProfile);

    
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

  // --> Naglagay ako ng loading screen while checking auth status <-- //
  if (loading) {
    return (
      <div className="App loading-screen">
        <div className="plane-icon">✈️</div>
        <div className="app-title">Landscapes</div>
        <div className="loading-text">Loading your travel journey...</div>
        <div className="loading-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        currentUser={currentUser}
      />

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
                  currentUser={currentUser} // Pass currentUser for display
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
                currentUser={currentUser} // pass current user
              />
            </div>
          </div>
        )}

        {/* Community Page - Posts and Chat */}
        {currentPage === 'community' && (
          <div className="page community-page">
            <CommunityFeed currentUser={currentUser} /> {/* New prop to */}
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
