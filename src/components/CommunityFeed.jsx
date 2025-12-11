/**
 * CommunityFeed Component
 * 
 * Posts: Hardcoded sample data (local state, resets on refresh)
 * Chat: Real-time Firebase (fully functional)
 */

import React, { useState, useEffect, useRef } from 'react';
import './CommunityFeed.css';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';

const CommunityFeed = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    location: '',
    content: '',
    imageUrl: ''
  });
  const [editingPost, setEditingPost] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);
  const [showThreadPopup, setShowThreadPopup] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [newThreadName, setNewThreadName] = useState('');
  const [showCreateThreadModal, setShowCreateThreadModal] = useState(false);

  const samplePosts = [
    {
      id: 'sample-1',
      userId: 'demo-user-1',
      userName: 'Maria Santos',
      userPhoto: 'https://i.pravatar.cc/150?img=5',
      location: 'Boracay, Aklan',
      content: 'Just got back from an amazing weekend at White Beach! The sunset was absolutely breathtaking. Can\'t wait to go back! 🌅',
      imageUrls: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'],
      likes: 24,
      likedBy: [],
      comments: [
        {
          id: 'c1',
          userId: 'demo-user-2',
          userName: 'Juan Dela Cruz',
          userAvatar: 'https://i.pravatar.cc/150?img=12',
          text: 'Wow! This looks amazing! 😍',
          timestamp: new Date(Date.now() - 3600000)
        }
      ],
      createdAt: { seconds: Math.floor(Date.now() / 1000) - 86400 }
    },
    {
      id: 'sample-2',
      userId: 'demo-user-2',
      userName: 'Juan Dela Cruz',
      userPhoto: 'https://i.pravatar.cc/150?img=12',
      location: 'Chocolate Hills, Bohol',
      content: 'The Chocolate Hills never disappoint! Such a unique landscape. Highly recommend visiting during the dry season. 🍫🏔️',
      imageUrls: [
        'https://images.unsplash.com/photo-1578469645742-27e5dd1d4ec4?w=800',
        'https://images.unsplash.com/photo-1621277224630-81d9af65e40e?w=800'
      ],
      likes: 42,
      likedBy: [],
      comments: [],
      createdAt: { seconds: Math.floor(Date.now() / 1000) - 172800 }
    },
    {
      id: 'sample-3',
      userId: 'demo-user-3',
      userName: 'Sarah Johnson',
      userPhoto: 'https://i.pravatar.cc/150?img=9',
      location: 'El Nido, Palawan',
      content: 'Island hopping in El Nido was the highlight of my Philippines trip! Crystal clear waters and stunning limestone cliffs. Paradise found! 🏝️✨',
      imageUrls: ['https://images.unsplash.com/photo-1583316130613-29a86fa1b5f6?w=800'],
      likes: 67,
      likedBy: [],
      comments: [
        {
          id: 'c2',
          userId: 'demo-user-1',
          userName: 'Maria Santos',
          userAvatar: 'https://i.pravatar.cc/150?img=5',
          text: 'Adding this to my bucket list! 🙌',
          timestamp: new Date(Date.now() - 7200000)
        },
        {
          id: 'c3',
          userId: 'demo-user-4',
          userName: 'Pedro Reyes',
          userAvatar: 'https://i.pravatar.cc/150?img=15',
          text: 'Been there last year, truly magical!',
          timestamp: new Date(Date.now() - 5400000)
        }
      ],
      createdAt: { seconds: Math.floor(Date.now() / 1000) - 259200 }
    },
    {
      id: 'sample-4',
      userId: 'demo-user-4',
      userName: 'Pedro Reyes',
      userPhoto: 'https://i.pravatar.cc/150?img=15',
      location: 'Mayon Volcano, Albay',
      content: 'Witnessed the perfect cone of Mayon Volcano up close! The ATV adventure to the viewing deck was thrilling. Nature\'s masterpiece! 🌋',
      imageUrls: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
      likes: 31,
      likedBy: [],
      comments: [],
      createdAt: { seconds: Math.floor(Date.now() / 1000) - 345600 }
    },
    {
      id: 'sample-5',
      userId: 'demo-user-5',
      userName: 'Anna Lee',
      userPhoto: 'https://i.pravatar.cc/150?img=20',
      location: 'Banaue Rice Terraces, Ifugao',
      content: 'The ancient rice terraces are mind-blowing! Built 2000 years ago and still functioning. The Ifugao people\'s engineering is incredible. A UNESCO World Heritage Site you must see! 🌾',
      imageUrls: [
        'https://images.unsplash.com/photo-1580501170888-80668882ca0c?w=800',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
      ],
      likes: 89,
      likedBy: [],
      comments: [
        {
          id: 'c4',
          userId: 'demo-user-3',
          userName: 'Sarah Johnson',
          userAvatar: 'https://i.pravatar.cc/150?img=9',
          text: 'This is on my list for next year!',
          timestamp: new Date(Date.now() - 10800000)
        }
      ],
      createdAt: { seconds: Math.floor(Date.now() / 1000) - 432000 }
    }
  ];

  useEffect(() => {
    const threadsRef = collection(db, 'chatThreads');
    const q = query(threadsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const threadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // ⭐ NEW: If no threads exist, create a default "General" thread
      if (threadsData.length === 0) {
        try {
          console.log('📝 No threads found. Creating default "General" thread...');
          const defaultThreadData = {
            name: 'General',
            createdBy: 'system',
            createdByName: 'System',
            createdAt: serverTimestamp(),
            lastMessage: serverTimestamp(),
            lastMessageText: 'Welcome to the community chat!'
          };
          
          const docRef = await addDoc(threadsRef, defaultThreadData);
          console.log('✅ Default "General" thread created with ID:', docRef.id);
          
          // Add welcome message to the new thread
          await addDoc(
            collection(db, 'chatThreads', docRef.id, 'messages'),
            {
              userId: 'system',
              userName: 'System',
              userAvatar: '🤖',
              text: 'Welcome to the Travel Community chat! Feel free to share your travel experiences and connect with fellow travelers. 🌏✈️',
              createdAt: serverTimestamp()
            }
          );
          
          return; // Let the listener trigger again with the new thread
        } catch (error) {
          console.error('❌ Error creating default thread:', error);
        }
      }
      
      setThreads(threadsData);
      
      // Set active thread to first one if not set
      if (!activeThread && threadsData.length > 0) {
        setActiveThread(threadsData[0]);
      }
      
      console.log('💬 Threads loaded:', threadsData.length);
    }, (error) => {
      console.error('❌ Error loading threads:', error);
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for messages in active thread
  useEffect(() => {
    if (!activeThread) return;

    const messagesRef = collection(db, 'chatThreads', activeThread.id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Update the active thread with messages
      setActiveThread(prev => ({
        ...prev,
        messages: messagesData
      }));
      
      console.log(`💬 Messages loaded for thread "${activeThread.name}":`, messagesData.length);
    }, (error) => {
      console.error('❌ Error loading messages:', error);
    });

    return () => unsubscribe();
  }, [activeThread?.id]);

  // ⭐ MODIFIED: Use hardcoded sample posts instead of Firebase (for demo without Storage billing)
  useEffect(() => {
    // Load sample posts into state
    setPosts(samplePosts);
    console.log('📝 Sample posts loaded:', samplePosts.length);
  }, []); // Load once on mount

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (activeTab === 'chat' && activeThread?.messages) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThread?.messages, activeTab]);

  // Upload images to Firebase Storage
  // Create post in local state only
  const handleCreatePost = async () => {
    if (!currentUser) {
      alert('Please login to create posts!');
      return;
    }

    if (!newPost.location.trim() || !newPost.content.trim()) {
      alert('Please fill in all fields!');
      return;
    }

    setIsUploading(true);

    try {
      let imageUrls = [];
      if (newPost.imageUrl && newPost.imageUrl.trim()) {
        imageUrls = [newPost.imageUrl.trim()];
        console.log('✅ Using image URL:', imageUrls[0]);
      }

      const postData = {
        id: `post-${Date.now()}`, // Generate unique ID for local state
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        userPhoto: currentUser.photoURL || 'https://i.pravatar.cc/150?img=0',
        location: newPost.location,
        content: newPost.content,
        imageUrls: imageUrls,
        likes: 0,
        likedBy: [],
        comments: [],
        createdAt: new Date()
      };

      console.log('📝 Adding post to local state:', postData);
      setPosts([postData, ...posts]);
      
      console.log('✅ Post added to local state with ID:', postData.id);
    
      setNewPost({ location: '', content: '', imageUrl: '' });
      setShowCreatePost(false);
    
      alert('Post created! 🎉\n\nNote: This is demo mode - posts will reset on page refresh.');
    } catch (error) {
      console.error('❌ Error creating post:', error);
      alert(`Failed to create post: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // ⭐ NEW: Handler to send chat messages to Firebase
  // This function adds a new message to the active thread's messages subcollection
  const handleSendMessage = async () => {
    // Validation: Check if message is not empty, user is logged in, and thread is selected
    if (!newMessage.trim() || !currentUser || !activeThread) return;

    try {
      // Create message data object with user info and timestamp
      const messageData = {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        userAvatar: currentUser.photoURL || '👤',
        text: newMessage,
        createdAt: serverTimestamp() // Firebase timestamp for sorting
      };

      // Add message to Firestore: chatThreads/{threadId}/messages
      await addDoc(
        collection(db, 'chatThreads', activeThread.id, 'messages'),
        messageData
      );

      // Update the thread's last message info for the sidebar
      await updateDoc(doc(db, 'chatThreads', activeThread.id), {
        lastMessage: serverTimestamp(),
        lastMessageText: newMessage.substring(0, 50) + (newMessage.length > 50 ? '...' : '')
      });

      console.log('✅ Message sent to thread:', activeThread.name);
      setNewMessage(''); // Clear input field after sending
    } catch (error) {
      console.error('❌ Error sending message:', error);
      alert('Failed to send message');
    }
  };

  // ⭐ NEW: Handler to create new chat threads
  // This function creates a new thread in Firebase and makes it active
  const handleCreateThread = async () => {
    // Validation: Check if thread name is not empty and user is logged in
    if (!newThreadName.trim() || !currentUser) {
      if (!currentUser) {
        alert('Please login to create threads!');
      } else {
        alert('Please enter a thread name!');
      }
      return;
    }

    try {
      // Create thread data object with creator info
      const threadData = {
        name: newThreadName,
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
        lastMessage: serverTimestamp(),
        lastMessageText: 'Thread created'
      };

      // Add thread to Firestore: chatThreads collection
      const docRef = await addDoc(collection(db, 'chatThreads'), threadData);
      console.log('✅ Thread created:', newThreadName);
      
      // Reset form and close modal
      setNewThreadName('');
      setShowCreateThreadModal(false);
      
      // Set as active thread (without messages initially - they'll load via useEffect)
      setActiveThread({
        id: docRef.id,
        ...threadData,
        messages: [] // Initialize with empty messages array
      });
    } catch (error) {
      console.error('❌ Error creating thread:', error);
      alert('Failed to create thread');
    }
  };

  // ⭐ NEW: Handler functions for post interactions (like, delete, edit, comment)
  // These were completely missing, causing PostCard to not work properly

  const handleLikePost = async (postId) => {
    if (!currentUser) {
      alert('Please login to like posts!');
      return;
    }

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const isLiked = post.likedBy?.includes(currentUser.uid);
      
      // Update local state
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            likes: isLiked ? Math.max(0, p.likes - 1) : (p.likes || 0) + 1,
            likedBy: isLiked 
              ? p.likedBy.filter(uid => uid !== currentUser.uid)
              : [...(p.likedBy || []), currentUser.uid]
          };
        }
        return p;
      }));

      console.log(isLiked ? '👎 Post unliked' : '👍 Post liked');
    } catch (error) {
      console.error('❌ Error updating like:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!currentUser) return;

    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        setPosts(posts.filter(p => p.id !== postId));
        console.log('✅ Post deleted successfully');
      } catch (error) {
        console.error('❌ Error deleting post:', error);
        alert('Failed to delete post');
      }
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost || !currentUser) return;

    try {
      const postRef = doc(db, 'posts', editingPost.id);
      await updateDoc(postRef, {
        location: editingPost.location,
        content: editingPost.content,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Post updated successfully');
      setEditingPost(null);
    } catch (error) {
      console.error('❌ Error updating post:', error);
      alert('Failed to update post');
    }
  };

  const handleAddComment = async (postId, commentText) => {
    if (!commentText.trim() || !currentUser) return;

    const comment = {
      id: Date.now().toString(),
      userId: currentUser.uid,
      userName: currentUser.displayName || 'Anonymous',
      userAvatar: currentUser.photoURL || '👤',
      text: commentText,
      timestamp: new Date()
    };

    try {
      // Update local state
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...(p.comments || []), comment]
          };
        }
        return p;
      }));
      
      console.log('✅ Comment added');
      setReplyingTo(null);
    } catch (error) {
      console.error('❌ Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!currentUser) return;

    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        // Update local state
        setPosts(posts.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              comments: p.comments.filter(c => c.id !== commentId)
            };
          }
          return p;
        }));
        
        console.log('✅ Comment deleted');
      } catch (error) {
        console.error('❌ Error deleting comment:', error);
      }
    }
  };

  // ⭐ NEW: Main return statement - This renders the entire CommunityFeed UI
  // Without this, the component has logic but nothing displays on screen
  return (
    <div className="community-feed">
      <div className="community-header">
        <h1>🌏 Travel Community</h1>
        <p>Share your adventures and connect with fellow travelers</p>
      </div>

      {!currentUser && (
        <div className="login-prompt" style={{ 
          padding: '20px', 
          textAlign: 'center', 
          backgroundColor: '#f0f4ff', 
          borderRadius: '8px', 
          margin: '20px 0',
          border: '2px solid #667eea'
        }}>
          <p style={{ fontSize: '16px', color: '#667eea', fontWeight: '600' }}>
            👋 Please login to create posts and interact with the community!
          </p>
        </div>
      )}

      {/* ⭐ Tabs to switch between Posts and Chat */}
      <div className="community-tabs">
        <button 
          className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          📝 Posts
        </button>
        <button 
          className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 Chat
        </button>
      </div>

      {/* ⭐ Posts Tab Content */}
      {activeTab === 'posts' && (
        <div className="posts-section">
          {currentUser && (
            <button className="create-post-btn" onClick={() => setShowCreatePost(true)}>
              ✨ Share Your Travel Story
            </button>
          )}

          {/* ⭐ NEW: Create Post Modal - This was completely missing! */}
          {/* Without this modal, clicking "Share Your Travel Story" does nothing */}
          {showCreatePost && (
            <div 
              onClick={() => setShowCreatePost(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}
            >
              <div 
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  width: '600px',
                  maxWidth: '90%',
                  maxHeight: '80vh',
                  overflowY: 'auto',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                }}
              >
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ margin: 0, fontSize: '24px', color: '#333' }}>Create New Post</h2>
                  <button 
                    onClick={() => {
                      setShowCreatePost(false);
                      setNewPost({ location: '', content: '', imageUrl: '' });
                    }}
                    disabled={isUploading}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: isUploading ? 'not-allowed' : 'pointer',
                      color: '#999',
                      padding: '0',
                      width: '30px',
                      height: '30px'
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                    📍 Location
                  </label>
                  <input 
                    type="text" 
                    placeholder="Where did you go? (e.g., Boracay, Aklan)" 
                    value={newPost.location} 
                    onChange={(e) => setNewPost({ ...newPost, location: e.target.value })} 
                    disabled={isUploading}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                    ✍️ Your Story
                  </label>
                  <textarea 
                    placeholder="Share your experience..." 
                    value={newPost.content} 
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} 
                    disabled={isUploading}
                    rows="5"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* ⭐ MODIFIED: Use image URL input instead of file upload */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                    🖼️ Image URL (Optional)
                  </label>
                  <input 
                    type="text" 
                    placeholder="Paste image URL (e.g., https://images.unsplash.com/...)" 
                    value={newPost.imageUrl || ''} 
                    onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })} 
                    disabled={isUploading}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
                    💡 Try <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>Unsplash</a> or <a href="https://picsum.photos" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>Lorem Picsum</a> for free images
                  </p>
                </div>

                {newPost.imageUrl && (
                  <div style={{ marginBottom: '16px' }}>
                    <img 
                      src={newPost.imageUrl} 
                      alt="Preview" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'block';
                      }}
                      style={{ 
                        width: '100%', 
                        maxHeight: '200px', 
                        objectFit: 'cover', 
                        borderRadius: '8px',
                        border: '2px solid #e0e0e0'
                      }}
                    />
                    <p style={{ 
                      display: 'none', 
                      color: '#e74c3c', 
                      fontSize: '12px', 
                      marginTop: '6px' 
                    }}>
                      ❌ Failed to load image. Please check the URL.
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={handleCreatePost}
                    disabled={isUploading || !newPost.location.trim() || !newPost.content.trim()}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: (isUploading || !newPost.location.trim() || !newPost.content.trim()) ? '#ccc' : '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: (isUploading || !newPost.location.trim() || !newPost.content.trim()) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isUploading ? '⏳ Posting...' : '📤 Post'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="posts-list">
            {posts.length === 0 ? (
              <div className="empty-feed" style={{
                padding: '60px 20px',
                textAlign: 'center',
                color: '#999'
              }}>
                <p style={{ fontSize: '48px', marginBottom: '10px' }}>📭</p>
                <p style={{ fontSize: '18px' }}>No posts yet. Be the first to share your travel story!</p>
              </div>
            ) : (
              posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onLike={handleLikePost} // ⭐ ADDED: Handler for liking posts
                  onDelete={handleDeletePost} // ⭐ ADDED: Handler for deleting posts
                  onEdit={setEditingPost} // ⭐ ADDED: Handler for editing posts
                  onAddComment={handleAddComment} // ⭐ ADDED: Handler for adding comments
                  onDeleteComment={handleDeleteComment} // ⭐ ADDED: Handler for deleting comments
                  editingPost={editingPost} // ⭐ ADDED: Current post being edited
                  onUpdatePost={handleUpdatePost} // ⭐ ADDED: Handler to save edited post
                  onCancelEdit={() => setEditingPost(null)} // ⭐ ADDED: Handler to cancel editing
                  replyingTo={replyingTo} // ⭐ ADDED: Current comment being replied to
                  setReplyingTo={setReplyingTo} // ⭐ ADDED: Handler to set reply target
                  formatTimestamp={(timestamp) => {
                    if (!timestamp) return 'Just now';
                    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
                    const now = new Date();
                    const diff = now - date;
                    const minutes = Math.floor(diff / 60000);
                    const hours = Math.floor(diff / 3600000);
                    const days = Math.floor(diff / 86400000);
                    if (minutes < 1) return 'Just now';
                    if (minutes < 60) return `${minutes}m ago`;
                    if (hours < 24) return `${hours}h ago`;
                    return `${days}d ago`;
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* ⭐ Chat Tab Content - This is where messages should display */}
      {activeTab === 'chat' && (
        <div className="chat-section" style={{ display: 'flex', height: '600px' }}>
          {/* ⭐ Sidebar showing all available threads */}
          <div className="thread-sidebar" style={{ 
            width: '240px', 
            borderRight: '1px solid #e0e0e0', 
            padding: '12px',
            overflowY: 'auto'
          }}>
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#667eea' }}>Channels</span>
              {/* ⭐ NEW: Button to create new threads */}
              <button
                onClick={() => setShowCreateThreadModal(true)}
                disabled={!currentUser}
                style={{
                  padding: '4px 8px',
                  backgroundColor: currentUser ? '#667eea' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: currentUser ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold'
                }}
                title={currentUser ? 'Create new channel' : 'Login to create channels'}
              >
                + New
              </button>
            </div>
            {threads.length === 0 ? (
              <p style={{ color: '#999', fontSize: '14px', fontStyle: 'italic' }}>Loading threads...</p>
            ) : (
              threads.map(thread => (
                <div
                  key={thread.id}
                  onClick={() => {
                    // ⭐ FIXED: When clicking a thread, preserve existing messages or initialize with empty array
                    // This prevents messages from disappearing when switching threads
                    setActiveThread({
                      ...thread,
                      messages: activeThread?.id === thread.id ? activeThread.messages : [] // Keep current messages if same thread, else reset
                    });
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginBottom: '4px',
                    backgroundColor: activeThread?.id === thread.id ? '#e8eaf6' : 'transparent',
                    fontWeight: activeThread?.id === thread.id ? '600' : '400',
                    color: activeThread?.id === thread.id ? '#667eea' : '#333',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => {
                    if (activeThread?.id !== thread.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  # {thread.name}
                </div>
              ))
            )}
          </div>

          {/* ⭐ Main chat area showing messages */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {activeThread ? (
              <>
                {/* ⭐ Chat header */}
                <div style={{ 
                  padding: '16px', 
                  borderBottom: '1px solid #e0e0e0',
                  fontWeight: 'bold',
                  fontSize: '18px'
                }}>
                  # {activeThread.name}
                </div>

                {/* ⭐ Messages display area - THIS IS THE KEY PART */}
                <div style={{ 
                  flex: 1, 
                  overflowY: 'auto', 
                  padding: '16px',
                  backgroundColor: '#fafafa'
                }}>
                  {/* ⭐ Check if messages exist and render them */}
                  {!activeThread.messages || activeThread.messages.length === 0 ? (
                    <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>
                      No messages yet. Start the conversation!
                    </p>
                  ) : (
                    // ⭐ Map through messages array and display each message
                    activeThread.messages.map(message => (
                      <div
                        key={message.id}
                        style={{
                          marginBottom: '16px',
                          padding: '12px',
                          backgroundColor: message.userId === currentUser?.uid ? '#e3f2fd' : 'white',
                          borderRadius: '8px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          maxWidth: '80%',
                          marginLeft: message.userId === currentUser?.uid ? 'auto' : '0',
                          marginRight: message.userId === currentUser?.uid ? '0' : 'auto'
                        }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          marginBottom: '4px',
                          gap: '8px'
                        }}>
                          <span style={{ fontSize: '20px' }}>
                            {message.userAvatar && message.userAvatar.startsWith('http') ? (
                              <img 
                                src={message.userAvatar} 
                                alt={message.userName}
                                style={{ 
                                  width: '24px', 
                                  height: '24px', 
                                  borderRadius: '50%', 
                                  objectFit: 'cover' 
                                }}
                              />
                            ) : (
                              message.userAvatar
                            )}
                          </span>
                          <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#667eea' }}>
                            {message.userName}
                          </span>
                          <span style={{ fontSize: '12px', color: '#999', marginLeft: 'auto' }}>
                            {message.createdAt ? (
                              message.createdAt.seconds ? 
                                new Date(message.createdAt.seconds * 1000).toLocaleTimeString() : 
                                'Just now'
                            ) : 'Just now'}
                          </span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#333', wordBreak: 'break-word' }}>
                          {message.text}
                        </div>
                      </div>
                    ))
                  )}
                  {/* ⭐ Auto-scroll anchor */}
                  <div ref={chatEndRef} />
                </div>

                {/* ⭐ Message input area */}
                <div style={{ 
                  padding: '16px', 
                  borderTop: '1px solid #e0e0e0',
                  display: 'flex',
                  gap: '8px',
                  backgroundColor: 'white'
                }}>
                  <input
                    type="text"
                    placeholder={`Message #${activeThread.name}`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={!currentUser}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !currentUser}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: !newMessage.trim() || !currentUser ? '#ccc' : '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: !newMessage.trim() || !currentUser ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    Send ➤
                  </button>
                </div>
              </>
            ) : (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#999',
                fontSize: '16px'
              }}>
                Select a channel to start chatting
              </div>
            )}
          </div>
        </div>
      )}

      {/* ⭐ NEW: Create Thread Modal */}
      {showCreateThreadModal && (
        <div 
          onClick={() => setShowCreateThreadModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              width: '400px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#333' }}>
              Create New Channel
            </h3>
            <input
              type="text"
              placeholder="Enter channel name (e.g., Beach Trips)"
              value={newThreadName}
              onChange={(e) => setNewThreadName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateThread();
                }
              }}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '16px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowCreateThreadModal(false);
                  setNewThreadName('');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateThread}
                disabled={!newThreadName.trim()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: newThreadName.trim() ? '#667eea' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: newThreadName.trim() ? 'pointer' : 'not-allowed',
                  fontWeight: '500'
                }}
              >
                Create Channel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; // ⭐ End of CommunityFeed component

  const PostCard = ({
    post,
    currentUser,
    onLike,
    onDelete,
    onEdit,
    onAddComment,
    onDeleteComment,
    formatTimestamp,
    editingPost,
    onUpdatePost,
    onCancelEdit,
    replyingTo,
    setReplyingTo
  }) => {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');

    const handleSubmitComment = () => {
      onAddComment(post.id, commentText);
      setCommentText('');
    };

    if (editingPost && editingPost.id === post.id) {
      return (
        <div className="post-card editing">
          <div className="post-header">
            <h3>Edit Post</h3>
            <button className="cancel-edit-btn" onClick={onCancelEdit}>✕</button>
          </div>
          <input
            type="text"
            placeholder="Location"
            value={editingPost.location}
            onChange={(e) => onEdit({ ...editingPost, location: e.target.value })}
            className="post-input"
          />
          <textarea
            placeholder="Content"
            value={editingPost.content}
            onChange={(e) => onEdit({ ...editingPost, content: e.target.value })}
            className="post-textarea"
            rows="4"
          />
          <button className="save-edit-btn" onClick={onUpdatePost}>Save Changes</button>
        </div>
      );
    }

    return (
      <div className="post-card">
        <div className="post-header">
          <div className="post-user-info">
            <img
              src={post.userPhoto || 'https://via.placeholder.com/40'}
              alt={post.userName}
              className="user-avatar"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <div className="user-details">
              <span className="user-name">{post.userName}</span>
              <span className="post-location" style={{ fontSize: '12px', color: '#667eea' }}>
                📍 {post.location}
              </span>
              <span className="post-time">{formatTimestamp(post.createdAt)}</span>
            </div>
          </div>
          {currentUser && post.userId === currentUser.uid && (
            <div className="post-actions">
              <button className="action-btn edit-btn" onClick={() => onEdit({ ...post })} title="Edit post">✏️</button>
              <button className="action-btn delete-btn" onClick={() => onDelete(post.id)} title="Delete post">🗑️</button>
            </div>
          )}
        </div>

        <div className="post-content">
          <p className="post-description">{post.content}</p>
        
          {post.imageUrls && post.imageUrls.length > 0 && (
            <div className="post-image" style={{
              display: 'grid',
              gridTemplateColumns: post.imageUrls.length === 1 ? '1fr' : 'repeat(2, 1fr)',
              gap: '10px',
              marginTop: '10px'
            }}>
              {post.imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Post image ${index + 1}`}
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    maxHeight: '300px'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="post-footer">
          <button
            className={`post-footer-btn like-btn ${post.likedBy?.includes(currentUser?.uid) ? 'liked' : ''}`}
            onClick={() => onLike(post.id)}
            disabled={!currentUser}
            style={{
              color: post.likedBy?.includes(currentUser?.uid) ? '#e74c3c' : 'inherit'
            }}
          >
            {post.likedBy?.includes(currentUser?.uid) ? '❤️' : '🤍'} {post.likes || 0}
          </button>
          <button className="post-footer-btn comment-btn" onClick={() => setShowComments(!showComments)}>
            💬 {post.comments?.length || 0}
          </button>
          <button className="post-footer-btn share-btn">
            <span className="btn-icon">🔗</span>
            <span className="btn-text">Share</span>
          </button>
        </div>

        {showComments && (
          <div className="comments-section">
            {post.comments && post.comments.map(comment => (
              <div key={comment.id} className="comment">
                <span className="comment-avatar">{comment.userAvatar}</span>
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-user">{comment.userName}</span>
                    <span className="comment-time">{formatTimestamp(comment.timestamp)}</span>
                    {currentUser && comment.userId === currentUser.uid && (
                      <button className="delete-comment-btn" onClick={() => onDeleteComment(post.id, comment.id)}>✕</button>
                    )}
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              </div>
            ))}
            {currentUser && (
              <div className="add-comment flex mt-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSubmitComment()}
                  className="comment-input flex-1 p-2 border rounded"
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim()}
                  className="add-comment-btn ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  ➤
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }; // ⭐ FIXED: Added closing bracket for PostCard component - This closes the PostCard functional component

export default CommunityFeed;