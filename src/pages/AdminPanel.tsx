import { motion } from "motion/react";
import { 
  BarChart3, 
  Upload, 
  Settings, 
  Users, 
  Image as ImageIcon, 
  Layers, 
  ShieldCheck, 
  Plus, 
  Search,
  MoreVertical,
  Trash2,
  Edit2,
  ExternalLink,
  Link as LinkIcon,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Download,
  AlertCircle,
  Mail,
  Send,
  Hash,
  Loader2,
  MessageSquare
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/src/lib/utils";
import { db, dbStandard, storage, auth } from "@/src/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { handleFirestoreError, OperationType } from "@/src/lib/firestore-utils";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  getDocs,
  serverTimestamp, 
  query, 
  where,
  orderBy,
  limit
} from "firebase/firestore";
import { useCategories } from "@/src/hooks/useCategories";
import { useWallpapers } from "@/src/hooks/useWallpapers";
import { MarkdownEditor } from "@/src/components/MarkdownEditor";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";

export function AdminPanel() {
  useEffect(() => {
    if (auth?.currentUser) {
      console.log("Current Admin User UID:", auth.currentUser.uid);
      console.log("Current Admin User Email:", auth.currentUser.email);
    }
  }, []);

  const { wallpapers } = useWallpapers();
  const { categories } = useCategories();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
  const [externalUrl, setExternalUrl] = useState("");
  const [title, setTitle] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [targetDatabase, setTargetDatabase] = useState<"Standard" | "Enterprise">("Enterprise");

  const MultiSelectCategories = ({
    selected,
    onChange,
  }: {
    selected: string[];
    onChange: (categories: string[]) => void;
  }) => (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => {
            if (selected.includes(cat.name)) {
              onChange(selected.filter((c) => c !== cat.name));
            } else {
              onChange([...selected, cat.name]);
            }
          }}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-bold transition-all",
            selected.includes(cat.name)
              ? "bg-indigo-500 text-white shadow-md shadow-indigo-100"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );

  const [is4k, setIs4k] = useState(false);
  const [is8k, setIs8k] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [is3d, setIs3d] = useState(false);
  const [hashtags, setHashtags] = useState("");

  // Broadcast state
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastTarget, setBroadcastTarget] = useState<"users" | "newsletter" | "both">("both");

  // Synchronize category selection with first available category
  useEffect(() => {
    if (categories.length > 0 && selectedCategories.length === 0) {
      setSelectedCategories([categories[0].name]);
    }
  }, [categories, selectedCategories]);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingOrigin, setEditingOrigin] = useState<"Standard" | "Enterprise">("Enterprise");

  const sidebarItems = [
    { name: "Dashboard", icon: BarChart3 },
    { name: "Wallpapers", icon: ImageIcon },
    { name: "Categories", icon: Layers },
    { name: "Users", icon: Users },
    { name: "Messages", icon: MessageSquare },
    { name: "Broadcast", icon: Mail },
    { name: "Ads & SEO", icon: ShieldCheck },
    { name: "Settings", icon: Settings },
  ];

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditingOrigin(item.origin || "Enterprise");
    setTitle(item.title);
    setSelectedCategories(item.categories || (item.category ? [item.category] : []));
    setPreviewUrl(item.thumbnailUrl || item.imageUrl);
    setIs4k(!!item.is4k);
    setIs8k(!!item.is8k);
    setIsPremium(!!item.isPremium);
    setIs3d(!!item.is3d);
    setHashtags(item.hashtags ? item.hashtags.join(", ") : "");
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      const targetDb = editingOrigin === "Standard" ? dbStandard : db;
      if (targetDb) {
        const hashtagArray = hashtags.split(",").map(t => t.trim().replace(/^#/, "")).filter(t => t !== "");
        await updateDoc(doc(targetDb, "wallpapers", editingId), {
          title,
          categories: selectedCategories,
          is4k,
          is8k,
          isPremium,
          is3d,
          hashtags: hashtagArray,
          resolution: is8k ? "8K" : (is4k ? "4K" : "HD"),
          updatedAt: serverTimestamp()
        });
      }
      closeEditModal();
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update wallpaper");
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingId(null);
    setTitle("");
    setSelectedCategories(["Anime"]);
    setIs4k(false);
    setIs8k(false);
    setIsPremium(false);
    setIs3d(false);
    setHashtags("");
    setPreviewUrl(null);
  };

  const handleDelete = async (id: string, origin?: string) => {
    if (window.confirm("Are you sure you want to delete this wallpaper?")) {
      try {
        const targetDb = origin === "Standard" ? dbStandard : db;
        if (targetDb) {
          await deleteDoc(doc(targetDb, "wallpapers", id));
        }
      } catch (error) {
        console.error("Delete failed", error);
        alert("Failed to delete wallpaper");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if ((uploadMethod === "file" && !file) || (uploadMethod === "url" && !externalUrl) || !title) {
        alert("Please provide all required fields.");
        return;
    }
    
    setIsUploading(true);
    
    try {
        let downloadUrl = "";
        
        if (uploadMethod === "file" && file) {
            try {
                if (storage) {
                    const storageRef = ref(storage, `wallpapers/${Date.now()}_${file.name}`);
                    const snapshot = await uploadBytes(storageRef, file);
                    downloadUrl = await getDownloadURL(snapshot.ref);
                } else {
                    throw new Error("Firebase Storage not initialized");
                }
            } catch (firebaseErr: any) {
                console.error("Firebase upload error:", firebaseErr);
                alert("Firebase Storage error: " + firebaseErr.message + ". The storage might not be configured or permissions are missing in Firebase Console.");
                setIsUploading(false);
                return;
            }
        } else {
            downloadUrl = externalUrl;
        }
        
        const hashtagArray = hashtags.split(",").map(t => t.trim().replace(/^#/, "")).filter(t => t !== "");
        const newWallpaper = {
          title: title,
          categories: selectedCategories,
          imageUrl: downloadUrl,
          thumbnailUrl: downloadUrl,
          resolution: is8k ? "8K" : (is4k ? "4K" : "HD"),
          views: 0,
          likes: 0,
          downloads: 0,
          isPremium: isPremium,
          is4k: is4k,
          is8k: is8k,
          is3d: is3d,
          hashtags: hashtagArray,
          authorId: "Admin",
          createdAt: serverTimestamp()
        };
        
        if (db) {
          const targetDb = targetDatabase === "Standard" ? dbStandard : db;
          if (!targetDb) throw new Error("Target database not available");

          await addDoc(collection(targetDb, "wallpapers"), {
            ...newWallpaper,
            createdAt: serverTimestamp()
          });
        }
        
        alert("Wallpaper uploaded successfully!");
        // Remove closeUploadModal() here as requested so the modal and the data stay
        // We might want to alert success implicitly or visually, but the requirement 
        // specifically asked for "le page ne doit plus se fermer automatiquement 
        // et les information ne doivent plus disparaitre".
    } catch (err) {
        console.error("Upload failed", err);
        alert("Failed to upload image. Please try again.");
    } finally {
        setIsUploading(false);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastSubject || !broadcastMessage) {
        alert("Please provide both subject and message.");
        return;
    }

    const confirmSend = window.confirm(`Are you sure you want to broadcast this email to ALL users?\n\nSubject: ${broadcastSubject}`);
    if (!confirmSend) return;

    const { auth } = await import("@/src/lib/firebase");
    const adminUid = auth.currentUser?.uid;
    if (!adminUid) {
        alert("You must be logged in as an admin.");
        return;
    }

    setIsBroadcasting(true);

    try {
        const response = await fetch("/api/admin/broadcast-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                subject: broadcastSubject,
                message: broadcastMessage,
                adminUid: adminUid,
                target: broadcastTarget
            })
        });

        const result = await response.json();
        if (result.success) {
            alert(result.message);
            setBroadcastSubject("");
            setBroadcastMessage("");
        } else {
            alert(result.error || "Broadcast failed");
        }
    } catch (err) {
        console.error("Broadcast failed", err);
        alert("Broadcast failed. See console for details.");
    } finally {
        setIsBroadcasting(false);
    }
  };

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setPreviewUrl(null);
    setFile(null);
    setTitle("");
    setSelectedCategories(["Anime"]);
    setIs4k(false);
    setIs8k(false);
    setIsPremium(false);
    setIs3d(false);
    setHashtags("");
    setIsUploading(false);
  };

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto glass rounded-[48px] overflow-hidden flex h-[800px]">
        {/* Sidebar */}
        <aside className="w-72 border-right border-slate-200/50 p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-bold text-slate-800">Admin</h2>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">WaifuWall System</p>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-2">
            {sidebarItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={cn(
                  "flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all",
                  activeTab === item.name 
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-100 scale-105" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </button>
            ))}
          </nav>

          <div className="mt-auto glass p-6 rounded-3xl border border-indigo-100 bg-indigo-50/30">
            <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">System Status</h4>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-bold text-slate-700">Healthy</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white/50 p-10 overflow-y-auto">
          <header className="flex items-center justify-between mb-10">
            <div>
              <h1 className="font-display text-4xl font-bold text-slate-800">{activeTab} Management</h1>
              <p className="text-slate-400 mt-1">Manage and moderate your assets.</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="glass px-4 py-2 rounded-2xl flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Fast search..." 
                  className="bg-transparent border-none focus:ring-0 text-sm w-48"
                />
              </div>

              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="px-6 py-3 bg-indigo-500 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-600 shadow-xl shadow-indigo-100 transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" /> Add New
              </button>
            </div>
          </header>

          {/* Dynamic Content based on activeTab */}
          <div className="grid grid-cols-1 gap-6">
            {activeTab === "Dashboard" && (
              <div className="space-y-6">
                <Banner wallpaperCount={wallpapers.length} />
                <DashboardStats wallpapers={wallpapers} />
                <RecentActivityTable wallpapers={wallpapers.slice(0, 5)} />
              </div>
            )}
            {activeTab === "Wallpapers" && (
              <DataTable 
                data={wallpapers.filter(w => (w.title || "").toLowerCase().includes(searchTerm.toLowerCase()))} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
              />
            )}
            {activeTab === "Categories" && (
              <CategoriesTable categories={categories} wallpapers={wallpapers} searchTerm={searchTerm} />
            )}
            {activeTab === "Users" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" /> Registered Users
                  </h3>
                  <UsersTable searchTerm={searchTerm} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-pink-500" /> Newsletter Subscribers
                  </h3>
                  <NewsletterSubscribersTable searchTerm={searchTerm} />
                </div>
              </div>
            )}
            {activeTab === "Messages" && (
              <MessagesTable searchTerm={searchTerm} />
            )}
            {activeTab === "Broadcast" && (
              <BroadcastTab 
                subject={broadcastSubject} 
                setSubject={setBroadcastSubject} 
                message={broadcastMessage} 
                setMessage={setBroadcastMessage} 
                target={broadcastTarget}
                setTarget={setBroadcastTarget}
                onSend={handleBroadcast} 
                isSending={isBroadcasting} 
              />
            )}
            {activeTab === "Ads & SEO" && (
              <AdsSeoSettings />
            )}
            {activeTab === "Settings" && (
              <GeneralSettings />
            )}
          </div>
        </main>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-y-auto my-auto max-h-[95vh] hide-scrollbar"
          >
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Upload New Wallpaper</h3>
                  <p className="text-slate-400 text-sm">Add high-quality artwork to your collection.</p>
                </div>
                <button 
                  onClick={closeUploadModal}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Target Database Selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Target Database</label>
                  <div className="flex p-1 bg-slate-100 rounded-2xl">
                    <button 
                      type="button"
                      onClick={() => setTargetDatabase("Standard")}
                      className={cn(
                        "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                        targetDatabase === "Standard" ? "bg-white text-indigo-600 shadow-sm border border-slate-100" : "text-slate-400"
                      )}
                    >
                      Standard (Default)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setTargetDatabase("Enterprise")}
                      className={cn(
                        "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                        targetDatabase === "Enterprise" ? "bg-white text-indigo-600 shadow-sm border border-slate-100" : "text-slate-400"
                      )}
                    >
                      Enterprise (Custom ID)
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Hashtags (separated by comma)</label>
                  <div className="relative">
                    <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      type="text" 
                      placeholder="e.g. naruto, anime, dark" 
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 transition-all outline-none font-bold text-slate-700"
                      value={hashtags}
                      onChange={(e) => setHashtags(e.target.value)}
                    />
                  </div>
                </div>
                {/* Method Toggle */}
                <div className="flex p-1 bg-slate-100 rounded-2xl">
                  <button 
                    onClick={() => setUploadMethod("file")}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                      uploadMethod === "file" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
                    )}
                  >
                    File Upload
                  </button>
                  <button 
                    onClick={() => setUploadMethod("url")}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                      uploadMethod === "url" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
                    )}
                  >
                    External URL
                  </button>
                </div>

                {/* File Dropzone */}
                {uploadMethod === "file" ? (
                  <div className="group relative">
                    {!previewUrl ? (
                      <>
                        <input 
                          type="file" 
                          id="wallpaper-upload"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                        <div className="border-2 border-dashed border-indigo-100 rounded-[32px] p-12 flex flex-col items-center justify-center gap-4 bg-indigo-50/30 group-hover:bg-indigo-50/50 transition-all group-hover:border-indigo-200">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-400 group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8" />
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-slate-700">Click or drag image to upload</p>
                            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">PNG, JPG or WebP (Max 20MB)</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="relative aspect-video rounded-[32px] overflow-hidden border border-indigo-100 group/preview">
                        <img src={previewUrl} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                          <button onClick={() => setPreviewUrl(null)} className="px-6 py-2 bg-white text-rose-500 rounded-full font-bold text-xs uppercase tracking-widest shadow-xl">
                            Change Image
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Image URL</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input 
                          type="url" 
                          placeholder="https://example.com/anime-art.jpg"
                          value={externalUrl}
                          onChange={(e) => {
                            setExternalUrl(e.target.value);
                            setPreviewUrl(e.target.value);
                          }}
                          className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                        />
                      </div>
                    </div>
                    {previewUrl && (
                      <div className="relative aspect-video rounded-[32px] overflow-hidden border border-indigo-100">
                        <img src={previewUrl} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Preview" onError={() => setPreviewUrl(null)} />
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Wallpaper Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Cyberpunk Dream"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-100 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Categories</label>
                    <MultiSelectCategories selected={selectedCategories} onChange={setSelectedCategories} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 px-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      is4k ? "bg-indigo-500 border-indigo-500 shadow-lg shadow-indigo-100" : "border-slate-200 group-hover:border-indigo-200"
                    )}>
                      <input type="checkbox" checked={is4k} onChange={(e) => setIs4k(e.target.checked)} className="hidden" />
                      {is4k && <Plus className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-sm font-bold text-slate-600">4K Ultra HD</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      is8k ? "bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200" : "border-slate-200 group-hover:border-indigo-300"
                    )}>
                      <input type="checkbox" checked={is8k} onChange={(e) => setIs8k(e.target.checked)} className="hidden" />
                      {is8k && <Plus className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-sm font-bold text-slate-600">8K Ultra HD</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      isPremium ? "bg-purple-500 border-purple-500 shadow-lg shadow-purple-100" : "border-slate-200 group-hover:border-purple-200"
                    )}>
                      <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} className="hidden" />
                      {isPremium && <Plus className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-sm font-bold text-slate-600">Premium member</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      is3d ? "bg-pink-500 border-pink-500 shadow-lg shadow-pink-100" : "border-slate-200 group-hover:border-pink-200"
                    )}>
                      <input type="checkbox" checked={is3d} onChange={(e) => setIs3d(e.target.checked)} className="hidden" />
                      {is3d && <Plus className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-sm font-bold text-slate-600">3D Design</span>
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={closeUploadModal}
                    disabled={isUploading}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpload}
                    disabled={isUploading || (!file && !externalUrl) || !title}
                    className="flex-1 py-4 bg-indigo-500 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isUploading ? "Uploading..." : "Start Upload"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
      
      {/* Edit Modal */}
      {isEditModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-y-auto my-auto max-h-[95vh] hide-scrollbar"
          >
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Edit Wallpaper</h3>
                  <p className="text-slate-400 text-sm">Update the details of your wallpaper.</p>
                </div>
                <button 
                  onClick={closeEditModal}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Hashtags (separated by comma)</label>
                  <div className="relative">
                    <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      type="text" 
                      placeholder="e.g. naruto, anime, dark" 
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 transition-all outline-none font-bold text-slate-700"
                      value={hashtags}
                      onChange={(e) => setHashtags(e.target.value)}
                    />
                  </div>
                </div>
                {/* File Preview */}
                <div className="group relative">
                  {previewUrl && (
                    <div className="relative aspect-video rounded-[32px] overflow-hidden border border-indigo-100">
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Wallpaper Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Cyberpunk Dream"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Categories</label>
                    <MultiSelectCategories selected={selectedCategories} onChange={setSelectedCategories} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 px-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      is4k ? "bg-indigo-500 border-indigo-500 shadow-lg shadow-indigo-100" : "border-slate-200 group-hover:border-indigo-200"
                    )}>
                      <input type="checkbox" checked={is4k} onChange={(e) => setIs4k(e.target.checked)} className="hidden" />
                      {is4k && <Plus className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-sm font-bold text-slate-600">4K Ultra HD</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      is8k ? "bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200" : "border-slate-200 group-hover:border-indigo-300"
                    )}>
                      <input type="checkbox" checked={is8k} onChange={(e) => setIs8k(e.target.checked)} className="hidden" />
                      {is8k && <Plus className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-sm font-bold text-slate-600">8K Ultra HD</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      isPremium ? "bg-purple-500 border-purple-500 shadow-lg shadow-purple-100" : "border-slate-200 group-hover:border-purple-200"
                    )}>
                      <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} className="hidden" />
                      {isPremium && <Plus className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-sm font-bold text-slate-600">Premium member</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      is3d ? "bg-pink-500 border-pink-500 shadow-lg shadow-pink-100" : "border-slate-200 group-hover:border-pink-200"
                    )}>
                      <input type="checkbox" checked={is3d} onChange={(e) => setIs3d(e.target.checked)} className="hidden" />
                      {is3d && <Plus className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-sm font-bold text-slate-600">3D Design</span>
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={closeEditModal}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpdate}
                    disabled={!title}
                    className="flex-1 py-4 bg-indigo-500 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}

function BroadcastTab({ subject, setSubject, message, setMessage, target, setTarget, onSend, isSending }: any) {
  return (
    <div className="glass p-10 rounded-[48px] space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500">
            <Mail className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Professional Broadcast</h3>
            <p className="text-slate-400">Send an announcement to your audience.</p>
          </div>
        </div>

        <div className="flex p-1 bg-slate-100/50 backdrop-blur-md rounded-2xl border border-white/50">
          <button 
            type="button"
            onClick={() => setTarget("users")}
            className={cn(
              "px-4 py-2 rounded-xl font-bold text-xs transition-all",
              target === "users" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Users
          </button>
          <button 
            type="button"
            onClick={() => setTarget("newsletter")}
            className={cn(
              "px-4 py-2 rounded-xl font-bold text-xs transition-all",
              target === "newsletter" ? "bg-white text-pink-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Newsletter
          </button>
          <button 
            type="button"
            onClick={() => setTarget("both")}
            className={cn(
              "px-4 py-2 rounded-xl font-bold text-xs transition-all",
              target === "both" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Both
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Subject Line</label>
          <input 
            type="text" 
            placeholder="e.g. Your weekly dose of Waifu masterpieces"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-8 py-5 bg-slate-50 border-none rounded-3xl focus:ring-4 focus:ring-pink-50 transition-all outline-none text-lg font-medium"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Editor (HTML)</label>
            <textarea 
              placeholder="Write your email content here (supports HTML)..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={12}
              className="w-full px-8 py-6 bg-slate-50 border-none rounded-[32px] focus:ring-4 focus:ring-pink-50 transition-all outline-none resize-none font-mono text-sm leading-relaxed"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Live Preview</label>
            <div className="w-full h-[324px] bg-slate-50 rounded-[32px] overflow-hidden border border-slate-100 flex flex-col shadow-inner">
              <div className="bg-slate-200/40 px-6 py-2 flex items-center gap-2 border-b border-white">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-400" />
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Broadcast Preview</span>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-white m-4 rounded-xl shadow-sm">
                <div style={{ fontFamily: 'sans-serif', color: '#374151' }}>
                  <div style={{ backgroundColor: '#6366f1', color: 'white', padding: '16px', borderRadius: '8px 8px 0 0', textAlign: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>WaifuWall</h1>
                  </div>
                  <div style={{ padding: '16px', border: '1px solid #f3f4f6', borderRadius: '0 0 8px 8px' }}>
                    <p style={{ margin: '0 0 16px' }}>Bonjour <strong>Cher membre</strong>,</p>
                    <div dangerouslySetInnerHTML={{ __html: message || '<p style="color: #9ca3af; font-style: italic;">Votre contenu apparaîtra ici...</p>' }} />
                    <p style={{ marginTop: '20px', fontSize: '13px', color: '#9ca3af', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                      Cordialement,<br /><strong>L'équipe WaifuWall</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-8 rounded-[32px] flex items-start gap-6">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-800 uppercase tracking-widest mb-1">Pre-flight check</h4>
            <p className="text-sm text-amber-700/70 leading-relaxed font-bold">
              Target audience: <span className="text-amber-800 uppercase underline decoration-2 underline-offset-2 tracking-tighter">{target}</span>. 
              Email content will be sent exactly as it appears in the preview.
            </p>
          </div>
        </div>

        <button 
          onClick={onSend}
          disabled={isSending || !subject || !message}
          className="w-full py-6 bg-pink-500 text-white rounded-[32px] font-bold text-xl shadow-xl shadow-pink-200 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-4 group"
        >
          {isSending ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Processing Transmissions...
            </>
          ) : (
            <>
              <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              Launch Professional Broadcast
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Banner({ wallpaperCount }: { wallpaperCount: number }) {
  return (
    <div className="relative h-60 rounded-[48px] overflow-hidden p-12 flex flex-col justify-center">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400" />
      <div className="absolute right-[-10%] top-[-20%] w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-[20%] bottom-[-30%] w-60 h-60 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
              Admin Shield Active
            </span>
          </div>
          <h2 className="text-4xl font-display font-extrabold text-white mb-4 leading-tight">
            The Gallery is Flourishing.
          </h2>
          <p className="text-indigo-50/80 text-lg leading-relaxed">
            You have <span className="text-white font-bold">{wallpaperCount}</span> masterpieces online today. Everything's running at peak performance.
          </p>
        </div>
        
        <div className="hidden lg:flex gap-6">
          <div className="glass p-6 rounded-3xl backdrop-blur-xl border-white/20">
             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 text-white">
                <TrendingUp className="w-6 h-6" />
             </div>
             <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Upload Rate</p>
             <h4 className="text-white text-2xl font-bold">+12%</h4>
          </div>
          <div className="glass p-6 rounded-3xl backdrop-blur-xl border-white/20">
             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 text-white">
                <ArrowUpRight className="w-6 h-6" />
             </div>
             <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Growth</p>
             <h4 className="text-white text-2xl font-bold">Stable</h4>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentActivityTable({ wallpapers }: { wallpapers: any[] }) {
  return (
    <div className="glass rounded-[48px] overflow-hidden">
      <div className="p-10 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Recent Art Uploads</h3>
          <p className="text-sm text-slate-400">Latest additions to the gallery.</p>
        </div>
        <button className="text-sm font-bold text-indigo-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">
           View All
        </button>
      </div>
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/50">
          <tr>
            <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset</th>
            <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metadata</th>
            <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {wallpapers.map((item) => (
            <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50/30 transition-colors group">
              <td className="px-10 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-white">
                    <img src={item.thumbnailUrl || item.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700">{item.title}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                       <ImageIcon className="w-3 h-3" /> {item.category}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-10 py-6">
                 <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-2 text-xs font-bold text-slate-500">
                       <TrendingUp className="w-3 h-3 text-emerald-500" /> {Number(item.views || 0).toLocaleString()} Views
                    </span>
                    <span className="flex items-center gap-2 text-xs font-bold text-slate-500">
                       <Download className="w-3 h-3 text-indigo-500" /> {Number(item.downloads || 0).toLocaleString()} Downloads
                    </span>
                 </div>
              </td>
              <td className="px-10 py-6">
                <div className="flex items-center justify-end gap-3">
                   <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-indigo-50 text-indigo-400 border border-transparent hover:border-indigo-100 transition-all">
                      <ExternalLink className="w-4 h-4" />
                   </button>
                   <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 border border-transparent transition-all">
                      <MoreVertical className="w-4 h-4" />
                   </button>
                </div>
              </td>
            </tr>
          ))}
          {wallpapers.length === 0 && (
            <tr>
              <td colSpan={3} className="px-10 py-20 text-center">
                 <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                       <ImageIcon className="w-10 h-10" />
                    </div>
                    <p className="text-slate-400 font-bold">No recent activity found.</p>
                 </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function DataTable({ data, onEdit, onDelete }: { data: any[], onEdit: (item: any) => void, onDelete: (id: string, origin: string) => void }) {
  return (
    <div className="glass rounded-[48px] overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/50">
          <tr>
            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Asset</th>
            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Views</th>
            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Origin</th>
            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50/30 transition-colors">
              <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100">
                    <img src={item.thumbnailUrl || item.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700">{item.title}</h4>
                    <p className="text-xs text-slate-400 font-mono tracking-tighter">ID: {item.id.substring(0, 8)}...</p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-5">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-500 rounded-full text-xs font-bold">{item.category}</span>
              </td>
              <td className="px-8 py-5 font-bold text-slate-600">{(item.downloads || 0).toLocaleString()}</td>
              <td className="px-8 py-5">
                <div className="flex items-center gap-2">
                  <div className={cn("w-1.5 h-1.5 rounded-full", item.origin === "Enterprise" ? "bg-emerald-500" : "bg-blue-500")} />
                  <span className="text-sm font-medium text-slate-600">{item.origin || "Standard"}</span>
                </div>
              </td>
              <td className="px-8 py-5">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => onEdit(item)} className="p-3 hover:bg-indigo-50 text-indigo-400 rounded-xl transition-all active:scale-95 border border-transparent hover:border-indigo-100"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => onDelete(item.id, item.origin)} className="p-3 hover:bg-rose-50 text-rose-400 rounded-xl transition-all active:scale-95 border border-transparent hover:border-rose-100"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DashboardStats({ wallpapers }: { wallpapers: any[] }) {
  const [userCountStandard, setUserCountStandard] = useState(0);
  const [userCountEnterprise, setUserCountEnterprise] = useState(0);
  const { categories } = useCategories();

  useEffect(() => {
    if (!db || !auth?.currentUser) return;
    
    // Standard DB
    const unsubStandard = onSnapshot(collection(dbStandard, "users"), (snap) => {
      setUserCountStandard(snap.size);
    }, (error: any) => {
      if (error?.code !== 'permission-denied') {
        console.warn("DashboardStats: Error listing users (Standard):", error);
      }
      setUserCountStandard(0);
    });

    // Enterprise DB
    let unsubEnterprise = () => {};
    if (db && db !== dbStandard) {
      unsubEnterprise = onSnapshot(collection(db, "users"), (snap) => {
        setUserCountEnterprise(snap.size);
      }, (error: any) => {
        if (error?.code !== 'permission-denied') {
          console.warn("DashboardStats: Error listing users (Enterprise):", error);
        }
        setUserCountEnterprise(0);
      });
    }

    return () => {
      unsubStandard();
      unsubEnterprise();
    };
  }, [auth?.currentUser, dbStandard]);

  const userCount = userCountStandard + userCountEnterprise;

  const stats = [
    { label: "Total Wallpapers", value: wallpapers.length, icon: ImageIcon, color: "text-indigo-500", bg: "bg-indigo-50" },
    { label: "Active Users", value: userCount, icon: Users, color: "text-pink-500", bg: "bg-pink-50" },
    { label: "Categories", value: categories.length, icon: Layers, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Est. Downloads", value: (wallpapers.reduce((acc, w) => acc + (Number(w.downloads) || 0), 0) / 1000).toFixed(1) + "k", icon: Download, color: "text-emerald-500", bg: "bg-emerald-50" },
  ];

  const chartData = useMemo(() => {
    return [
      { name: "Mon", value: 420 },
      { name: "Tue", value: 580 },
      { name: "Wed", value: 490 },
      { name: "Thu", value: 720 },
      { name: "Fri", value: 650 },
      { name: "Sat", value: 890 },
      { name: "Sun", value: 950 },
    ];
  }, []);

  const categoryDistribution = useMemo(() => {
    return categories.map((cat, i) => ({
      name: cat.name,
      value: wallpapers.filter(w => w.category === cat.name).length
    })).filter(c => c.value > 0);
  }, [categories, wallpapers]);

  const COLORS = ["#6366f1", "#f43f5e", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-8 rounded-[40px] flex items-center gap-6">
            <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center shrink-0", stat.bg)}>
               <stat.icon className={cn("w-8 h-8", stat.color)} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="text-3xl font-display font-extrabold text-slate-800 leading-none">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass p-10 rounded-[48px]">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Traffic Activity</h3>
              <p className="text-sm text-slate-400">Weekly engagement Overview</p>
            </div>
            <div className="flex gap-2">
               <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full">
                 <ArrowUpRight className="w-3 h-3" /> +15.5%
               </span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: "#94a3b8" }} 
                  dy={10}
                />
                <YAxis 
                  hide 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: "20px", 
                    border: "none", 
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    fontWeight: "bold"
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366f1" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 glass p-10 rounded-[48px]">
           <h3 className="text-xl font-bold text-slate-800 mb-8">Categories</h3>
           <div className="h-[250px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={categoryDistribution}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={100}
                   paddingAngle={8}
                   dataKey="value"
                   cornerRadius={10}
                 >
                   {categoryDistribution.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip 
                   contentStyle={{ 
                    borderRadius: "16px", 
                    border: "none", 
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    fontSize: "12px"
                  }} 
                 />
               </PieChart>
             </ResponsiveContainer>
           </div>
           <div className="mt-6 flex flex-wrap gap-4">
              {categoryDistribution.map((cat, i) => (
                <div key={i} className="flex items-center gap-2">
                   <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{cat.name} ({cat.value})</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

function CategoriesTable({ categories, wallpapers, searchTerm }: { categories: any[], wallpapers: any[], searchTerm: string }) {
  const [newCatName, setNewCatName] = useState("");
  const [newCatUrl, setNewCatUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [targetDb, setTargetDb] = useState<"Standard" | "Enterprise">("Enterprise");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingOrigin, setEditingOrigin] = useState<"Standard" | "Enterprise">("Enterprise");
  const [editingName, setEditingName] = useState("");
  const [editingUrl, setEditingUrl] = useState("");
  const [isUpdatingCat, setIsUpdatingCat] = useState(false);

  const enrichedCategories = categories.map(cat => ({
    ...cat,
    count: wallpapers.filter(w => w.category === cat.name).length
  })).filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const firestore = targetDb === "Standard" ? dbStandard : db;
    if (!newCatName.trim() || !firestore) {
      console.warn("Cannot add category: Name is empty or DB not initialized");
      return;
    }
    setIsAdding(true);
    try {
      const docRef = await addDoc(collection(firestore, "categories"), { 
        name: newCatName.trim(), 
        imageUrl: newCatUrl.trim(),
        createdAt: serverTimestamp() 
      });
      setNewCatName("");
      setNewCatUrl("");
      alert(`Category created in ${targetDb}!`);
    } catch (error: any) {
      console.error("Failed to add category", error);
      alert("Failed to add category: " + error.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editingName.trim()) return;
    const firestore = editingOrigin === "Standard" ? dbStandard : db;
    if (!firestore) return;

    setIsUpdatingCat(true);
    try {
      await updateDoc(doc(firestore, "categories", id), { 
        name: editingName.trim(),
        imageUrl: editingUrl.trim()
      });
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update category", error);
      alert("Failed to update category");
    } finally {
      setIsUpdatingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string, origin: string) => {
    if (wallpapers.some(w => w.category === name)) {
      alert(`There are wallpapers linked to "${name}". Please re-categorize them first before deleting this category.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete the category "${name}" from ${origin}?`)) {
      try {
        const firestore = origin === "Standard" ? dbStandard : db;
        if (firestore) await deleteDoc(doc(firestore, "categories", id));
      } catch (error) {
        console.error("Failed to delete category", error);
        alert("Failed to delete category");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass p-8 rounded-[48px] flex flex-col gap-6">
         <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-800">Manage Categories</h3>
            <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-xs font-bold uppercase tracking-widest">Total: {categories.length}</span>
         </div>
         
         <form id="add-category-form" onSubmit={handleAddCategory} className="bg-slate-50/50 p-8 rounded-[32px] border border-slate-100 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Category Name</label>
                 <input 
                   type="text" 
                   placeholder="e.g. Dark Anime" 
                   value={newCatName} 
                   onChange={(e) => setNewCatName(e.target.value)} 
                   className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-indigo-100/20 outline-none text-sm font-bold transition-all" 
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Cover Image URL</label>
                 <input 
                   type="text" 
                   placeholder="https://images.unsplash.com/..." 
                   value={newCatUrl} 
                   onChange={(e) => setNewCatUrl(e.target.value)} 
                   className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-indigo-100/20 outline-none text-sm font-bold transition-all" 
                 />
               </div>
             </div>

             <div className="flex flex-col md:flex-row items-end gap-6 border-t border-slate-100 pt-6">
                <div className="flex-1 space-y-2 w-full">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Target Database</label>
                  <div className="flex p-1 bg-white border border-slate-200 rounded-2xl w-full">
                    <button 
                      type="button"
                      onClick={() => setTargetDb("Standard")}
                      className={cn(
                        "flex-1 py-3 rounded-xl font-bold text-xs transition-all",
                        targetDb === "Standard" ? "bg-indigo-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      Standard
                    </button>
                    <button 
                      type="button"
                      onClick={() => setTargetDb("Enterprise")}
                      className={cn(
                        "flex-1 py-3 rounded-xl font-bold text-xs transition-all",
                        targetDb === "Enterprise" ? "bg-indigo-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      Enterprise
                    </button>
                  </div>
                </div>

               <button 
                 type="submit" 
                 disabled={isAdding || !newCatName.trim()} 
                 className="flex-[0.5] w-full h-[54px] bg-indigo-500 text-white font-bold rounded-2xl disabled:opacity-50 hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
               >
                  <Plus className="w-5 h-5" />
                  {isAdding ? "Working..." : "Add to Gallery"}
               </button>
             </div>
         </form>
      </div>
      
      <div className="glass rounded-[48px] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visual</th>
              <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Designation</th>
              <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Origin</th>
              <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Usage</th>
              <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Control</th>
            </tr>
          </thead>
          <tbody>
            {enrichedCategories.length > 0 ? (
              enrichedCategories.map((c) => (
                <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50/30 transition-colors">
                  <td className="px-10 py-6">
                    {editingId === c.id ? (
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-indigo-100 overflow-hidden shadow-inner">
                        {(editingUrl || c.imageUrl) ? (
                          <img src={editingUrl || c.imageUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        )}
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-white shadow-sm overflow-hidden flex items-center justify-center">
                        {c.imageUrl ? (
                          <img src={c.imageUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-10 py-6">
                    {editingId === c.id ? (
                      <div className="flex flex-col gap-3">
                        <input 
                          type="text" 
                          value={editingName} 
                          onChange={(e) => setEditingName(e.target.value)}
                          className="px-4 py-2.5 rounded-xl bg-white border border-indigo-200 focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-slate-700 text-sm"
                          placeholder="Name..."
                          autoFocus
                        />
                        <input 
                          type="text" 
                          value={editingUrl} 
                          onChange={(e) => setEditingUrl(e.target.value)}
                          className="px-4 py-2.5 rounded-xl bg-white border border-indigo-200 focus:ring-4 focus:ring-indigo-50 outline-none text-slate-500 text-[10px] font-mono"
                          placeholder="Image URL..."
                        />
                      </div>
                    ) : (
                      <div>
                        <span className="font-bold text-slate-700 block">{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">#{c.id.substring(0, 8)}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                        c.origin === "Enterprise" ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"
                    )}>
                        {c.origin || "Standard"}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <span className="px-4 py-1.5 bg-pink-50 text-pink-500 rounded-full text-[10px] font-bold uppercase tracking-[0.1em]">{c.count} Artworks</span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === c.id ? (
                        <>
                          <button 
                            onClick={() => handleUpdateCategory(c.id)}
                            className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-emerald-100 hover:scale-105 active:scale-95 transition-all"
                            disabled={isUpdatingCat}
                          >
                            {isUpdatingCat ? "..." : "Confirm"}
                          </button>
                          <button 
                            onClick={() => { setEditingId(null); setEditingUrl(""); }}
                            className="bg-slate-100 text-slate-500 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-200 active:scale-95 transition-all"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => { setEditingId(c.id); setEditingName(c.name); setEditingOrigin(c.origin || "Enterprise"); setEditingUrl(c.imageUrl || ""); }}
                          className="p-3 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all active:scale-90 border border-transparent hover:border-indigo-100"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleDeleteCategory(c.id, c.name, c.origin || "Standard")} 
                        className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90 border border-transparent hover:border-rose-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-20">
                      <Layers className="w-20 h-20" />
                      <p className="text-xl font-bold uppercase tracking-widest">No Categories Defined</p>
                    </div>
                  </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersTable({ searchTerm }: { searchTerm: string }) {
  const [usersStandard, setUsersStandard] = useState<any[]>([]);
  const [usersEnterprise, setUsersEnterprise] = useState<any[]>([]);
  const [isLoadingStandard, setIsLoadingStandard] = useState(true);
  const [isLoadingEnterprise, setIsLoadingEnterprise] = useState(true);

  useEffect(() => {
    if (!dbStandard || !auth?.currentUser) return;
    
    // Standard DB
    const unsubStandard = onSnapshot(collection(dbStandard, "users"), (sn) => {
        const list = sn.docs.map(doc => ({
            id: doc.id,
            origin: "Standard",
            ...(doc.data() as any)
        }));
        setUsersStandard(list);
        setIsLoadingStandard(false);
    }, (error: any) => {
        if (error?.code !== 'permission-denied') {
          console.warn("UsersTable: Error listing users (Standard):", error);
        }
        setUsersStandard([]);
        setIsLoadingStandard(false);
    });

    // Enterprise DB
    let unsubEnterprise = () => {};
    if (db && db !== dbStandard) {
      unsubEnterprise = onSnapshot(collection(db, "users"), (sn) => {
          const list = sn.docs.map(doc => ({
              id: doc.id,
              origin: "Enterprise",
              ...(doc.data() as any)
          }));
          setUsersEnterprise(list);
          setIsLoadingEnterprise(false);
      }, (error: any) => {
          if (error?.code !== 'permission-denied') {
            console.warn("UsersTable: Error listing users (Enterprise):", error);
          }
          setUsersEnterprise([]);
          setIsLoadingEnterprise(false);
      });
    } else {
      setIsLoadingEnterprise(false);
    }

    return () => {
      unsubStandard();
      unsubEnterprise();
    };
  }, [auth?.currentUser, dbStandard]);

  const users = useMemo(() => {
    // Merge and Deduplicate by ID if necessary, though they should be different sets of users
    const combined = [...usersStandard, ...usersEnterprise];
    return combined.filter(u => 
        (u.displayName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [usersStandard, usersEnterprise, searchTerm]);

  const isLoading = isLoadingStandard || isLoadingEnterprise;

  return (
    <div className="glass rounded-[32px] overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/50">
          <tr>
            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Email</th>
            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">ID</th>
            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Origin</th>
            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
              <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                      Loading Users...
                  </td>
              </tr>
          ) : users.map((u) => (
            <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50/30 transition-colors">
              <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-white shadow-sm overflow-hidden text-xs flex items-center justify-center font-bold text-slate-400">
                          {u.photoURL ? <img src={u.photoURL} alt="" /> : u.displayName?.[0] || "?"}
                      </div>
                      <span className="font-bold text-slate-700">{u.displayName || "Anonymous"}</span>
                  </div>
              </td>
              <td className="px-8 py-5 text-slate-500 font-medium">{u.email}</td>
              <td className="px-8 py-5 text-slate-400 text-[10px] font-mono">{u.id}</td>
              <td className="px-8 py-5">
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                    u.origin === "Enterprise" ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"
                  )}>
                    {u.origin}
                  </span>
              </td>
              <td className="px-8 py-5">
                <div className="flex gap-2">
                    <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter", u.isAdmin ? "bg-purple-50 text-purple-600 border border-purple-100" : "bg-slate-50 text-slate-400")}>
                      {u.isAdmin ? "Admin" : "User"}
                    </span>
                    {u.isPremium && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-amber-50 text-amber-600 border border-amber-100">
                            Premium
                        </span>
                    )}
                </div>
              </td>
            </tr>
          ))}
          {!isLoading && users.length === 0 && (
              <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold">
                      No users found.
                  </td>
              </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function NewsletterSubscribersTable({ searchTerm }: { searchTerm: string }) {
  const [subsStandard, setSubsStandard] = useState<any[]>([]);
  const [subsEnterprise, setSubsEnterprise] = useState<any[]>([]);
  const [isLoadingStandard, setIsLoadingStandard] = useState(true);
  const [isLoadingEnterprise, setIsLoadingEnterprise] = useState(true);

  useEffect(() => {
    if (!dbStandard || !auth?.currentUser) return;
    
    // Standard DB
    const unsubStandard = onSnapshot(collection(dbStandard, "newsletter"), (sn) => {
        const list = sn.docs.map(doc => ({
            id: doc.id,
            origin: "Standard",
            ...doc.data()
        }));
        setSubsStandard(list);
        setIsLoadingStandard(false);
    }, (error) => {
        console.error("Error fetching subscribers (Standard):", error);
        setIsLoadingStandard(false);
    });

    // Enterprise DB
    let unsubEnterprise = () => {};
    if (db && db !== dbStandard) {
      unsubEnterprise = onSnapshot(collection(db, "newsletter"), (sn) => {
          const list = sn.docs.map(doc => ({
              id: doc.id,
              origin: "Enterprise",
              ...doc.data()
          }));
          setSubsEnterprise(list);
          setIsLoadingEnterprise(false);
      }, (error) => {
          console.error("Error fetching subscribers (Enterprise):", error);
          setIsLoadingEnterprise(false);
      });
    } else {
      setIsLoadingEnterprise(false);
    }

    return () => {
      unsubStandard();
      unsubEnterprise();
    };
  }, [auth?.currentUser, dbStandard]);

  const subscribers = useMemo(() => {
    return [...subsStandard, ...subsEnterprise].filter(s => 
        (s.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [subsStandard, subsEnterprise, searchTerm]);

  const isLoading = isLoadingStandard || isLoadingEnterprise;

  const handleDeleteSub = async (id: string, origin: string) => {
    if (window.confirm("Remove this subscriber?")) {
      try {
        const targetDb = origin === "Standard" ? dbStandard : db;
        if (targetDb) await deleteDoc(doc(targetDb, "newsletter", id));
      } catch (err) {
        alert("Failed to delete subscriber");
      }
    }
  };

  return (
    <div className="glass rounded-[32px] overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/50">
          <tr>
            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</th>
            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Origin</th>
            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={3} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest">Loading Subscribers...</td>
            </tr>
          ) : subscribers.map((s) => (
            <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50/30 transition-colors">
              <td className="px-8 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-700">{s.email}</span>
                </div>
              </td>
              <td className="px-8 py-5">
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                    s.origin === "Enterprise" ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"
                  )}>
                    {s.origin}
                  </span>
              </td>
              <td className="px-8 py-5 text-right">
                <button 
                  onClick={() => handleDeleteSub(s.id, s.origin)}
                  className="w-10 h-10 inline-flex items-center justify-center text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
          {!isLoading && subscribers.length === 0 && (
            <tr>
              <td colSpan={3} className="px-8 py-20 text-center text-slate-400 font-bold">No subscribers yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AdsSeoSettings() {
  const [gaId, setGaId] = useState("");
  const [adsenseId, setAdsenseId] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!db || !auth?.currentUser) return;
    const unsub = onSnapshot(doc(db, "settings", "ads_seo"), (sn) => {
      if (sn.exists()) {
        const data = sn.data();
        setGaId(data.gaId || "");
        setAdsenseId(data.adsenseId || "");
        setMetaKeywords(data.metaKeywords || "");
        setMetaDescription(data.metaDescription || "");
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "settings/ads_seo");
    });
    return () => unsub();
  }, [auth?.currentUser]);

  const handleSave = async () => {
    if (!db) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "settings", "ads_seo"), {
        gaId,
        adsenseId,
        metaKeywords,
        metaDescription,
        updatedAt: serverTimestamp()
      });
      alert("Ads & SEO Settings saved successfully!");
    } catch (err) {
      // If doc doesn't exist, try to set it
      try {
        const { setDoc } = await import("firebase/firestore");
        await setDoc(doc(db, "settings", "ads_seo"), {
          gaId,
          adsenseId,
          metaKeywords,
          metaDescription,
          updatedAt: serverTimestamp()
        });
        alert("Ads & SEO Settings saved successfully!");
      } catch (innerErr) {
        console.error(innerErr);
        alert("Failed to save settings.");
      }
    }
    setIsSaving(false);
  };

  return (
    <div className="glass p-10 rounded-[32px] space-y-6">
      <h3 className="text-2xl font-bold mb-4">Ads & SEO Settings</h3>
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Google Analytics ID</label>
        <input 
          type="text" 
          value={gaId}
          onChange={(e) => setGaId(e.target.value)}
          placeholder="G-XXXXXXXXXX" 
          className="w-full mt-2 px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-100 transition-all outline-none" 
        />
      </div>
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Adsense Client ID</label>
        <input 
          type="text" 
          value={adsenseId}
          onChange={(e) => setAdsenseId(e.target.value)}
          placeholder="ca-pub-XXXXXXXXXXXXXXXX" 
          className="w-full mt-2 px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-100 transition-all outline-none" 
        />
      </div>
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Meta Keywords</label>
        <input 
          type="text" 
          value={metaKeywords}
          onChange={(e) => setMetaKeywords(e.target.value)}
          placeholder="waifu, wallpaper, anime, art" 
          className="w-full mt-2 px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-100 transition-all outline-none" 
        />
      </div>
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Meta Description</label>
        <textarea 
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          placeholder="Discover the best high-quality anime wallpapers..." 
          rows={3}
          className="w-full mt-2 px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-100 transition-all outline-none resize-none" 
        />
      </div>
      <button 
        onClick={handleSave}
        disabled={isSaving}
        className="px-6 py-3 bg-indigo-500 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-600 transition-all disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}

function GeneralSettings() {
  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!db || !auth?.currentUser) return;
    const unsub = onSnapshot(doc(db, "settings", "general"), (sn) => {
      if (sn.exists()) {
        const data = sn.data();
        setSiteName(data.siteName || "");
        setSiteDescription(data.siteDescription || "");
        setMetaKeywords(data.metaKeywords || "");
        setMetaDescription(data.metaDescription || "");
        setContactEmail(data.contactEmail || "");
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "settings/general");
    });
    return () => unsub();
  }, [auth?.currentUser]);

  const handleSave = async () => {
    if (!db) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "settings", "general"), {
        siteName,
        siteDescription,
        metaKeywords,
        metaDescription,
        contactEmail,
        updatedAt: serverTimestamp()
      });
      alert("General Settings saved successfully!");
    } catch (err) {
      try {
        const { setDoc } = await import("firebase/firestore");
        await setDoc(doc(db, "settings", "general"), {
          siteName,
          siteDescription,
          metaKeywords,
          metaDescription,
          contactEmail,
          updatedAt: serverTimestamp()
        });
        alert("General Settings saved successfully!");
      } catch (innerErr) {
        console.error(innerErr);
        alert("Failed to save settings.");
      }
    }
    setIsSaving(false);
  };

  return (
    <div className="glass p-10 rounded-[32px] space-y-6">
      <h3 className="text-2xl font-bold mb-4">General Settings</h3>
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Site Name</label>
        <input 
          type="text" 
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          placeholder="e.g. WaitfuWall" 
          className="w-full mt-2 px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-100 transition-all outline-none" 
        />
      </div>
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Site Description</label>
        <input 
          type="text" 
          value={siteDescription}
          onChange={(e) => setSiteDescription(e.target.value)}
          placeholder="A short description for Meta tags" 
          className="w-full mt-2 px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-100 transition-all outline-none" 
        />
      </div>
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Meta Keywords</label>
        <input 
          type="text" 
          value={metaKeywords}
          onChange={(e) => setMetaKeywords(e.target.value)}
          placeholder="waifu, wallpaper, anime, art" 
          className="w-full mt-2 px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-100 transition-all outline-none" 
        />
      </div>
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Meta Description</label>
        <textarea 
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          placeholder="SEO focused description" 
          rows={3}
          className="w-full mt-2 px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-100 transition-all outline-none resize-none" 
        />
      </div>
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Contact Email</label>
        <input 
          type="email" 
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder="admin@example.com" 
          className="w-full mt-2 px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-100 transition-all outline-none" 
        />
      </div>
      <button 
        onClick={handleSave}
        disabled={isSaving}
        className="px-6 py-3 bg-indigo-500 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-600 transition-all disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}

function BlogPostsTable({ searchTerm }: { searchTerm: string }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image: "",
    category: "Guides",
    tags: "",
    author: "Admin",
    readTime: "5 min",
    relatedSearch: ""
  });

  useEffect(() => {
    if (!db || !auth?.currentUser) return;

    const q = query(collection(db, "blogPosts"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (sn) => {
      setPosts(sn.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });
    return () => unsub();
  }, [auth?.currentUser]);

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    const postData = {
      ...formData,
      slug: formData.slug.trim().toLowerCase().replace(/\s+/g, '-'),
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      updatedAt: serverTimestamp()
    };

    try {
      if (editingPost) {
        await updateDoc(doc(db, "blogPosts", editingPost.id), postData);
      } else {
        await addDoc(collection(db, "blogPosts"), postData);
      }
      setIsModalOpen(false);
      setEditingPost(null);
      setFormData({
        title: "", slug: "", excerpt: "", content: "", image: "", 
        category: "Guides", tags: "", author: "Admin", readTime: "5 min", relatedSearch: ""
      });
    } catch (err) {
      console.error(err);
      alert("Error saving post");
    }
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      image: post.image,
      category: post.category,
      tags: post.tags.join(", "),
      author: post.author,
      readTime: post.readTime,
      relatedSearch: post.relatedSearch || ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!db || !window.confirm("Delete this article?")) return;
    try {
      await deleteDoc(doc(db, "blogPosts", id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete article");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">Manage Articles</h3>
        <button 
          onClick={() => { setEditingPost(null); setIsModalOpen(true); }}
          className="px-6 py-2 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-all text-sm"
        >
          New Article
        </button>
      </div>

      <div className="glass rounded-[32px] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Article</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold">Loading...</td></tr>
            ) : filteredPosts.map(post => (
              <tr key={post.id} className="border-t border-slate-100 hover:bg-slate-50/30">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <img src={post.image} referrerPolicy="no-referrer" className="w-12 h-12 rounded-xl object-cover" alt="" />
                    <div>
                      <div className="font-bold text-slate-800 line-clamp-1">{post.title}</div>
                      <div className="text-[10px] text-slate-400">/{post.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                    {post.category}
                  </span>
                </td>
                <td className="px-8 py-5 text-sm text-slate-500">{post.date}</td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(post)} className="p-2 hover:bg-indigo-50 text-indigo-400 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="p-2 hover:bg-rose-50 text-rose-400 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-900">{editingPost ? "Edit Article" : "Write New Article"}</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                  <input 
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="Epic Naruto Wallpapers..."
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-100 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Slug (URL friendly)</label>
                  <input 
                    required
                    value={formData.slug}
                    onChange={e => setFormData({...formData, slug: e.target.value})}
                    placeholder="epic-naruto-wallpapers"
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-100 transition-all font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                  <input 
                    required
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-100 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Image URL</label>
                  <input 
                    required
                    value={formData.image}
                    onChange={e => setFormData({...formData, image: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-100 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Related Search</label>
                  <input 
                    value={formData.relatedSearch}
                    onChange={e => setFormData({...formData, relatedSearch: e.target.value})}
                    placeholder="Naruto"
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-100 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Excerpt</label>
                <textarea 
                  required
                  value={formData.excerpt}
                  onChange={e => setFormData({...formData, excerpt: e.target.value})}
                  rows={2}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-100 transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Content (Markdown)</label>
                <MarkdownEditor
                  value={formData.content}
                  onChange={value => setFormData({...formData, content: value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tags (comma separated)</label>
                <input 
                  value={formData.tags}
                  onChange={e => setFormData({...formData, tags: e.target.value})}
                  placeholder="Naruto, 4K, Mobile"
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-100 transition-all"
                />
              </div>

              <div className="flex gap-4 pt-6 sticky bottom-0 bg-white">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-pink-500 text-white rounded-2xl font-black shadow-xl shadow-pink-100 uppercase tracking-widest text-xs"
                >
                  {editingPost ? "Update Post" : "Publish Post"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}

function MessagesTable({ searchTerm }: { searchTerm: string }) {
  const [messagesStandard, setMessagesStandard] = useState<any[]>([]);
  const [messagesEnterprise, setMessagesEnterprise] = useState<any[]>([]);
  const [isLoadingStandard, setIsLoadingStandard] = useState(true);
  const [isLoadingEnterprise, setIsLoadingEnterprise] = useState(true);

  useEffect(() => {
    if (!dbStandard || !auth?.currentUser) return;
    
    // Standard DB
    const qStandard = query(collection(dbStandard, "contact_messages"), orderBy("createdAt", "desc"));
    const unsubStandard = onSnapshot(qStandard, (sn) => {
      const list = sn.docs.map(doc => ({
        id: doc.id,
        origin: "Standard",
        ...doc.data()
      }));
      setMessagesStandard(list);
      setIsLoadingStandard(false);
    }, (error) => {
      console.error("Error fetching messages (Standard):", error);
      setIsLoadingStandard(false);
    });

    // Enterprise DB
    let unsubEnterprise = () => {};
    if (db && db !== dbStandard) {
      const qEnterprise = query(collection(db, "contact_messages"), orderBy("createdAt", "desc"));
      unsubEnterprise = onSnapshot(qEnterprise, (sn) => {
        const list = sn.docs.map(doc => ({
          id: doc.id,
          origin: "Enterprise",
          ...doc.data()
        }));
        setMessagesEnterprise(list);
        setIsLoadingEnterprise(false);
      }, (error) => {
        console.error("Error fetching messages (Enterprise):", error);
        setIsLoadingEnterprise(false);
      });
    } else {
      setIsLoadingEnterprise(false);
    }

    return () => {
      unsubStandard();
      unsubEnterprise();
    };
  }, [auth?.currentUser, dbStandard]);

  const messages = useMemo(() => {
    return [...messagesStandard, ...messagesEnterprise].filter(m => 
        (m.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.message || "").toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a: any, b: any) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [messagesStandard, messagesEnterprise, searchTerm]);

  const isLoading = isLoadingStandard || isLoadingEnterprise;

  const handleDelete = async (id: string, origin: string) => {
    if (window.confirm("Supprimer ce message ?")) {
      try {
        const targetDb = origin === "Standard" ? dbStandard : db;
        if (targetDb) await deleteDoc(doc(targetDb, "contact_messages", id));
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const markAsRead = async (id: string, origin: string) => {
    try {
      const targetDb = origin === "Standard" ? dbStandard : db;
      if (targetDb) await updateDoc(doc(targetDb, "contact_messages", id), { status: "read" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass rounded-[32px] overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/50">
          <tr>
            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Sender</th>
            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Origin</th>
            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Message</th>
            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest">Chargement...</td>
            </tr>
          ) : messages.map((m) => (
            <tr key={m.id} className={cn(
              "border-t border-slate-100 hover:bg-slate-50/30 transition-colors",
              m.status === "new" ? "bg-indigo-50/20" : ""
            )}>
              <td className="px-8 py-5 text-xs text-slate-500 font-medium whitespace-nowrap">
                {m.createdAt?.toDate ? m.createdAt.toDate().toLocaleString() : "Récent"}
              </td>
              <td className="px-8 py-5">
                <div className="flex flex-col">
                  <span className={cn("font-bold", m.status === "new" ? "text-indigo-600" : "text-slate-700")}>{m.name}</span>
                  <span className="text-[10px] text-slate-400">{m.email}</span>
                </div>
              </td>
              <td className="px-8 py-5">
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                    m.origin === "Enterprise" ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"
                  )}>
                    {m.origin}
                  </span>
              </td>
              <td className="px-8 py-5 text-sm text-slate-600 max-w-md truncate">
                {m.message}
              </td>
              <td className="px-8 py-5 text-right">
                <div className="flex justify-end gap-2">
                  {m.status === "new" && (
                    <button 
                      onClick={() => markAsRead(m.id, m.origin)}
                      className="p-2 hover:bg-indigo-50 text-indigo-400 rounded-lg transition-colors border border-transparent whitespace-nowrap text-[10px] font-bold uppercase tracking-widest"
                    >
                      Lu
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(m.id, m.origin)} 
                    className="p-2 hover:bg-rose-50 text-rose-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {!isLoading && messages.length === 0 && (
            <tr>
              <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold italic">Aucun message de contact.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
