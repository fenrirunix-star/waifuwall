import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Github, Twitter, Instagram, MessageSquare, Heart, Sparkles, ShieldCheck, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { db } from "@/src/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");
    try {
      if (!db) throw new Error("Database not initialized");

      await addDoc(collection(db, "newsletter"), {
        email: email.toLowerCase().trim(),
        subscribedAt: serverTimestamp(),
        active: true
      });

      // Trigger Welcome Email
      fetch('/api/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), displayName: 'Subscriber' }),
      }).catch(e => console.error("Newsletter welcome email failed", e));

      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err: any) {
      console.error("Newsletter error:", err);
      setStatus("error");
      setErrorMessage("Service currently unavailable. Please try again later.");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <footer className="relative bg-white border-t border-slate-100 pt-20 pb-10 overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-pink-100 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-24 w-64 h-64 bg-purple-100 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group transition-all hover:scale-105 active:scale-95">
              <Logo size="md" />
            </Link>
            <p className="text-slate-400 leading-relaxed">
              Elevate your digital space with high-quality, AI-curated masterpieces. Join our community of collectors and artists.
            </p>
            <div className="flex items-center gap-4">
              <SocialLink icon={Twitter} url="https://twitter.com/yourhandle" />
              <SocialLink icon={Instagram} url="https://instagram.com/yourhandle" />
              <SocialLink icon={MessageSquare} url="https://discord.com/invite/yourcode" />
              <SocialLink icon={Github} url="https://github.com/yourhandle" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-slate-800 mb-6 uppercase tracking-widest text-xs">Explore</h4>
            <ul className="space-y-4">
              <FooterLink to="/" label="Home" />
              <FooterLink to="/categories" label="Categories" />
              <FooterLink to="/trending" label="Trending" />
              <FooterLink to="/about" label="About Us" />
              <FooterLink to="/premium" label="Premium Plans" />
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-slate-800 mb-6 uppercase tracking-widest text-xs">Support</h4>
            <ul className="space-y-4">
              <FooterLink to="/help" label="Help Center" />
              <FooterLink to="/privacy" label="Privacy Policy" />
              <FooterLink to="/terms" label="Terms of Service" />
              <FooterLink to="/cookies" label="Cookie Policy" />
              <FooterLink to="/contact" label="Contact Us" />
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-slate-800 mb-6 uppercase tracking-widest text-xs">Newsletter</h4>
            <p className="text-slate-400 text-sm mb-6">Get the latest masterpieces delivered to your inbox weekly.</p>
            <form onSubmit={handleSubscribe} className="relative group">
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={status === "loading" || status === "success"}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-pink-100 transition-all text-sm group-hover:border-pink-200 disabled:opacity-50"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-pink-500 transition-colors" />
              </div>
              
              <button 
                type="submit"
                disabled={status === "loading" || status === "success"}
                className={cn(
                  "mt-4 w-full py-4 rounded-2xl font-bold shadow-lg transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2",
                  status === "success" 
                    ? "bg-emerald-500 text-white shadow-emerald-100" 
                    : status === "error"
                    ? "bg-rose-500 text-white shadow-rose-100"
                    : "bg-pink-500 text-white shadow-pink-100 hover:scale-[1.02] active:scale-95"
                )}
              >
                {status === "loading" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : status === "success" ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> Subscribed
                  </>
                ) : status === "error" ? (
                  "Try Again"
                ) : (
                  "Subscribe"
                )}
              </button>

              <AnimatePresence>
                {status === "error" && (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-rose-500 text-[10px] font-bold mt-2 text-center uppercase tracking-widest"
                  >
                    {errorMessage}
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-sm flex items-center gap-1">
            © 2026 WaifuWall. Crafted with <Heart className="w-3 h-3 text-rose-500 fill-current" /> by Mozel Team.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Secure & encrypted collection</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

function SocialLink({ icon: Icon, url }: { icon: any, url: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-pink-50 hover:text-pink-500 transition-all border border-slate-100 hover:border-pink-200">
      <Icon className="w-5 h-5" />
    </a>
  );
}

function FooterLink({ to, label }: { to: string, label: string }) {
  return (
    <li>
      <Link to={to} className="text-slate-400 hover:text-pink-500 transition-colors font-medium flex items-center gap-2 group">
        <span className="w-1.5 h-1.5 bg-pink-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        {label}
      </Link>
    </li>
  );
}

