import { motion } from 'motion/react';
import { SetAvailabilityPage } from '@/app/components/SetAvailabilityPage';
import { useAvailabilityViewModel } from '../viewModels/useAvailabilityViewModel';

export function Availability() {
  const viewModel = useAvailabilityViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <SetAvailabilityPage />
    </motion.div>
  );
}

export default Availability;