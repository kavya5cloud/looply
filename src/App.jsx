// src/App.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Home,
  Search,
  Bell,
  User,
  DollarSign,
  BarChart3,
  TrendingUp,
  Image as ImageIcon,
  X,
  MoreHorizontal,
  ShieldCheck,
  Sparkles,
  Loader2,
} from "lucide-react";

// Firebase
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

// Supabase
import { createClient } from "@supabase/supabase-js";

/* ----------------------------
  Environment / Init checks
  ---------------------------- */
const {
  VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID,
  VITE_FIREBASE_MEASUREMENT_ID,
  VITE_SUPABASE_URL,
  VITE_SUPABASE_KEY,
} = import.meta.env;

if (!VITE_FIREBASE_API_KEY || !VITE_SUPABASE_URL || !VITE_SUPABASE_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    "Missing env variables. Add VITE_FIREBASE_* and VITE_SUPABASE_* to continue."
  );
}

/* ----------------------------
  Firebase init
  ---------------------------- */
const firebaseConfig = {
  apiKey: VITE_FIREBASE_API_KEY,
  authDomain: VITE_FIREBASE_AUTH_DOMAIN,
  projectId: VITE_FIREBASE_PROJECT_ID,
  storageBucket: VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: VITE_FIREBASE_APP_ID,
  measurementId: VITE_FIREBASE_MEASUREMENT_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
try {
  // analytics only if available in environment (no crash server-side)
  if (typeof window !== "undefined") {
    getAnalytics(firebaseApp);
  }
} catch (e) {
  // ignore if analytics can't initialize
}

/* Firestore client */
const db = getFirestore(firebaseApp);

/* Auth */
const auth = getAuth(firebaseApp);

/* ----------------------------
  Supabase init & helper
  ---------------------------- */
const supabase = createClient(VITE_SUPABASE_URL || "", VITE_SUPABASE_KEY || "");

/**
 * uploadImage - uploads File object to supabase storage bucket 'looply-media'
 * returns public URL string or null on failure
 */
async function uploadImageToSupabase(file, path) {
  if (!VITE_SUPABASE_URL || !VITE_SUPABASE_KEY) {
    console.error("Supabase credentials missing");
    return null;
  }
  try {
    // path example: posts/{userId}/{timestamp}_{filename}
    const { error: uploadError } = await supabase.storage
      .from("looply-media")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: publicURL } = supabase.storage
      .from("looply-media")
      .getPublicUrl(path);

    return publicURL?.publicUrl || null;
  } catch (err) {
    console.error("Supabase Upload Error:", err);
    return null;
  }
}

/* ----------------------------
  Small shared components
  ---------------------------- */
const LooplyLogo = ({ size = "sm", animated = false }) => {
  const dim = size === "xl" ? 48 : size === "lg" ? 32 : size === "md" ? 24 : 20;
  return (
    <div style={{ width: dim, height: dim }} className={`${animated ? "animate-spin-slow" : ""}`}>
      <svg viewBox="0 0 100 100" width={dim} height={dim} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 10C27.9 10 10 27.9 10 50C10 72.1 27.9 90 50 90C72.1 90 90 72.1 90 50" stroke="#4f46e5" strokeWidth="10" strokeLinecap="round" opacity="0.25"/>
        <path d="M50 10C65 10 90 20 90 50C90 80 65 90 50 90" stroke="#4f46e5" strokeWidth="10" strokeLinecap="round"/>
      </svg>
    </div>
  );
};

const Button = ({ children, onClick, variant = "primary", className = "", icon: Icon, disabled }) => {
  const base = "flex items-center gap-2 px-4 py-2 rounded-full font-medium transition";
  const variants = {
    primary: "bg-slate-900 text-white",
    secondary: "bg-white text-slate-700 border",
    ghost: "bg-transparent text-slate-600",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant] || ""} ${className}`}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

/* ----------------------------
  Google Ad placeholder
  ---------------------------- */
const GoogleAd = ({ format = "auto" }) => {
  // This is only a placeholder. Real ads need publisher account & domain verification.
  return (
    <div className="mx-4 my-6 rounded-2xl overflow-hidden bg-white shadow-sm border p-6 text-center">
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>Ad</div>
      <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: "#0f172a", opacity: 0.3 }}>
        Google Ad Placeholder
      </div>
    </div>
  );
};

/* ----------------------------
  PostCard component
  ---------------------------- */
const PostCard = ({ post, currentUserId, onLike }) => {
  const isLiked = post.likes?.includes(currentUserId);
  const likeCount = post.likes?.length || 0;

  const timeAgo = (val) => {
    if (!val) return "now";
    const t = val.toMillis ? val.toMillis() : val;
    const seconds = Math.max(1, Math.floor((Date.now() - t) / 1000));
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className="bg-white mx-4 my-4 p-4 rounded-2xl shadow-sm border">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <img src={post.user?.avatar || "/default-avatar.png"} alt="" className="w-10 h-10 rounded-full object-cover" />
          <div>
            <div className="font-semibold text-sm">{post.user?.name || "Anonymous"}</div>
            <div className="text-xs text-slate-400">{post.user?.handle || "@user"} • {timeAgo(post.createdAt || post.timestamp)}</div>
          </div>
        </div>
        <MoreHorizontal size={18} className="text-slate-400" />
      </div>

      <p className="text-sm text-slate-700 whitespace-pre-wrap mb-3">{post.content}</p>

      {post.image && (
        <div className="w-full h-56 overflow-hidden rounded-xl mb-3 bg-slate-100">
          <img src={post.image} alt="post" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-center justify-between text-slate-500">
        <div className="flex items-center gap-6">
          <button
            onClick={() => onLike && onLike(post.id, isLiked)}
            className={`flex items-center gap-2 ${isLiked ? "text-rose-500" : "hover:text-rose-400"}`}
          >
            <Heart size={18} />
            <span className="text-sm">{likeCount}</span>
          </button>

          <div className="flex items-center gap-2 hover:text-indigo-500 cursor-default">
            <MessageCircle size={18} />
            <span className="text-sm">{post.comments || 0}</span>
          </div>

          <div className="flex items-center gap-2 hover:text-emerald-500 cursor-default">
            <Share2 size={18} />
          </div>
        </div>

        <div className="text-xs text-slate-400">{post.earnings ? `$${Number(post.earnings).toFixed(2)}` : ""}</div>
      </div>
    </div>
  );
};

/* ----------------------------
  Stories & CreateStory
  ---------------------------- */
const Stories = ({ stories = [], onCreate }) => {
  return (
    <div className="px-4">
      <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
        <button onClick={onCreate} className="flex-shrink-0 w-20 h-28 bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-2">
          <Plus size={18} />
          <div className="text-xs">Create</div>
        </button>

        {stories.map((s) => (
          <div key={s.id} className="flex-shrink-0 w-20 h-28 bg-white rounded-2xl border border-slate-100 flex flex-col items-center p-2">
            <img src={s.image} alt="" className="w-full h-16 rounded-lg object-cover mb-2" />
            <div className="text-xs text-slate-500 truncate">{s.user?.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CreateStoryModal = ({ onClose, onUpload, uploading }) => {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f && onUpload) onUpload(f);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-t-2xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold">Create Story</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        <div className="mb-3">
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 size={14} className="animate-spin" /> : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ----------------------------
  CreatePost Modal (single-file)
  ---------------------------- */
const CreatePostModal = ({ user, profile, onClose, onPosted }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const removeImage = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const handleSubmit = async () => {
    if (!text.trim() && !file) return;
    setIsPosting(true);
    setError("");
    try {
      let imageURL = null;
      if (file) {
        const safeName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
        const path = `posts/${user.uid}/${safeName}`;
        imageURL = await uploadImageToSupabase(file, path);
        if (!imageURL) throw new Error("Image upload failed");
      }

      await addDoc(collection(db, "posts"), {
        user: {
          id: user.uid,
          name: profile?.name || user.displayName || "Anon",
          handle: profile?.handle || "@user",
          avatar: profile?.avatar || user.photoURL || "/default-avatar.png",
        },
        content: text.trim(),
        image: imageURL || null,
        likes: [],
        comments: 0,
        shares: 0,
        earnings: 0,
        createdAt: serverTimestamp(),
        timestamp: Date.now(),
        isAd: false,
      });

      setText("");
      removeImage();
      onPosted && onPosted();
      onClose && onClose();
    } catch (err) {
      console.error("CreatePost error:", err);
      setError(err?.message || "Failed to post");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/95 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <button onClick={onClose} className="p-2 rounded-full"><X size={18} /></button>
        <h2 className="font-bold">New Loop</h2>
        <button
          onClick={handleSubmit}
          disabled={isPosting || (!text.trim() && !file)}
          className="px-4 py-2 bg-slate-900 text-white rounded-full disabled:opacity-50"
        >
          {isPosting ? <Loader2 size={14} className="animate-spin" /> : "Post"}
        </button>
      </div>

      <div className="flex-1 p-5 overflow-auto">
        <div className="flex gap-4">
          <img src={profile?.avatar || user.photoURL || "/default-avatar.png"} alt="me" className="w-10 h-10 rounded-full object-cover" />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's looping?"
            className="w-full h-40 resize-none outline-none text-slate-800 placeholder:text-slate-400 text-lg"
            autoFocus
          />
        </div>

        {preview && (
          <div className="relative mt-4 max-w-[420px]">
            <img src={preview} alt="preview" className="w-full rounded-xl object-cover max-h-[360px]" />
            <button onClick={removeImage} className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full"><X size={14} /></button>
          </div>
        )}

        {error && <div className="mt-3 text-sm text-rose-600">{error}</div>}
      </div>

      <div className="p-4 border-t flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input id="post-image-input" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <button onClick={() => document.getElementById("post-image-input")?.click()} className="p-2 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center gap-2">
            <ImageIcon size={16} />
            <span className="text-sm">Photo</span>
          </button>

          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center gap-2">
            <DollarSign size={16} />
            <span className="text-sm">Monetization</span>
          </div>
        </div>

        <div className="text-xs text-slate-500">Drafts will not be saved</div>
      </div>
    </div>
  );
};

/* ----------------------------
  Small Views
  ---------------------------- */
const EarningsDashboard = () => (
  <div className="p-6">
    <div className="bg-slate-900 text-white p-6 rounded-xl">
      <div className="text-sm opacity-80">Creator Program</div>
      <div className="text-3xl font-bold mt-2">$1,240.50</div>
    </div>
    <div className="mt-6 space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex justify-between">
            <div>Ad Revenue</div>
            <div className="font-bold">+$24.50</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ExploreView = () => {
  const categories = ["Design", "Tech", "Life", "Art", "Writing", "Food"];
  return (
    <div className="p-4">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
        <input placeholder="Search loops..." className="w-full pl-10 pr-4 py-3 rounded-2xl border" />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3">
        {categories.map((c) => (
          <button key={c} className="px-4 py-2 bg-white rounded-full border">{c}</button>
        ))}
      </div>
    </div>
  );
};

const ProfileView = ({ posts = [], currentUserId }) => {
  const userPosts = posts.filter((p) => p.user?.id === currentUserId);
  return (
    <div className="p-4">
      <div className="flex items-center gap-4">
        <img src="/default-avatar.png" alt="" className="w-20 h-20 rounded-full" />
        <div>
          <div className="font-bold text-xl">Your Name</div>
          <div className="text-sm text-slate-500">@you</div>
        </div>
      </div>

      <div className="mt-6">
        {userPosts.length ? userPosts.map((p) => <PostCard key={p.id} post={p} currentUserId={currentUserId} />) : <div className="text-slate-400">No posts yet</div>}
      </div>
    </div>
  );
};

/* ----------------------------
  Main App component
  ---------------------------- */
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("welcome"); // welcome, home, explore, notifications, profile, earnings
  const [showCreate, setShowCreate] = useState(false);
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [uploadingStory, setUploadingStory] = useState(false);

  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState("");

  // anonymous auth + auth listener
  useEffect(() => {
    signInAnonymously(auth).catch((e) => {
      // not fatal, we still show UI but Firestore rules may block reads
      console.error("Auth error:", e);
    });
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
    });
    return () => unsub();
  }, []);

  // realtime posts
  useEffect(() => {
    setLoadingPosts(true);
    try {
      const q = query(collection(db, "posts"));
      const unsub = onSnapshot(
        q,
        (snap) => {
          const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          loaded.sort((a, b) => {
            const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : a.timestamp || 0;
            const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : b.timestamp || 0;
            return tb - ta;
          });
          setPosts(loaded);
          setLoadingPosts(false);
        },
        (err) => {
          console.error("Posts listener error:", err);
          setError(err.message || "Failed to load posts");
          setLoadingPosts(false);
        }
      );
      return () => unsub();
    } catch (e) {
      console.error("Fetching posts failed:", e);
      setLoadingPosts(false);
    }
  }, []);

  // realtime stories
  useEffect(() => {
    try {
      const q = query(collection(db, "stories"));
      const unsub = onSnapshot(q, (snap) => {
        const s = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setStories(s.filter((x) => !x.expireAt || x.expireAt > Date.now()));
      });
      return () => unsub();
    } catch (e) {
      console.error("Stories listener error:", e);
    }
  }, []);

  // welcome -> home
  useEffect(() => {
    if (view === "welcome") {
      const t = setTimeout(() => setView("home"), 1200);
      return () => clearTimeout(t);
    }
  }, [view]);

  // Create post handler called from CreatePostModal
  const handleCreatePost = async (payload) => {
    if (!user) return;
    setIsPosting(true);
    try {
      let imageURL = null;
      if (payload.file) {
        imageURL = await uploadImageToSupabase(payload.file, `posts/${user.uid}/${Date.now()}_${payload.file.name.replace(/\s+/g, "_")}`);
      }

      await addDoc(collection(db, "posts"), {
        user: {
          id: user.uid,
          name: payload.name || user.displayName || "Anon",
          avatar: payload.avatar || user.photoURL || "/default-avatar.png",
        },
        content: payload.content || "",
        image: imageURL || null,
        likes: [],
        comments: 0,
        shares: 0,
        earnings: 0,
        createdAt: serverTimestamp(),
        timestamp: Date.now(),
        isAd: false,
      });
    } catch (e) {
      console.error("Create post error:", e);
      setError(e.message || "Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  // Like/unlike
  const handleLike = async (postId, currentlyLiked) => {
    if (!user) {
      console.log("Auth required to like");
      return;
    }
    try {
      const postRef = doc(db, "posts", postId);
      if (currentlyLiked) {
        await updateDoc(postRef, { likes: arrayRemove(user.uid) });
      } else {
        await updateDoc(postRef, { likes: arrayUnion(user.uid) });
      }
    } catch (e) {
      console.error("Like error:", e);
    }
  };

  // Upload story
  const uploadStory = async (file) => {
    if (!user || !file) return;
    setUploadingStory(true);
    try {
      const safeName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      const path = `stories/${user.uid}/${safeName}`;
      const url = await uploadImageToSupabase(file, path);
      if (!url) throw new Error("Upload failed");

      await addDoc(collection(db, "stories"), {
        uid: user.uid,
        image: url,
        createdAt: serverTimestamp(),
        expireAt: Date.now() + 24 * 60 * 60 * 1000,
        user: { name: "You", avatar: "/default-avatar.png" },
      });
      setShowStoryCreator(false);
    } catch (e) {
      console.error("Story upload error:", e);
    } finally {
      setUploadingStory(false);
    }
  };

  // UI
  if (!VITE_FIREBASE_API_KEY) {
    return (
      <div className="p-6">
        <h3 className="font-bold text-lg">Environment missing</h3>
        <p className="text-sm text-slate-500">Add VITE_FIREBASE_* and VITE_SUPABASE_* env variables.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Top nav */}
      <div className="fixed top-0 left-0 right-0 p-3 bg-white/80 backdrop-blur-sm border-b z-40 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView("home")}>
          <LooplyLogo size="md" />
          <div className="font-bold text-xl">looply</div>
        </div>

        <div className="flex items-center gap-2">
          {view === "home" && (
            <div className="bg-white rounded-full border px-1 py-1 flex items-center">
              <button className="px-3 py-1 bg-slate-900 text-white rounded-full text-xs">For You</button>
              <button className="px-3 py-1 text-xs text-slate-500">Following</button>
            </div>
          )}

          <button className="p-2 rounded-full" onClick={() => setView("notifications")}>
            <Bell size={20} />
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="pt-20 max-w-lg mx-auto min-h-screen pb-40">
        {/* Home feed */}
        {view === "home" && (
          <div className="pb-24">
            <Stories stories={stories} onCreate={() => setShowStoryCreator(true)} />

            <div className="space-y-2 mt-4">
              {loadingPosts ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="animate-spin" />
                </div>
              ) : posts.length === 0 ? (
                <div className="p-6 text-center text-slate-500">No posts yet.</div>
              ) : (
                posts.map((post, idx) => (
                  <React.Fragment key={post.id}>
                    <PostCard post={post} currentUserId={user?.uid} onLike={handleLike} />
                    {(idx + 1) % 3 === 0 && <GoogleAd />}
                  </React.Fragment>
                ))
              )}
            </div>
          </div>
        )}

        {view === "explore" && <ExploreView />}
        {view === "earnings" && <EarningsDashboard />}
        {view === "profile" && <ProfileView posts={posts} currentUserId={user?.uid} />}

        {view === "notifications" && (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-3">Activity</h2>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-xl border">System: You earned $2.40</div>
              <div className="bg-white p-4 rounded-xl border">Sarah liked your post</div>
            </div>
          </div>
        )}
      </div>

      {/* Floating create */}
      <div className="fixed right-6 bottom-20 z-50">
        <button onClick={() => setShowCreate(true)} className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl">
          <Plus size={26} />
        </button>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40">
        <nav className="bg-white px-2 py-2 rounded-full shadow-xl flex gap-2 items-center">
          <NavBtn icon={Home} active={view === "home"} onClick={() => setView("home")} />
          <NavBtn icon={Search} active={view === "explore"} onClick={() => setView("explore")} />
          <NavBtn icon={BarChart3} active={view === "earnings"} onClick={() => setView("earnings")} />
          <NavBtn icon={User} active={view === "profile"} onClick={() => setView("profile")} />
        </nav>
      </div>

      {/* Modals */}
      {showCreate && <CreatePostModal user={user} profile={{ name: "You", avatar: "/default-avatar.png", handle: "@you" }} onClose={() => setShowCreate(false)} onPosted={() => {}} />}
      {showStoryCreator && <CreateStoryModal onClose={() => setShowStoryCreator(false)} onUpload={uploadStory} uploading={uploadingStory} />}

      {/* tiny error display */}
      {error && <div className="fixed left-6 bottom-28 bg-rose-50 text-rose-800 border border-rose-100 p-3 rounded-md">{error}</div>}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes spin-slow { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>
    </div>
  );
}

/* Nav button helper */
function NavBtn({ icon: Icon, active, onClick }) {
  return (
    <button onClick={onClick} className={`p-2 rounded-full ${active ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-100"}`}>
      <Icon size={20} />
    </button>
  );
}
