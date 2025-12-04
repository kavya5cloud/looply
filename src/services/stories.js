// src/services/stories.js
import { db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

export const uploadStoryImage = async (file, uid) => {
  const fileRef = ref(storage, `stories/${uid}/${Date.now()}-${file.name}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
};

export const createStory = async ({ uid, user, imageUrl }) => {
  const expireAt = Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000);
  return addDoc(collection(db, "stories"), {
    uid,
    user,
    image: imageUrl,
    createdAt: serverTimestamp(),
    expireAt
  });
};

// Listen only non-expired stories
export const listenStories = (onUpdate) => {
  const now = Timestamp.fromMillis(Date.now());
  const q = query(collection(db, "stories"), where("expireAt", ">", now), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const stories = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    onUpdate(stories);
  });
};
