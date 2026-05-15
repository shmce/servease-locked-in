import dynamic from 'next/dynamic'

const AdminApp = dynamic(() => import('../app/App'), {
  ssr: false,
})

export default function AdminCatchAllPage() {
  return <AdminApp />
}
