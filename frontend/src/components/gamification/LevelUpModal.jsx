import { motion, AnimatePresence } from 'framer-motion'

export default function LevelUpModal({ isOpen, onClose, newLevel, badge }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-8 text-center max-w-sm w-full"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Confetti effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    background: ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'][i % 4],
                    left: `${Math.random() * 100}%`,
                    top: '-10%'
                  }}
                  animate={{
                    y: ['0%', '1200%'],
                    rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                    opacity: [1, 0]
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    delay: Math.random() * 0.5,
                    ease: 'easeOut'
                  }}
                />
              ))}
            </div>
            
            <motion.div
              className="text-8xl mb-4"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              🎉
            </motion.div>
            
            <h2 className="text-3xl font-bold text-white mb-2">
              Level Up!
            </h2>
            
            <motion.div
              className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 my-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3, repeat: 3 }}
            >
              {newLevel}
            </motion.div>
            
            <div className="text-4xl mb-4">{badge}</div>
            
            <p className="text-slate-400 mb-6">
              Tabriklaymiz! Siz yangi levelga chiqdingiz!
            </p>
            
            <motion.button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Davom etish
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
