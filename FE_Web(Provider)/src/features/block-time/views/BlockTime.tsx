import { motion } from 'motion/react';
import { BlockTimePage } from '@/app/components/BlockTimePage';
import { useBlockTimeViewModel } from '../viewModels/useBlockTimeViewModel';

export function BlockTime() {
  const viewModel = useBlockTimeViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <BlockTimePage />
    </motion.div>
  );
}

export default BlockTime;