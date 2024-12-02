'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ConnectButton } from '@rainbow-me/rainbowkit'


export default function Navbar() {
  const [activeLink, setActiveLink] = useState('home')

  const links = [
    { name: 'Home', href: '#' },
    { name: 'Marketplace', href: '/marketplace' },
    { name: 'List Memberships', href: '/mint' },
    { name: 'How It Works', href: '#' },
    { name: 'Contact', href: '#' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900 bg-opacity-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <a href="#" className="text-xl font-bold text-white">
              MetaPass
            </a>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {links.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="relative px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  onClick={() => setActiveLink(link.name.toLowerCase())}
                >
                  {link.name}
                  {activeLink === link.name.toLowerCase() && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
                      layoutId="underline"
                    />
                  )}
                </a>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  )
}

