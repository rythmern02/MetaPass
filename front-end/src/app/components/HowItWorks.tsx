'use client'

import { motion } from 'framer-motion'
import { Wand2, Sparkles, Zap, Gift } from 'lucide-react'

const features = [
  {
    icon: Wand2,
    title: 'Tradable Membership NFTs',
    description: 'Buy, sell, or lease your memberships as unique NFTs.',
  },
  {
    icon: Sparkles,
    title: 'Dynamic Rewards & Perks',
    description: 'Unlock exclusive content and level-based rewards.',
  },
  {
    icon: Zap,
    title: 'Flexible Marketplace',
    description: 'Trade memberships with ease and earn royalties.',
  },
  {
    icon: Gift,
    title: 'Gamified Membership System',
    description: 'Earn loyalty bonuses and unlock rare perks.',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 px-4">
      <motion.h2
        className="text-4xl font-bold text-center mb-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        How MetaPass Works
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="bg-gray-800 p-6 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
          >
            <feature.icon className="w-12 h-12 text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

