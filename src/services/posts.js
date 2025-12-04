// src/services/posts.js
import { db, storage } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const POSTS_COLL = "posts";
const PAGE_SIZE = 12;

export const uploadImageToStorage = async (file, path = "posts") => {
  const fileRef = ref(storage, `${path}/${Date.now()}-${file.name}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
};

// Create a post (with optional uploaded image url)
export const createPost = async ({ user, content, imageUrl, monetized = true }) => {
  return addDoc(collection(db, POSTS_COLL), {
    user,
    content,
    image: imageUrl || null,
    likes: [],
    comments: 0,
    shares: 0,
    earnings: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    monetized,
  });
};

// Real-time listener for feed (for 'For You': simple time-ordered for MVP)
export const listenToFeed = (onUpdate) => {
  const q = query(collection(db, POSTS_COLL), orderBy("createdAt", "desc"), limit(PAGE_SIZE));
  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    onUpdate(posts, snapshot);
  });
};

// Cursor-based load more (server-side)
export const loadMorePosts = async (lastSnapshot) => {
  const q = query(collection(db, POSTS_COLL), orderBy("createdAt", "desc"), startAfter(lastSnapshot), limit(PAGE_SIZE));
  const snap = await getDocs(q);
  return snap;
};

// Like/unlike (atomic)
export const toggleLike = async (postId, uid, liked) => {
  const ref = doc(db, POSTS_COLL, postId);
  if (liked) {
    await updateDoc(ref, { likes: arrayRemove(uid) });
  } else {
    await updateDoc(ref, { likes: arrayUnion(uid) });
  }
};

