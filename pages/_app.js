import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import '../public/style.css'
import '../public/teste.css'

// Carrega o widget de habilidades somente no client (sem SSR)
const SkillsWidget = dynamic(() => import('../components/SkillsWidget'), { ssr: false });

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.warn('SW register failed', err));
    }
  }, []);
  return (
    <>
      <Component {...pageProps} />
      <SkillsWidget />
    </>
  )
}
