import React from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'; // ⭐ FIXED: was "signInwithPopup"
import './LoginButton.css';

function LoginButton({ currentUser }) {
    
    // Function para mahandle yung Google Login
    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider); // ⭐ FIXED: capital W
            console.log("User logged in:", result.user);
        } catch (error) {
            console.error("Error during login:", error);
            alert("Login failed: " + error.message);
        }
    };


    // Function para mahandle yung Logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log("Logged out successfully");
        } catch (error) {
            console.error('Logout error:', error.message);
        }
    };


    return (
        <div className="login-button-container">
            {currentUser ? (
                <div className="user-info">
                    <img
                        src={currentUser.photoURL || 'https://via.placeholder.com/40'}
                        alt="Profile"
                        className="user-avatar"
                    />

                    <span className="user-name">
                        {currentUser.displayName || currentUser.email}
                    </span>
                    <button onClick={handleLogout} className="logout-btn"> {/* ⭐ FIXED: was "onclick" */}
                        Logout
                    </button>
                </div>
            ) : (
                // Show if the user is not logged in
                <button onClick={handleLogin} className="login-btn">
                    <span className="google-icon">🔐</span>
                    Login with Google
                </button>
            )}
        </div>
    );
}

export default LoginButton;