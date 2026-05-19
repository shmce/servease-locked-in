import { motion } from 'motion/react';
import { UnifiedBookingsPage } from '@/app/components/UnifiedBookingsPage';
import { useBookingsViewModel } from '../viewModels/useBookingsViewModel';

export function Bookings() {
  const viewModel = useBookingsViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <UnifiedBookingsPage />
    </motion.div>
  );
}

export default Bookings;