import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const FloatingHearts: React.FC = () => {
  const [hearts, setHearts] = useState<{ id: number; left: number; scale: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate random hearts with varied "physics" properties
    const newHearts = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // Random start position
      scale: 0.3 + Math.random() * 0.5, // Varied sizes (small to medium)
      duration: 15 + Math.random() * 20, // Very slow float (15-35s) for calmness
      delay: Math.random() * 10 // Randomize start times
    }));
    setHearts(newHearts);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          className="absolute -bottom-20 text-pink-200/60"
          style={{ left: `${h.left}%` }}
          initial={{ y: 0, opacity: 0, x: 0 }}
          animate={{
            y: -1200, // Float way up off screen
            opacity: [0, 0.6, 0.6, 0], // Gentle fade in/out
            x: [0, Math.sin(h.id) * 50, Math.sin(h.id + 1) * -50, 0], // Sinusoidal sway (drift)
            rotate: [0, (h.id % 2 === 0 ? 360 : -360)] // Slow spin
          }}
          transition={{
            y: {
              duration: h.duration,
              repeat: Infinity,
              ease: "linear", // Constant upward velocity
              delay: h.delay
            },
            x: {
              duration: h.duration, // Match vertical duration for fluid drift
              repeat: Infinity,
              ease: "easeInOut", // Smooth turns
              times: [0, 0.33, 0.66, 1]
            },
            rotate: {
              duration: h.duration,
              repeat: Infinity,
              ease: "linear"
            },
            opacity: {
              duration: h.duration,
              repeat: Infinity,
              times: [0, 0.1, 0.9, 1]
            }
          }}
        >
          {/* Soft Rounded Heart SVG */}
          <svg width={`${40 * h.scale}`} height={`${40 * h.scale}`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingHearts;