import { motion } from 'motion/react';
import { ProviderProfilePage } from '@/app/components/ProviderProfilePage';
import { useProfileViewModel } from '../viewModels/useProfileViewModel';

export function Profile() {
  const viewModel = useProfileViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <ProviderProfilePage />
    </motion.div>
  );
}

export default Profile;