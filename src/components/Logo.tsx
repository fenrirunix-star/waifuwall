import React from "react";
import { cn } from "@/src/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  withText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Logo({ className, iconOnly = false, withText = true, size = "md" }: LogoProps) {
  const sizeMap = {
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-2xl" },
    lg: { icon: 48, text: "text-4xl" },
    xl: { icon: 64, text: "text-6xl" },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      {/* Lotus Icon */}
      <div 
        className="relative flex items-center justify-center"
        style={{ width: currentSize.icon, height: currentSize.icon }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_8px_rgba(236,72,153,0.3)] animate-pulse-slow"
        >
          <defs>
            <linearGradient id="lotus-gradient-pink" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff0080" />
              <stop offset="100%" stopColor="#ff80bf" />
            </linearGradient>
            <linearGradient id="lotus-gradient-purple" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d946ef" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <filter id="glossy" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
              <feSpecularLighting in="blur" surfaceScale="7" specularConstant="1.2" specularExponent="35" lightingColor="white" result="specular">
                <fePointLight x="-50" y="-50" z="250" />
              </feSpecularLighting>
              <feComposite in="specular" in2="SourceAlpha" operator="in" result="specularResult" />
              <feComposite in="SourceGraphic" in2="specularResult" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
            </filter>
          </defs>
          
          {/* Symmetrical Lotus Petals */}
          <g filter="url(#glossy)">
            {/* Outer Petals */}
            <path
              d="M50 85C30 85 10 60 10 40C10 20 30 10 50 25C70 10 90 20 90 40C90 60 70 85 50 85Z"
              fill="url(#lotus-gradient-pink)"
              fillOpacity="0.9"
            />
            {/* Inner Petals */}
            <path
              d="M50 80C35 80 22 62 22 47C22 32 35 25 50 35C65 25 78 32 78 47C78 62 65 80 50 80Z"
              fill="url(#lotus-gradient-purple)"
              fillOpacity="0.95"
            />
            {/* Center Detail */}
            <circle cx="50" cy="45" r="8" fill="white" fillOpacity="0.5" />
          </g>
        </svg>
      </div>

      {/* Text Branding */}
      {withText && !iconOnly && (
        <div className={cn("font-black tracking-tighter flex items-baseline", currentSize.text)}>
          <span className="bg-gradient-to-r from-[#ff0080] via-[#ff66b2] to-[#ff0080] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,0,128,0.3)]">
            Waifu
          </span>
          <span className="bg-gradient-to-r from-[#d946ef] via-[#a855f7] to-[#8b5cf6] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(217,70,239,0.3)] ml-0.5">
            Wall
          </span>
        </div>
      )}
    </div>
  );
}
