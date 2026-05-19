import { motion } from 'motion/react';
import { PayoutPage } from '@/app/components/PayoutPage';
import { usePayoutViewModel } from '../viewModels/usePayoutViewModel';

export function Payout() {
  const viewModel = usePayoutViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <PayoutPage />
    </motion.div>
  );
}

export default Payout;