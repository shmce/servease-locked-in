import { motion } from 'motion/react';
import { PayoutConfirmationPage } from '@/app/components/PayoutConfirmationPage';
import { usePayoutConfirmationViewModel } from '../viewModels/usePayoutConfirmationViewModel';

export function PayoutConfirmation() {
  const viewModel = usePayoutConfirmationViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <PayoutConfirmationPage />
    </motion.div>
  );
}

export default PayoutConfirmation;