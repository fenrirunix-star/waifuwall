import { motion } from "motion/react";
import { SEO } from "@/src/components/SEO";

const Spark = ({ delay }: { delay: number }) => (
  <motion.div
    initial={{ opacity: 1, x: 0, y: 0 }}
    animate={{ opacity: 0, x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100 }}
    transition={{ repeat: Infinity, duration: 0.5, delay, ease: "easeOut" }}
    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
    style={{ left: "50%", top: "50%" }}
  />
);

const RepairingDog = () => (
  <div className="relative">
    <motion.svg width="200" height="200" viewBox="0 0 100 100">
      {/* Body */}
      <circle cx="50" cy="70" r="25" fill="#e2e8f0" />
      {/* Head */}
      <circle cx="50" cy="40" r="20" fill="#e2e8f0" />
      
      {/* Cable */}
      <path d="M20 50 L40 50" stroke="#f59e0b" strokeWidth="6" fill="transparent" />
      <path d="M60 50 L80 50" stroke="#f59e0b" strokeWidth="6" fill="transparent" />
      
      {/* Dog hands holding cables */}
      <circle cx="42" cy="50" r="6" fill="#cbd5e1" />
      <circle cx="58" cy="50" r="6" fill="#cbd5e1" />
    </motion.svg>
    {/* Sparks */}
    {[...Array(5)].map((_, i) => <Spark key={i} delay={i * 0.1} />)}
  </div>
);

export function Offline() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center bg-white text-slate-800 relative overflow-hidden">
      <SEO 
        title="Offline | WaifuWall" 
        description="You appear to be offline. Please check your internet connection."
        keywords="offline, no internet, connection error"
      />
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 opacity-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500 to-transparent"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-8 z-10 p-10 bg-slate-50 backdrop-blur-2xl rounded-[3rem] border border-slate-100 shadow-xl"
      >
        <div className="flex justify-center mb-6">
          <RepairingDog />
        </div>
        <div className="space-y-4">
             <h1 className="text-5xl font-bold font-display text-slate-900">Connection Interrupted</h1>
             <p className="text-xl text-slate-500 max-w-sm mx-auto">Critical Error: Network connection lost. The repair drone is currently working on the connection.</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="inline-block px-10 py-5 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-slate-800 transition active:scale-95"
        >
          Re-establish Link
        </button>
      </motion.div>
    </div>
  );
}
