import { motion } from "motion/react";
import { Download, Heart, Eye, Maximize } from "lucide-react";
import { Wallpaper } from "@/src/types";
import { incrementWallpaperStat } from "@/src/lib/firestore-utils";
import { cn } from "@/src/lib/utils";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  index: number;
}

export function WallpaperCard({ wallpaper, index }: WallpaperCardProps) {
  const navigate = useNavigate();
  const { user, toggleFavorite } = useAuth();
  
  const isFavorite = user?.favorites?.includes(wallpaper.id) || false;

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/register', { state: { from: window.location.pathname + window.location.search } });
      return;
    }

    if (wallpaper.isPremium && !user?.isPremium) {
      navigate("/premium");
      return;
    }
    
    // Increment download count
    incrementWallpaperStat(wallpaper.id, wallpaper.origin, 'downloads');
    
    const link = document.createElement("a");
    link.href = wallpaper.imageUrl;
    link.download = `${wallpaper.title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    toggleFavorite(wallpaper.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group relative"
    >
      <Link to={`/wallpaper/${wallpaper.id}`}>
        <div className="relative aspect-video bg-white/50 rounded-2xl border border-white shadow-sm overflow-hidden flex items-center justify-center card-hover group/card">
          <img 
            src={wallpaper.thumbnailUrl} 
            alt={`${wallpaper.title} - ${wallpaper.category} Anime Wallpaper HD`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
            loading="lazy"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-3 right-3 flex gap-2">
            {wallpaper.isPremium ? (
              <span className="bg-purple-500 text-[10px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-lg">Premium</span>
            ) : (
              <span className="bg-pink-500 text-[10px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-lg">{wallpaper.resolution}</span>
            )}
          </div>

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/40 transform scale-0 group-hover/card:scale-100 transition-transform duration-300">
              <Maximize className="w-6 h-6" />
            </div>
          </div>
        </div>
      </Link>
      
      <div className="mt-3 flex justify-between items-center px-1">
        <Link to={`/wallpaper/${wallpaper.id}`} className="hover:text-pink-500 transition-colors">
          <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{wallpaper.title}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{wallpaper.category}</p>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <Eye className="w-3 h-3" />
              <span>{wallpaper.views?.toLocaleString() || 0}</span>
            </div>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <Download className="w-3 h-3 shadow-sm" />
              <span>{wallpaper.downloads?.toLocaleString() || 0}</span>
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleDownload}
            className="text-slate-300 hover:text-pink-500 transition-colors p-2 rounded-full hover:bg-pink-50"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={handleToggleFavorite}
            className={cn(
              "p-2 rounded-full transition-all",
              isFavorite ? "text-rose-500 bg-rose-50" : "text-slate-300 hover:text-pink-500 hover:bg-pink-50"
            )}
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
