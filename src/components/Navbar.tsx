import { motion } from "motion/react";
import { Logo } from "./Logo";
import { Search, Menu, LogIn, UserPlus, Heart, TrendingUp, Grid, Crown, Sparkles, LogOut, LayoutDashboard } from "lucide-react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

  useEffect(() => {
    // If the URL changed from outside (e.g. going back), sync searchTerm
    setSearchTerm(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      // Need to avoid infinite loop when searchParams update triggers searchTerm
      if (searchTerm !== (searchParams.get("q") || "")) {
        if (searchTerm.trim() !== "") {
          navigate(`/?q=${encodeURIComponent(searchTerm.trim())}`);
        } else {
          if (location.pathname === "/") {
            navigate("/");
          }
        }
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, navigate, location.pathname, searchParams]);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl z-50"
    >
      <nav className="glass rounded-full px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95">
          <Logo size="md" />
        </Link>

        {/* Menu Items */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium opacity-70">
          <Link to="/" className="hover:text-pink-500 transition-colors">Home</Link>
          <Link to="/categories" className="hover:text-pink-500 transition-colors">Categories</Link>
          <Link to="/trending" className="hover:text-pink-500 transition-colors">Trending</Link>
          <Link to="/premium" className="hover:text-pink-500 transition-colors font-bold text-pink-600">Premium</Link>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center bg-white/60 border border-pink-100 rounded-full px-6 py-2 w-64 group focus-within:w-80 transition-all duration-300 backdrop-blur-md">
          <Search className="w-4 h-4 text-pink-300 mr-2" />
          <input 
            type="text" 
            placeholder="Search wallpapers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-xs w-full placeholder:text-pink-200 outline-none"
          />
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-4">
              {user.isAdmin && (
                <Link to="/admin" className="p-2 text-pink-500 hover:bg-pink-50 rounded-full transition-all group" title="Admin Panel">
                  <LayoutDashboard className="w-5 h-5 group-hover:scale-110" />
                </Link>
              )}
              <Link to="/profile" className="flex items-center gap-2 bg-pink-50/50 pr-4 pl-1 py-1 rounded-full border border-pink-100 hover:bg-pink-100/50 transition-colors">
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt={user.displayName || "User"} className="w-8 h-8 rounded-full border-2 border-white" />
                <span className="text-xs font-bold text-slate-700 hidden sm:block">{user.displayName || user.email}</span>
              </Link>
              <button 
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="px-6 py-2 text-xs font-semibold rounded-full hover:bg-pink-50 transition-colors hidden sm:block">
                Login
              </Link>
              <Link to="/register" className="px-6 py-2 text-xs font-semibold bg-pink-500 text-white rounded-full shadow-lg shadow-pink-200 transition-all hover:scale-105 active:scale-95">
                Join Free
              </Link>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  );
}
