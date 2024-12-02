'use client'

import { motion } from 'framer-motion'
import { Wand2, Sparkles, Zap, Gift } from 'lucide-react'
import FeatureCard from './FeatureCard'

const features = [
  {
    icon: Wand2,
    title: 'Tradable Membership NFTs',
    description: 'Buy, sell, or lease your memberships as unique NFTs. Upgrade and customize your access like never before.',
  },
  {
    icon: Sparkles,
    title: 'Dynamic Rewards & Perks',
    description: 'Unlock exclusive content, level-based rewards, and surprise bonuses as you engage with the platform.',
  },
  {
    icon: Zap,
    title: 'Flexible Marketplace',
    description: 'Trade memberships with ease, set custom lease terms, and earn royalties as a creator.',
  },
  {
    icon: Gift,
    title: 'Gamified Membership System',
    description: 'Earn loyalty bonuses, unlock rare perks, and combine memberships for unique "superpowers".',
  },
]

export default function FeaturesList() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
          >
            <FeatureCard {...feature} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

