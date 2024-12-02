'use client'

import { motion } from 'framer-motion'

export default function FeaturesHero() {
  return (
    <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 to-gray-900/50" />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/magic-background.mp4" type="video/mp4" />
        </video>
      </div>
      <motion.div
        className="z-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Magical Features
        </h1>
        <p className="text-xl md:text-2xl text-gray-300">
          Discover the enchanting world of MetaPass
        </p>
      </motion.div>
    </section>
  )
}

