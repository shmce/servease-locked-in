import { motion } from 'motion/react';
import { CalendarPage } from '@/app/components/CalendarPage';
import { useCalendarViewModel } from '../viewModels/useCalendarViewModel';

export function Calendar() {
  const viewModel = useCalendarViewModel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      data-view-model-loading={viewModel.isLoading}
      data-view-model-error={viewModel.error ?? undefined}
    >
      <CalendarPage />
    </motion.div>
  );
}

export default Calendar;