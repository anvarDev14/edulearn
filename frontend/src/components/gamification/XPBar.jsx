import { motion } from 'framer-motion'

export default function XPBar({ 
  totalXP = 0, 
  level = 1, 
  progress = 0, 
  xpToNext = 100,
  badge = '🌱',
  showDetails = true 
}) {
  return (
    <div className="bg-slate-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{badge}</span>
          <span className="text-white font-bold">Level {level}</span>
        </div>
        {showDetails && (
          <span className="text-slate-400 text-sm">
            {totalXP.toLocaleString()} XP
          </span>
        )}
      </div>
      
      <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      
      {showDetails && (
        <p className="text-slate-400 text-xs mt-1 text-right">
          {xpToNext.toLocaleString()} XP to Level {level + 1}
        </p>
      )}
    </div>
  )
}
