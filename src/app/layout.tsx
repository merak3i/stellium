import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://stellium.vercel.app'),
  title: {
    default: 'S T E L L I U M',
    template: '%s · STELLIUM',
  },
  description:
    "The first app for astrology where you don't get any answers. A spatial environment by Simulacra for exploring the unknowns of yourself. As above, so below.",
  applicationName: 'Stellium',
  keywords: [
    'astrology',
    'natal chart',
    'vedic',
    'sidereal',
    'nakshatra',
    'simulacra',
    'astro esoteric',
    'as above so below',
    'spatial environment',
  ],
  authors: [{ name: 'Simulacra', url: 'https://instagram.com/end.of.knowledge' }],
  creator: 'Simulacra',
  publisher: 'Simulacra',
  openGraph: {
    type: 'website',
    url: 'https://stellium.vercel.app',
    siteName: 'STELLIUM',
    title: 'S T E L L I U M',
    description:
      "The first app for astrology where you don't get any answers. You are not a speck of dust — the universe conspired to birth you. This miracle we call life.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'S T E L L I U M',
    description:
      "The first app for astrology where you don't get any answers. A spatial environment by Simulacra.",
    creator: '@end.of.knowledge',
  },
  robots: { index: true, follow: true },
  category: 'art',
}

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-black text-white antialiased overflow-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
