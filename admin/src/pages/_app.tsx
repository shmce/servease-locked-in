import type { AppProps } from 'next/app'
import '../styles/index.css'

export default function AdminNextApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
