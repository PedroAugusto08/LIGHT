import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="pt-br">
      <Head>
        <link rel="icon" href="/images/favicon.png" />
        <link rel="preload" as="image" href="/images/fundo.png" />
        <link rel="stylesheet" href="/style.css?v=20250904" />
        <link rel="stylesheet" href="/teste.css?v=20250904" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="LIGHT" />
        <meta name="theme-color" content="#0a0d12" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
