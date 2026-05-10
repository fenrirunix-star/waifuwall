import { motion } from "motion/react";
import { WallpaperCard } from "@/src/components/WallpaperCard";
import { SEO } from "@/src/components/SEO";
import { TrendingUp, Filter, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { useWallpapers } from "@/src/hooks/useWallpapers";

export function Trending() {
  const [period, setPeriod] = useState("All Time");
  const [searchTerm, setSearchTerm] = useState("");
  const { wallpapers, loading } = useWallpapers();

  const filteredWallpapers = useMemo(() => {
    let list = [...wallpapers];
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      list = list.filter(w => 
        w.title?.toLowerCase().includes(search) ||
        (w.categories || (w.category ? [w.category] : [])).some(cat => cat.toLowerCase().includes(search)) ||
        (w.hashtags?.some((t: string) => t.toLowerCase().includes(search)) || false)
      );
    }
    
    return list.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }, [wallpapers, searchTerm]);

  if (loading) {
    return (
      <div className="pt-40 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
        <p className="mt-6 text-slate-500 font-medium">Fetching most wanted...</p>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-20 px-6 min-h-screen max-w-7xl mx-auto">
      <SEO 
        title="Trending Anime Wallpapers | Popular AI Art"
        description="Explore the most popular anime wallpapers on WaifuWall. Highly rated 4K AI-generated backgrounds by our community."
        keywords="trending anime, popular wallpapers, best anime art, top waifu wallpapers"
      />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-2"
          >
            <TrendingUp className="text-pink-500 w-6 h-6" />
            <span className="text-pink-500 font-bold uppercase tracking-widest text-sm">Most Popular</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-slate-800"
          >
            Trending Now
          </motion.h1>
          <p className="text-slate-400 mt-2 text-lg">The most liked and viewed masterpieces by the community in {period}.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative group w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-pink-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search trendings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-pink-50 rounded-2xl font-bold text-slate-600 outline-none shadow-sm focus:ring-2 focus:ring-pink-100 transition-all text-sm"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-8 py-3 bg-white border border-pink-50 rounded-2xl font-bold text-slate-600 outline-none appearance-none cursor-pointer shadow-sm hover:border-pink-200 transition-all focus:ring-2 focus:ring-pink-100 text-sm"
            >
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>All Time</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-300 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8">
        {filteredWallpapers.map((wallpaper, i) => (
          <div key={wallpaper.id} className="break-inside-avoid mb-8">
            <WallpaperCard wallpaper={wallpaper} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}
