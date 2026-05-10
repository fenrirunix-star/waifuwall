import { motion } from "motion/react";
import { FileText, Scale, CheckCircle2, AlertCircle } from "lucide-react";
import { SEO } from "@/src/components/SEO";

export function Terms() {
  const points = [
    {
      title: "Content Usage",
      text: "All wallpapers are provided for personal use only. Commercial redistribution without proper licensing is strictly prohibited.",
      type: "success"
    },
    {
      title: "Account Responsibility",
      text: "You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.",
      type: "alert"
    },
    {
      title: "Premium Subscription",
      text: "Premium memberships are billed on a recurring basis. You can cancel at any time through your account settings.",
      type: "success"
    }
  ];

  return (
    <div className="pt-32 pb-20 px-6">
      <SEO 
        title="Terms of Service" 
        description="Read the terms of service for using WaifuWall. Learn about our content usage policies, account responsibilities, and subscription terms."
        keywords="terms of service, legal, usage policy, subscription terms"
      />
      <div className="max-w-3xl mx-auto">
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            <FileText className="w-4 h-4" /> Legal Agreement
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4 font-display">Terms of Service</h1>
          <p className="text-slate-500 font-medium italic">Effective date: January 1, 2026</p>
        </header>

        <div className="space-y-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-slate max-w-none"
          >
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              By accessing WaifuWall, you agree to bound by these terms. Please read them carefully to understand your rights and obligations.
            </p>
          </motion.div>

          <div className="space-y-6">
            {points.map((point, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex gap-6 p-8 bg-slate-50/50 border border-slate-100 rounded-[32px]"
              >
                <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${point.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                  {point.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{point.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm">
                    {point.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <section className="mt-16 pt-16 border-t border-slate-100 italic text-slate-400 text-sm text-center">
            <p>Failure to comply with these terms may result in account suspension or legal action where applicable.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
