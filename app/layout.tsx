import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: 'Restaurant Journal',
  description: 'Log every meal, savor every memory.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  )
}
