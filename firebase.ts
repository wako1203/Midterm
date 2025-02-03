// firebase.ts or firebase.js
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCRRbFYCmisRncHb9EqdulGYIjNocoENGw",
    authDomain: "movie-b06ca.firebaseapp.com",
    databaseURL: "https://movie-b06ca-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "movie-b06ca",
    storageBucket: "movie-b06ca.appspot.com",
    messagingSenderId: "1020870809576",
    appId: "1:1020870809576:web:acfd441a4b85248030f65d",
    measurementId: "G-27Z4SMP078"
};

// Initialize Firebase only if not already initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

export { auth, database, storage };
