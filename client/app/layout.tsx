import type { Metadata } from 'next'
import { Playfair_Display, Cormorant_Garamond, Montserrat } from 'next/font/google'
import './globals.css'
import { PanierProvider } from '@/contexts/PanierContext'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'SAFIYA BOUTIQUE - Luxe & Élégance',
  description: 'Boutique en ligne de luxe SAFIYA BOUTIQUE - Pagnes de qualité exceptionnelle',
  // ✅ AJOUTER ICI - Favicon pour Render
  icons: {
    icon: 'https://safiyaboutique-utvv.onrender.com/client/public/logo/icon.ico',
    apple: 'https://safiyaboutique-utvv.onrender.com/client/public/logo/icon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${playfair.variable} ${cormorant.variable} ${montserrat.variable}`}>
      <head>
        {/* Favicon alternatif */}
        <link rel="icon" href="https://safiyaboutique-utvv.onrender.com/client/public/logo/icon.ico" type="image/x-icon" />
      </head>
      <body className="antialiased">
        <PanierProvider>{children}</PanierProvider>
      </body>
    </html>
  )
}