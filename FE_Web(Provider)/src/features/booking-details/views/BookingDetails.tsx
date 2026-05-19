import { motion } from 'motion/react';
import { BookingDetailsPage } from '@/app/components/BookingDetailsPage';
import { useBookingDetailsViewModel } from '../viewModels/useBookingDetailsViewModel';

export function BookingDetails() {
  const viewModel = useBookingDetailsViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <BookingDetailsPage />
    </motion.div>
  );
}

export default BookingDetails;