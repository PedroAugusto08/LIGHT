import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="pt-br">
      <Head>
        <link rel="icon" href="/images/favicon.svg" />
        <link rel="preload" as="image" href="/images/fundo.png" />
        <link rel="stylesheet" href="/style.css?v=20250904" />
        <link rel="stylesheet" href="/teste.css?v=20250904" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
