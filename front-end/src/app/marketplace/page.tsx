import MarketplaceHero from '../components/MarketPlaceHero'
import MarketplaceGrid from '../components/MarketplaceGrid'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MetaPass Marketplace - Magical Memberships',
  description: 'Explore and trade enchanting membership NFTs in the MetaPass Marketplace.',
}

export default function MarketplacePage() {
  return (
    <main className="min-h-screen bg-gray-900 text-white overflow-hidden">
      <MarketplaceHero />
      <MarketplaceGrid />
    </main>
  )
}

