'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import Image from 'next/image'

interface NFTCardProps {
  id: number
  name: string
  price: string
  image: string
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
}

export default function NFTCard({ id, name, price, image, isHovered, onHover, onLeave }: NFTCardProps) {
  return (
    <motion.div
      className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer relative"
      whileHover={{ scale: 1.05 }}
      onHoverStart={onHover}
      onHoverEnd={onLeave}
    >
      <div className="relative aspect-square">
        <Image
          src={image}
          alt={name}
          layout="fill"
          objectFit="cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60" />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-gray-300">{price}</p>
      </div>
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={false}
        animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
        <div className="absolute inset-0 bg-[url('/images/magic-runes.png')] bg-repeat opacity-10" />
      </motion.div>
      <motion.button
        className="absolute bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-full flex items-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isHovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        <Sparkles className="mr-2" size={16} />
        Buy Now
      </motion.button>
    </motion.div>
  )
}

