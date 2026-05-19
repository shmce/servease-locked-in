import { motion } from 'motion/react';
import { LoginPage } from '@/app/components/LoginPage';
import { useLoginViewModel } from '../viewModels/useLoginViewModel';

export function Login() {
  const viewModel = useLoginViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <LoginPage />
    </motion.div>
  );
}

export default Login;