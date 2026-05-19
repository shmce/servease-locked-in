import { motion } from 'motion/react';
import { EditServicesPricingPage } from '@/app/components/EditServicesPricingPage';
import { useEditServicesViewModel } from '../viewModels/useEditServicesViewModel';

export function EditServices() {
  const viewModel = useEditServicesViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <EditServicesPricingPage />
    </motion.div>
  );
}

export default EditServices;