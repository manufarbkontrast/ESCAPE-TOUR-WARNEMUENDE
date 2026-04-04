'use client'

import { motion } from 'framer-motion'
import { Search, Zap, Star, Anchor, Compass, Clock, Target } from 'lucide-react'
import type { Achievement } from '@/lib/game/achievements'

const ICON_MAP: Record<string, typeof Search> = {
  search: Search,
  zap: Zap,
  star: Star,
  anchor: Anchor,
  compass: Compass,
  clock: Clock,
  target: Target,
}

interface AchievementListProps {
  readonly achievements: readonly Achievement[]
  readonly language: 'de' | 'en'
}

export function AchievementList({ achievements, language }: AchievementListProps) {
  if (achievements.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide">
        {language === 'de' ? 'Auszeichnungen' : 'Achievements'}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {achievements.map((achievement, index) => {
          const Icon = ICON_MAP[achievement.icon] ?? Star
          const title = language === 'de' ? achievement.titleDe : achievement.titleEn
          const desc = language === 'de' ? achievement.descriptionDe : achievement.descriptionEn

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="rounded-lg p-3"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-4 w-4 text-white/70" strokeWidth={1.5} />
                <span className="text-sm font-semibold text-white">{title}</span>
              </div>
              <p className="text-xs text-white/40">{desc}</p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
