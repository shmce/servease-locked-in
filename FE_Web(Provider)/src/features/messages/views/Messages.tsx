import { motion } from 'motion/react';
import { MessagesPage } from '@/app/components/MessagesPage';
import { useMessagesViewModel } from '../viewModels/useMessagesViewModel';

export function Messages() {
  const viewModel = useMessagesViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <MessagesPage />
    </motion.div>
  );
}

export default Messages;