import { HomePage } from './components/HomePage'
import { fetchLandingCatalog } from './lib/catalog'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const catalog = await fetchLandingCatalog()

  return <HomePage catalog={catalog} />
}
