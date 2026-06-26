import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Sora, Oxanium } from 'next/font/google'
import './globals.css'

const sora = Sora({ variable: '--font-sora', subsets: ['latin'] })
const oxanium = Oxanium({
  variable: '--font-oxanium',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'YakuAlert - Alerta Temprana de Inundaciones y Huaicos',
  description: 'Sistema de alerta en tiempo real para inundaciones y huaicos (deslaves de lodo) en Perú',
  generator: 'v0.app',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0f172a',
  userScalable: true,
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es-PE" className={`${sora.variable} ${oxanium.variable} bg-background`}>
      <body className="font-sans antialiased bg-background text-foreground relative min-h-screen">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
