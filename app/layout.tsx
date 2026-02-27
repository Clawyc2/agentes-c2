import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Agentes C2 - Dashboard',
  description: 'Sistema de subagentes de Clawy',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
