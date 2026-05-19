import { motion } from 'motion/react';
import { ProviderEarningsDashboard } from '@/app/components/ProviderEarningsDashboard';
import { useEarningsDashboardViewModel } from '../viewModels/useEarningsDashboardViewModel';

export function EarningsDashboard() {
  const viewModel = useEarningsDashboardViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <ProviderEarningsDashboard />
    </motion.div>
  );
}

export default EarningsDashboard;