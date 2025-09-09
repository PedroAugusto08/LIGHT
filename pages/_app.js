import { useEffect } from 'react'
import '../public/style.css'
import '../public/teste.css'

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.warn('SW register failed', err));
    }
  }, []);
  return <Component {...pageProps} />
}
