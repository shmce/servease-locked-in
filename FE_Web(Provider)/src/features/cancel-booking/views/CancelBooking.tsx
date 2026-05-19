import { motion } from 'motion/react';
import { CancelBookingPage } from '@/app/components/CancelBookingPage';
import { useCancelBookingViewModel } from '../viewModels/useCancelBookingViewModel';

export function CancelBooking() {
  const viewModel = useCancelBookingViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <CancelBookingPage />
    </motion.div>
  );
}

export default CancelBooking;