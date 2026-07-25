// ============================================================
// FIREBASE CONFIG — paste your project's config below.
// Get this from: Firebase Console → Project Settings → General
// → "Your apps" → Web app → SDK setup and configuration.
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyA3q_x7ipp0esBm2BahzwAEoRFaN_JC7wk",
  authDomain: "sitara-electronics.firebaseapp.com",
  projectId: "sitara-electronics",
  storageBucket: "sitara-electronics.firebasestorage.app",
  messagingSenderId: "192588985472",
  appId: ""1:192588985472:web:9a65cd6469782875bbe265","
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Is the config still the placeholder? Both index.html and admin.html
// check this so they can show a helpful setup message instead of
// throwing confusing errors when Firebase isn't connected yet.
export const isFirebaseConfigured = firebaseConfig.apiKey !== "AIzaSyA3q_x7ipp0esBm2BahzwAEoRFaN_JC7wk";
