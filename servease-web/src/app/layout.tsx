import type { Metadata } from 'next'
import { Layout } from './components/Layout'
import '../styles/index.css'

export const metadata: Metadata = {
  title: 'ServEase',
  description: 'Book trusted services anytime, anywhere.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
