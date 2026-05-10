import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { WallpaperCard } from "@/src/components/WallpaperCard";
import { SEO } from "@/src/components/SEO";
import { ChevronLeft, Grid } from "lucide-react";
import { useWallpapers } from "@/src/hooks/useWallpapers";

export function CategoryPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { wallpapers } = useWallpapers();

  const filteredWallpapers = wallpapers.filter(
    (w) => (w.categories || (w.category ? [w.category] : [])).some(cat => cat.toLowerCase() === categoryId?.toLowerCase())
  );

  return (
    <div className="pt-40 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <SEO 
        title={`${categoryId?.charAt(0).toUpperCase()}${categoryId?.slice(1)} Wallpapers - High Quality Anime Art`}
        description={`Explore our exclusive collection of ${categoryId} anime wallpapers. Premium 4K backgrounds for mobile and desktop, AI-generated for perfection.`}
        keywords={`${categoryId}, anime wallpaper, 4k background, waifuwall`}
      />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-4 text-pink-500 font-bold uppercase tracking-widest text-sm hover:translate-x-[-4px] transition-transform"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Categories
          </button>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="w-10 h-10 bg-pink-500 text-white rounded-xl flex items-center justify-center">
              <Grid className="w-6 h-6" />
            </div>
            <h1 className="text-5xl font-bold text-slate-800 capitalize">
              {categoryId}
            </h1>
          </motion.div>
          <p className="text-slate-400 mt-2 text-lg">
            Discover our curated collection of {categoryId} themed wallpapers.
          </p>
        </div>
      </div>

      {filteredWallpapers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWallpapers.map((wallpaper, i) => (
            <WallpaperCard key={wallpaper.id} wallpaper={wallpaper} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/30 backdrop-blur-md rounded-[40px] border border-white/40">
          <p className="text-2xl font-bold text-slate-400">No wallpapers found in this category yet.</p>
          <p className="text-slate-400 mt-2">Check back later or explore other sections!</p>
        </div>
      )}
    </div>
  );
}
