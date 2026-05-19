import { motion } from 'motion/react';
import { ProviderReviewsPage } from '@/app/components/ProviderReviewsPage';
import { useReviewsViewModel } from '../viewModels/useReviewsViewModel';

export function Reviews() {
  const viewModel = useReviewsViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <ProviderReviewsPage />
    </motion.div>
  );
}

export default Reviews;