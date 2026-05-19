import { motion } from 'motion/react';
import { PortfolioManagementPage } from '@/app/components/PortfolioManagementPage';
import { usePortfolioViewModel } from '../viewModels/usePortfolioViewModel';

export function Portfolio() {
  const viewModel = usePortfolioViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <PortfolioManagementPage />
    </motion.div>
  );
}

export default Portfolio;