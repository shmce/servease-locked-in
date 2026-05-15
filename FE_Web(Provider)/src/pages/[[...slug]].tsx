import dynamic from 'next/dynamic'

const ProviderApp = dynamic(() => import('../app/App'), {
  ssr: false,
})

export default function ProviderCatchAllPage() {
  return <ProviderApp />
}
