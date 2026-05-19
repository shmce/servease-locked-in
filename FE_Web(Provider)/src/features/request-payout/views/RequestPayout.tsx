import { motion } from 'motion/react';
import { RequestPayoutPage } from '@/app/components/RequestPayoutPage';
import { useRequestPayoutViewModel } from '../viewModels/useRequestPayoutViewModel';

export function RequestPayout() {
  const viewModel = useRequestPayoutViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <RequestPayoutPage />
    </motion.div>
  );
}

export default RequestPayout;