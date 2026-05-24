import { notFound } from 'next/navigation';
import { ProviderDetailPage } from '../../components/ProviderDetailPage';
import { fetchProviderDetail } from '../../lib/provider-detail';

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  const detail = await fetchProviderDetail(listingId);

  if (!detail) {
    notFound();
  }

  return <ProviderDetailPage detail={detail} />;
}
