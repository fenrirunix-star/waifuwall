import { motion, AnimatePresence } from "motion/react";
import { Download, X, Play, Clock, ShieldCheck, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/src/lib/utils";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPremium?: boolean;
}

export function DownloadModal({ isOpen, onClose, isPremium = false }: DownloadModalProps) {
  const [step, setStep] = useState<"initial" | "ad" | "complete">("initial");
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (step === "ad" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === "ad" && timeLeft === 0) {
      setStep("complete");
    }
  }, [step, timeLeft]);

  const handleDownload = () => {
    if (isPremium) {
      setStep("complete");
    } else {
      setStep("ad");
      setTimeLeft(5);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-lg glass rounded-[40px] overflow-hidden p-10 relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>

            {step === "initial" && (
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-[28px] flex items-center justify-center mx-auto mb-6">
                  <Download className="text-indigo-600 w-10 h-10" />
                </div>
                <h2 className="text-3xl font-display font-bold text-slate-800 mb-4">Ready to Download?</h2>
                <p className="text-slate-500 mb-10 leading-relaxed">
                  {isPremium 
                    ? "Premium users enjoy instant downloads. No ads, no waiting."
                    : "Free users must watch a short 5-second video ad to unlock the 4K download."}
                </p>

                <div className="flex flex-col gap-4">
                  <button 
                    onClick={handleDownload}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 hover:scale-[1.02] transition-all"
                  >
                    {isPremium ? <Zap className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    {isPremium ? "Instant Download" : "Unlock with Ad"}
                  </button>
                  {!isPremium && (
                    <button className="w-full py-4 bg-amber-50 text-amber-600 rounded-2xl font-bold flex items-center justify-center gap-2 border border-amber-100 hover:bg-amber-100 transition-all">
                      <ShieldCheck className="w-5 h-5" /> Upgrade for Instant Access
                    </button>
                  )}
                </div>
              </div>
            )}

            {step === "ad" && (
              <div className="text-center py-10">
                <div className="aspect-video bg-slate-900 rounded-3xl mb-8 flex flex-col items-center justify-center relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 animate-pulse" />
                   <Play className="w-16 h-16 text-white/50 animate-bounce" />
                   <p className="text-white/50 font-bold mt-4">Simulated Ad playing...</p>
                   
                   <div className="absolute bottom-4 right-4 glass px-4 py-2 rounded-xl flex items-center gap-2">
                     <Clock className="w-4 h-4 text-white" />
                     <span className="text-white font-bold">{timeLeft}s</span>
                   </div>
                </div>
                <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">Unlocking Download...</h2>
                <p className="text-slate-400">Please wait while we process your request.</p>
              </div>
            )}

            {step === "complete" && (
              <div className="text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-[28px] flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="text-emerald-600 w-10 h-10" />
                </div>
                <h2 className="text-3xl font-display font-bold text-slate-800 mb-4">Download Started!</h2>
                <p className="text-slate-500 mb-10 leading-relaxed">
                  Your high-resolution wallpaper is being prepared. It will start shortly in your browser.
                </p>
                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl hover:bg-slate-900 transition-all"
                >
                  Close & Browse More
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
