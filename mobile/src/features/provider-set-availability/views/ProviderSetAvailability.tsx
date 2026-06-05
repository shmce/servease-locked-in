import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ChevronRight, Clock, X } from 'lucide-react-native';
import {
  MotionPressable,
  MotionView,
  StaggeredMotionView,
} from '../../../components/Motion';
import {
  ApiOptions,
  ProviderAvailabilitySchedule,
} from '../../../shared/models/types';
import {
  ProviderButton,
  ProviderCard,
  ProviderContent,
  ProviderEmptyState,
  ProviderHeader,
  ProviderScreen,
  ProviderSection,
  ProviderTextField,
  providerText,
} from '../../../shared/components/ProviderUI';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { useProviderSetAvailabilityViewModel } from '../viewModels/useProviderSetAvailabilityViewModel';

type ProviderSetAvailabilityScreenProps = {
  selectedDate: string;
  availability: ProviderAvailabilitySchedule | null;
  apiOptions: ApiOptions;
  onScheduleUpdated: (schedule: ProviderAvailabilitySchedule) => void;
  onBack: () => void;
};

export function ProviderSetAvailabilityScreen({
  selectedDate,
  availability,
  apiOptions,
  onScheduleUpdated,
  onBack,
}: ProviderSetAvailabilityScreenProps) {
  const [activeTimePicker, setActiveTimePicker] = useState<'start' | 'end' | null>(
    null,
  );
  const availabilityForm = useProviderSetAvailabilityViewModel({
    selectedDate,
    availability,
    apiOptions,
    onScheduleUpdated,
  });
  const { data, actions } = availabilityForm;
  const pickerOptions =
    activeTimePicker === 'end' ? data.endOptions : data.bookingTimeSlots;
  const pickerTitle = activeTimePicker === 'end' ? 'End time' : 'Start time';
  const pickerSelectedTime =
    activeTimePicker === 'end' ? data.endTime : data.startTime;

  function handleTimeSelected(time: string) {
    if (activeTimePicker === 'start') {
      actions.setStartTime(time);
      const nextEnd = data.timeOffEndSlots.find((option) => option > time);
      actions.setEndTime(nextEnd ?? time);
    } else if (activeTimePicker === 'end') {
      actions.setEndTime(time);
    }

    setActiveTimePicker(null);
  }

  return (
    <>
      <ProviderScreen>
        <ProviderContent>
          <ProviderHeader
            title={selectedDate}
            subtitle="Block availability for this date"
            onBack={onBack}
          />

        <ProviderSection title="Block Time">
          <ProviderCard>
            {data.isTooSoon ? (
              <Text style={styles.warningText}>{data.leadTimeMessage}</Text>
            ) : null}
            <View style={styles.segmentedControl}>
              <ModeButton
                label="Block whole day"
                selected={data.mode === 'whole-day'}
                onPress={() => actions.setMode('whole-day')}
              />
              <ModeButton
                label="Block specific time"
                selected={data.mode === 'specific-time'}
                onPress={() => actions.setMode('specific-time')}
              />
            </View>

            {data.mode === 'specific-time' ? (
              <>
                <TimeRow
                  label="Start time"
                  value={data.startTime}
                  onPress={() => setActiveTimePicker('start')}
                />
                <View style={styles.rowDivider} />
                <TimeRow
                  label="End time"
                  value={data.endTime}
                  onPress={() => setActiveTimePicker('end')}
                />
              </>
            ) : null}

            <ProviderTextField
              label="Reason"
              value={data.reason}
              onChangeText={actions.setReason}
              placeholder="Optional"
            />
            <ProviderButton
              label="Save block"
              onPress={() => void actions.saveBlock()}
              disabled={!data.canSubmit}
            />
            {data.notice ? <Text style={styles.noticeText}>{data.notice}</Text> : null}
          </ProviderCard>
        </ProviderSection>

        <ProviderSection title="Existing Blocks">
          {data.selectedDayOff ? (
            <ProviderCard>
              <BlockRow
                title="Whole day off"
                subtitle={data.selectedDayOff.reason ?? 'No reason added'}
                disabled={availabilityForm.isLoading}
                onDelete={() => void actions.deleteDayOff()}
              />
            </ProviderCard>
          ) : null}
          {data.selectedTimeOffWindows.map((window) => (
            <ProviderCard key={window.id}>
              <BlockRow
                title={`${window.startTime} to ${window.endTime}`}
                subtitle={window.reason ?? 'Partial time block'}
                disabled={availabilityForm.isLoading}
                onDelete={() => void actions.deleteTimeOffWindow(window.id)}
              />
            </ProviderCard>
          ))}
          {!data.selectedDayOff && !data.selectedTimeOffWindows.length ? (
            <ProviderEmptyState
              title="No blocks for this date"
              body="Your calendar is open unless you add a whole-day or specific-time block."
            />
          ) : null}
        </ProviderSection>
        </ProviderContent>
      </ProviderScreen>
      <TimePickerModal
        visible={activeTimePicker !== null}
        title={pickerTitle}
        times={pickerOptions}
        selectedTime={pickerSelectedTime}
        onSelect={handleTimeSelected}
        onDismiss={() => setActiveTimePicker(null)}
      />
    </>
  );
}

function ModeButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.segment, selected && styles.segmentSelected]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

function TimeRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.timeRow}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Choose ${label.toLowerCase()}`}
    >
      <Clock color={palette.mintDeep} size={17} strokeWidth={2.2} />
      <Text style={styles.timeRowLabel}>{label}</Text>
      <Text style={styles.timeRowValue}>{value}</Text>
      <ChevronRight color={palette.faint} size={17} strokeWidth={2.2} />
    </Pressable>
  );
}

function TimePickerModal({
  visible,
  title,
  times,
  selectedTime,
  onSelect,
  onDismiss,
}: {
  visible: boolean;
  title: string;
  times: string[];
  selectedTime: string;
  onSelect: (time: string) => void;
  onDismiss: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.modalBackdrop} onPress={onDismiss}>
        <Pressable onPress={() => undefined}>
          <MotionView style={styles.modalSheet} variant="sheet">
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{title}</Text>
            <ScrollView
              style={styles.modalList}
              contentContainerStyle={styles.modalListContent}
              showsVerticalScrollIndicator={false}
            >
              {times.map((time, index) => {
                const selected = time === selectedTime;
                return (
                  <StaggeredMotionView
                    key={time}
                    index={index}
                    variant="listItem"
                  >
                    <MotionPressable
                      contentStyle={[
                        styles.modalOption,
                        selected && styles.modalOptionSelected,
                      ]}
                      onPress={() => onSelect(time)}
                      selected={selected}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={`Set time to ${time}`}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          selected && styles.modalOptionTextSelected,
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.82}
                      >
                        {time}
                      </Text>
                    </MotionPressable>
                  </StaggeredMotionView>
                );
              })}
            </ScrollView>
          </MotionView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function BlockRow({
  title,
  subtitle,
  disabled,
  onDelete,
}: {
  title: string;
  subtitle: string;
  disabled: boolean;
  onDelete: () => void;
}) {
  return (
    <View style={styles.blockRow}>
      <View style={styles.flex}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardMeta}>{subtitle}</Text>
      </View>
      <MotionPressable
        contentStyle={styles.deleteButton}
        onPress={onDelete}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${title}`}
      >
        <X color={palette.red} size={18} strokeWidth={2.4} />
      </MotionPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  warningText: {
    backgroundColor: '#FEECEC',
    borderRadius: radius.md,
    color: '#C2413D',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    padding: spacing.md,
  },
  segmentedControl: {
    backgroundColor: '#F8FAF9',
    borderColor: '#EEF0F2',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
  },
  segment: {
    alignItems: 'center',
    borderRadius: radius.sm,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.sm,
  },
  segmentSelected: {
    backgroundColor: palette.white,
    borderColor: '#A7E5C2',
    borderWidth: 1,
  },
  segmentText: {
    color: '#7A828D',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    textAlign: 'center',
  },
  segmentTextSelected: {
    color: palette.mintDeep,
    fontWeight: '600',
  },
  timeRow: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#E7EBEF',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 50,
    paddingHorizontal: spacing.base,
  },
  timeRowLabel: {
    color: '#202733',
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
  },
  timeRowValue: {
    color: palette.mintDeep,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
  },
  rowDivider: {
    backgroundColor: '#EEF0F2',
    height: 1,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.42)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: palette.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '72%',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  modalHandle: {
    alignSelf: 'center',
    backgroundColor: '#D8DEE5',
    borderRadius: radius.pill,
    height: 4,
    marginBottom: spacing.md,
    width: 38,
  },
  modalTitle: {
    color: '#202733',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0,
    marginBottom: spacing.md,
  },
  modalList: {
    maxHeight: 320,
  },
  modalListContent: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  modalOption: {
    alignItems: 'center',
    borderColor: '#E7EBEF',
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.base,
  },
  modalOptionSelected: {
    backgroundColor: palette.mintSoft,
    borderColor: '#A7E5C2',
  },
  modalOptionText: {
    color: '#202733',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
  },
  modalOptionTextSelected: {
    color: palette.mintDeep,
  },
  noticeText: {
    ...providerText.meta,
  },
  blockRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardTitle: {
    color: '#202733',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  cardMeta: {
    ...providerText.meta,
    marginTop: spacing.xs,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: '#FEECEC',
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});
