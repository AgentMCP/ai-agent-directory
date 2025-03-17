import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Agent } from '../types';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ai-agent-directory.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ai-agent-directory",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ai-agent-directory.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ABCDEFGHIJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google: ", error);
    throw error;
  }
};

// Sign out
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
};

// Save user search
export const saveUserSearch = async (
  userId: string, 
  searchQuery: string, 
  repositories: Agent[]
) => {
  try {
    const searchData = {
      userId,
      searchQuery,
      timestamp: Timestamp.now(),
      repositoryCount: repositories.length,
      repositories: repositories.map(repo => ({
        id: repo.id,
        name: repo.name,
        owner: repo.owner,
        url: repo.url,
        description: repo.description,
        stars: repo.stars,
        forks: repo.forks,
        license: repo.license
      }))
    };
    
    const docRef = await addDoc(collection(db, "userSearches"), searchData);
    console.log("Search saved with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving search: ", error);
    throw error;
  }
};

// Get user searches
export const getUserSearches = async (userId: string) => {
  try {
    const q = query(
      collection(db, "userSearches"), 
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    const searches: any[] = [];
    
    querySnapshot.forEach((doc) => {
      searches.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return searches.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
  } catch (error) {
    console.error("Error getting user searches: ", error);
    throw error;
  }
};
