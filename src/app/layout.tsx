import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'STELLIUM',
  description: 'An environment for self-exploration through the cosmos.',
  metadataBase: new URL('https://stellium.vercel.app'),
  openGraph: {
    title: 'S T E L L I U M',
    description: 'You are not a speck of dust — you are the universe, experienced subjectively.',
    type: 'website',
  },
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Seanor — wordmark font */}
        <link href="https://fonts.cdnfonts.com/css/seanor" rel="stylesheet" />
        {/* Syncopate — display/title alternative */}
        <link
          href="https://fonts.googleapis.com/css2?family=Syncopate:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {/* Space Grotesk — labels */}
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Inter — system fallback for Helvetica Neue */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black text-white antialiased overflow-hidden">
        {children}
      </body>
    </html>
  )
}
