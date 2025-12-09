import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 


// Copy and pasted lang to sa binigay ni Firebase after natin isetup ung project.
const firebaseConfig = {
  apiKey: "AIzaSyBywBuMhjQwjeNXqI991Qjv3F4-5dgI0gg",
  authDomain: "landscapes-c5f55.firebaseapp.com",
  projectId: "landscapes-c5f55",
  storageBucket: "landscapes-c5f55.firebasestorage.app",
  messagingSenderId: "410647510600",
  appId: "1:410647510600:web:3b8e0d87a2bf2d101d627d",
  measurementId: "G-DT677Y43X0"
};


// Initialize lang natin ung firebase, makikita mo to sa import sa taas
const app = initializeApp(firebaseConfig);

// Initialize naman natin yung services na gagamitin natin sa firebase
export const auth = getAuth(app); 
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;