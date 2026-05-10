import { motion } from "motion/react";
import { useAuth } from "@/src/context/AuthContext";
import { User, Mail, Shield, Camera, Heart, Settings, LogOut, Crown } from "lucide-react";
import { useState } from "react";
import { useWallpapers } from "@/src/hooks/useWallpapers";
import { WallpaperCard } from "@/src/components/WallpaperCard";
import { cn } from "@/src/lib/utils";

export function Profile() {
  const { user, logout, updateUserProfile } = useAuth();
  const { wallpapers } = useWallpapers();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [selectedPhotoURL, setSelectedPhotoURL] = useState(user?.photoURL || "");

  const AVATARS = [
    "Felix", "Aneka", "Caleb", "Destiny", "Jasper", "Kiki", "Milo"
  ].map(seed => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);

  if (!user) {
    return (
      <div className="pt-40 text-center">
        <h2 className="text-3xl font-bold text-slate-800">Please sign in to view your profile</h2>
      </div>
    );
  }

  const favoriteWallpapers = wallpapers.filter(w => (user.favorites || []).includes(w.id));

  const handleUpdateProfile = async () => {
    try {
      await updateUserProfile({ 
        displayName,
        photoURL: selectedPhotoURL 
      });
      setIsEditing(false);
    } catch (error) {
      alert("Failed to update profile");
    }
  };

  const handleEditClick = () => {
    setDisplayName(user.displayName);
    setSelectedPhotoURL(user.photoURL);
    setIsEditing(true);
  };

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Profile Card */}
        <div className="lg:col-span-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-[40px] p-8 sticky top-32"
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative group mb-6">
                <img 
                  src={isEditing ? selectedPhotoURL : user.photoURL} 
                  alt={user.displayName} 
                  className="w-32 h-32 rounded-full border-4 border-white shadow-xl transition-all"
                />
                {!isEditing && (
                  <button 
                    onClick={handleEditClick}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-pink-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="w-full space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left block">
                      Choose Your Avatar
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {AVATARS.map((url, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedPhotoURL(url)}
                          className={cn(
                            "relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105",
                            selectedPhotoURL === url ? "border-pink-500 scale-105 shadow-md" : "border-transparent opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                          )}
                        >
                          <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left block">
                      Display Name
                    </label>
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white/50 border border-pink-100 outline-none focus:ring-2 focus:ring-pink-200"
                      placeholder="Display Name"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={handleUpdateProfile}
                      className="flex-1 py-3 bg-pink-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-pink-200 hover:bg-pink-600 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-slate-800 mb-1">{user.displayName}</h2>
                  <p className="text-slate-400 text-sm mb-6 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {user.email}
                  </p>
                </>
              )}

              <div className="flex gap-2 mb-8">
                {user.isAdmin && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                )}
                {user.isPremium && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Premium
                  </span>
                )}
              </div>

              <div className="w-full flex grid-cols-2 gap-4 border-t border-slate-100 pt-8">
                 <button 
                  onClick={handleEditClick}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors"
                >
                  <Settings className="w-4 h-4" /> Edit Profile
                </button>
                 <button 
                  onClick={logout}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-50 text-rose-500 font-bold text-xs uppercase tracking-widest hover:bg-rose-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Favorites Gallery */}
        <div className="lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Your Favorites</h3>
                <p className="text-slate-400 text-sm">{favoriteWallpapers.length} wallpapers saved</p>
              </div>
              <div className="p-3 glass rounded-2xl text-pink-500">
                <Heart className="w-6 h-6 fill-current" />
              </div>
            </div>

            {favoriteWallpapers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {favoriteWallpapers.map((wallpaper, i) => (
                  <WallpaperCard key={wallpaper.id} wallpaper={wallpaper} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/30 backdrop-blur-md rounded-[40px] border border-white/40">
                <p className="text-xl font-bold text-slate-400 mb-2">No favorites yet</p>
                <p className="text-slate-400 text-sm">Start exploring and heart your favorite masterpieces!</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
