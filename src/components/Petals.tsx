/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface Petal {
  id: number;
  startX: number;
  swayAmount: number;
  size: number;
  initialRotation: number;
  duration: number;
  delay: number;
  opacity: number;
}

export function Petals() {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const newPetals = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      startX: Math.random() * 100,
      swayAmount: Math.random() * 15 + 5,
      size: Math.random() * 18 + 12, // Increased size
      initialRotation: Math.random() * 360,
      duration: Math.random() * 12 + 15, 
      delay: Math.random() * -30, 
      opacity: Math.random() * 0.4 + 0.4, // Slightly more opaque
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          initial={{ 
            x: `${petal.startX}vw`, 
            y: "-10vh", 
            rotate: petal.initialRotation,
            rotateY: 0,
            opacity: 0 
          }}
          animate={{ 
            x: [
              `${petal.startX}vw`, 
              `${petal.startX + petal.swayAmount}vw`, 
              `${petal.startX - petal.swayAmount}vw`,
              `${petal.startX + petal.swayAmount / 2}vw`
            ],
            y: "110vh", 
            rotate: petal.initialRotation + 1080,
            rotateY: [0, 180, 360, 540],
            opacity: [0, petal.opacity, petal.opacity, 0]
          }}
          transition={{ 
            duration: petal.duration,
            repeat: Infinity,
            delay: petal.delay,
            ease: "easeInOut",
          }}
          className="absolute"
        >
          <div 
            style={{ 
              width: petal.size, 
              height: petal.size * 1.4, // Slightly elongated
              background: Math.random() > 0.5 
                ? "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)" 
                : "linear-gradient(135deg, #fbcfe8 0%, #f9a8d4 100%)", 
              borderRadius: "45% 55% 45% 55% / 60% 40% 60% 40%", 
              boxShadow: "0 4px 12px rgba(244, 114, 182, 0.25), inset 0 0 4px rgba(255,255,255,0.5)", // Stronger shadow + inner highlight for thickness
              border: "1px solid rgba(249, 168, 212, 0.2)", // Subtle edge
              transform: `scale(${Math.random() * 0.4 + 1.0})`, // Larger scale
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
