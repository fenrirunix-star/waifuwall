import { motion } from "motion/react";
import { Hero } from "@/src/components/Hero";
import { Link, useSearchParams } from "react-router-dom";
import { Sidebar } from "@/src/components/Sidebar";
import { AdSense } from "@/src/components/AdSense";
import { WallpaperCard } from "@/src/components/WallpaperCard";
import { SEO } from "@/src/components/SEO";
import { Grid, TrendingUp, Clock, LayoutGrid, Filter, RotateCcw } from "lucide-react";
import { useState } from "react";
import { cn } from "@/src/lib/utils";
import { useCategories } from "@/src/hooks/useCategories";
import { useWallpapers } from "@/src/hooks/useWallpapers";

export function Home() {
  const [filter, setFilter] = useState("All");
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q")?.toLowerCase() || "";
  const { categories } = useCategories();
  const { wallpapers, loading: wallpapersLoading } = useWallpapers(queryParam ? 100 : 24);

  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "WaifuWall",
    "url": "https://waifuwall-psi.vercel.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://waifuwall-psi.vercel.app/?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  if (wallpapersLoading) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
        <p className="mt-6 text-slate-500 font-medium animate-pulse">Summoning masterpieces...</p>
      </div>
    );
  }

  const categoryNames = ["All", ...categories.map(c => c.name)];

  const filteredWallpapers = wallpapers.filter(wallpaper => {
    const wallpaperCategories = wallpaper.categories || (wallpaper.category ? [wallpaper.category] : []);
    const matchesCategory = filter === "All" || wallpaperCategories.includes(filter);
    
    let matchesSearch = true;
    if (queryParam) {
      if (queryParam.startsWith("#")) {
        const tagToSearch = queryParam.substring(1);
        matchesSearch = wallpaper.hashtags?.some((tag: string) => tag.toLowerCase() === tagToSearch) || false;
      } else {
        const titleMatch = wallpaper.title?.toLowerCase().includes(queryParam) || false;
        const categoryMatch = wallpaperCategories.some((cat: string) => cat.toLowerCase().includes(queryParam));
        const hashtagMatch = wallpaper.hashtags?.some((tag: string) => tag.toLowerCase().includes(queryParam)) || false;

        matchesSearch = titleMatch || categoryMatch || hashtagMatch;
      }
    }
    
    return matchesCategory && matchesSearch;
  });

  const displayWallpapers = queryParam ? filteredWallpapers : filteredWallpapers.slice(0, 10);
  const trendingWallpapers = [...wallpapers].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 4);

  return (
    <div className="pt-10">
      <SEO 
        title="Premium AI Anime Wallpapers | 4K Anime Art"
        description="Discover the ultimate collection of AI-generated anime wallpapers. Thousands of 4K backgrounds for desktop and mobile, updated daily."
        schema={homeSchema}
      />
      <Hero />

      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 pb-20">
        <div className="lg:col-span-12">
            <AdSense slot="home-top" className="mb-12" />
        </div>

        {!queryParam && (
          <div className="lg:col-span-12 mb-12">
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-xl font-bold">Trending Now</h2>
              <Link to="/trending" className="text-xs text-pink-500 font-bold uppercase tracking-wider hover:underline">View All Items</Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingWallpapers.map((wallpaper, i) => (
                <WallpaperCard key={wallpaper.id} wallpaper={wallpaper} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-white/30 backdrop-blur-xl border border-white/40 p-8 rounded-[40px] mb-12 shadow-lg shadow-pink-100/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {queryParam ? `Search Results for "${queryParam}"` : "Explore Collection"}
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  {queryParam ? `${filteredWallpapers.length} wallpapers found` : "Selection criteria: Top 10 masterpieces."}
                </p>
              </div>

              {!queryParam && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                  {categoryNames.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilter(cat)}
                      className={cn(
                        "px-6 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                        filter === cat 
                          ? "bg-pink-500 text-white shadow-lg shadow-pink-100" 
                          : "bg-white/60 text-slate-500 hover:bg-pink-50"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {displayWallpapers.length > 0 ? (
              <div className="columns-1 sm:columns-2 gap-8">
                {displayWallpapers.map((wallpaper, i) => (
                  <div key={wallpaper.id} className="break-inside-avoid mb-8">
                    <WallpaperCard wallpaper={wallpaper} index={i} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200">
                <LayoutGrid className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No masterpieces found in this collection yet.</p>
                <button 
                  onClick={() => {
                    setFilter("All");
                    if (queryParam) {
                      setSearchParams({});
                    }
                  }} 
                  className="mt-4 px-8 py-3 bg-white text-slate-600 rounded-full font-bold shadow-sm hover:shadow-md transition-all border border-slate-100"
                >
                  Clear Filters & Refresh
                </button>
              </div>
            )}

            {!queryParam && filteredWallpapers.length > 10 && (
              <div className="mt-12 flex flex-col items-center gap-4">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">More content available</p>
                <Link 
                  to="/trending"
                  className="group px-10 py-5 bg-indigo-500 text-white rounded-[24px] font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-600 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
                >
                  Continue exploring in Trending <TrendingUp className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="lg:col-span-4">
          <Sidebar />
        </div>
      </main>
    </div>
  );
}
