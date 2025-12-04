
// src/services/auth.js
import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  const res = await signInWithPopup(auth, provider);
  const user = res.user;
  // upsert user document
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  const userDoc = {
    uid: user.uid,
    name: user.displayName || "",
    email: user.email || "",
    avatar: user.photoURL || "",
    handle: (user.email ? user.email.split("@")[0] : user.uid).replace(/\W/g, "").toLowerCase(),
    bio: "",
    createdAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
  };
  // merge: don't overwrite existing profile fields (bio, handle customizations)
  await setDoc(userRef, userDoc, { merge: true });
  return user;
};

export const logout = () => signOut(auth);

export const onAuthChanged = (cb) => onAuthStateChanged(auth, cb);
