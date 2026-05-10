import { 
  Grid, 
  ChevronRight, 
  Layers, 
  LayoutGrid, 
  Image as ImageIcon, 
  Sparkles, 
  Car, 
  Leaf, 
  Gamepad2, 
  Wand2, 
  Mountain, 
  Building2, 
  User, 
  Moon,
  Palette,
  Box,
  Cpu,
  Music,
  Film,
  Utensils,
  Dumbbell,
  Laptop,
  Plane,
  Heart,
  Globe,
  Camera,
  Coffee,
  Cloud,
  Sun,
  Rocket,
  Bike,
  Waves,
  TrendingUp,
  Search
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { useCategories } from "@/src/hooks/useCategories";
import { useWallpapers } from "@/src/hooks/useWallpapers";
import { AdSense } from "@/src/components/AdSense";
import { SEO } from "@/src/components/SEO";
import { motion } from "motion/react";

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  
  if (n.includes('car') || n.includes('voiture') || n.includes('vehicle') || n.includes('moto')) return Car;
  if (n.includes('3d') || n.includes('object') || n.includes('objet')) return Box;
  if (n.includes('nature') || n.includes('leaf') || n.includes('flower') || n.includes('plant') || n.includes('forêt') || n.includes('forest')) return Leaf;
  if (n.includes('game') || n.includes('gaming') || n.includes('jouer') || n.includes('console')) return Gamepad2;
  if (n.includes('magic') || n.includes('fantasy') || n.includes('fantastique')) return Wand2;
  if (n.includes('mountain') || n.includes('montagne') || n.includes('landscape') || n.includes('paysage')) return Mountain;
  if (n.includes('city') || n.includes('urban') || n.includes('ville') || n.includes('building') || n.includes('architecture')) return Building2;
  if (n.includes('person') || n.includes('people') || n.includes('character') || n.includes('anime') || n.includes('girl') || n.includes('boy') || n.includes('femme') || n.includes('homme')) return User;
  if (n.includes('night') || n.includes('dark') || n.includes('moon') || n.includes('nuit') || n.includes('lune')) return Moon;
  if (n.includes('abstract') || n.includes('art') || n.includes('pattern') || n.includes('couleur') || n.includes('color')) return Palette;
  if (n.includes('tech') || n.includes('science') || n.includes('future') || n.includes('cyber') || n.includes('digital') || n.includes('hitech')) return Cpu;
  if (n.includes('music') || n.includes('song') || n.includes('musique') || n.includes('son')) return Music;
  if (n.includes('movie') || n.includes('film') || n.includes('cinema')) return Film;
  if (n.includes('food') || n.includes('drink') || n.includes('nourriture') || n.includes('cuisine')) return Utensils;
  if (n.includes('sport') || n.includes('fitness') || n.includes('gym')) return Dumbbell;
  if (n.includes('computer') || n.includes('laptop') || n.includes('ordinateur') || n.includes('code')) return Laptop;
  if (n.includes('travel') || n.includes('plane') || n.includes('voyage') || n.includes('avion')) return Plane;
  if (n.includes('love') || n.includes('heart') || n.includes('amour') || n.includes('coeur')) return Heart;
  if (n.includes('world') || n.includes('globe') || n.includes('terre') || n.includes('earth')) return Globe;
  if (n.includes('photo') || n.includes('camera') || n.includes('appareil')) return Camera;
  if (n.includes('coffee') || n.includes('cafe') || n.includes('break')) return Coffee;
  if (n.includes('cloud') || n.includes('nuage') || n.includes('weather')) return Cloud;
  if (n.includes('sun') || n.includes('soleil') || n.includes('summer') || n.includes('été')) return Sun;
  if (n.includes('space') || n.includes('rocket') || n.includes('espace') || n.includes('star')) return Rocket;
  if (n.includes('bike') || n.includes('bicycle') || n.includes('vélo')) return Bike;
  if (n.includes('water') || n.includes('ocean') || n.includes('sea') || n.includes('mer') || n.includes('eau')) return Waves;
  
  return Sparkles; 
};

const defaultImages = [
  "https://images.unsplash.com/photo-1541562232579-2af5f51957c5?w=500&fit=crop",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&fit=crop",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500&fit=crop",
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&fit=crop",
  "https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?w=500&fit=crop",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&fit=crop",
  "https://images.unsplash.com/photo-1605806616949-1e87b487fc2f?w=500&fit=crop",
  "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?w=500&fit=crop",
  "https://images.unsplash.com/photo-1492052722242-2554d0e99e3a?w=500&fit=crop",
];

export function Categories() {
  const { categories } = useCategories();
  const { wallpapers, loading } = useWallpapers();
  const [searchTerm, setSearchTerm] = useState("");

  const enrichedCategories = useMemo(() => {
    if (!categories.length) return [];

    const filteredCategories = categories.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const counts = categories.map(cat => {
      const count = wallpapers.filter(w => (w.categories || (w.category ? [w.category] : [])).includes(cat.name)).length;
      return { id: cat.id, count };
    });

    // Find the max count to determine popularity threshold
    const maxCount = Math.max(...counts.map(c => c.count), 0);
    const popularThreshold = Math.max(5, maxCount * 0.7); // At least 5, or 70% of max

    return filteredCategories.map((cat, i) => {
      const count = wallpapers.filter(w => (w.categories || (w.category ? [w.category] : [])).includes(cat.name)).length;
      const IconComponent = getCategoryIcon(cat.name);
      return {
        ...cat,
        Icon: IconComponent,
        image: cat.imageUrl || defaultImages[i % defaultImages.length],
        count: count,
        isPopular: count >= popularThreshold && count > 0
      };
    }).sort((a, b) => b.count - a.count); // Optional: sort by popularity
  }, [categories, wallpapers, searchTerm]);

  const popularTags = useMemo(() => {
    const tagCounts: { [key: string]: number } = {};
    wallpapers.forEach(w => {
      if (w.hashtags && Array.isArray(w.hashtags)) {
        w.hashtags.forEach(tag => {
          const t = tag.trim();
          if (t) {
            tagCounts[t] = (tagCounts[t] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([tag]) => tag);
  }, [wallpapers]);

  if (loading) {
    return (
      <div className="pt-40 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="mt-6 text-slate-500 font-medium">Sorting archives...</p>
      </div>
    );
  }

  const displayedTags = popularTags.length > 0 ? popularTags : ["Naruto", "Cyberpunk 2077", "Neon Tokyo", "Mountain View", "Supercars", "Minimalist Black", "Fantasy Forest"];

  const hasCategories = enrichedCategories.length > 0;

  return (
    <div className="pt-40 pb-20 px-6">
      <SEO 
        title="Wallpaper Categories | Anime AI Collections"
        description="Browse thousands of AI-generated anime wallpapers by category. From Cyberpunk to Nature, find the perfect 4K background for your style."
        keywords="anime categories, wallpaper collection, ai background library"
      />
      <div className="max-w-7xl mx-auto">
        <header className="mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-4"
          >
            <div className="h-px w-10 bg-indigo-500" />
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Global Library</span>
          </motion.div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="font-display text-5xl font-bold text-slate-800 mb-4">Browse by Category</h1>
              <p className="text-slate-400 text-lg max-w-xl">
                Explore our vast library organized into beautifully curated collections for every mood.
              </p>
            </div>

            <div className="relative group w-full md:w-80">
              <input 
                type="text" 
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border-2 border-indigo-50 rounded-2xl px-12 py-4 text-sm font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-200 outline-none transition-all placeholder:text-slate-300 shadow-sm group-hover:shadow-md"
              />
              <Search className="w-5 h-5 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-400 transition-colors" />
            </div>
          </div>
        </header>

        {hasCategories ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {enrichedCategories.map((cat, i) => (
              <Link 
                key={cat.id} 
                to={`/category/${cat.name.toLowerCase()}`}
                className="block"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative h-96 rounded-[48px] overflow-hidden shadow-2xl transition-all hover:shadow-indigo-500/20"
                >
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-colors duration-500 group-hover:from-indigo-900/90" />
                  
                  <div className="absolute inset-0 p-10 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center text-white bg-white/10 backdrop-blur-md border border-white/20">
                        <cat.Icon className="w-10 h-10" />
                      </div>
                      <span className="px-5 py-2 glass rounded-2xl text-xs font-bold text-white uppercase tracking-widest border border-white/20 backdrop-blur-md">
                        {cat.count} Wallpapers
                      </span>
                    </div>

                    <div>
                      <h3 className="text-4xl font-display font-bold text-white mb-2">{cat.name}</h3>
                      <div className="flex items-center gap-2 text-indigo-300 font-bold group-hover:text-white transition-colors">
                        Discover Collection <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center glass rounded-[40px] border-dashed border-2 border-slate-200">
            <Layers className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Categories Found</h3>
            <p className="text-slate-400">Our curators are still organizing the collection. Check back soon!</p>
          </div>
        )}

        {/* Featured Tag Cloud */}
        <section className="mt-32">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-display font-bold text-slate-800">Popular Tags</h2>
            <button className="text-sm font-bold text-slate-400 flex items-center gap-2">Discover Tags <LayoutGrid className="w-4 h-4" /></button>
          </div>
          <div className="flex flex-wrap gap-4">
            {displayedTags.map((tag, i) => (
              <Link 
                key={tag + i}
                to={`/?q=${encodeURIComponent('#' + tag)}`}
                className="px-6 py-3 glass rounded-2xl text-sm font-bold text-slate-600 hover:bg-indigo-100 hover:text-indigo-500 transition-all border border-slate-200/50"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </section>

        <AdSense slot="categories-bottom" className="mt-20" />
      </div>
    </div>
  );
}
