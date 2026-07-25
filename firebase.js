// ================= FIREBASE CONFIG =================

import { initializeApp } from 
"https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import { 
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    getDoc,
    updateDoc,
    deleteDoc
} from 
"https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 
"https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyA3q_x7ipp0esBm2BahzwAEoRFaN_JC7wk",
  authDomain: "sitara-electronics.firebaseapp.com",
  projectId: "sitara-electronics",
  storageBucket: "sitara-electronics.firebasestorage.app",
  messagingSenderId: "192588985472",
  appId: "1:192588985472:web:9a65cd6469782875bbe265",
  measurementId: "G-5SBHR8KZ21"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);


// Export Firebase tools

export {
    db,
    auth,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    getDoc,
    updateDoc,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
};

console.log("Firebase Connected ✅");
