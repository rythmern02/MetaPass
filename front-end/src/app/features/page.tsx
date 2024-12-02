import FeaturesHero from '../components/FeaturesHero'
import FeaturesList from '../components/FeaturesList'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MetaPass Features - Magical Memberships',
  description: 'Discover the enchanting features of MetaPass - Tradable Memberships, Dynamic Rewards, and more!',
}

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-gray-900 text-white overflow-hidden">
      <FeaturesHero />
      <FeaturesList />
    </main>
  )
}

