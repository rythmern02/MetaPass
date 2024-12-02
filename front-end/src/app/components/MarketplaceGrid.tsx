'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import NFTCard from './NFTCard'

const mockNFTs = [
  { id: 1, name: 'Mystic Scroll', price: '0.5 ETH', image: '/images/nft-1.jpg' },
  { id: 2, name: 'Enchanted Key', price: '0.7 ETH', image: '/images/nft-2.jpg' },
  { id: 3, name: 'Wizard\'s Hat', price: '1.2 ETH', image: '/images/nft-3.jpg' },
  { id: 4, name: 'Dragon Scale', price: '2.0 ETH', image: '/images/nft-4.jpg' },
  { id: 5, name: 'Phoenix Feather', price: '1.5 ETH', image: '/images/nft-5.jpg' },
  { id: 6, name: 'Crystal Ball', price: '0.8 ETH', image: '/images/nft-6.jpg' },
]

export default function MarketplaceGrid() {
  const [hoveredNFT, setHoveredNFT] = useState<number | null>(null)

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, staggerChildren: 0.1 }}
        >
          {mockNFTs.map((nft) => (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <NFTCard
                {...nft}
                isHovered={hoveredNFT === nft.id}
                onHover={() => setHoveredNFT(nft.id)}
                onLeave={() => setHoveredNFT(null)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

