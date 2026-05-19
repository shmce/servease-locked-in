import { motion } from 'motion/react';
import { BookingRequestDetailsPage } from '@/app/components/BookingRequestDetailsPage';
import { useBookingRequestDetailsViewModel } from '../viewModels/useBookingRequestDetailsViewModel';

export function BookingRequestDetails() {
  const viewModel = useBookingRequestDetailsViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <BookingRequestDetailsPage />
    </motion.div>
  );
}

export default BookingRequestDetails;