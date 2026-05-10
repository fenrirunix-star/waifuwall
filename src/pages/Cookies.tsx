import { motion } from "motion/react";
import { Cookie, Info, Settings, MousePointer2 } from "lucide-react";
import { SEO } from "@/src/components/SEO";

export function Cookies() {
  const cookieTypes = [
    {
      title: "Essential Cookies",
      description: "Required for basic site functionality like user login and secure session management.",
      essential: true
    },
    {
      title: "Performance Cookies",
      description: "Help us understand how users interact with our site so we can optimize load times.",
      essential: false
    },
    {
      title: "Personalization",
      description: "Used to remember your preferences like 'Dark Mode' or your favorite categories.",
      essential: false
    }
  ];

  return (
    <div className="pt-32 pb-20 px-6">
      <SEO 
        title="Cookie Policy" 
        description="Learn how WaifuWall uses cookies to enhance your experience, analyze traffic, and manage your preferences."
        keywords="cookie policy, manage cookies, data usage, preferences"
      />
      <div className="max-w-3xl mx-auto">
        <header className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            <Cookie className="w-4 h-4" /> Cookies Policy
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4 font-display">Manage Your Cookies</h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            We use cookies to enhance your experience and analyze our traffic. Learn how to manage your data below.
          </p>
        </header>

        <div className="space-y-6">
          {cookieTypes.map((cookie, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-8 rounded-[32px] flex items-center justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 mt-1">
                  {cookie.essential ? <Settings className="w-5 h-5" /> : <MousePointer2 className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-slate-800">{cookie.title}</h3>
                    {cookie.essential && (
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">Always Active</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-sm">{cookie.description}</p>
                </div>
              </div>
              {!cookie.essential && (
                <div className="flex relative items-center cursor-pointer">
                  <div className="w-12 h-6 bg-slate-200 rounded-full"></div>
                  <div className="absolute right-0.5 w-5 h-5 bg-white rounded-full shadow-md translate-x-[-26px]"></div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-16 p-10 bg-slate-50 rounded-[48px] flex items-start gap-6 border border-slate-100">
          <Info className="w-8 h-8 text-indigo-500 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-slate-800 mb-2">How to clear cookies</h4>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              You can delete all cookies already on your device by clearing the browsing history of your browser. This will however remove saved logins and preferences.
            </p>
            <button className="text-indigo-600 font-bold text-sm hover:underline">Full Browser Settings Guide →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
