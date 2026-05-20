import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import {
  ApiOptions,
  ProviderAvailabilitySchedule,
} from '../../../shared/models/types';
import {
  Card,
  Field,
  PrimaryButton,
  Section,
  TopBar,
} from '../../../components/DesignKit';
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
  const availabilityForm = useProviderSetAvailabilityViewModel({
    selectedDate,
    availability,
    apiOptions,
    onScheduleUpdated,
  });
  const { data, actions } = availabilityForm;

  return (
    <>
      <TopBar
        title={selectedDate}
        subtitle="Block availability for this date"
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <Section title="Block time">
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
                <Text style={styles.label}>Start time</Text>
                <View style={styles.slotGrid}>
                  {data.bookingTimeSlots.map((slot) => (
                    <SlotButton
                      key={slot}
                      label={slot}
                      selected={slot === data.startTime}
                      onPress={() => {
                        actions.setStartTime(slot);
                        const nextEnd = data.timeOffEndSlots.find(
                          (option) => option > slot,
                        );
                        actions.setEndTime(nextEnd ?? slot);
                      }}
                    />
                  ))}
                </View>
                <Text style={styles.label}>End time</Text>
                <View style={styles.slotGrid}>
                  {data.timeOffEndSlots.map((slot) => (
                    <SlotButton
                      key={slot}
                      label={slot}
                      selected={slot === data.endTime}
                      disabled={slot <= data.startTime}
                      onPress={() => actions.setEndTime(slot)}
                    />
                  ))}
                </View>
              </>
            ) : null}

            <Field
              label="Reason"
              value={data.reason}
              onChangeText={actions.setReason}
              placeholder="Optional"
            />
            <PrimaryButton
              label="Save block"
              onPress={() => void actions.saveBlock()}
              disabled={!data.canSubmit}
            />
            {data.notice ? <Text style={styles.noticeText}>{data.notice}</Text> : null}
          </Section>

          <Section title="Existing blocks">
            {data.selectedDayOff ? (
              <Card>
                <BlockRow
                  title="Whole day off"
                  subtitle={data.selectedDayOff.reason ?? 'No reason added'}
                  disabled={availabilityForm.isLoading}
                  onDelete={() => void actions.deleteDayOff()}
                />
              </Card>
            ) : null}
            {data.selectedTimeOffWindows.map((window) => (
              <Card key={window.id}>
                <BlockRow
                  title={`${window.startTime} to ${window.endTime}`}
                  subtitle={window.reason ?? 'Partial time block'}
                  disabled={availabilityForm.isLoading}
                  onDelete={() => void actions.deleteTimeOffWindow(window.id)}
                />
              </Card>
            ))}
            {!data.selectedDayOff && !data.selectedTimeOffWindows.length ? (
              <Text style={styles.emptyText}>No blocks for this date.</Text>
            ) : null}
          </Section>
        </View>
      </ScrollView>
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

function SlotButton({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.slotButton,
        selected && styles.slotButtonSelected,
        disabled && styles.slotButtonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
    >
      <Text
        style={[
          styles.slotText,
          selected && styles.slotTextSelected,
          disabled && styles.slotTextDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
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
      <Pressable
        style={styles.deleteButton}
        onPress={onDelete}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${title}`}
      >
        <X color={palette.red} size={18} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  withBottomNav: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 108,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xl,
  },
  warningText: {
    backgroundColor: '#FEF2F2',
    borderRadius: radius.sm,
    color: palette.red,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    padding: spacing.md,
  },
  segmentedControl: {
    backgroundColor: palette.surface,
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
  },
  segment: {
    alignItems: 'center',
    borderRadius: radius.sm,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  segmentSelected: {
    backgroundColor: palette.white,
  },
  segmentText: {
    color: palette.faint,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  segmentTextSelected: {
    color: palette.ink,
  },
  label: {
    color: palette.body,
    fontSize: 13,
    fontWeight: '900',
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slotButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.sm,
    borderWidth: 1,
    minHeight: 38,
    justifyContent: 'center',
    width: 72,
  },
  slotButtonSelected: {
    backgroundColor: palette.mint,
    borderColor: palette.mint,
  },
  slotButtonDisabled: {
    opacity: 0.42,
  },
  slotText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  slotTextSelected: {
    color: palette.white,
  },
  slotTextDisabled: {
    color: palette.faint,
  },
  noticeText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  emptyText: {
    color: palette.faint,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  blockRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  cardMeta: {
    color: palette.faint,
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});
