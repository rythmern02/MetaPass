import MintHero from '../components/MintHero'
import MintForm from '../components/MintForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mint Your Magical Membership - MetaPass',
  description: 'Create your unique membership NFT and unlock exclusive community access with MetaPass.',
}

export default function MintPage() {
  return (
    <main className="min-h-screen bg-gray-900 text-white overflow-hidden">
      <MintHero />
      <MintForm />
    </main>
  )
}

