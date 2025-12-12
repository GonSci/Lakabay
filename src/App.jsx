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
import CampaignSection from './components/CampaignSection';
import CampaignList from './components/CampaignList';

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
  const [campaigns, setCampaigns] = useState([]);
  const [showCampaignModal, setShowCampaignModal] = useState(false);

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

  /* ========================================================================
    CAMPAIGN IMPLEMENTATION (implement na lang sa DB pag tapos na)
     ========================================================================
  */
  //Fetch campaigns from localStorage
  const fetchCampaigns = () => {
    try {
      const savedCampaigns = localStorage.getItem('campaigns');
      if (savedCampaigns) {
        const campaigns = JSON.parse(savedCampaigns);
        setCampaigns(campaigns);
        console.log('Campaigns loaded from localStorage:', campaigns);
      } else {
        setCampaigns([]);
      }
    } catch (error) {
      console.error('Error loading campaigns from localStorage:', error);
      setCampaigns([]);
    }
  };

  // Save campaign to localStorage
  const saveCampaignToStorage = (formData) => {
    return new Promise((resolve, reject) => {
      try {
        const savedCampaigns = localStorage.getItem('campaigns');
        const campaigns = savedCampaigns ? JSON.parse(savedCampaigns) : [];

        // Convert image file to base64 if it exists
        if (formData.imageFile) {
          // Create a FileReader to convert file to base64
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const imageBase64 = e.target.result;
              
              // Create new campaign object with generated ID
              const newCampaign = {
                id: Date.now().toString(),
                name: formData.name,
                description: formData.description,
                imageUrl: imageBase64, // Store base64 image
                platform: formData.platform,
                total_payout: formData.budget,
                distributed_payout: 0,
                rpm: formData.rpm,
                createdAt: new Date().toISOString()
              };

              campaigns.push(newCampaign);
              localStorage.setItem('campaigns', JSON.stringify(campaigns));
              console.log('Campaign saved to localStorage with image:', newCampaign.id);
              
              // Update state with new campaigns
              setCampaigns(campaigns);
              resolve(newCampaign);
            } catch (error) {
              console.error('Error processing image:', error);
              reject(error);
            }
          };
          reader.onerror = (error) => {
            console.error('FileReader error:', error);
            reject(error);
          };
          reader.readAsDataURL(formData.imageFile);
        } else {
          // No image, use placeholder
          const newCampaign = {
            id: Date.now().toString(),
            name: formData.name,
            description: formData.description,
            imageUrl: null,
            platform: formData.platform,
            total_payout: formData.budget,
            distributed_payout: 0,
            rpm: formData.rpm,
            createdAt: new Date().toISOString()
          };

          campaigns.push(newCampaign);
          localStorage.setItem('campaigns', JSON.stringify(campaigns));
          console.log('Campaign saved to localStorage without image:', newCampaign.id);
          
          // Update state with new campaigns
          setCampaigns(campaigns);
          resolve(newCampaign);
        }
      } catch (error) {
        console.error('Error saving campaign to localStorage:', error);
        reject(error);
      }
    });
  };

  // Delete campaign from localStorage
  const deleteCampaignFromStorage = (campaignId) => {
    try {
      const savedCampaigns = localStorage.getItem('campaigns');
      let campaigns = savedCampaigns ? JSON.parse(savedCampaigns) : [];
      
      // Filter out the campaign to delete
      campaigns = campaigns.filter(campaign => campaign.id !== campaignId);
      
      // Update localStorage
      localStorage.setItem('campaigns', JSON.stringify(campaigns));
      
      // Update state
      setCampaigns(campaigns);
      console.log('Campaign deleted from localStorage:', campaignId);
      
      return true;
    } catch (error) {
      console.error('Error deleting campaign from localStorage:', error);
      return false;
    }
  };

  // Update campaign in localStorage
  const updateCampaignInStorage = (campaignId, updatedData) => {
    return new Promise((resolve, reject) => {
      try {
        const savedCampaigns = localStorage.getItem('campaigns');
        let campaigns = savedCampaigns ? JSON.parse(savedCampaigns) : [];
        
        // Find the campaign to update
        const campaignIndex = campaigns.findIndex(campaign => campaign.id === campaignId);
        if (campaignIndex === -1) {
          reject(new Error('Campaign not found'));
          return;
        }

        const currentCampaign = campaigns[campaignIndex];

        // If there's a new image file, convert it to base64
        if (updatedData.imageFile) {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const imageBase64 = e.target.result;
              
              // Update campaign with new data
              campaigns[campaignIndex] = {
                ...currentCampaign,
                name: updatedData.name,
                description: updatedData.description,
                imageUrl: imageBase64,
                platform: updatedData.platform,
                total_payout: updatedData.budget,
                rpm: updatedData.rpm,
                updatedAt: new Date().toISOString()
              };

              // Save to localStorage
              localStorage.setItem('campaigns', JSON.stringify(campaigns));
              setCampaigns(campaigns);
              console.log('Campaign updated in localStorage:', campaignId);
              resolve(campaigns[campaignIndex]);
            } catch (error) {
              console.error('Error processing image:', error);
              reject(error);
            }
          };
          reader.onerror = (error) => {
            console.error('FileReader error:', error);
            reject(error);
          };
          reader.readAsDataURL(updatedData.imageFile);
        } else {
          // No new image file, keep existing image or use provided imageUrl
          campaigns[campaignIndex] = {
            ...currentCampaign,
            name: updatedData.name,
            description: updatedData.description,
            imageUrl: updatedData.imageUrl !== undefined ? updatedData.imageUrl : currentCampaign.imageUrl,
            platform: updatedData.platform,
            total_payout: updatedData.budget,
            rpm: updatedData.rpm,
            updatedAt: new Date().toISOString()
          };

          // Save to localStorage
          localStorage.setItem('campaigns', JSON.stringify(campaigns));
          setCampaigns(campaigns);
          console.log('Campaign updated in localStorage:', campaignId);
          resolve(campaigns[campaignIndex]);
        }
      } catch (error) {
        console.error('Error updating campaign in localStorage:', error);
        reject(error);
      }
    });
  };

  // Load campaigns on component mount
  useEffect(() => {
    fetchCampaigns();
  }, []);


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

        {/* Campaigns Page - Create Marketing Campaigns */}
        {currentPage === 'campaigns' && (
          <div className="page campaigns-page">
            {/* Show CampaignSection modal when button is clicked or no campaigns exist */}
            {showCampaignModal && (
              <CampaignSection 
                hideHeader={true}
                onClose={() => setShowCampaignModal(false)}
                onCreate={async (formData) => {
                  try {
                    // Save campaign to localStorage
                    await saveCampaignToStorage(formData);
                    console.log('Campaign created:', formData);
                    setShowCampaignModal(false);
                    // Refresh campaigns list after creation
                    fetchCampaigns();
                  } catch (error) {
                    console.error('Error creating campaign:', error);
                  }
                }}
              />
            )}
            
            {/* Show CampaignSection header if no campaigns, otherwise show CampaignList */}
            {campaigns.length === 0 ? (
              <CampaignSection 
                onCreate={async (formData) => {
                  try {
                    // Save campaign to localStorage
                    await saveCampaignToStorage(formData);
                    console.log('Campaign created:', formData);
                    // Refresh campaigns list after creation
                    fetchCampaigns();
                  } catch (error) {
                    console.error('Error creating campaign:', error);
                  }
                }}
              />
            ) : (
              <CampaignList 
                campaigns={campaigns} 
                onCreate={() => setShowCampaignModal(true)}
                onDelete={deleteCampaignFromStorage}
                onUpdate={updateCampaignInStorage}
              />
            )}
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
