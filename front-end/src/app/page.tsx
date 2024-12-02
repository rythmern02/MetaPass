import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BackgroundEffect from './components/BackgroundEffect'

export default function Home() {
  return (
      <main className="min-h-screen bg-gray-900 text-white overflow-hidden">
        <BackgroundEffect />
        <Navbar />
        <Hero />
        <HowItWorks />
        <Footer />
      </main>
  )
}

