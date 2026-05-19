import { motion } from 'motion/react';
import { ProviderAnalyticsPage } from '@/app/components/ProviderAnalyticsPage';
import { useAnalyticsViewModel } from '../viewModels/useAnalyticsViewModel';

export function Analytics() {
  const viewModel = useAnalyticsViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <ProviderAnalyticsPage />
    </motion.div>
  );
}

export default Analytics;