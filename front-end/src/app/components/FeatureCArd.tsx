'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
}

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="bg-gray-800 rounded-lg p-6 cursor-pointer overflow-hidden relative"
      whileHover={{ scale: 1.05, rotate: 2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 transition-opacity duration-300 ease-in-out" style={{ opacity: isHovered ? 1 : 0 }} />
      <div className="relative z-10">
        <Icon className="w-12 h-12 text-purple-500 mb-4" />
        <h3 className="text-2xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </div>
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={false}
        animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
        <div className="absolute inset-0 bg-[url('/images/magic-runes.png')] bg-repeat opacity-10" />
      </motion.div>
    </motion.div>
  )
}

