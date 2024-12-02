'use client'

import { motion } from 'framer-motion'
import { Search } from 'lucide-react'


export default function MarketplaceHero() {
  return (
    <section className="relative py-20 flex flex-col items-center justify-center overflow-hidden">
      <motion.div
        className="z-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Magical Marketplace
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8">
          Discover and trade enchanting membership NFTs
        </p>
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search for magical memberships..."
            className="pl-10 pr-4 py-2 w-full bg-gray-800 border-purple-500 focus:border-pink-500 transition-colors duration-300"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </motion.div>
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-radial from-purple-900/30 to-gray-900/70" />
        <div className="absolute inset-0 bg-[url('/images/magic-particles.png')] bg-repeat animate-float opacity-30" />
      </div>
    </section>
  )
}

