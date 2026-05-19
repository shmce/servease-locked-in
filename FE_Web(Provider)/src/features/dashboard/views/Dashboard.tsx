import { motion } from 'motion/react';
import { DashboardPage } from '@/app/components/DashboardPage';
import { useDashboardViewModel } from '../viewModels/useDashboardViewModel';

export function Dashboard() {
  const viewModel = useDashboardViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <DashboardPage />
    </motion.div>
  );
}

export default Dashboard;