import { motion, useMotionValue, useSpring, useMotionTemplate } from "motion/react";
import { Link } from "react-router-dom";
import { SEO } from "@/src/components/SEO";
import { useRef } from "react";

const FuturisticDog = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left - rect.width / 2);
    mouseY.set(event.clientY - rect.top - rect.height / 2);
  };

  const eyeX = useSpring(useMotionTemplate`${mouseX}px`, { stiffness: 100, damping: 10 });
  const eyeY = useSpring(useMotionTemplate`${mouseY}px`, { stiffness: 100, damping: 10 });

  return (
    <motion.svg
      width="200"
      height="200"
      viewBox="0 0 100 100"
      onMouseMove={handleMouseMove}
      className="cursor-crosshair"
    >
      <defs>
        <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: "#6366f1", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#312e81", stopOpacity: 1 }} />
        </radialGradient>
      </defs>
      {/* Body */}
      <circle cx="50" cy="70" r="25" fill="url(#grad1)" />
      {/* Head */}
      <circle cx="50" cy="40" r="20" fill="url(#grad1)" />
      {/* Eyes Container - Move reactive pupils */}
      <g>
        <circle cx="43" cy="35" r="5" fill="#fff" />
        <motion.circle cx="43" cy="35" r="2" fill="#000" style={{ x: eyeX, y: eyeY }} />
        <circle cx="57" cy="35" r="5" fill="#fff" />
        <motion.circle cx="57" cy="35" r="2" fill="#000" style={{ x: eyeX, y: eyeY }} />
      </g>
    </motion.svg>
  );
};

export function NotFound() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center bg-white text-slate-800 relative overflow-hidden">
      <SEO 
        title="404 Not Found | WaifuWall" 
        description="The page you are looking for does not exist."
        keywords="404, not found, page not found"
      />
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(rgba(99,102,241,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 z-10"
      >
        <div className="flex justify-center mb-4">
          <FuturisticDog />
        </div>
        <h1 className="text-9xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">404</h1>
        <p className="text-xl text-slate-600 max-w-sm mx-auto">System Error: Navigation protocol failed. The requested dimension doesn't exist.</p>
        <Link 
          to="/" 
          className="inline-block px-8 py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition"
        >
          Reboot to Homepage
        </Link>
      </motion.div>
    </div>
  );
}
