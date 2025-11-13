import React, { useState } from 'react';
import './LocationModal.css';

const LocationModal = ({ location, onClose, onMarkBeen, onMarkWant, onAskAI }) => {
  const [showCommunity, setShowCommunity] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [communityMessages, setCommunityMessages] = useState([]);
  const [messageLikes, setMessageLikes] = useState({});
  const [activeCategory, setActiveCategory] = useState('activities'); // activities, places, food

  if (!location) return null;

  // Comprehensive marketplace data for each location
  const locationMarketplace = {
    manila: {
      activities: [
        { id: 1, name: 'Intramuros Walking Tour', price: '₱500-800', rating: 4.8, reviews: 234, image: '🏰', description: 'Explore 400-year-old Spanish walled city', business: 'Manila Tours Co.' },
        { id: 2, name: 'Manila Bay Sunset Cruise', price: '₱1,500', rating: 4.9, reviews: 189, image: '⛵', description: 'Romantic sunset cruise with dinner buffet', business: 'Bay Cruise Manila' },
        { id: 3, name: 'Rizal Park Cultural Show', price: '₱300', rating: 4.6, reviews: 156, image: '🎭', description: 'Live cultural performances every weekend', business: 'National Parks Board' },
        { id: 4, name: 'Street Food Tour Binondo', price: '₱650', rating: 4.9, reviews: 421, image: '🍜', description: 'Authentic Chinatown food adventure', business: 'Manila Food Tours' }
      ],
      places: [
        { id: 1, name: 'National Museum Complex', price: 'FREE', rating: 4.9, reviews: 567, image: '🏛️', description: 'World-class art and history museums', business: 'National Museum PH' },
        { id: 2, name: 'BGC High Street', price: 'FREE', rating: 4.7, reviews: 342, image: '🏙️', description: 'Modern shopping and dining district', business: 'BGC Development' },
        { id: 3, name: 'Manila Ocean Park', price: '₱800', rating: 4.5, reviews: 289, image: '🐠', description: 'Aquarium & marine life experiences', business: 'Ocean Park Manila' },
        { id: 4, name: 'SM Mall of Asia', price: 'FREE', rating: 4.6, reviews: 1234, image: '🛍️', description: 'One of largest malls in the world', business: 'SM Supermalls' }
      ],
      food: [
        { id: 1, name: 'Barbara\'s Heritage Restaurant', price: '₱₱₱', rating: 4.8, reviews: 456, image: '🍽️', description: 'Authentic Filipino heritage cuisine', business: 'Barbara\'s Group' },
        { id: 2, name: 'Abe Restaurant', price: '₱₱', rating: 4.7, reviews: 389, image: '🥘', description: 'Kapampangan traditional dishes', business: 'Abe Franchise' },
        { id: 3, name: 'Café Adriatico', price: '₱₱', rating: 4.6, reviews: 523, image: '☕', description: 'Historic café since 1980s', business: 'Café Adriatico Inc.' },
        { id: 4, name: 'Binondo Food Stalls', price: '₱', rating: 4.9, reviews: 789, image: '🥟', description: 'Street food paradise - siopao, lumpia', business: 'Various Vendors' }
      ]
    },
    cebu: {
      activities: [
        { id: 1, name: 'Oslob Whale Shark Watching', price: '₱1,500', rating: 4.9, reviews: 1243, image: '🦈', description: 'Swim with gentle giants', business: 'Oslob Tourism' },
        { id: 2, name: 'Canyoneering Kawasan Falls', price: '₱1,800', rating: 4.9, reviews: 567, image: '🏞️', description: 'Adventure jump, swim, climb', business: 'Kawasan Adventures' },
        { id: 3, name: 'Island Hopping Moalboal', price: '₱2,500', rating: 4.8, reviews: 432, image: '🏝️', description: 'See sardine run & sea turtles', business: 'Moalboal Tours' },
        { id: 4, name: 'Sinulog Festival Experience', price: '₱500', rating: 5.0, reviews: 234, image: '🎉', description: 'Cultural dance & street parade', business: 'Cebu Tourism Office' }
      ],
      places: [
        { id: 1, name: 'Magellan\'s Cross', price: 'FREE', rating: 4.7, reviews: 892, image: '✝️', description: 'Historic cross from 1521', business: 'Cebu Heritage' },
        { id: 2, name: 'Basilica del Santo Niño', price: 'FREE', rating: 4.9, reviews: 1123, image: '⛪', description: 'Oldest Roman Catholic church', business: 'Basilica Foundation' },
        { id: 3, name: 'Temple of Leah', price: '₱50', rating: 4.6, reviews: 456, image: '🏛️', description: 'Greco-Roman temple with city views', business: 'Temple of Leah' },
        { id: 4, name: 'Tops Lookout', price: '₱100', rating: 4.7, reviews: 678, image: '🌄', description: '360° panoramic city & sea views', business: 'Tops Management' }
      ],
      food: [
        { id: 1, name: 'Zubuchon', price: '₱₱₱', rating: 4.9, reviews: 2341, image: '🍖', description: 'World-famous Cebu lechon', business: 'Zubuchon Restaurant' },
        { id: 2, name: 'STK ta Bay!', price: '₱₱', rating: 4.8, reviews: 892, image: '🦞', description: 'Fresh seafood by the bay', business: 'STK Restaurant Group' },
        { id: 3, name: 'House of Lechon', price: '₱₱', rating: 4.7, reviews: 1234, image: '🐷', description: 'Multiple lechon varieties', business: 'House of Lechon' },
        { id: 4, name: 'Larsian BBQ', price: '₱', rating: 4.8, reviews: 567, image: '🍢', description: 'Street BBQ institution', business: 'Larsian Vendors' }
      ]
    },
    davao: {
      activities: [
        { id: 1, name: 'Philippine Eagle Center Visit', price: '₱150', rating: 4.9, reviews: 456, image: '🦅', description: 'See majestic national bird', business: 'Eagle Foundation' },
        { id: 2, name: 'Mt. Apo Climbing Expedition', price: '₱5,000', rating: 4.9, reviews: 234, image: '🏔️', description: '2-day climb to PH\'s highest peak', business: 'Apo Guides Association' },
        { id: 3, name: 'Eden Nature Park Day Tour', price: '₱600', rating: 4.7, reviews: 345, image: '🌲', description: 'Zipline, skyride, nature walk', business: 'Eden Nature Park' },
        { id: 4, name: 'Durian Farm Tour', price: '₱400', rating: 4.6, reviews: 189, image: '🍈', description: 'Learn about "King of Fruits"', business: 'Davao Fruit Tours' }
      ],
      places: [
        { id: 1, name: 'People\'s Park', price: 'FREE', rating: 4.7, reviews: 567, image: '🌳', description: 'Sculpture garden & green space', business: 'Davao City Gov' },
        { id: 2, name: 'Samal Island Beaches', price: '₱300', rating: 4.8, reviews: 892, image: '🏖️', description: 'White sand paradise near city', business: 'Samal Tourism' },
        { id: 3, name: 'D\' Bone Collector Museum', price: '₱50', rating: 4.9, reviews: 234, image: '🦴', description: 'Largest skeletal collection in PH', business: 'D\' Bone Museum' },
        { id: 4, name: 'Jack\'s Ridge', price: '₱100', rating: 4.7, reviews: 678, image: '🌆', description: 'Hilltop dining with city lights', business: 'Jack\'s Ridge Resort' }
      ],
      food: [
        { id: 1, name: 'Claude\'s Le Cafe de Ville', price: '₱₱₱', rating: 4.8, reviews: 456, image: '🍽️', description: 'Fine dining with local twist', business: 'Claude\'s Restaurant' },
        { id: 2, name: 'Penong\'s BBQ', price: '₱₱', rating: 4.9, reviews: 1234, image: '🍖', description: 'Famous grilled chicken & pork', business: 'Penong\'s Chain' },
        { id: 3, name: 'Kusina Dabaw', price: '₱₱', rating: 4.7, reviews: 567, image: '🥘', description: 'Traditional Davao cuisine', business: 'Kusina Dabaw Rest.' },
        { id: 4, name: 'Magsaysay Fruit Stands', price: '₱', rating: 4.8, reviews: 892, image: '🍉', description: 'Fresh durian & tropical fruits', business: 'Various Vendors' }
      ]
    },
    boracay: {
      activities: [
        { id: 1, name: 'Sunset Sailing', price: '₱2,500', rating: 5.0, reviews: 1523, image: '⛵', description: 'Paraw sailing at golden hour', business: 'Boracay Sailing' },
        { id: 2, name: 'Helmet Diving Adventure', price: '₱1,500', rating: 4.8, reviews: 678, image: '🤿', description: 'Walk underwater - no training needed', business: 'Helmet Dive Boracay' },
        { id: 3, name: 'Island Hopping Tour', price: '₱1,800', rating: 4.9, reviews: 892, image: '🏝️', description: 'Visit Crystal Cove & Crocodile Island', business: 'Island Tours Bora' },
        { id: 4, name: 'Parasailing Experience', price: '₱2,000', rating: 4.9, reviews: 567, image: '🪂', description: 'Fly above White Beach', business: 'Sky High Boracay' }
      ],
      places: [
        { id: 1, name: 'White Beach Station 1', price: 'FREE', rating: 4.9, reviews: 2341, image: '🏖️', description: 'Finest white sand in the world', business: 'Boracay Tourism' },
        { id: 2, name: 'Puka Shell Beach', price: 'FREE', rating: 4.8, reviews: 456, image: '🐚', description: 'Quieter alternative to White Beach', business: 'Yapak Tourism' },
        { id: 3, name: 'Mt. Luho Viewpoint', price: '₱100', rating: 4.6, reviews: 234, image: '⛰️', description: 'Highest point with 360° views', business: 'Mt. Luho Eco Park' },
        { id: 4, name: 'D\'Mall Boracay', price: 'FREE', rating: 4.7, reviews: 1234, image: '🛍️', description: 'Shopping & dining hub', business: 'D\'Mall Management' }
      ],
      food: [
        { id: 1, name: 'Aria Cucina Italiana', price: '₱₱₱₱', rating: 4.9, reviews: 678, image: '🍝', description: 'Beachfront Italian fine dining', business: 'Aria Restaurant' },
        { id: 2, name: 'Smoke Restaurant', price: '₱₱₱', rating: 4.8, reviews: 892, image: '🥩', description: 'Ribs, steaks & seafood', business: 'Smoke Boracay' },
        { id: 3, name: 'Jonah\'s Fruit Shake', price: '₱', rating: 4.9, reviews: 2341, image: '🥤', description: 'Legendary mango shakes since 1992', business: 'Jonah\'s Shakes' },
        { id: 4, name: 'D\'Talipapa Seafood Market', price: '₱₱', rating: 4.8, reviews: 1456, image: '🦞', description: 'Fresh seafood - buy & cook', business: 'D\'Talipapa Market' }
      ]
    },
    palawan: {
      activities: [
        { id: 1, name: 'El Nido Island Hopping Tour A', price: '₱1,400', rating: 4.9, reviews: 3456, image: '🛶', description: 'Secret Lagoon, Big & Small Lagoon', business: 'El Nido Tours' },
        { id: 2, name: 'Underground River Tour', price: '₱1,500', rating: 4.9, reviews: 2341, image: '🦇', description: 'UNESCO World Heritage site', business: 'PPUR Tourism Office' },
        { id: 3, name: 'Nacpan Beach Motorbike Tour', price: '₱800', rating: 4.8, reviews: 567, image: '🏍️', description: 'Scenic ride to 4km beach', business: 'Palawan Bike Rentals' },
        { id: 4, name: 'Kayaking Bacuit Bay', price: '₱1,200', rating: 4.9, reviews: 892, image: '🚣', description: 'Paddle through limestone cliffs', business: 'Bacuit Adventures' }
      ],
      places: [
        { id: 1, name: 'Big Lagoon', price: 'incl. tour', rating: 5.0, reviews: 4567, image: '💧', description: 'Turquoise waters surrounded by cliffs', business: 'El Nido Tourism' },
        { id: 2, name: 'Nacpan Beach', price: 'FREE', rating: 4.9, reviews: 1234, image: '🏝️', description: '4km of unspoiled white sand', business: 'Nacpan Community' },
        { id: 3, name: 'Las Cabanas Beach', price: 'FREE', rating: 4.8, reviews: 678, image: '🌅', description: 'Best sunset spot in El Nido', business: 'Las Cabanas Area' },
        { id: 4, name: 'Helicopter Island', price: 'incl. tour', rating: 4.7, reviews: 456, image: '🚁', description: 'Named for helicopter-like shape', business: 'Island Tours' }
      ],
      food: [
        { id: 1, name: 'Artcafe', price: '₱₱₱', rating: 4.8, reviews: 892, image: '🍽️', description: 'Art gallery & Mediterranean cuisine', business: 'Artcafe El Nido' },
        { id: 2, name: 'Trattoria Altrove', price: '₱₱₱', rating: 4.9, reviews: 567, image: '🍕', description: 'Wood-fired pizza & homemade pasta', business: 'Altrove Restaurant' },
        { id: 3, name: 'Happiness Beach Bar', price: '₱₱', rating: 4.7, reviews: 1234, image: '🍹', description: 'Beachfront dining & cocktails', business: 'Happiness Beach' },
        { id: 4, name: 'El Nido Public Market', price: '₱', rating: 4.6, reviews: 456, image: '🦐', description: 'Fresh seafood grilled to order', business: 'Public Market' }
      ]
    },
    baguio: {
      activities: [
        { id: 1, name: 'Strawberry Picking Experience', price: '₱200', rating: 4.8, reviews: 892, image: '🍓', description: 'Pick fresh strawberries at La Trinidad', business: 'Strawberry Farms' },
        { id: 2, name: 'Burnham Park Boat Ride', price: '₱150', rating: 4.6, reviews: 456, image: '🚣', description: 'Scenic lake paddleboat ride', business: 'Burnham Park Admin' },
        { id: 3, name: 'Tam-Awan Village Tour', price: '₱60', rating: 4.7, reviews: 234, image: '🏘️', description: 'Cordillera cultural village', business: 'Tam-Awan Village' },
        { id: 4, name: 'Mines View Park Photography', price: 'FREE', rating: 4.7, reviews: 1234, image: '📷', description: 'Mountain views & souvenir shops', business: 'Baguio Tourism' }
      ],
      places: [
        { id: 1, name: 'The Mansion', price: 'FREE', rating: 4.8, reviews: 678, image: '🏛️', description: 'Official summer residence of President', business: 'Philippine Gov' },
        { id: 2, name: 'Botanical Garden', price: '₱10', rating: 4.6, reviews: 567, image: '🌺', description: 'Peaceful garden with Igorot sculptures', business: 'Baguio Parks' },
        { id: 3, name: 'Session Road', price: 'FREE', rating: 4.7, reviews: 2341, image: '🛍️', description: 'Main shopping & dining street', business: 'Session Road Assoc.' },
        { id: 4, name: 'Bell Church', price: 'FREE', rating: 4.8, reviews: 456, image: '⛪', description: 'Historic church with prayer bell', business: 'Baguio Cathedral' }
      ],
      food: [
        { id: 1, name: 'Good Shepherd Convent', price: '₱', rating: 4.9, reviews: 3456, image: '🫙', description: 'Famous ube jam & strawberry jam', business: 'Good Shepherd' },
        { id: 2, name: 'Hill Station', price: '₱₱₱', rating: 4.8, reviews: 892, image: '🍽️', description: 'Fine dining with mountain views', business: 'Hill Station Rest.' },
        { id: 3, name: 'Vizco\'s', price: '₱₱', rating: 4.7, reviews: 1234, image: '🍰', description: 'Strawberry shortcake & pastries', business: 'Vizco\'s Bakery' },
        { id: 4, name: 'Strawberry Taho Vendors', price: '₱', rating: 4.9, reviews: 567, image: '🥛', description: 'Fresh strawberry taho at parks', business: 'Various Vendors' }
      ]
    },
    vigan: {
      activities: [
        { id: 1, name: 'Kalesa Ride Calle Crisologo', price: '₱150', rating: 4.9, reviews: 1234, image: '🐴', description: 'Horse carriage on cobblestone streets', business: 'Vigan Kalesa Assoc.' },
        { id: 2, name: 'Pottery Making Workshop', price: '₱300', rating: 4.7, reviews: 234, image: '🏺', description: 'Traditional jar-making at Pagburnayan', business: 'Pagburnayan Pottery' },
        { id: 3, name: 'Heritage House Tour', price: '₱200', rating: 4.8, reviews: 456, image: '🏛️', description: 'Visit Crisologo Museum & ancestral homes', business: 'Heritage Tours' },
        { id: 4, name: 'Bantay Bell Tower Climb', price: 'FREE', rating: 4.6, reviews: 567, image: '🔔', description: 'Panoramic views of Vigan', business: 'Bantay Tourism' }
      ],
      places: [
        { id: 1, name: 'Calle Crisologo', price: 'FREE', rating: 5.0, reviews: 2341, image: '🏘️', description: 'UNESCO cobblestone street', business: 'Vigan Heritage' },
        { id: 2, name: 'Baluarte Zoo', price: 'FREE', rating: 4.7, reviews: 892, image: '🦁', description: 'Mini zoo with exotic animals', business: 'Baluarte' },
        { id: 3, name: 'Syquia Mansion', price: '₱30', rating: 4.8, reviews: 345, image: '🏛️', description: 'Elpidio Quirino\'s ancestral house', business: 'National Museum' },
        { id: 4, name: 'Plaza Salcedo', price: 'FREE', rating: 4.6, reviews: 456, image: '⛲', description: 'Dancing fountain shows at night', business: 'Vigan City Gov' }
      ],
      food: [
        { id: 1, name: 'Café Leona', price: '₱₱', rating: 4.9, reviews: 1234, image: '🍽️', description: 'Ilocano cuisine in heritage house', business: 'Café Leona' },
        { id: 2, name: 'Vigan Empanada Plaza', price: '₱', rating: 5.0, reviews: 2341, image: '🥟', description: 'Legendary orange empanada', business: 'Various Vendors' },
        { id: 3, name: 'Kusina Felicitas', price: '₱₱', rating: 4.8, reviews: 567, image: '🍖', description: 'Bagnet, longganisa & Ilocano dishes', business: 'Kusina Felicitas' },
        { id: 4, name: 'Hidden Garden', price: '₱₱', rating: 4.7, reviews: 456, image: '🌿', description: 'Garden restaurant with local food', business: 'Hidden Garden' }
      ]
    },
    siargao: {
      activities: [
        { id: 1, name: 'Surfing Lesson at Cloud 9', price: '₱500', rating: 4.9, reviews: 2341, image: '🏄', description: '2-hour lesson with board rental', business: 'Cloud 9 Surf School' },
        { id: 2, name: 'Sugba Lagoon Boat Tour', price: '₱1,500', rating: 5.0, reviews: 1234, image: '🛥️', description: 'Cliff jumping & floating cottage', business: 'Sugba Tours' },
        { id: 3, name: 'Island Hopping 3 Islands', price: '₱1,800', rating: 4.9, reviews: 892, image: '🏝️', description: 'Naked, Daku, Guyam islands', business: 'Siargao Island Tours' },
        { id: 4, name: 'Motorbike Island Exploration', price: '₱350/day', rating: 4.8, reviews: 567, image: '🏍️', description: 'Rent & explore at your pace', business: 'Bike Rentals Siargao' }
      ],
      places: [
        { id: 1, name: 'Cloud 9 Boardwalk', price: 'FREE', rating: 5.0, reviews: 3456, image: '🌊', description: 'Iconic surf break viewing deck', business: 'Siargao Tourism' },
        { id: 2, name: 'Magpupungko Rock Pools', price: '₱50', rating: 4.8, reviews: 892, image: '🪨', description: 'Natural tidal pools (low tide only)', business: 'Pilar Tourism' },
        { id: 3, name: 'Sohoton Cove', price: '₱1,200', rating: 4.9, reviews: 567, image: '🦑', description: 'Stingless jellyfish & cave swimming', business: 'Socorro Tours' },
        { id: 4, name: 'Daku Island', price: 'incl. tour', rating: 4.7, reviews: 456, image: '🥥', description: 'Largest island with coconut groves', business: 'Island Hopping' }
      ],
      food: [
        { id: 1, name: 'Shaka Siargao', price: '₱₱₱', rating: 4.9, reviews: 1234, image: '🍽️', description: 'Healthy bowls & smoothies', business: 'Shaka Café' },
        { id: 2, name: 'Kermit Siargao', price: '₱₱', rating: 4.8, reviews: 892, image: '🍕', description: 'Italian wood-fired pizza', business: 'Kermit Restaurant' },
        { id: 3, name: 'Bravo Beach Resort Restaurant', price: '₱₱', rating: 4.7, reviews: 456, image: '🥘', description: 'Filipino & international beachfront', business: 'Bravo Beach' },
        { id: 4, name: 'General Luna Food Stalls', price: '₱', rating: 4.8, reviews: 678, image: '🍢', description: 'BBQ, seafood & local dishes', business: 'Various Vendors' }
      ]
    },
    'chocolate-hills': {
      activities: [
        { id: 1, name: 'ATV Tour Around Hills', price: '₱800', rating: 4.8, reviews: 567, image: '🏍️', description: 'Thrilling ride around the hills', business: 'Choco Hills ATV' },
        { id: 2, name: 'Loboc River Cruise', price: '₱500', rating: 4.9, reviews: 892, image: '🚤', description: 'Lunch buffet cruise with live music', business: 'Loboc River Cruises' },
        { id: 3, name: 'Tarsier Sanctuary Visit', price: '₱60', rating: 4.9, reviews: 1234, image: '🐵', description: 'See world\'s smallest primates', business: 'Tarsier Foundation' },
        { id: 4, name: 'Zipline Over Hills', price: '₱350', rating: 4.7, reviews: 345, image: '🎢', description: 'Adrenaline rush with views', business: 'Choco Hills Adventure' }
      ],
      places: [
        { id: 1, name: 'Chocolate Hills Viewpoint', price: '₱50', rating: 5.0, reviews: 2341, image: '🍫', description: '1,200+ cone-shaped hills', business: 'Carmen Tourism' },
        { id: 2, name: 'Baclayon Church', price: 'FREE', rating: 4.8, reviews: 456, image: '⛪', description: 'Oldest stone church in PH (1595)', business: 'Baclayon Heritage' },
        { id: 3, name: 'Blood Compact Shrine', price: 'FREE', rating: 4.6, reviews: 234, image: '🗿', description: 'Historic Spanish-Filipino pact site', business: 'Bohol Tourism' },
        { id: 4, name: 'Mahogany Forest', price: 'FREE', rating: 4.7, reviews: 567, image: '🌳', description: '2km man-made forest tunnel', business: 'Bilar Municipality' }
      ],
      food: [
        { id: 1, name: 'Gerarda\'s', price: '₱₱', rating: 4.8, reviews: 678, image: '🍽️', description: 'Home-style Filipino & seafood', business: 'Gerarda\'s Restaurant' },
        { id: 2, name: 'Loboc Riverwatch Floating Rest.', price: '₱₱', rating: 4.7, reviews: 892, image: '🚤', description: 'Buffet on floating restaurant', business: 'Loboc Riverwatch' },
        { id: 3, name: 'The Buzzz Café', price: '₱₱', rating: 4.6, reviews: 234, image: '🐝', description: 'Bee farm products & organic food', business: 'Bohol Bee Farm' },
        { id: 4, name: 'Carmen Public Market', price: '₱', rating: 4.7, reviews: 345, image: '🥘', description: 'Local street food & snacks', business: 'Carmen Market' }
      ]
    },
    mayon: {
      activities: [
        { id: 1, name: 'ATV Lava Trail Adventure', price: '₱1,500', rating: 4.9, reviews: 892, image: '🏍️', description: 'Ride through volcanic lava trails', business: 'Mayon ATV Tours' },
        { id: 2, name: 'Mayon Volcano Trekking', price: '₱2,500', rating: 4.8, reviews: 234, image: '🥾', description: 'Guided trek to base camp', business: 'Mayon Guides Assoc.' },
        { id: 3, name: 'Cagsawa Ruins Photography', price: 'FREE', rating: 4.9, reviews: 1234, image: '📷', description: 'Iconic ruins with Mayon backdrop', business: 'Daraga Tourism' },
        { id: 4, name: 'Whale Shark Watching Donsol', price: '₱3,500', rating: 5.0, reviews: 567, image: '🦈', description: 'Swim with whale sharks (seasonal)', business: 'Donsol Tourism' }
      ],
      places: [
        { id: 1, name: 'Cagsawa Ruins Park', price: '₱50', rating: 4.9, reviews: 2341, image: '🏛️', description: 'Iconic church ruins from 1814 eruption', business: 'Cagsawa Park' },
        { id: 2, name: 'Sumlang Lake', price: 'FREE', rating: 4.8, reviews: 678, image: '🌊', description: 'Perfect Mayon reflection in water', business: 'Camalig Tourism' },
        { id: 3, name: 'Lignon Hill Nature Park', price: '₱20', rating: 4.7, reviews: 456, image: '⛰️', description: 'Hilltop views of Mayon & city', business: 'Lignon Hill' },
        { id: 4, name: 'Hoyop-Hoyopan Cave', price: '₱100', rating: 4.6, reviews: 234, image: '🦇', description: 'Cathedral-like limestone cave', business: 'Camalig Cave Tours' }
      ],
      food: [
        { id: 1, name: 'Waway\'s Restaurant', price: '₱₱₱', rating: 4.8, reviews: 892, image: '🌶️', description: 'Authentic Bicol Express & laing', business: 'Waway\'s' },
        { id: 2, name: '1st Colonial Grill', price: '₱₱', rating: 4.7, reviews: 567, image: '🍽️', description: 'Spanish-Filipino fusion', business: '1st Colonial' },
        { id: 3, name: 'Small Talk Café', price: '₱₱', rating: 4.8, reviews: 678, image: '☕', description: 'Cozy café with Bicol specialties', business: 'Small Talk Café' },
        { id: 4, name: 'Legazpi Public Market', price: '₱', rating: 4.7, reviews: 456, image: '🌶️', description: 'Fresh Bicol Express ingredients & pili', business: 'Public Market' }
      ]
    }
  };

  const currentMarketplace = locationMarketplace[location.id] || { activities: [], places: [], food: [] };

  // Community insights data for each location
  const communityInsights = {
    manila: [
      { id: 1, user: 'Sean', avatar: '👨', message: 'Just visited Intramuros! The historical tours are amazing. Don\'t miss the sunset at Manila Bay - absolutely breathtaking! 🌅', time: '2 hours ago', likes: 12 },
      { id: 2, user: 'Jason', avatar: '🧔', message: 'Pro tip: Try the street food in Binondo! Authentic Chinese-Filipino fusion. The Lumpia and Siopao are to die for! 🍜', time: '5 hours ago', likes: 8 },
      { id: 3, user: 'Maria', avatar: '👩', message: 'Solo female traveler here! Manila is safe if you stick to main areas. BGC and Makati are very modern and tourist-friendly. Grab is your best friend! 🚗', time: '1 day ago', likes: 15 },
      { id: 4, user: 'Carlos', avatar: '👨‍💼', message: 'The National Museum is FREE and world-class! Spend at least half a day there. Also, Rizal Park at night is magical. ✨', time: '2 days ago', likes: 10 }
    ],
    cebu: [
      { id: 1, user: 'Jason', avatar: '🧔', message: 'The lechon here is UNREAL! Try CNT Lechon or Zubuchon. Best pork I\'ve ever had. Also, Sinulog Festival in January is a must-see! 🎉', time: '3 hours ago', likes: 20 },
      { id: 2, user: 'Sean', avatar: '👨', message: 'Went island hopping to Moalboal - saw sardine run and sea turtles! Book through local operators for better prices. Kawasan Falls is stunning! 🏝️', time: '6 hours ago', likes: 18 },
      { id: 3, user: 'Elena', avatar: '👩‍🦰', message: 'Magellan\'s Cross and Basilica del Santo Niño are free to visit. The history is incredible! Don\'t forget to try Cebu\'s dried mangoes - perfect pasalubong! 🥭', time: '1 day ago', likes: 14 },
      { id: 4, user: 'Mike', avatar: '🧑', message: 'For budget travelers: Stay in Fuente Osmeña area, lots of cheap hostels and restaurants. Jeepney rides are cheap but download maps offline! 🗺️', time: '3 days ago', likes: 9 }
    ],
    davao: [
      { id: 1, user: 'Sean', avatar: '👨', message: 'The Philippine Eagle Center blew my mind! Seeing these majestic birds up close is surreal. They\'re HUGE! Conservation fee is worth it. 🦅', time: '4 hours ago', likes: 25 },
      { id: 2, user: 'Anna', avatar: '👩', message: 'Tried durian for the first time at Magsaysay Park! Love it or hate it, but you MUST try it here. Also got fresh pomelo - so sweet! 🍈', time: '7 hours ago', likes: 11 },
      { id: 3, user: 'Jason', avatar: '🧔', message: 'Davao is SO clean and safe! You can walk around at night. Visited Eden Nature Park - perfect for families. The skyride has amazing views! 🌲', time: '2 days ago', likes: 16 },
      { id: 4, user: 'Rico', avatar: '🧑‍🦱', message: 'Climbed Mount Apo! 2-day trek, challenging but WORTH IT. Hire a local guide - they know the best routes and keep you safe. 🏔️', time: '4 days ago', likes: 22 }
    ],
    boracay: [
      { id: 1, user: 'Jason', avatar: '🧔', message: 'White Beach at Station 2 is paradise! Sand is like powder. Book sunset sailing - ₱2,500 for a group, includes drinks. Best experience ever! ⛵', time: '1 hour ago', likes: 30 },
      { id: 2, user: 'Sean', avatar: '👨', message: 'Tried helmet diving - you can walk underwater! Also did parasailing and island hopping. Book activities early morning for best rates. 🤿', time: '5 hours ago', likes: 24 },
      { id: 3, user: 'Sophie', avatar: '👩‍🦱', message: 'Puka Beach is less crowded than White Beach! Perfect for peaceful mornings. Station 1 has the finest sand. D\'Mall for shopping and food! 🛍️', time: '1 day ago', likes: 19 },
      { id: 4, user: 'Jake', avatar: '🧑', message: 'Budget tip: Stay in Station 3, way cheaper! Party at Epic nightclub if you\'re into that. Fire dancers at night are FREE entertainment! 🔥', time: '2 days ago', likes: 15 }
    ],
    palawan: [
      { id: 1, user: 'Sean', avatar: '👨', message: 'El Nido is BREATHTAKING! Did Tour A and C - Secret Lagoon and Hidden Beach are incredible. Kayaking through limestone cliffs is magical! 🛶', time: '2 hours ago', likes: 35 },
      { id: 2, user: 'Jason', avatar: '🧔', message: 'Book island hopping early! Tours fill up fast in peak season. Tour A is best for first-timers. Big Lagoon and Small Lagoon are must-sees! 🏝️', time: '6 hours ago', likes: 28 },
      { id: 3, user: 'Emma', avatar: '👩', message: 'Nacpan Beach is a hidden gem - 4km of pristine sand, barely any tourists! Rent a motorbike to get there. Las Cabanas beach for sunset! 🌅', time: '1 day ago', likes: 21 },
      { id: 4, user: 'Diego', avatar: '🧑‍🦰', message: 'Underground River in Puerto Princesa is world heritage! Book 2 days advance. The cave formations are insane. Bring a waterproof phone case! 📸', time: '3 days ago', likes: 26 }
    ],
    baguio: [
      { id: 1, user: 'Jason', avatar: '🧔', message: 'The weather is PERFECT! 15-20°C even in summer. Bring a jacket! Mines View Park has great strawberries and mountain views. 🍓', time: '3 hours ago', likes: 18 },
      { id: 2, user: 'Sean', avatar: '👨', message: 'Burnham Park boat rides are fun! Session Road for shopping and ukay-ukay finds. Good Shepherd for pasalubong - their ube jam is famous! 🫙', time: '8 hours ago', likes: 14 },
      { id: 3, user: 'Lily', avatar: '👩', message: 'Tam-Awan Village showcases Cordillera culture beautifully. Also visited Botanical Garden and Bell Church. The whole city is Instagram-worthy! 📷', time: '1 day ago', likes: 16 },
      { id: 4, user: 'Mark', avatar: '🧑', message: 'Traffic is CRAZY on weekends! Visit weekdays if possible. Try strawberry taho and fresh vegetables at the market. Affordable accommodations everywhere! 🚗', time: '2 days ago', likes: 12 }
    ],
    vigan: [
      { id: 1, user: 'Sean', avatar: '👨', message: 'Calle Crisologo at night is like time travel! Cobblestone streets, Spanish houses, kalesa rides - pure magic. No cars allowed, so peaceful! 🐴', time: '4 hours ago', likes: 22 },
      { id: 2, user: 'Jason', avatar: '🧔', message: 'Vigan empanada is LEGENDARY! Orange shell, filled with veggies and egg. Also tried bagnet and longganisa - Ilocano food is underrated! 🥟', time: '7 hours ago', likes: 19 },
      { id: 3, user: 'Rosa', avatar: '👩', message: 'Stayed at a heritage hotel - felt like Spanish colonial times! Crisologo Museum and Bantay Bell Tower are must-visits. The architecture is preserved perfectly! 🏛️', time: '2 days ago', likes: 15 },
      { id: 4, user: 'Luis', avatar: '🧑', message: 'Don\'t miss Baluarte Zoo (FREE!) and pottery-making at Pagburnayan. Buy authentic Vigan jars as souvenirs. Very affordable place to visit! 🏺', time: '3 days ago', likes: 13 }
    ],
    siargao: [
      { id: 1, user: 'Jason', avatar: '🧔', message: 'Cloud 9 boardwalk is iconic! Watched surfers catch massive waves. Even if you don\'t surf, the vibe here is incredible. Sunset sessions! 🏄', time: '2 hours ago', likes: 28 },
      { id: 2, user: 'Sean', avatar: '👨', message: 'Took a surf lesson at Cloud 9 - stood up on my first day! ₱500 for 2 hours with board rental. Instructors are patient and friendly! 🌊', time: '5 hours ago', likes: 24 },
      { id: 3, user: 'Mia', avatar: '👩', message: 'Sugba Lagoon is a MUST! Crystal clear water, floating cottages, cliff jumping. Book a boat tour - ₱1,500 per person, includes lunch. Heaven! 🛥️', time: '1 day ago', likes: 31 },
      { id: 4, user: 'Alex', avatar: '🧑', message: 'Island hopping to Naked Island, Daku, and Guyam! Pack snacks and water. Rent a motorbike to explore - roads are good. Laid-back island life! 🏝️', time: '2 days ago', likes: 20 }
    ],
    'chocolate-hills': [
      { id: 1, user: 'Sean', avatar: '👨', message: 'The hills are STUNNING! Over 1,200 of them! Best viewed from the observation deck. Visit during dry season when they turn chocolate brown! 🍫', time: '3 hours ago', likes: 26 },
      { id: 2, user: 'Jason', avatar: '🧔', message: 'Combined this with Tarsier Sanctuary - saw the world\'s smallest primates! They\'re nocturnal but so cute. Loboc River cruise for lunch is relaxing! 🐵', time: '6 hours ago', likes: 22 },
      { id: 3, user: 'Nina', avatar: '👩', message: 'Did ATV tour around the hills - super fun! Panglao beaches are just 2 hours away. Bohol is packed with attractions, plan at least 3 days! 🏍️', time: '1 day ago', likes: 18 },
      { id: 4, user: 'Tom', avatar: '🧑', message: 'Baclayon Church and Blood Compact Shrine are nearby. The geological formation is unique in the world! Entrance fee is minimal. Worth the trip! ⛰️', time: '3 days ago', likes: 14 }
    ],
    mayon: [
      { id: 1, user: 'Jason', avatar: '🧔', message: 'The perfect cone shape is unreal! Did ATV tour around Mayon - thrilling ride through lava trails. Cagsawa Ruins with Mayon backdrop is iconic! 🌋', time: '4 hours ago', likes: 24 },
      { id: 2, user: 'Sean', avatar: '👨', message: 'Tried authentic Bicol Express and laing - SO SPICY but delicious! The food here is incredible. Pili nuts as pasalubang are unique! 🌶️', time: '7 hours ago', likes: 19 },
      { id: 3, user: 'Isabella', avatar: '👩', message: 'Climbed to Mayon\'s base camp - challenging but manageable. The view of Albay province from up there is spectacular. Hire certified guides! 🥾', time: '2 days ago', likes: 21 },
      { id: 4, user: 'Rafael', avatar: '🧑', message: 'Legazpi is underrated! Whale shark watching in Donsol is nearby. The city is clean and organized. Sumlang Lake has perfect Mayon reflection! 📷', time: '3 days ago', likes: 17 }
    ]
  };

  const currentCommunity = communityInsights[location.id] || [];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: Date.now(),
        user: 'You',
        avatar: '😊',
        message: newMessage,
        time: 'Just now',
        likes: 0,
        isOwn: true
      };
      setCommunityMessages([...communityMessages, newMsg]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLike = (messageId) => {
    setMessageLikes(prev => ({
      ...prev,
      [messageId]: (prev[messageId] || 0) + 1
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="modal-header">
          <h2>{location.name}</h2>
          <div className="region-badge">{location.region}</div>
        </div>

        {/* Tab Navigation */}
        <div className="modal-tabs">
          <button 
            className={`tab-button ${!showCommunity ? 'active' : ''}`}
            onClick={() => setShowCommunity(false)}
          >
            📍 Information
          </button>
          <button 
            className={`tab-button ${showCommunity ? 'active' : ''}`}
            onClick={() => setShowCommunity(true)}
          >
            💬 Community Chat
            <span className="tab-badge">{currentCommunity.length + communityMessages.length}</span>
          </button>
        </div>

        <div className="modal-body">
          {/* Information Tab */}
          {!showCommunity && (
            <div className="info-section">
              <div className="location-image">
                <img 
                  src={location.image || '/assets/images/philippines-placeholder.jpg'} 
                  alt={location.name}
                  onError={(e) => {
                    e.target.src = '/assets/images/philippines-placeholder.jpg';
                  }}
                />
              </div>

              <p className="location-description">
                {location.description || 'Discover this beautiful location in the Philippines!'}
              </p>

              {/* Marketplace Categories */}
              <div className="marketplace-section">
                <div className="marketplace-tabs">
                  <button 
                    className={`marketplace-tab ${activeCategory === 'activities' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('activities')}
                  >
                    <span className="tab-icon">🎯</span>
                    <span className="tab-label">Activities</span>
                  </button>
                  <button 
                    className={`marketplace-tab ${activeCategory === 'places' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('places')}
                  >
                    <span className="tab-icon">📍</span>
                    <span className="tab-label">Places</span>
                  </button>
                  <button 
                    className={`marketplace-tab ${activeCategory === 'food' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('food')}
                  >
                    <span className="tab-icon">🍴</span>
                    <span className="tab-label">Food</span>
                  </button>
                </div>

                <div className="marketplace-content">
                  {currentMarketplace[activeCategory]?.map((item) => (
                    <div key={item.id} className="marketplace-card">
                      <div className="card-emoji">{item.image}</div>
                      <div className="card-info">
                        <h5 className="card-name">{item.name}</h5>
                        <p className="card-description">{item.description}</p>
                        <div className="card-meta">
                          <span className="card-price">{item.price}</span>
                          <span className="card-rating">
                            ⭐ {item.rating} <span className="reviews">({item.reviews})</span>
                          </span>
                        </div>
                        <p className="card-business">🏢 {item.business}</p>
                      </div>
                      <button className="card-action">
                        <span>📱</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Community Chat Tab */}
          {showCommunity && (
            <div className="community-section">
              <div className="community-messages">
                {currentCommunity.map((msg) => {
                  const messageKey = `${location.id}-${msg.id}`;
                  const currentLikes = messageLikes[messageKey] !== undefined 
                    ? msg.likes + messageLikes[messageKey]
                    : msg.likes;
                  
                  return (
                    <div key={msg.id} className="community-message">
                      <div className="message-avatar">{msg.avatar}</div>
                      <div className="message-content">
                        <div className="message-header">
                          <span className="message-user">{msg.user}</span>
                          <span className="message-time">{msg.time}</span>
                        </div>
                        <p className="message-text">{msg.message}</p>
                        <div className="message-footer">
                          <button 
                            className="message-like"
                            onClick={() => handleLike(messageKey)}
                          >
                            <span>👍</span> {currentLikes}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {communityMessages.map((msg, index) => (
                  <div key={index} className={`community-message ${msg.user === 'You' ? 'own-message' : ''}`}>
                    <div className="message-avatar">{msg.avatar}</div>
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-user">{msg.user}</span>
                        <span className="message-time">{msg.time}</span>
                      </div>
                      <p className="message-text">{msg.message}</p>
                      <div className="message-footer">
                        <button 
                          className="message-like"
                          onClick={() => handleLike(`${msg.id || index}`)}
                        >
                          <span>👍</span> {messageLikes[`${msg.id || index}`] || msg.likes || 0}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="community-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share your experience..."
                  className="message-input"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="send-button"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onMarkBeen} className="btn btn-success">
            ✅ Been There
          </button>
          <button onClick={onMarkWant} className="btn btn-warning">
            ⭐ Want to Go
          </button>
          <button onClick={onAskAI} className="btn btn-primary">
            🤖 Ask AI
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
