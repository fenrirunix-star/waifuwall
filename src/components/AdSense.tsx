import React, { useEffect, useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Info } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface AdSenseProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  className?: string;
}

/**
 * AdSense Component
 * Automatically hides for premium users in real-time.
 */
export const AdSense: React.FC<AdSenseProps> = ({ slot = "default", format = "auto", className }) => {
  const { user } = useAuth();
  const [isAdBlockerActive, setIsAdBlockerActive] = useState(false);
  
  // AdSense Client ID from environment
  let ADSENSE_CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID || "ca-pub-9176050154556227"; 
  
  // Ensure the ID has the proper 'ca-pub-' prefix if it only has 'pub-'
  if (ADSENSE_CLIENT_ID && ADSENSE_CLIENT_ID !== "ca-pub-XXXXXXXXXXXXXXXX") {
    if (ADSENSE_CLIENT_ID.startsWith('pub-')) {
      ADSENSE_CLIENT_ID = 'ca-' + ADSENSE_CLIENT_ID;
    }
  } else {
    ADSENSE_CLIENT_ID = "ca-pub-9176050154556227";
  }

  const isPremium = user?.isPremium || user?.isAdmin;

  useEffect(() => {
    // Check for ad-blockers (optional helper)
    const checkAdBlocker = async () => {
      try {
        const url = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
        setIsAdBlockerActive(false);
      } catch (e) {
        setIsAdBlockerActive(true);
      }
    };

    if (!isPremium) {
      checkAdBlocker();
      
      // Initialize AdSense push only after element has size
      const initAd = () => {
        try {
          const adElement = document.querySelector(`.adsbygoogle[data-ad-slot="${slot}"]`);                
          
          if (!window.adsbygoogle) return;
          
          if (adElement && adElement.clientWidth > 0) {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } else {
            // If element is not rendered or has 0 width, retry next frame
            requestAnimationFrame(initAd);
          }
        } catch (e) {
          console.error("AdSense push error", e);
        }
      };

      // Start check loop
      const raf = requestAnimationFrame(initAd);
      return () => cancelAnimationFrame(raf);
    }
  }, [isPremium, slot]); // Re-init if slot changes

  if (isPremium) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className={cn("w-full my-8 overflow-hidden", className)}
      >
        <div className="relative glass rounded-[32px] p-6 border border-slate-100/50 bg-slate-50/30">
          <div className="absolute top-4 right-6 flex items-center gap-1.5 opacity-30 hover:opacity-100 transition-opacity cursor-help group">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Advertisement</span>
            <Info className="w-3 h-3 text-slate-400" />
            <div className="absolute right-0 top-6 w-48 p-3 bg-white shadow-xl rounded-xl text-[10px] text-slate-500 font-medium hidden group-hover:block z-50 border border-slate-100">
              This ad covers server costs for free users. Upgrade to <span className="text-indigo-500 font-bold">Premium</span> to remove all ads instantly.
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center min-h-[120px] bg-white/50 rounded-2xl border-2 border-dashed border-slate-100">
            {/* Real Google AdSense Tag (Mocked visual for preview) */}
            <ins className="adsbygoogle"
              style={{ display: 'block', width: '100%' }}
              data-ad-client={ADSENSE_CLIENT_ID}
              data-ad-slot={slot}
              data-ad-format={format}
              data-full-width-responsive="true">
            </ins>
            
            {isAdBlockerActive ? (
              <div className="text-center p-4">
                <p className="text-sm font-bold text-slate-400">Ad Blocked</p>
                <p className="text-[10px] text-slate-300">Please consider disabling ad-block to support us.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full border-2 border-indigo-200 border-t-indigo-500 animate-spin" />
                </div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Loading Ad...</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
