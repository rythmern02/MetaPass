'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center text-center px-4">
      <div className="z-10">
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          MetaPass: The Magic of Tradable Memberships
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl mb-8 text-gray-300"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Unleash the Future of Access with Blockchain
        </motion.p>
        <motion.button
          className="px-8 py-3 bg-purple-600 text-white rounded-full text-lg font-semibold hover:bg-purple-700 transition-colors duration-300 flex items-center justify-center mx-auto group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }} 
        >
          <Link href={'/marketplace'}>
          Start Your Magical Journey
          </Link>
          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </section>
  )
}

