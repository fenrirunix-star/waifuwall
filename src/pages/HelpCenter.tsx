import { motion } from "motion/react";
import { HelpCircle, Search, Zap, Shield, User, CreditCard, ChevronRight } from "lucide-react";
import { SEO } from "@/src/components/SEO";

export function HelpCenter() {
  const faqs = [
    {
      icon: Zap,
      title: "Getting Started",
      description: "Learn how to download and apply your first high-res wallpaper.",
      color: "bg-indigo-50 text-indigo-500",
    },
    {
      icon: Shield,
      title: "Privacy & Safety",
      description: "How we protect your data and ensure a secure browsing experience.",
      color: "bg-emerald-50 text-emerald-500",
    },
    {
      icon: User,
      title: "Account Settings",
      description: "Manage your profile, favorites, and account preferences.",
      color: "bg-pink-50 text-pink-500",
    },
    {
      icon: CreditCard,
      title: "Premium Billing",
      description: "Everything you need to know about your subscription and payments.",
      color: "bg-amber-50 text-amber-500",
    },
  ];

  return (
    <div className="pt-32 pb-20 px-6">
      <SEO 
        title="WaifuWall Help & FAQ: Support for AI Artwork & Premium Accounts" 
        description="Have questions about WaifuWall? Our FAQ covers AI artwork downloads, premium subscription plans, account security, and technical support. Get the help you need."
        keywords="waifuwall support, ai art faq, premium plan help, technical assistance, wallpaper download support, account help"
      />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
          >
            <HelpCircle className="w-4 h-4" /> Support Center
          </motion.div>
          <h1 className="text-5xl font-bold text-slate-800 mb-6 font-display tracking-tight">How can we help you?</h1>
          <div className="relative max-w-xl mx-auto">
            <input 
              type="text" 
              placeholder="Search for articles, guides, or help topics..."
              className="w-full px-8 py-5 bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/50 outline-none focus:ring-4 focus:ring-indigo-50 transition-all text-lg"
            />
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {faqs.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-8 rounded-[40px] hover:translate-y-[-4px] transition-all cursor-pointer group"
            >
              <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform`}>
                <item.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="glass p-10 rounded-[48px] bg-indigo-500 text-white overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Still need assistance?</h2>
            <p className="text-indigo-100 mb-8 max-w-md">Our specialist support team is ready to help you with any technical or account queries.</p>
            <button className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center gap-2">
              Contact Support <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <Sparkles className="absolute -right-10 -bottom-10 w-64 h-64 text-indigo-400/20 rotate-12" />
        </div>
      </div>
    </div>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
  );
}
