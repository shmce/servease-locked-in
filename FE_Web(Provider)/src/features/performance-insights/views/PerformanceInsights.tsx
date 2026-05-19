import { motion } from 'motion/react';
import { ProviderPerformanceInsightsPage } from '@/app/components/ProviderPerformanceInsightsPage';
import { usePerformanceInsightsViewModel } from '../viewModels/usePerformanceInsightsViewModel';

export function PerformanceInsights() {
  const viewModel = usePerformanceInsightsViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <ProviderPerformanceInsightsPage />
    </motion.div>
  );
}

export default PerformanceInsights;