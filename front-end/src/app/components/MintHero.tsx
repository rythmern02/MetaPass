'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function MintHero() {
  return (
    <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-radial from-purple-900/50 to-gray-900/90" />
        <div className="absolute inset-0 bg-[url('/images/magic-particles.png')] bg-repeat animate-float opacity-30" />
      </div>
      <motion.div
        className="z-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Mint Your Magical Membership!
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8">
          Enter the world of MetaPass by minting your unique membership NFT and unlocking exclusive community access.
        </p>
        <motion.button
          className="px-8 py-3 bg-purple-600 text-white rounded-full text-lg font-semibold hover:bg-purple-700 transition-colors duration-300 flex items-center justify-center mx-auto group relative overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="relative z-10">Mint Your Membership</span>
          <Sparkles className="ml-2 relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.button>
      </motion.div>
    </section>
  )
}

