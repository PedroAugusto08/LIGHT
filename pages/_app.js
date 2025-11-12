import { useEffect, useState } from 'react'
import '../public/style.css'
import '../public/teste.css'
import IntroScreen from '../components/IntroScreen'

export default function MyApp({ Component, pageProps }) {
  const [showIntro, setShowIntro] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.warn('SW register failed', err));
    }

    // Verifica se já viu a intro
    const hasSeenIntro = localStorage.getItem('light_intro_seen');
    if (hasSeenIntro) {
      setShowIntro(false);
      setIntroComplete(true);
    }
  }, []);

  const handleIntroComplete = () => {
    localStorage.setItem('light_intro_seen', 'true');
    setIntroComplete(true);
  };

  return (
    <>
      {showIntro && !introComplete && <IntroScreen onComplete={handleIntroComplete} />}
      <Component {...pageProps} />
    </>
  )
}
