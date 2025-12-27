import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Mechanic Pro - Vehicle Inspection Reports',
  description: 'Professional vehicle inspection reporting system for automotive mechanics',
  applicationName: 'Mechanic Pro',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Toaster 
          position="top-center" 
          richColors 
          toastOptions={{
            style: {
              padding: '16px 20px',
              fontSize: '14px',
              fontWeight: '700',
              letterSpacing: '0.025em',
              textAlign: 'center',
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
            },
            className: 'font-bold uppercase tracking-tight',
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
