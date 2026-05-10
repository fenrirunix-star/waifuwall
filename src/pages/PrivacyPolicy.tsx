import { motion } from "motion/react";
import { Shield, Lock, Eye, Server } from "lucide-react";
import { SEO } from "@/src/components/SEO";

export function PrivacyPolicy() {
  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      content: "We collect information you provide directly to us (like your name and email when you register) and technical data about how you use WaifuWall to provide you with the best experience possible."
    },
    {
      icon: Server,
      title: "How We Use Your Data",
      content: "Your data helps us personalize your gallery feed, manage your premium membership, and improve our artificial intelligence recommendation algorithms."
    },
    {
      icon: Lock,
      title: "Security Measures",
      content: "We implement industry-standard encryption and security protocols to safeguard your personal information against unauthorized access or disclosure."
    }
  ];

  return (
    <div className="pt-32 pb-20 px-6">
      <SEO 
        title="Privacy Policy" 
        description="WaifuWall's privacy policy. Learn how we collect, use, and protect your personal data, ensuring your information stays secure."
        keywords="privacy policy, data protection, security, data usage, privacy"
      />
      <div className="max-w-3xl mx-auto">
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            <Shield className="w-4 h-4" /> Privacy & Security
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4 font-display">Privacy Policy</h1>
          <p className="text-slate-500 font-medium italic">Last updated: April 27, 2026</p>
        </header>

        <div className="space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-slate max-w-none"
          >
            <p className="text-lg text-slate-600 leading-relaxed">
              At WaifuWall, your privacy is paramount. This policy explains how we collect, use, and protect your data across our entire platform. We believe in total transparency and minimal data retention.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8">
            {sections.map((section, idx) => (
              <motion.section 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-800">
                    <section.icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">{section.title}</h2>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {section.content}
                </p>
              </motion.section>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 bg-slate-900 text-white rounded-[32px] mt-12"
          >
            <h3 className="text-xl font-bold mb-4">Contact Privacy Officer</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              For any questions regarding your data or to request a copy of your personal information, please contact our dedicated privacy team.
            </p>
            <a href="mailto:privacy@waifuwall.com" className="font-bold underline decoration-indigo-500 underline-offset-4 hover:text-indigo-400 transition-colors">
              privacy@waifuwall.com
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
