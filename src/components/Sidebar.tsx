import { motion } from "motion/react";
import { ChevronRight, Crown, Download, Heart, TrendingUp, Clock, Grid, Search } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCategories } from "@/src/hooks/useCategories";
import { useWallpapers } from "@/src/hooks/useWallpapers";
import { AdSense } from "@/src/components/AdSense";
import { useState, useEffect } from "react";

export function Sidebar() {
  const { categories } = useCategories();
  const { wallpapers } = useWallpapers();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setSearchTerm(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const currentQ = searchParams.get("q") || "";
      if (searchTerm.trim() !== currentQ) {
        if (searchTerm.trim() !== "") {
          navigate(`/?q=${encodeURIComponent(searchTerm.trim())}`);
        } else if (currentQ !== "") {
          navigate("/");
        }
      }
    }, 500); // 500ms debounce for sidebar to avoid too many transitions

    return () => clearTimeout(handler);
  }, [searchTerm, navigate, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate("/");
    }
  };

  const defaultImages = [
    "https://images.unsplash.com/photo-1541562232579-2af5f51957c5?w=200&fit=crop",
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&fit=crop",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&fit=crop",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&fit=crop"
  ];

  const sidebarCategories = categories.slice(0, 4).map((cat, i) => ({
    name: cat.name,
    count: (wallpapers.filter(w => w.category === cat.name).length) + " Artworks",
    image: cat.imageUrl || defaultImages[i % defaultImages.length]
  }));

  const topDownloads = [...wallpapers]
    .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
    .slice(0, 3);

  const latestUpdates = [...wallpapers]
    .sort((a, b) => {
      const dateA = a.createdAt?.seconds ? a.createdAt.seconds : new Date(a.createdAt).getTime();
      const dateB = b.createdAt?.seconds ? b.createdAt.seconds : new Date(b.createdAt).getTime();
      return (dateB as number) - (dateA as number);
    })
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Search Bar */}
      <div className="glass p-6 rounded-[32px]">
        <h3 className="font-display font-bold text-lg text-slate-800 mb-4">Search Artworks</h3>
        <form onSubmit={handleSearch} className="relative group">
          <input 
            type="text" 
            placeholder="Search wallpapers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border-2 border-pink-50 rounded-2xl px-12 py-4 text-xs font-medium focus:ring-2 focus:ring-pink-100 focus:border-pink-200 outline-none transition-all placeholder:text-slate-300"
          />
          <Search className="w-4 h-4 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-pink-400 transition-colors" />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-pink-500 text-white p-2 rounded-xl shadow-lg shadow-pink-200 hover:scale-105 active:scale-95 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Popular Categories */}
      <div className="glass p-6 rounded-[32px]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-lg text-slate-800">Popular Categories</h3>
          <Link to="/categories" className="text-xs font-bold text-sakura-400 hover:text-sakura-500 flex items-center gap-1 uppercase tracking-widest">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {sidebarCategories.map((cat, i) => (
            <Link key={i} to={`/category/${cat.name.toLowerCase()}`} className="group relative aspect-[4/5] rounded-2xl overflow-hidden">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-[10px] font-medium text-white/70 uppercase tracking-widest">{cat.count}</p>
                <h4 className="text-sm font-bold text-white">{cat.name}</h4>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Premium Banner */}
      <div className="relative p-8 rounded-[32px] overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-400" />
        <div className="absolute right-[-20%] top-[-20%] w-64 h-64 bg-white/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-display font-bold text-xl text-white">Upgrade to Premium</h3>
            <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold text-white uppercase">No Ads</span>
          </div>
          <p className="text-white/80 text-sm mb-6 leading-relaxed">
            Download without limits and enjoy exclusive premium wallpapers.
          </p>
          <Link to="/premium" className="inline-flex px-6 py-3 bg-white text-indigo-600 rounded-2xl font-bold text-sm shadow-xl shadow-black/10 hover:scale-105 transition-transform">
            Explore Plans
          </Link>
        </div>
        
        <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20 pointer-events-none">
          <Crown className="w-full h-full text-white rotate-12" />
        </div>
      </div>

      {/* Top Downloads */}
      {topDownloads.length > 0 && (
        <div className="glass p-6 rounded-[32px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-lg text-slate-800">Top Downloads</h3>
            <Link to="/trending" className="text-xs font-bold text-slate-400 hover:text-sakura-400 flex items-center gap-1 uppercase tracking-widest">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {topDownloads.map((item, i) => (
              <div key={i} className="flex items-center gap-4 group cursor-pointer">
                <div className="relative">
                  <div className="w-6 h-6 absolute -top-2 -left-2 bg-sakura-100 text-sakura-500 rounded-full flex items-center justify-center font-bold text-[10px] z-10 border-2 border-white">
                    {i + 1}
                  </div>
                  <Link to={`/wallpaper/${item.id}`} className="block w-16 h-12 rounded-xl overflow-hidden bg-slate-100">
                    <img src={item.thumbnailUrl || item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </Link>
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/wallpaper/${item.id}`}>
                    <h4 className="font-bold text-sm text-slate-700 truncate hover:text-pink-500 transition-colors">{item.title}</h4>
                  </Link>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{item.resolution || "4K"} • {item.category}</span>
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-rose-400"><Heart className="w-3 h-3" /> {(item.likes || 0).toLocaleString()}</span>
                  </div>
                </div>
                <Link to={`/wallpaper/${item.id}`} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-indigo-500 transition-colors">
                  <Download className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Latest Updates */}
      {latestUpdates.length > 0 && (
        <div className="glass p-6 rounded-[32px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-lg text-slate-800">Latest Updates</h3>
            <button className="text-xs font-bold text-slate-400 hover:text-sakura-400 flex items-center gap-1 uppercase tracking-widest">
              Recent <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {latestUpdates.map((item, i) => (
              <Link 
                key={i} 
                to={`/wallpaper/${item.id}`}
                className="aspect-square rounded-xl overflow-hidden bg-slate-100 hover:ring-2 hover:ring-sakura-200 transition-all cursor-pointer"
              >
                <img 
                  src={item.thumbnailUrl || item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      <AdSense slot="sidebar-bottom" format="vertical" />
    </div>
  );
}
