import React, { useState, useRef, useEffect } from "react";

interface Post {
  id: number | string;
  author: string;
  avatar: string;
  village: string;
  date: string;
  title: string;
  content: string;
  tag: "Fertilizer" | "Pest Alert" | "Pumps" | "General" | "Market";
  likes: number;
  replies: number;
  isUserPost?: boolean;
  isEdited?: boolean;
  editedAt?: string;
}

const STORAGE_KEY = "your_schemes_community_posts_v2";
const COMMENTS_STORAGE_KEY = "your_schemes_community_comments_v1";

const formatDateTime = (dateObj: Date = new Date()): string => {
  const dateStr = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  const timeStr = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
  return `${dateStr} • ${timeStr}`;
};

const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    author: "Sukhdev Singh",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD45Exqc7s149CWz_WlS0a8AqTGKdBrWJAgE6Y-lm_1yGbg7jHe01Iy2hfd3FKXiSbTFn3dV2-ikn-9f0nK03xjwhI1fAiqz0GVrjiu-ekf7hsSTdkUTtxSl0ueaC5_r-ev4SMu_-XVNlKyY3MJwQGua1yKxmPIDMxRgaPdhQx4lhlrClITz7EptCbr5BBTDccIAo5Llqu-BpT7rAA_-2456u32EQJWPVE9k-UQEcB0sFLLp_0RRsJ52K7evhhvCGSX4eOJCaccftu8",
    village: "Niphad, Nashik",
    date: "Jul 22, 2026 • 08:30 AM",
    title: "Any grape farmers seeing powdery mildew spots?",
    content: "Due to the unexpected morning fog and rising humidity in Niphad this week, I noticed some white powdery dust on our grape vine leaves. What organic treatment is recommended? Should I spray neem oil or sulfur?",
    tag: "Pest Alert",
    likes: 12,
    replies: 5,
    isUserPost: false
  },
  {
    id: 2,
    author: "Venkata Rao",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD45Exqc7s149CWz_WlS0a8AqTGKdBrWJAgE6Y-lm_1yGbg7jHe01Iy2hfd3FKXiSbTFn3dV2-ikn-9f0nK03xjwhI1fAiqz0GVrjiu-ekf7hsSTdkUTtxSl0ueaC5_r-ev4SMu_-XVNlKyY3MJwQGua1yKxmPIDMxRgaPdhQx4lhlrClITz7EptCbr5BBTDccIAo5Llqu-BpT7rAA_-2456u32EQJWPVE9k-UQEcB0sFLLp_0RRsJ52K7evhhvCGSX4eOJCaccftu8",
    village: "Sinnar, Maharashtra",
    date: "Jul 21, 2026 • 04:15 PM",
    title: "Best ratio of NPK fertilizer for second sugarcane ratoon crop?",
    content: "I am about to start applying fertilizers on our 4-acre sugarcane fields in Sinnar. Is 150:80:80 NPK ratio standard, or should we increase nitrogen content since we had rain?",
    tag: "Fertilizer",
    likes: 8,
    replies: 3,
    isUserPost: false
  },
  {
    id: 3,
    author: "Rajesh Patel (You)",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD45Exqc7s149CWz_WlS0a8AqTGKdBrWJAgE6Y-lm_1yGbg7jHe01Iy2hfd3FKXiSbTFn3dV2-ikn-9f0nK03xjwhI1fAiqz0GVrjiu-ekf7hsSTdkUTtxSl0ueaC5_r-ev4SMu_-XVNlKyY3MJwQGua1yKxmPIDMxRgaPdhQx4lhlrClITz7EptCbr5BBTDccIAo5Llqu-BpT7rAA_-2456u32EQJWPVE9k-UQEcB0sFLLp_0RRsJ52K7evhhvCGSX4eOJCaccftu8",
    village: "Dindori, Nashik",
    date: "Jul 22, 2026 • 10:15 AM",
    title: "Solar drip irrigation setup query for 5-acre farm",
    content: "Has anyone recently installed a 5HP solar pump with subsidy under PM-KUSUM scheme? Looking for feedback on maintenance and water flow rate during cloud cover.",
    tag: "Pumps",
    likes: 4,
    replies: 2,
    isUserPost: true
  }
];

export const Community: React.FC<{ lang: string }> = ({ lang }) => {
  const isTamil = lang === "ta";
  const [activeTab, setActiveTab] = useState<"forum" | "disease" | "mandi" | "loans">("forum");

  // ==================== 1. FARMER FORUM STATE ====================
  const [posts, setPosts] = useState<Post[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error("Failed to load posts", e); }
      }
    }
    return INITIAL_POSTS;
  });

  // Comments state: { [postId]: Comment[] }
  interface Comment {
    id: number;
    author: string;
    text: string;
    date: string;
    likes: number;
    isUserComment: boolean;
    isEdited?: boolean;
  }
  const [comments, setComments] = useState<Record<string | number, Comment[]>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(COMMENTS_STORAGE_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch { return {}; }
      }
    }
    return {};
  });
  const [expandedComments, setExpandedComments] = useState<Record<string | number, boolean>>({});
  const [newCommentText, setNewCommentText] = useState<Record<string | number, string>>({});
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    }
  }, [posts]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
    }
  }, [comments]);

  // OFFENSIVE WORD FILTER (basic spam guard)
  const BANNED_WORDS = ["spam", "abuse", "xxx", "hate"];
  const containsOffensiveContent = (text: string) =>
    BANNED_WORDS.some(w => text.toLowerCase().includes(w));

  const handleAddComment = (postId: number | string) => {
    const text = (newCommentText[postId] || "").trim();
    if (!text) return;
    if (containsOffensiveContent(text)) {
      alert(isTamil ? "உங்கள் கருத்தில் ஏற்றுக்கொள்ள முடியாத வார்த்தைகள் உள்ளன." : "Your comment contains inappropriate content.");
      return;
    }
    const comment: Comment = {
      id: Date.now(),
      author: isTamil ? "ராஜேஷ் பட்டேல் (நீங்கள்)" : "Rajesh Patel (You)",
      text,
      date: formatDateTime(new Date()),
      likes: 0,
      isUserComment: true,
    };
    setComments(prev => ({ ...prev, [postId]: [comment, ...(prev[postId] || [])] }));
    setNewCommentText(prev => ({ ...prev, [postId]: "" }));
  };

  const handleEditComment = (postId: number | string, commentId: number) => {
    if (!editCommentText.trim()) return;
    if (containsOffensiveContent(editCommentText)) {
      alert(isTamil ? "தவறான உள்ளடக்கம் உள்ளது." : "Inappropriate content detected.");
      return;
    }
    setComments(prev => ({
      ...prev,
      [postId]: (prev[postId] || []).map(c =>
        c.id === commentId ? { ...c, text: editCommentText.trim(), isEdited: true } : c
      ),
    }));
    setEditingCommentId(null);
    setEditCommentText("");
  };

  const handleDeleteComment = (postId: number | string, commentId: number) => {
    if (!window.confirm(isTamil ? "இந்த கருத்தை நீக்கவா?" : "Delete this comment?")) return;
    setComments(prev => ({
      ...prev,
      [postId]: (prev[postId] || []).filter(c => c.id !== commentId),
    }));
  };

  const handleLikeComment = (postId: number | string, commentId: number) => {
    setComments(prev => ({
      ...prev,
      [postId]: (prev[postId] || []).map(c =>
        c.id === commentId ? { ...c, likes: c.likes + 1 } : c
      ),
    }));
  };

  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTag, setNewPostTag] = useState<Post["tag"]>("General");

  // Edit post state
  const [editingPostId, setEditingPostId] = useState<number | string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTag, setEditTag] = useState<Post["tag"]>("General");

  // Delete post state
  const [deletingPostId, setDeletingPostId] = useState<number | string | null>(null);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const formattedDateTime = formatDateTime(new Date());

    const post: Post = {
      id: Date.now(),
      author: "Rajesh Patel (You)",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD45Exqc7s149CWz_WlS0a8AqTGKdBrWJAgE6Y-lm_1yGbg7jHe01Iy2hfd3FKXiSbTFn3dV2-ikn-9f0nK03xjwhI1fAiqz0GVrjiu-ekf7hsSTdkUTtxSl0ueaC5_r-ev4SMu_-XVNlKyY3MJwQGua1yKxmPIDMxRgaPdhQx4lhlrClITz7EptCbr5BBTDccIAo5Llqu-BpT7rAA_-2456u32EQJWPVE9k-UQEcB0sFLLp_0RRsJ52K7evhhvCGSX4eOJCaccftu8",
      village: "Dindori, Nashik",
      date: formattedDateTime,
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      tag: newPostTag,
      likes: 0,
      replies: 0,
      isUserPost: true
    };

    setPosts([post, ...posts]);
    setNewPostTitle("");
    setNewPostContent("");
    setNewPostTag("General");
  };

  const handleStartEdit = (post: Post) => {
    setEditingPostId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditTag(post.tag);
    setDeletingPostId(null);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditTitle("");
    setEditContent("");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim() || !editingPostId) return;

    const formattedEditedAt = formatDateTime(new Date());

    setPosts(prev =>
      prev.map(p => {
        if (p.id === editingPostId) {
          return {
            ...p,
            title: editTitle.trim(),
            content: editContent.trim(),
            tag: editTag,
            isEdited: true,
            editedAt: formattedEditedAt
          };
        }
        return p;
      })
    );

    setEditingPostId(null);
    setEditTitle("");
    setEditContent("");
  };

  const handleConfirmDelete = (id: number | string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    if (deletingPostId === id) setDeletingPostId(null);
    if (editingPostId === id) setEditingPostId(null);
  };

  const handleLikePost = (id: number | string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleResetPosts = () => {
    if (window.confirm("Reset discussion feed back to default posts?")) {
      setPosts(INITIAL_POSTS);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // ==================== 2. CROP DISEASE SCANNER STATE ====================
  const [selectedDiseaseImage, setSelectedDiseaseImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedDiseaseImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const mockDiseases = [
    {
      name: "Wheat Leaf Rust (Puccinia triticina)",
      severity: "Moderate (35% infected)",
      symptoms: "Small, orange-brown pustules on leaves, causing premature drying and reduced wheat grain weight.",
      organicRemedy: "Spray 5% Neem Seed Kernel Extract (NSKE) or a garlic-onion aqueous extract. Ensure proper drainage.",
      chemicalRemedy: "Foliar spray of Propiconazole 25% EC @ 200 ml per acre mixed in 200 liters of clean water.",
      prevention: "Plant rust-resistant varieties such as HD-2967 or DBW-187 in the next rotation."
    },
    {
      name: "Late Blight of Potato/Tomato (Phytophthora infestans)",
      severity: "High (65% infected)",
      symptoms: "Water-soaked dark lesions on leaf tips and margins, surrounded by a light-green halo, with white fuzzy growth underneath.",
      organicRemedy: "Apply copper oxychloride (organic formulation) or Bordeaux mixture (1% spray). Prune infected lower leaves immediately.",
      chemicalRemedy: "Spray Metalaxyl 8% + Mancozeb 64% WP @ 500g per acre.",
      prevention: "Avoid sprinkler overhead irrigation; keep wide row spacing to enhance ventilation."
    },
    {
      name: "Sugarcane Red Rot (Colletotrichum falcatum)",
      severity: "Critical (80% infected)",
      symptoms: "Reddish spots on the stem, white patches on red tissues inside, giving a sour alcoholic smell when split open.",
      organicRemedy: "No direct curatives. Immediately uproot and burn infected stalks to prevent cluster contamination.",
      chemicalRemedy: "Treat seed setts with Trichoderma viride formulation or Carbendazim 50% WP @ 2g per liter prior to planting.",
      prevention: "Practice active 3-year crop rotation; use healthy certified disease-free setts from cooperative nurseries."
    }
  ];

  const triggerDiseaseScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setIsScanning(false);
      // Pick a random disease for the interactive demo
      const randomDisease = mockDiseases[Math.floor(Math.random() * mockDiseases.length)];
      setScanResult(randomDisease);
    }, 2500);
  };

  // ==================== 3. MSP AND APMC MANDI PRICES STATE ====================
  const mspPrices = [
    { crop: "Wheat (Kanak)", season: "Rabi 2025-26", msp: 2425, change: 150 },
    { crop: "Paddy (Rice - Common)", season: "Kharif 2025-26", msp: 2300, change: 117 },
    { crop: "Cotton (Long Staple)", season: "Kharif 2025-26", msp: 7521, change: 501 },
    { crop: "Sugarcane (FRP Value)", season: "2025-26", msp: 340, change: 25 },
    { crop: "Maize (Makka)", season: "Kharif 2025-26", msp: 2225, change: 135 },
    { crop: "Mustard (Sarson)", season: "Rabi 2025-26", msp: 5650, change: 200 },
    { crop: "Gram (Chana)", season: "Rabi 2025-26", msp: 5440, change: 105 }
  ];

  // Mandi prices — Tamil Nadu APMC markets
  const mandiPrices = [
    { item: "Tomato", APMC: "Ammapet, Salem", low: 800, high: 1600, modal: 1200, unit: "Quintal" },
    { item: "Onion", APMC: "Singanallur, Coimbatore", low: 1200, high: 2000, modal: 1600, unit: "Quintal" },
    { item: "Banana", APMC: "Pollachi, Coimbatore", low: 1500, high: 2500, modal: 2000, unit: "Quintal" },
    { item: "Brinjal", APMC: "Anna Nagar, Madurai", low: 600, high: 1200, modal: 900, unit: "Quintal" },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-left space-y-6">
      
      {/* Tab Navigation header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
            Community & Market Hub
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">Interact with other farmers, identify crop diseases, and track Mandi prices.</p>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { id: "forum", label: "Farmer Forum", icon: "forum" },
            { id: "disease", label: "Disease Scan", icon: "psychiatry" },
            { id: "mandi", label: "Mandi Prices", icon: "storefront" },
            { id: "loans", label: "Agri Loans", icon: "account_balance" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap border-none cursor-pointer ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ==================== SCREEN 1: FARMER COMMUNITY FORUM ==================== */}
      {activeTab === "forum" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-scale-in">
          {/* Post creation form (Left 5 Cols) */}
          <div className="lg:col-span-5 space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-150">
            <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#0F5238] text-lg">edit_note</span>
              Share with Community
            </h4>
            <p className="text-xs text-slate-500 leading-normal">Ask a query or post a local weather, water, or pest alert for nearby farmers.</p>

            <form onSubmit={handleCreatePost} className="space-y-3.5 pt-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-semibold">Post Title</label>
                <input
                  type="text"
                  placeholder="e.g. Yellowing leaves in sugarcanes..."
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-semibold">Post Category Tag</label>
                <div className="relative">
                  <select
                    value={newPostTag}
                    onChange={(e) => setNewPostTag(e.target.value as any)}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold appearance-none focus:outline-none focus:border-primary"
                  >
                    <option value="General">General farming discussion</option>
                    <option value="Fertilizer">Fertilizers & seeds advice</option>
                    <option value="Pest Alert">Pest / Crop disease outbreak</option>
                    <option value="Pumps">Irrigation & Solar pumps</option>
                    <option value="Market">Mandi prices & sales</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-semibold">Description / Question</label>
                <textarea
                  rows={4}
                  placeholder="Describe your issue with seed types, fertilizers, or pest observations in detail..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border-none cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">send</span>
                <span>Publish Post to Forum</span>
              </button>
            </form>
          </div>

          {/* Posts feed (Right 7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Local Farmers Discussion Feed</h4>
              <button
                onClick={handleResetPosts}
                title="Reset feed to sample posts"
                className="text-[11px] text-slate-400 hover:text-slate-600 font-semibold underline bg-transparent border-none cursor-pointer"
              >
                Reset Feed
              </button>
            </div>
            
            <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1 scrollbar-hide">
              {posts.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <span className="material-symbols-outlined text-3xl text-slate-400">forum</span>
                  <p className="text-xs font-bold text-slate-600">No posts in community feed yet.</p>
                  <p className="text-[11px] text-slate-400">Use the form on the left to share your first post with fellow farmers!</p>
                </div>
              ) : (
                posts.map((post) => {
                  const isUserAuthor = Boolean(post.isUserPost || post.author.toLowerCase().includes("(you)"));
                  const isEditingThisPost = editingPostId === post.id;
                  const isDeletingThisPost = deletingPostId === post.id;

                  return (
                    <div key={post.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition duration-300 text-left space-y-3">
                      
                      {/* Post Header: Author info, Posted Date Time, Category Tag & Edit/Delete actions */}
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-100 flex-shrink-0">
                            <img className="w-full h-full object-cover" src={post.avatar} alt={post.author} />
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-slate-900 text-xs">{post.author}</h5>
                              {isUserAuthor && (
                                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase rounded">
                                  Your Post
                                </span>
                              )}
                            </div>
                            
                            {/* Display Posted Date & Time */}
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold mt-0.5">
                              <span>{post.village}</span>
                              <span>•</span>
                              <span className="material-symbols-outlined text-[13px] text-slate-400">schedule</span>
                              <span title="Posted Date and Time">{post.date}</span>
                              {post.isEdited && (
                                <span className="text-[9px] text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded font-bold ml-0.5" title={post.editedAt ? `Edited at ${post.editedAt}` : "Edited"}>
                                  Edited
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 text-[9px] uppercase font-bold rounded-full ${
                            post.tag === "Pest Alert" ? "bg-rose-100 text-rose-800" :
                            post.tag === "Fertilizer" ? "bg-amber-100 text-amber-800" :
                            post.tag === "Pumps" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"
                          }`}>
                            {post.tag}
                          </span>

                          {/* Edit & Delete Action Buttons for user posts */}
                          {isUserAuthor && !isEditingThisPost && (
                            <div className="flex items-center gap-1 ml-1 border-l border-slate-100 pl-2">
                              <button
                                onClick={() => handleStartEdit(post)}
                                className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-amber-800 hover:bg-amber-50 px-2 py-1 rounded-lg border border-transparent hover:border-amber-200 transition cursor-pointer"
                                title="Edit post title or content"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => setDeletingPostId(post.id)}
                                className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg border border-transparent hover:border-rose-200 transition cursor-pointer"
                                title="Delete this post"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delete Confirmation Banner */}
                      {isDeletingThisPost && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2.5 animate-scale-in">
                          <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            <span>Are you sure you want to delete this post?</span>
                          </div>
                          <p className="text-[11px] text-rose-700 leading-normal">
                            This will permanently remove your post from the community discussion feed.
                          </p>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => setDeletingPostId(null)}
                              className="px-3 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleConfirmDelete(post.id)}
                              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 border-none cursor-pointer shadow-sm"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                              <span>Confirm Delete</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Edit Post Form Mode */}
                      {isEditingThisPost ? (
                        <form onSubmit={handleSaveEdit} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-scale-in">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm text-amber-600">edit_note</span>
                              Editing Your Post
                            </span>
                            <span className="text-[10px] text-slate-400">Update details below</span>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-500 font-semibold">Title</label>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-primary"
                              required
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-500 font-semibold">Category Tag</label>
                            <select
                              value={editTag}
                              onChange={(e) => setEditTag(e.target.value as any)}
                              className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-primary"
                            >
                              <option value="General">General farming discussion</option>
                              <option value="Fertilizer">Fertilizers & seeds advice</option>
                              <option value="Pest Alert">Pest / Crop disease outbreak</option>
                              <option value="Pumps">Irrigation & Solar pumps</option>
                              <option value="Market">Mandi prices & sales</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-500 font-semibold">Description / Details</label>
                            <textarea
                              rows={3}
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary resize-none"
                              required
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-1.5 bg-primary hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 border-none cursor-pointer shadow-sm"
                            >
                              <span className="material-symbols-outlined text-sm">check</span>
                              <span>Save Changes</span>
                            </button>
                          </div>
                        </form>
                      ) : (
                        /* Normal Post Body Display */
                        !isDeletingThisPost && (
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{post.title}</h4>
                            <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">{post.content}</p>
                          </div>
                        )
                      )}

                      {/* Post Footer: Likes, Replies & Comments */}
                      {!isEditingThisPost && !isDeletingThisPost && (
                        <div>
                          <div className="flex items-center gap-4 pt-2.5 border-t border-slate-50">
                            <button
                              onClick={() => handleLikePost(post.id)}
                              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 bg-transparent border-none cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm text-emerald-600 hover:scale-125 transition">thumb_up</span>
                              <span>{post.likes} {isTamil ? "லைக்ஸ்" : "Likes"}</span>
                            </button>
                            <button
                              onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary bg-transparent border-none cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm text-slate-400">comment</span>
                              <span>{(comments[post.id] || []).length + post.replies} {isTamil ? "கருத்துகள்" : "Comments"}</span>
                            </button>
                          </div>

                          {/* Inline Comments Section */}
                          {expandedComments[post.id] && (
                            <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
                              {/* New Comment Input */}
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newCommentText[post.id] || ""}
                                  onChange={e => setNewCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                  onKeyDown={e => { if (e.key === "Enter") handleAddComment(post.id); }}
                                  placeholder={isTamil ? "கருத்து சேர்க்கவும்..." : "Add a comment..."}
                                  className="flex-1 h-8 px-2.5 text-[11px] bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:outline-none"
                                />
                                <button
                                  onClick={() => handleAddComment(post.id)}
                                  disabled={!newCommentText[post.id]?.trim()}
                                  className="h-8 px-3 bg-primary text-white rounded-lg text-[11px] font-bold transition disabled:opacity-40 cursor-pointer border-none"
                                >
                                  {isTamil ? "சேர்" : "Post"}
                                </button>
                              </div>

                              {/* Comments List */}
                              {(comments[post.id] || []).map(c => (
                                <div key={c.id} className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <span className="text-[11px] font-bold text-slate-800">{c.author}</span>
                                      {c.isEdited && <span className="ml-1.5 text-[9px] text-amber-600 font-bold">(edited)</span>}
                                      <span className="text-[10px] text-slate-400 ml-2">{c.date}</span>
                                    </div>
                                    {c.isUserComment && (
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => { setEditingCommentId(c.id); setEditCommentText(c.text); }}
                                          className="text-[10px] text-slate-400 hover:text-amber-600 cursor-pointer bg-transparent border-none"
                                        >
                                          <span className="material-symbols-outlined text-xs">edit</span>
                                        </button>
                                        <button
                                          onClick={() => handleDeleteComment(post.id, c.id)}
                                          className="text-[10px] text-slate-400 hover:text-red-600 cursor-pointer bg-transparent border-none"
                                        >
                                          <span className="material-symbols-outlined text-xs">delete</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {editingCommentId === c.id ? (
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={editCommentText}
                                        onChange={e => setEditCommentText(e.target.value)}
                                        className="flex-1 h-7 px-2 text-[11px] bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:outline-none"
                                      />
                                      <button onClick={() => handleEditComment(post.id, c.id)} className="h-7 px-2 bg-primary text-white rounded-lg text-[10px] font-bold border-none cursor-pointer">
                                        {isTamil ? "சேமி" : "Save"}
                                      </button>
                                      <button onClick={() => { setEditingCommentId(null); setEditCommentText(""); }} className="h-7 px-2 bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer">
                                        {isTamil ? "இல்லை" : "Cancel"}
                                      </button>
                                    </div>
                                  ) : (
                                    <p className="text-[11px] text-slate-700 leading-relaxed">{c.text}</p>
                                  )}

                                  <button
                                    onClick={() => handleLikeComment(post.id, c.id)}
                                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-700 cursor-pointer bg-transparent border-none"
                                  >
                                    <span className="material-symbols-outlined text-xs">thumb_up</span>
                                    {c.likes}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== SCREEN 2: CROP DISEASE DIAGNOSTIC SCANNER ==================== */}
      {activeTab === "disease" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-scale-in">
          {/* Leaf Upload / Capture Section */}
          <div className="md:col-span-5 space-y-4 text-center">
            <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider text-left">Leaf Diagnostic Scanner</h4>
            <p className="text-xs text-slate-500 text-left leading-normal">Upload a photograph of an infected crop leaves or grain stalk to scan for pests, rusts, or blights.</p>

            <input 
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`aspect-video w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 cursor-pointer transition ${
                selectedDiseaseImage ? "border-emerald-500 bg-emerald-50/10" : "border-slate-300 bg-slate-50 hover:border-primary"
              }`}
            >
              {selectedDiseaseImage ? (
                <div className="w-full h-full rounded-xl overflow-hidden relative">
                  <img src={selectedDiseaseImage} alt="Crop sample" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded uppercase">
                    {selectedDiseaseImage.startsWith("data:") ? "Image Loaded" : "Sample Leaf Locked"}
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="material-symbols-outlined text-4xl text-[#0F5238]">psychiatry</span>
                  <p className="text-xs font-bold text-slate-700">Click to Select Leaf Photo</p>
                  <p className="text-[10px] text-slate-400">Supports Wheat rust, Sugarcane root, Potato blight</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {selectedDiseaseImage && (
                <button
                  onClick={() => setSelectedDiseaseImage(null)}
                  className="flex-1 h-11 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Clear Photo
                </button>
              )}
              <button
                onClick={triggerDiseaseScan}
                disabled={isScanning || !selectedDiseaseImage}
                className="flex-[2] h-11 bg-primary hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border-none cursor-pointer"
              >
                {isScanning ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                    <span>Scanning leaf tissue...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">biotech</span>
                    <span>Run AI Diagnostics</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Diagnosis output analysis report */}
          <div className="md:col-span-7 bg-slate-50 rounded-2xl p-6 border border-slate-150 flex flex-col justify-between">
            {scanResult ? (
              <div className="space-y-4 animate-scale-in text-left">
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 bg-rose-100 text-rose-800 text-[10px] font-bold uppercase rounded-full">
                    Pathological Report
                  </span>
                  <span className="text-xs font-bold text-slate-400">Diagnosis Status: Verified</span>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Identified Disease</p>
                  <h4 className="text-lg font-black text-slate-900">{scanResult.name}</h4>
                  <p className="text-xs font-bold text-rose-600">Infection Severity: {scanResult.severity}</p>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Observable Symptoms</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{scanResult.symptoms}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1">
                    <p className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">eco</span>
                      Organic Treatment
                    </p>
                    <p className="text-xs text-slate-600 leading-normal">{scanResult.organicRemedy}</p>
                  </div>
                  <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1">
                    <p className="text-[10px] font-bold text-blue-800 uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">science</span>
                      Chemical Spray
                    </p>
                    <p className="text-xs text-slate-600 leading-normal">{scanResult.chemicalRemedy}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Preventative Measures for Next Season</p>
                  <p className="text-xs text-slate-600 leading-normal mt-1">{scanResult.prevention}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 space-y-3">
                <span className="material-symbols-outlined text-5xl">biotech</span>
                <p className="text-xs font-bold">No diagnosis active.</p>
                <p className="text-[11px] max-w-xs leading-normal">Click on the card to lock the <span className="text-primary font-bold">sample leaf leaf_sample.jpg</span>, then click "Run AI Diagnostics" to see the dynamic treatment report.</p>
              </div>
            )}

            <div className="p-3 bg-amber-50 rounded-xl text-[10px] text-slate-500 leading-normal border border-amber-100/60 mt-4">
              <strong>General Advisory:</strong> This diagnostic tool uses computer-vision analysis models. Consult your block-level Krishi Vigyan Kendra extension officer for full localized approvals.
            </div>
          </div>
        </div>
      )}

      {/* ==================== SCREEN 3: MANDI APMC MARKET PRICES ==================== */}
      {activeTab === "mandi" && (
        <div className="space-y-6 animate-scale-in text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MSP Table */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150">
              <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <span className="material-symbols-outlined text-[#0F5238] text-lg">verified_user</span>
                Minimum Support Price (MSP) 2025-26
              </h4>
              <p className="text-xs text-slate-500 leading-normal mb-4">Latest guaranteed prices offered by the Government of India at local procurement centers.</p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-left">
                      <th className="pb-2">Crop Name</th>
                      <th className="pb-2">Season</th>
                      <th className="pb-2 text-right">MSP (₹/Qtl)</th>
                      <th className="pb-2 text-right text-emerald-800">Increase</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mspPrices.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-100/50 transition">
                        <td className="py-2.5 font-bold text-slate-800">{p.crop}</td>
                        <td className="py-2.5 text-slate-500 font-semibold">{p.season}</td>
                        <td className="py-2.5 text-right font-black text-slate-950">₹{p.msp}</td>
                        <td className="py-2.5 text-right font-bold text-emerald-700">+{p.change}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mandi Prices */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150">
              <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <span className="material-symbols-outlined text-primary text-lg">storefront</span>
                Live Mandi APMC Market Prices
              </h4>
              <p className="text-xs text-slate-500 leading-normal mb-4">
                {isTamil
                  ? "இன்று தமிழ்நாடு APMC சந்தைகளில் நிலவும் பரிவர்த்தனை விலைகள்."
                  : "Prevailing transaction prices from Tamil Nadu district APMC markets today."}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-left">
                      <th className="pb-2">Commodity</th>
                      <th className="pb-2">APMC Market</th>
                      <th className="pb-2 text-right">Range (₹/Qtl)</th>
                      <th className="pb-2 text-right text-primary">Modal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mandiPrices.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-100/50 transition">
                        <td className="py-2.5 font-bold text-slate-800">{p.item}</td>
                        <td className="py-2.5 text-slate-500 font-semibold">{p.APMC}</td>
                        <td className="py-2.5 text-right text-slate-600">₹{p.low} - ₹{p.high}</td>
                        <td className="py-2.5 text-right font-black text-primary">₹{p.modal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SCREEN 4: AGRICULTURAL LOANS & INSURANCE ==================== */}
      {activeTab === "loans" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-scale-in text-left">
          {/* Institutional Credit Guide */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
              <h4 className="font-bold text-slate-800 text-base font-display">Institutional Crop Credit (KCC Loans)</h4>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Banks in India provide institutional short-term credit to farmers through the <strong>Kisan Credit Card (KCC)</strong> scheme at highly subsidized interest rates:
            </p>

            <ul className="text-xs text-slate-600 space-y-2.5 pl-4 list-disc">
              <li><strong>Nominal Interest Rate:</strong> Base rate is 9.0%, but the Government offers an automatic 2% Interest Subvention, making it <strong>7.0%</strong>.</li>
              <li><strong>Prompt Repayment Incentive (PRI):</strong> Repaying loan within 1 year awards an extra <strong>3.0% subvention</strong>, bringing effective interest rate to just <strong>4.0% p.a.</strong>!</li>
              <li><strong>Collateral Free:</strong> No collateral is required for credit limits up to <strong>₹1.60 Lakhs</strong>.</li>
              <li><strong>Flexibility:</strong> Includes household consumption costs (10%) and crop insurance premium directly embedded inside the credit card limit.</li>
            </ul>

            <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2.5 text-blue-950">
              <span className="material-symbols-outlined text-sm text-blue-600 mt-0.5">info</span>
              <p className="text-[11px] leading-normal">
                Avoid informal moneylenders charging 24-36% interest. Use our <strong>Kisan Credit Card</strong> application module directly in the Schemes tab to claim low-cost credit instantly.
              </p>
            </div>
          </div>

          {/* Insurance Guide */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 space-y-4">
            <div className="flex items-center gap-2 text-emerald-800">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              <h4 className="font-bold text-slate-800 text-base font-display">PM Fasal Bima Yojana (Crop Insurance)</h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Protects agricultural crops from unavoidable natural risks like dry spells, droughts, localized flooding, pest infestations, and unseasonal cyclones:
            </p>

            <ul className="text-xs text-slate-600 space-y-2.5 pl-4 list-disc">
              <li><strong>Sowing Risks:</strong> Provides coverage even if unseasonal climate anomalies prevent the farmer from sowing their crop.</li>
              <li><strong>Kharif Crops (Monsoon):</strong> Farmer pays only <strong>2.0%</strong> of the total sum insured.</li>
              <li><strong>Rabi Crops (Winter):</strong> Farmer pays only <strong>1.5%</strong> of the total sum insured.</li>
              <li><strong>Commercial/Horticulture (Grapes, Cotton):</strong> Farmer pays only <strong>5.0%</strong> premium.</li>
              <li><strong>Claim Settlement:</strong> Done digitally using automatic weather station triggers and drone-assisted crop cutting surveys for total transparency.</li>
            </ul>

            <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-[#0F5238]">
              <span className="material-symbols-outlined text-sm text-[#0F5238] mt-0.5">verified</span>
              <p className="text-[11px] leading-normal">
                Crop insurance is optional for all farmers but highly advised for high-investment cash crops. Check out our <strong>PM Fasal Bima Yojana</strong> application module to safeguard your seasonal yields.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
