// src/App.jsx
import React, { useState, useEffect, useRef } from "react";
import Stories from "./components/Stories";
import CreateStory from "./components/CreateStory"; // <--- add this file in components
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
  doc,
  updateDoc,
  serverTimestamp,
  query,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// ------------------- FIREBASE SETUP -------------------
const firebaseConfig = {
  apiKey: "AIzaSyAwGjcZmjx54SK3WU46_1PyU06qNCC2m38",
  authDomain: "looplu-6ce6d.firebaseapp.com",
  projectId: "looplu-6ce6d",
  storageBucket: "looplu-6ce6d.firebasestorage.app",
  messagingSenderId: "686439644716",
  appId: "1:686439644716:web:961535747cbbb95bc51b89",
  measurementId: "G-NDWGTYPVEY",
};

const app = initializeApp(firebaseConfig);
try {
  // analytics can fail in non-browser envs so guard it
  if (typeof window !== "undefined") getAnalytics(app);
} catch (e) {
  // ignore analytics initialization errors in server or CI
  // console.warn("Analytics not available:", e);
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ------------------- CONSTANTS / MOCK -------------------
const BRAND = {
  bg: "bg-stone-50",
  glass: "backdrop-blur-xl bg-white/80 border border-white/40 shadow-sm",
  primary: "text-indigo-600",
  primaryBg: "bg-indigo-600",
  gradient: "bg-gradient-to-tr from-indigo-100 via-purple-50 to-pink-50",
  textMain: "text-slate-800",
  textSoft: "text-slate-500",
};

const MOCK_PROFILE = {
  name: "Alex Rivera",
  handle: "@arivera",
  avatar:
    "https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=e0e7ff",
  bio: "Digital gardener 🌱 | UI Designer |looping thoughts into reality.",
  earnings: 1240.5,
  followers: 842,
  following: 150,
};

const ONBOARDING_POST = {
  id: "welcome-post",
  user: {
    name: "Looply Team",
    handle: "@team",
    avatar:
      "https://api.dicebear.com/7.x/notionists/svg?seed=Looply&backgroundColor=e0e7ff",
    id: "system",
  },
  content:
    "Welcome to Looply! 👋 \nThis is a live demo. \n\n✨ Create a post to see it appear in real-time.\n✨ We've integrated Google Ads slots into the feed.\n✨ Like posts to test the database.",
  likes: [],
  comments: 0,
  shares: 0,
  earnings: 0,
  timestamp: Date.now(),
  isAd: false,
};

// ------------------- SMALL UI HELPERS -------------------
const LooplyLogo = ({ size = "md", animated = false }) => {
  const dims = size === "lg" ? "w-16 h-16" : size === "xl" ? "w-24 h-24" : "w-8 h-8";
  return (
    <div className={`relative flex items-center justify-center ${dims} text-indigo-600`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${animated ? "animate-spin-slow" : ""} w-full h-full`}>
        <path d="M50 10C27.9 10 10 27.9 10 50C10 72.1 27.9 90 50 90C72.1 90 90 72.1 90 50" stroke="currentColor" strokeWidth="12" strokeLinecap="round" className="opacity-30" />
        <path d="M50 10C65 10 90 20 90 50C90 80 65 90 50 90" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
      </svg>
    </div>
  );
};

const Button = ({ children, onClick, variant = "primary", className = "", icon: Icon, disabled = false }) => {
  const baseStyle = "flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-slate-900 text-white shadow-lg hover:bg-slate-800",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-600 hover:bg-indigo-50 hover:text-indigo-600",
    accent: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const PostCard = ({ post, currentUserId, onLike }) => {
  const isLiked = post.likes && post.likes.includes(currentUserId);
  const likeCount = post.likes ? post.likes.length : 0;

  const timeAgo = (dateInput) => {
    if (!dateInput) return "Just now";
    const date = dateInput.toMillis ? dateInput.toMillis() : dateInput;
    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return "now";
  };

  return (
    <div className="bg-white mx-4 my-4 p-5 rounded-[2rem] shadow-sm border border-slate-100 transition-shadow hover:shadow-md animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <img src={post.user?.avatar || MOCK_PROFILE.avatar} alt={post.user?.name} className="w-10 h-10 rounded-full border border-slate-100 bg-slate-100" />
          <div>
            <h3 className="font-bold text-slate-800 text-sm leading-tight">{post.user?.name || "Anonymous"}</h3>
            <span className="text-xs text-slate-400">{post.user?.handle || "@user"} • {timeAgo(post.createdAt || post.timestamp)}</span>
          </div>
        </div>
        <button className="text-slate-300 hover:text-slate-600">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <p className="text-slate-700 text-[15px] leading-relaxed mb-3 whitespace-pre-wrap">
        {post.content}
      </p>

      {post.image && (
        <div className="w-full h-64 rounded-2xl overflow-hidden mb-4 bg-slate-100">
          <img src={post.image} alt="Post content" className="w-full h-full object-cover" />
        </div>
      )}

      {post.user?.id === currentUserId && (
        <div className="flex items-center gap-3 mb-4 px-3 py-2 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
          <div className="flex items-center gap-1.5 text-indigo-600">
            <TrendingUp size={14} />
            <span className="text-xs font-bold">${(post.earnings || 0).toFixed(2)} earned</span>
          </div>
          <div className="w-px h-3 bg-indigo-200"></div>
          <span className="text-xs text-indigo-400">{post.views || 0} views</span>
        </div>
      )}

      <div className="flex items-center justify-between text-slate-400 mt-2">
        <div className="flex gap-6">
          <button onClick={() => onLike(post.id, isLiked)} className={`flex items-center gap-1.5 transition-colors ${isLiked ? "text-rose-500" : "hover:text-rose-400"}`}>
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} className={`transition-transform duration-200 ${isLiked ? "scale-110" : ""}`} />
            <span className="text-sm font-medium">{likeCount}</span>
          </button>

          <button className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors">
            <MessageCircle size={20} />
            <span className="text-sm font-medium">{post.comments || 0}</span>
          </button>

          <button className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors">
            <Share2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ------------------- NAV BTN -------------------
const NavBtn = ({ icon: Icon, active, onClick }) => (
  <button onClick={onClick} className={`p-3 rounded-full transition-all duration-300 ${active ? "bg-slate-900 text-white scale-110" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}>
    <Icon size={22} strokeWidth={active ? 2.5 : 2} />
  </button>
);

// ------------------- APP -------------------
function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("welcome"); // welcome, home, explore, notifications, profile, earnings
  const [showCreate, setShowCreate] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  // story-related state (moved inside App)
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [uploadingStory, setUploadingStory] = useState(false);
  const [stories, setStories] = useState([]);

  // auth
  useEffect(() => {
    signInAnonymously(auth).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // realtime posts
  useEffect(() => {
    const q = query(collection(db, "posts"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedPosts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        loadedPosts.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : a.timestamp || 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : b.timestamp || 0;
          return timeB - timeA;
        });
        setPosts(loadedPosts);
        setLoadingPosts(false);
      },
      (err) => {
        console.error("Error fetching posts:", err);
        setLoadingPosts(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // stories realtime & auto-expire
  useEffect(() => {
    const q = query(collection(db, "stories"));
    const unsub = onSnapshot(q, (snapshot) => {
      const allStories = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((s) => (s.expireAt ? s.expireAt > Date.now() : true));
      setStories(allStories);
    });
    return () => unsub();
  }, []);

  // welcome -> auto navigate to home
  useEffect(() => {
    if (view === "welcome") {
      const timer = setTimeout(() => setView("home"), 1800);
      return () => clearTimeout(timer);
    }
  }, [view]);

  // upload story (uses storage & db)
  const uploadStory = async (file) => {
    if (!user) return;
    setUploadingStory(true);
    try {
      const fileRef = ref(storage, `stories/${user.uid}/${Date.now()}.jpg`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      await addDoc(collection(db, "stories"), {
        uid: user.uid,
        image: url,
        createdAt: serverTimestamp(),
        expireAt: Date.now() + 24 * 60 * 60 * 1000,
        user: {
          name: MOCK_PROFILE.name,
          avatar: MOCK_PROFILE.avatar,
        },
      });

      setShowStoryCreator(false);
    } catch (e) {
      console.error("Error uploading story:", e);
    } finally {
      setUploadingStory(false);
    }
  };

  // POST creation (uses uploadImage from your services if file present)
  const handlePost = async (newPostData) => {
    if (!user) return;
    setIsPosting(true);

    try {
      let imageURL = null;

      if (newPostData.file) {
        // uploadImage is expected from /src/services/supabase (you already have it)
        // keep usage the same; ensure uploadImage is exported from your service file.
        // eslint-disable-next-line no-undef
        imageURL = await uploadImage(newPostData.file, `posts/${user.uid}/${Date.now()}`);
      }

      await addDoc(collection(db, "posts"), {
        user: {
          id: user.uid,
          name: MOCK_PROFILE.name,
          handle: MOCK_PROFILE.handle,
          avatar: MOCK_PROFILE.avatar,
        },
        content: newPostData.content,
        image: imageURL || null,
        likes: [],
        comments: 0,
        shares: 0,
        earnings: 0,
        createdAt: serverTimestamp(),
        timestamp: Date.now(),
        isAd: false,
      });

      setShowCreate(false);
    } catch (e) {
      console.error("Error adding post:", e);
    } finally {
      setIsPosting(false);
    }
  };

  // like/unlike
  const handleLike = async (postId, isLiked) => {
    if (!user) return;
    const postRef = doc(db, "posts", postId);
    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid),
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(user.uid),
        });
      }
    } catch (e) {
      console.error("Error liking post:", e);
    }
  };

  if (view === "welcome") {
    return (
      <div className={`h-screen w-full flex flex-col items-center justify-center ${BRAND.gradient}`}>
        <LooplyLogo size="xl" animated={true} />
        <h1 className="mt-8 text-3xl font-bold text-slate-800 tracking-tight">looply</h1>
        <p className="mt-2 text-slate-500 animate-pulse">looping your world...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full ${BRAND.bg} font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-700`}>
      {/* Top nav */}
      <div className={`fixed top-0 inset-x-0 z-40 px-4 py-3 flex justify-between items-center ${BRAND.glass}`}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView("home")}>
          <LooplyLogo size="sm" />
          <span className="font-bold text-xl tracking-tight text-slate-800">looply</span>
        </div>

        <div className="flex gap-2">
          {view === "home" && (
            <div className="flex items-center bg-white rounded-full px-1 py-1 border border-slate-100 shadow-sm">
              <button className="px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-bold">For You</button>
              <button className="px-3 py-1 text-slate-500 rounded-full text-xs font-medium hover:text-slate-900">Following</button>
            </div>
          )}
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative" onClick={() => setView("notifications")}>
            <Bell size={24} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="pt-20 max-w-lg mx-auto min-h-screen">
        {view === "home" && (
          <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Stories stories={stories} onCreate={() => setShowStoryCreator(true)} />

            <div className="space-y-2 mt-4">
              {loadingPosts ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="animate-spin text-indigo-500" />
                </div>
              ) : posts.length === 0 ? (
                <PostCard post={ONBOARDING_POST} currentUserId={user?.uid} onLike={() => {}} />
              ) : (
                posts.map((post, index) => (
                  <React.Fragment key={post.id}>
                    <PostCard post={post} currentUserId={user?.uid} onLike={handleLike} />
                    {(index + 1) % 3 === 0 && <div className="mx-4 my-4"><div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-100 p-6 text-center text-slate-400">Ad placeholder</div></div>}
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
          <div className="px-4 pb-24 pt-2 animate-in fade-in">
            <h2 className="text-xl font-bold mb-4">Activity</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-50 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <DollarSign size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-800"><span className="font-bold">System</span> You earned $2.40 from ads yesterday</p>
                  <p className="text-xs text-slate-400">1h ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-50 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Heart size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-800"><span className="font-bold">Sarah Chen</span> liked your post</p>
                  <p className="text-xs text-slate-400">3h ago</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Create Button */}
      <div className="fixed bottom-24 right-6 z-30">
        <button onClick={() => setShowCreate(true)} className="w-14 h-14 bg-slate-900 text-white rounded-full shadow-xl shadow-indigo-900/20 flex items-center justify-center hover:scale-105 transition-transform active:scale-95">
          <Plus size={28} />
        </button>
      </div>

      {/* Create Modal */}
     {showCreate && (
  <CreatePost 
      onPost={handlePost}
      onCancel={() => setShowCreate(false)}
      isPosting={isPosting}
  />
)}

{showStoryCreator && (
  <CreateStory
    onClose={() => setShowStoryCreator(false)}
    onUpload={uploadStory}
    uploading={uploadingStory}
  />
)}

      {/* Story Creator Modal */}
      {showStoryCreator && <CreateStory onClose={() => setShowStoryCreator(false)} onUpload={uploadStory} uploading={uploadingStory} />}

      {/* Bottom Nav */}
      <div className="fixed bottom-6 inset-x-0 flex justify-center z-40">
        <nav className={`flex items-center gap-1 p-2 rounded-full shadow-xl shadow-slate-200/50 ${BRAND.glass}`}>
          <NavBtn icon={Home} active={view === "home"} onClick={() => setView("home")} />
          <NavBtn icon={Search} active={view === "explore"} onClick={() => setView("explore")} />
          <NavBtn icon={BarChart3} active={view === "earnings"} onClick={() => setView("earnings")} />
          <NavBtn icon={User} active={view === "profile"} onClick={() => setView("profile")} />
        </nav>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// ------------------- Other sub-components used above (kept brief) -------------------
const ExploreView = () => {
  const categories = ["Design", "Tech", "Life", "Art", "Writing", "Food"];
  return (
    <div className="px-4 pb-24 pt-4 animate-in fade-in">
      <div className="relative mb-6">
        <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
        <input type="text" placeholder="Search loops, people, ideas..." className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-100 focus:ring-2 focus:ring-indigo-100 outline-none" />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
        {categories.map((c) => (
          <button key={c} className="px-5 py-2 bg-white border border-slate-100 rounded-full text-slate-600 whitespace-nowrap hover:bg-slate-50 hover:border-indigo-200 transition-colors">
            #{c}
          </button>
        ))}
      </div>

      <div className="columns-2 gap-4 space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="break-inside-avoid rounded-2xl overflow-hidden relative group">
            <img src={`https://images.unsplash.com/photo-${1500000000000 + i * 100000}?w=500&auto=format&fit=crop&q=80`} className="w-full h-auto object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <p className="text-white text-xs font-bold">Amazing Loop #{i}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EarningsDashboard = () => (
  <div className="pb-24 animate-in fade-in duration-500">
    <div className="bg-slate-900 text-white p-8 rounded-b-[3rem] shadow-xl relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 opacity-80 mb-1">
          <ShieldCheck size={16} />
          <span className="text-xs font-semibold uppercase tracking-wider">Creator Program</span>
        </div>
        <h1 className="text-4xl font-bold mb-2">${MOCK_PROFILE.earnings.toFixed(2)}</h1>
        <p className="text-slate-400 text-sm">Available for payout on Dec 15</p>
      </div>
      <div className="flex gap-4 mt-8">
        <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4">
          <div className="text-xs text-slate-300 mb-1">RPM (Avg)</div>
          <div className="text-xl font-bold">$2.45</div>
        </div>
        <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4">
          <div className="text-xs text-slate-300 mb-1">Views</div>
          <div className="text-xl font-bold">128.4k</div>
        </div>
      </div>
    </div>
    <div className="px-6 mt-8">
      <h3 className="font-bold text-slate-800 mb-4 text-lg">Recent Earnings</h3>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <DollarSign size={20} />
              </div>
              <div>
                <div className="font-semibold text-slate-800">Ad Revenue</div>
                <div className="text-xs text-slate-400">Nov {10 + i}, 2024</div>
              </div>
            </div>
            <span className="font-bold text-emerald-600">+$24.50</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ProfileView = ({ posts, currentUserId }) => {
  const userPosts = posts.filter((p) => p.user?.id === currentUserId);

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      <div className="relative h-40 bg-indigo-100">
        <div className="absolute -bottom-12 left-6">
          <img src={MOCK_PROFILE.avatar} className="w-24 h-24 rounded-full border-4 border-white shadow-md" />
        </div>
      </div>
      <div className="pt-14 px-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{MOCK_PROFILE.name}</h1>
            <p className="text-slate-500">{MOCK_PROFILE.handle}</p>
          </div>
          <Button variant="secondary" className="px-4 py-2 text-sm h-10">Edit Profile</Button>
        </div>

        <p className="mt-4 text-slate-600 leading-relaxed">{MOCK_PROFILE.bio}</p>

        <div className="flex gap-6 mt-6 pb-6 border-b border-slate-100">
          <div className="text-center">
            <div className="font-bold text-lg text-slate-900">{MOCK_PROFILE.followers}</div>
            <div className="text-xs text-slate-400">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-slate-900">{MOCK_PROFILE.following}</div>
            <div className="text-xs text-slate-400">Following</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-indigo-600 flex items-center gap-1">
              <Sparkles size={14} /> {userPosts.length}
            </div>
            <div className="text-xs text-slate-400">Loops</div>
          </div>
        </div>

        <div className="mt-4 -mx-4">
          {userPosts.length > 0 ? userPosts.map((p) => <PostCard key={p.id} post={p} currentUserId={currentUserId} onLike={() => {}} />) : <div className="p-8 text-center text-slate-400 text-sm">No posts yet.</div>}
        </div>
      </div>
    </div>
  );
};

export default App;
