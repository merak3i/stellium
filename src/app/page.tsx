import dynamic from 'next/dynamic'

// All screens run client-only — the landing page is a WebGL/canvas animation
// with no SEO value, so we skip SSR entirely to avoid hydration mismatches.
const ClientApp = dynamic(() => import('@/components/ClientApp'), { ssr: false })

export default function Home() {
  return <ClientApp />
}
