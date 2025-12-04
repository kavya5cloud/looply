// src/services/auth.js
import { auth, db } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
  getDoc
} from "firebase/firestore";

const provider = new GoogleAuthProvider();

// --- PRODUCTION GOOGLE SIGN-IN ---
export const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, provider);
    const user = res.user;

    // Reference to Firestore user document
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    // Create handle from email (example: john@email.com -> "john")
    const handle =
      user.email && user.email.length > 0
        ? user.email.split("@")[0].replace(/\W/g, "").toLowerCase()
        : `user_${user.uid.slice(0, 6)}`;

    const userData = {
      uid: user.uid,
      name: user.displayName || "Unnamed User",
      email: user.email || "",
      avatar: user.photoURL || "",
      handle,
      bio: snap.exists() ? snap.data().bio || "" : "",
      createdAt: snap.exists() ? snap.data().createdAt || serverTimestamp() : serverTimestamp(),
      lastSeen: serverTimestamp()
    };

    // Upsert (merge existing fields)
    await setDoc(userRef, userData, { merge: true });

    return userData;
  } catch (err) {
    console.error("Google Sign-In Error:", err);
    throw err;
  }
};

// --- AUTH STATE LISTENER (PRODUCTION SAFE) ---
export const onAuthChanged = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) return callback(null);

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    callback({ uid: user.uid, ...snap.data() });
  });
};

// --- LOG OUT ---
export const logout = async () => {
  return signOut(auth);
};
