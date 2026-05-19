import { motion } from 'motion/react';
import { OnboardingPage } from '@/app/components/OnboardingPage';
import { useOnboardingViewModel } from '../viewModels/useOnboardingViewModel';

export function Onboarding() {
  const viewModel = useOnboardingViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <OnboardingPage />
    </motion.div>
  );
}

export default Onboarding;