import { motion } from 'motion/react';
import { ProviderSettingsPage } from '@/app/components/ProviderSettingsPage';
import { useSettingsViewModel } from '../viewModels/useSettingsViewModel';

export function Settings() {
  const viewModel = useSettingsViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <ProviderSettingsPage />
    </motion.div>
  );
}

export default Settings;