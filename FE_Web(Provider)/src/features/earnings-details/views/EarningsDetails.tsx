import { motion } from 'motion/react';
import { ProviderEarningsDetails } from '@/app/components/ProviderEarningsDetails';
import { useEarningsDetailsViewModel } from '../viewModels/useEarningsDetailsViewModel';

export function EarningsDetails() {
  const viewModel = useEarningsDetailsViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <ProviderEarningsDetails />
    </motion.div>
  );
}

export default EarningsDetails;