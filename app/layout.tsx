import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lumera - Takı E-Ticaret',
  description: 'Lumera takı koleksiyonu - Özel tasarım takılar',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}

