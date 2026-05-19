import { motion } from 'motion/react';
import { ProviderHelpCenterPage } from '@/app/components/ProviderHelpCenterPage';
import { useHelpCenterViewModel } from '../viewModels/useHelpCenterViewModel';

export function HelpCenter() {
  const viewModel = useHelpCenterViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <ProviderHelpCenterPage />
    </motion.div>
  );
}

export default HelpCenter;