import { BookingDetailPage } from '../../components/BookingDetailPage';

export default async function Page({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return <BookingDetailPage bookingId={bookingId} />;
}
