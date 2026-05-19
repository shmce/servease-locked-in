import { motion } from 'motion/react';
import { NotificationPreferencesPage } from '@/app/components/NotificationPreferencesPage';
import { useNotificationPreferencesViewModel } from '../viewModels/useNotificationPreferencesViewModel';

export function NotificationPreferences() {
  const viewModel = useNotificationPreferencesViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <NotificationPreferencesPage />
    </motion.div>
  );
}

export default NotificationPreferences;