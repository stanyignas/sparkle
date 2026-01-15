import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import { MICROCOPY, COLORS } from '../constants';

interface Props {
  onSave: (rating: number, note: string) => void;
  onClose: () => void;
}

const LoveMeter: React.FC<Props> = ({ onSave, onClose }) => {
  const [rating, setRating] = useState<number>(0);
  const [note, setNote] = useState('');
  const [showBouquet, setShowBouquet] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;

    if (rating < 4) {
      setShowBouquet(true);
      // Save after delay to show animation
      setTimeout(() => {
        onSave(rating, note);
      }, 3500);
    } else {
      setShowConfetti(true);
      setTimeout(() => {
        onSave(rating, note);
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm p-4">
      
      {/* Bouquet Modal (Low Rating) - Comfort Animation */}
      <AnimatePresence>
        {showBouquet && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-pink-50/95"
          >
            {/* Anti-gravity Petals */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-pink-300 opacity-60"
                initial={{ y: 200, x: (Math.random() - 0.5) * 200, opacity: 0, rotate: 0 }}
                animate={{ 
                  y: -500, // Float UP (Anti-gravity)
                  x: (Math.random() - 0.5) * 300,
                  opacity: [0, 1, 0],
                  rotate: Math.random() * 360
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2, 
                  ease: "easeOut",
                  delay: Math.random() * 0.5
                }}
              >
                🌸
              </motion.div>
            ))}

            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="text-8xl mb-6 relative z-10"
            >
              💐
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-primary mb-2"
            >
              {MICROCOPY.bouquet}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-textMuted"
            >
              Sending you extra love today.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti Modal (High Rating) - Celebration Animation */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-blue-50/95 pointer-events-none"
          >
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
             {/* Physics Bouncing Hearts */}
             {Array.from({ length: 30 }).map((_, i) => (
               <motion.div
                 key={i}
                 className="absolute"
                 initial={{ y: 0, x: 0, scale: 0 }}
                 animate={{ 
                   y: [0, (Math.random() - 0.5) * 600, 500], // Shoot up/out then fall
                   x: (Math.random() - 0.5) * 800,
                   rotate: 720,
                   scale: [0, 1, 0.5]
                 }}
                 transition={{ 
                   duration: 2.5, 
                   ease: "circOut", // Explose out
                   times: [0, 0.4, 1],
                   delay: Math.random() * 0.2
                 }}
               >
                 <Heart 
                   size={10 + Math.random() * 20} 
                   className="fill-primary text-primary" 
                 />
               </motion.div>
             ))}
            </div>
            
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1.2, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="z-10 bg-white p-6 rounded-3xl shadow-xl shadow-blue-200 text-center border-4 border-blue-100"
            >
               <div className="text-6xl mb-2">✨</div>
               <h2 className="text-3xl font-bold text-primary">
                {MICROCOPY.confetti}
               </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Card */}
      {!showBouquet && !showConfetti && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-textMuted hover:text-textPrimary">
            <X size={24} />
          </button>

          <h2 className="text-2xl font-bold text-center mb-6 text-textPrimary">How are you feeling?</h2>
          
          <div className="flex justify-between mb-8 px-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <motion.button
                key={r}
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => setRating(r)}
                className={`transition-colors duration-300 ${rating >= r ? 'text-primary' : 'text-gray-200'}`}
              >
                <Heart 
                  size={40} 
                  fill={rating >= r ? COLORS.primary : 'none'} 
                  strokeWidth={rating >= r ? 0 : 2}
                />
              </motion.button>
            ))}
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note... (optional)"
            className="w-full p-4 bg-gray-50 rounded-xl mb-6 text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none h-32"
          />

          <motion.button
            onClick={handleSubmit}
            disabled={rating === 0}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
              rating === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary shadow-lg shadow-pink-200 hover:shadow-pink-300'
            }`}
          >
            Save to Journal
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default LoveMeter;