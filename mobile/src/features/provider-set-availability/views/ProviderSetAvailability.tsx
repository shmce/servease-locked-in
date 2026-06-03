import { Pressable, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
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
  const availabilityForm = useProviderSetAvailabilityViewModel({
    selectedDate,
    availability,
    apiOptions,
    onScheduleUpdated,
  });
  const { data, actions } = availabilityForm;

  return (
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
        <X color={palette.red} size={18} strokeWidth={2.4} />
      </Pressable>
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
  label: {
    color: '#202733',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slotButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#E7EBEF',
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    width: 72,
  },
  slotButtonSelected: {
    backgroundColor: palette.mintSoft,
    borderColor: '#A7E5C2',
  },
  slotButtonDisabled: {
    opacity: 0.42,
  },
  slotText: {
    color: '#202733',
    fontSize: 12,
    fontWeight: '500',
  },
  slotTextSelected: {
    color: palette.mintDeep,
    fontWeight: '600',
  },
  slotTextDisabled: {
    color: '#A0A7B2',
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
