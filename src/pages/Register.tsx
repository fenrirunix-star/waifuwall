import { motion } from "motion/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Github, Chrome, Sparkles, ChevronLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";
  const { register, signInWithGoogle, signInWithGithub } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      await register(email, password, name);
      // Trigger Welcome Email
      fetch('/api/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), displayName: name }),
      }).catch(e => console.error("Welcome email failed", e));
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Google login failed");
    }
  };

  const handleGithubLogin = async () => {
    setError("");
    try {
      await signInWithGithub();
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Github login failed");
    }
  };

  return (
    <div className="pt-40 pb-20 px-6 min-h-screen flex items-center justify-center relative">
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-32 left-8 px-6 py-3 glass rounded-2xl font-bold text-slate-600 flex items-center gap-2 hover:bg-pink-50 hover:text-pink-500 transition-all active:scale-95 z-50 group"
      >
        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-10 rounded-[40px] w-full max-w-md relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-sakura-200/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="text-pink-500 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Create Account</h1>
          <p className="text-slate-400 mt-2">Join our community of artists and collectors.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-500 text-sm font-bold rounded-2xl text-center">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-300" />
              <input 
                type="text" 
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-12 pr-6 py-4 bg-white/60 border border-pink-50 rounded-2xl focus:ring-2 focus:ring-pink-100 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-300" />
              <input 
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-6 py-4 bg-white/60 border border-pink-50 rounded-2xl focus:ring-2 focus:ring-pink-100 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-300" />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-6 py-4 bg-white/60 border border-pink-50 rounded-2xl focus:ring-2 focus:ring-pink-100 transition-all outline-none"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-pink-500 text-white rounded-2xl font-bold shadow-xl shadow-pink-100 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {isSubmitting ? "Creating Account..." : "Join the Gallery"}
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-pink-50"></div></div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold"><span className="bg-transparent px-4 text-slate-400">Or sign up with</span></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-white/60 border border-pink-50 rounded-2xl font-bold text-slate-600 hover:bg-pink-50 transition-all"
          >
            <Chrome className="w-5 h-5" /> Google
          </button>
          <button 
            onClick={handleGithubLogin}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-white/60 border border-pink-50 rounded-2xl font-bold text-slate-600 hover:bg-pink-50 transition-all"
          >
            <Github className="w-5 h-5" /> GitHub
          </button>
        </div>

        <p className="mt-10 text-center text-sm font-medium text-slate-400">
          Already have an account? <Link to="/login" state={{ from }} className="text-pink-500 font-bold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
