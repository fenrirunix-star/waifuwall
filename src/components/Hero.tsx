import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Crown, Image as ImageIcon, Users, LayoutGrid, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const HERO_IMAGES = [
  {
    url: "https://i.pinimg.com/736x/64/30/a4/6430a439992100f9200f13307ba46eb6.jpg",
    title: "Sakura Spirit",
    artist: "@artist_zero"
  },
  {
    url: "https://i.pinimg.com/736x/e6/a4/ef/e6a4ef0cc85fe5c95808bfff0aed88c4.jpg",
    title: "Neon Dreams",
    artist: "@synth_wave"
  },
  {
    url: "https://i.pinimg.com/736x/97/0f/3b/970f3bc43f32d8576c0e5bb73d6f449d.jpg",
    title: "Techno City",
    artist: "@cyber_punk"
  },
  {
    url: "https://i.pinimg.com/736x/f4/a3/ce/f4a3ce94e1ea23a07cfe46df8c407df6.jpg",
    title: "Ethereal Night",
    artist: "@lunar_art"
  }
];

export function Hero() {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 25000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-10"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 mb-6"
          >
            <div className="h-px w-8 bg-sakura-200" />
            <span className="text-sakura-500 font-bold tracking-widest text-sm uppercase">Curated Collections</span>
          </motion.div>
          
          <h1 className="text-7xl font-light leading-none tracking-tight mb-6">
            Premium <span className="font-bold block text-pink-500">Anime Wallpapers</span> 4K High Definition
          </h1>
          
          <p className="text-lg opacity-60 max-w-lg mb-10 leading-relaxed">
            Elevate your desktop with high-end futuristic aesthetics. Discover the world's most curated gallery of pastel anime art.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link to="/trending" className="px-10 py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-xl shadow-purple-200 flex items-center gap-2 group transition-all hover:scale-105 active:scale-95">
              Explore Now <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" />
            </Link>
            <Link to="/premium" className="px-10 py-4 bg-white/60 backdrop-blur-md border border-pink-200 text-pink-600 rounded-2xl font-bold transition-all hover:bg-white/80">
              Get Premium
            </Link>
          </div>

          <div className="flex gap-12 py-10 mt-10 border-t border-pink-100/30">
            {[
              { label: "Wallpapers", value: "12,482" },
              { label: "Daily Users", value: "840K+" },
              { label: "Categories", value: "42" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex flex-col"
              >
                <span className="text-2xl font-bold text-slate-800 tracking-tight">{stat.value}</span>
                <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold mt-1">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Art - Slideshow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl shadow-sakura-200/50 z-10 group">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIdx}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <img 
                  src={HERO_IMAGES[currentIdx].url} 
                  alt={HERO_IMAGES[currentIdx].title} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute bottom-6 left-6 right-6 translate-y-12 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="glass px-6 py-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-bold">{HERO_IMAGES[currentIdx].title}</h4>
                      <p className="text-white/70 text-sm">by {HERO_IMAGES[currentIdx].artist}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-sakura-400 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">4K</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Pagination Dots */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {HERO_IMAGES.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    i === currentIdx ? "w-8 bg-white" : "w-1.5 bg-white/30"
                  )}
                />
              ))}
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-sakura-200/30 rounded-full blur-3xl -z-10 animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl -z-10 animate-pulse" />
        </motion.div>
      </div>
    </section>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
