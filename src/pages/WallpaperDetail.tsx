import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useEffect, useMemo } from "react";
import { ChevronLeft, Download, Heart, Eye, Calendar, User, Maximize2, ShieldAlert, Crown } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { cn } from "@/src/lib/utils";
import { WallpaperCard } from "@/src/components/WallpaperCard";
import { AdSense } from "@/src/components/AdSense";
import { SEO } from "@/src/components/SEO";
import { useWallpapers } from "@/src/hooks/useWallpapers";
import { incrementWallpaperStat } from "@/src/lib/firestore-utils";

export function WallpaperDetail() {
  const { wallpaperId } = useParams();
  const navigate = useNavigate();
  const { user, toggleFavorite } = useAuth();
  const { wallpapers } = useWallpapers();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [wallpaperId]);

  const wallpaper = useMemo(() => 
    wallpapers.find((w) => w.id === wallpaperId),
  [wallpapers, wallpaperId]);

  const wallpaperSchema = useMemo(() => {
    if (!wallpaper) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ImageObject",
      "contentUrl": wallpaper.imageUrl,
      "name": wallpaper.title,
      "description": `Download ${wallpaper.title} ${wallpaper.resolution} wallpaper. Premium ${wallpaper.category} anime background.`,
      "thumbnail": wallpaper.imageUrl,
      "fileFormat": "image/jpeg",
      "width": wallpaper.resolution.split('x')[0],
      "height": wallpaper.resolution.split('x')[1] || "",
      "author": {
        "@type": "Person",
        "name": `Featured Artist #${wallpaper.authorId}`
      }
    };
  }, [wallpaper]);

  // Increment view count
  useEffect(() => {
    if (!wallpaper || !wallpaperId) return;
    incrementWallpaperStat(wallpaperId, wallpaper.origin, 'views');
  }, [wallpaper?.id, wallpaper?.origin]); // Trigger when wallpaper is loaded or changes

  const wallpaperYear = useMemo(() => {
    if (!wallpaper?.createdAt) return new Date().getFullYear();
    
    // Handle Firestore Timestamp
    if (typeof wallpaper.createdAt === 'object' && 'toDate' in wallpaper.createdAt) {
      return (wallpaper.createdAt as any).toDate().getFullYear();
    }
    
    // Handle String/Date
    const date = new Date(wallpaper.createdAt);
    return isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear();
  }, [wallpaper?.createdAt]);

  if (!wallpaper) {
    return (
      <div className="pt-40 text-center text-4xl font-display font-bold">
        Wallpaper not found
      </div>
    );
  }

  const isFavorite = user?.favorites?.includes(wallpaper.id) || false;

  const similarWallpapers = wallpapers
    .filter((w) => w.category === wallpaper.category && w.id !== wallpaper.id)
    .slice(0, 4);

  // If not enough similar by category, fallback to random
  if (similarWallpapers.length < 4) {
    const fallback = wallpapers.filter(w => w.id !== wallpaper.id && !similarWallpapers.find(sw => sw.id === w.id)).slice(0, 4 - similarWallpapers.length);
    similarWallpapers.push(...fallback);
  }

  const handleDownload = () => {
    if (!user) {
      navigate('/register', { state: { from: window.location.pathname + window.location.search } });
      return;
    }

    if (wallpaper.isPremium && !user?.isPremium) {
      navigate("/premium");
      return;
    }
    
    // Increment download count
    if (wallpaperId) {
      incrementWallpaperStat(wallpaperId, wallpaper.origin, 'downloads');
    }
    
    // Professional download logic: link to the high res image
    const link = document.createElement("a");
    link.href = wallpaper.imageUrl;
    link.download = `${wallpaper.title.toLowerCase().replace(/\s+/g, '-')}-${wallpaper.resolution}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen max-w-7xl mx-auto">
      <SEO 
        title={`${wallpaper.title} - ${wallpaper.category} Anime Wallpaper`}
        description={`Download ${wallpaper.title} at ${wallpaper.resolution} resolution. High-quality AI-generated ${wallpaper.category} anime background for your device.`}
        keywords={`${wallpaper.category}, anime wallpaper, ${wallpaper.hashtags?.join(', ')}, 4K background`}
        image={wallpaper.imageUrl}
        type="article"
        schema={wallpaperSchema || {}}
      />
      <motion.button 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-8 text-pink-500 font-bold uppercase tracking-widest text-sm hover:translate-x-[-4px] transition-transform"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Large Preview */}
        <motion.div 
          key={wallpaper.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative glass rounded-[48px] overflow-hidden shadow-2xl min-h-[500px] lg:h-[700px] bg-white/20"
        >
          <img 
            src={wallpaper.imageUrl} 
            alt={wallpaper.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          {wallpaper.isPremium && (
            <div className="absolute top-8 right-8 bg-purple-500 text-white px-4 py-2 rounded-full font-bold shadow-xl flex items-center gap-2 uppercase tracking-widest text-sm">
              <Crown className="w-4 h-4" /> Premium
            </div>
          )}
        </motion.div>

        {/* Info & Actions */}
        <div className="flex flex-col justify-center space-y-8">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <span className="px-3 py-1 bg-pink-100 text-pink-500 rounded-full text-xs font-bold uppercase tracking-widest">
                {wallpaper.category}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                <Maximize2 className="w-3 h-3" /> {wallpaper.resolution}
              </span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl font-bold text-slate-800 leading-tight mb-4"
            >
              {wallpaper.title}
            </motion.h1>

            {wallpaper.hashtags && wallpaper.hashtags.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-wrap gap-2 mb-6"
              >
                {wallpaper.hashtags.map((tag: string) => (
                  <button
                    key={tag}
                    onClick={() => navigate(`/?q=${encodeURIComponent('#' + tag)}`)}
                    className="text-sm font-bold text-indigo-500 hover:text-indigo-600 hover:underline"
                  >
                    #{tag}
                  </button>
                ))}
              </motion.div>
            )}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg"
            >
              Experience the breathtaking detail of this {wallpaper.resolution} masterpiece. Add it to your collection today.
            </motion.p>
          </div>

          <div className="flex items-center gap-8 py-6 border-y border-pink-50">
            <div className="flex flex-col gap-1 text-center">
              <Eye className="w-6 h-6 text-pink-300 mx-auto" />
              <span className="text-xl font-bold text-slate-700">{wallpaper.views.toLocaleString()}</span>
              <span className="text-xs uppercase tracking-widest font-bold text-slate-400">Views</span>
            </div>
            <div className="flex flex-col gap-1 text-center">
              <Download className="w-6 h-6 text-pink-300 mx-auto" />
              <span className="text-xl font-bold text-slate-700">{wallpaper.downloads.toLocaleString()}</span>
              <span className="text-xs uppercase tracking-widest font-bold text-slate-400">Downloads</span>
            </div>
            <div className="flex flex-col gap-1 text-center">
              <Calendar className="w-6 h-6 text-pink-300 mx-auto" />
              <span className="text-xl font-bold text-slate-700">{wallpaperYear}</span>
              <span className="text-xs uppercase tracking-widest font-bold text-slate-400">Year</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center font-bold text-pink-500 text-lg uppercase">
              {wallpaper.authorId.substring(0, 2)}
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-slate-400">Created by</p>
              <p className="text-slate-700 font-bold">Featured Artist #{wallpaper.authorId}</p>
            </div>
          </div>

          <div className="flex grid-cols-2 gap-4">
            <button 
              onClick={handleDownload}
              className={cn(
                "flex-1 py-5 rounded-[24px] font-bold shadow-xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all text-lg group",
                wallpaper.isPremium && !user?.isPremium 
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-purple-200" 
                  : "bg-pink-500 text-white shadow-pink-100"
              )}
            >
              {wallpaper.isPremium && !user?.isPremium ? (
                <>
                  <Crown className="w-6 h-6 animate-pulse" /> Unlock with Premium
                </>
              ) : (
                <>
                  <Download className="w-6 h-6 transition-transform group-hover:translate-y-1" /> Download Now
                </>
              )}
            </button>
            <button 
              onClick={() => {
                if (!user) {
                  navigate("/login");
                  return;
                }
                toggleFavorite(wallpaper.id);
              }}
              className={cn(
                "w-20 h-20 rounded-[24px] border flex items-center justify-center transition-all",
                isFavorite 
                  ? "bg-rose-500 border-rose-500 text-white shadow-xl shadow-rose-100 scale-110" 
                  : "bg-white border-pink-50 text-slate-400 hover:border-pink-200"
              )}
            >
              <Heart className={cn("w-8 h-8", isFavorite && "fill-current")} />
            </button>
          </div>

          {wallpaper.isPremium && !user?.isPremium && (
            <div className="p-6 bg-purple-50 border border-purple-100 rounded-3xl flex items-start gap-4">
              <ShieldAlert className="w-6 h-6 text-purple-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-purple-900">Premium Locked</p>
                <p className="text-sm text-purple-600 mb-3">This masterpiece is reserved for Premium Artists. Upgrade to unlock all resolutions.</p>
                <button 
                  onClick={() => navigate("/premium")}
                  className="text-sm font-bold text-purple-700 underline underline-offset-4 hover:text-purple-900"
                >
                  View Premium Plans
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {similarWallpapers.length > 0 && (
        <div className="mt-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-display font-bold text-slate-800 mb-8"
          >
            Similar Wallpapers
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarWallpapers.map((w, index) => (
              <WallpaperCard key={w.id} wallpaper={w} index={index} />
            ))}
          </div>
        </div>
      )}

      <AdSense slot="detail-bottom" className="mt-20" />
    </div>
  );
}

