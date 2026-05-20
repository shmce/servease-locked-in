import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Clock, Image as ImageIcon } from 'lucide-react-native';
import {
  Card,
  Field,
  PrimaryButton,
  TopBar,
} from '../../../components/DesignKit';
import {
  BookingSummary,
  BookingTimelineEventSummary,
} from '../../../shared/models/types';
import { palette, radius, spacing, type } from '../../../theme/serveaseDesign';
import { MediaUploadBox } from '../../../shared/components/ScreenLayout';
import { useProviderServiceInProgressViewModel } from '../viewModels/useProviderServiceInProgressViewModel';

type ProviderServiceInProgressScreenProps = {
  booking: BookingSummary;
  busyAction: string | null;
  nowTick: number;
  progressMessage: string;
  progressPhotoUri: string | null;
  progressPhotoUrl: string | null;
  timelineEvents: BookingTimelineEventSummary[];
  onBack: () => void;
  onCompleteService: () => void;
  onPickProgressPhoto: () => void;
  onProgressMessageChange: (message: string) => void;
  onReportIssue: () => void;
  onSendProgressUpdate: () => Promise<void>;
};

export function ProviderServiceInProgressScreen({
  booking,
  busyAction,
  nowTick,
  progressMessage,
  progressPhotoUri,
  progressPhotoUrl,
  timelineEvents,
  onBack,
  onCompleteService,
  onPickProgressPhoto,
  onProgressMessageChange,
  onReportIssue,
  onSendProgressUpdate,
}: ProviderServiceInProgressScreenProps) {
  const serviceInProgress = useProviderServiceInProgressViewModel({
    booking,
    busyAction,
    nowTick,
    progressMessage,
    progressPhotoUri,
    progressPhotoUrl,
    timelineEvents,
  });
  const { data } = serviceInProgress;

  return (
    <>
      <TopBar
        title="Service in Progress"
        subtitle={data.bookingReference}
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <View style={styles.timerCard}>
            <Clock color={palette.mint} size={28} strokeWidth={2.5} />
            <Text style={styles.timerText}>{data.timerLabel}</Text>
            <Text style={styles.cardMeta}>{data.startedAtLabel}</Text>
          </View>
          <Card>
            <Text style={styles.cardTitle}>{data.serviceTitle}</Text>
            <Text style={styles.cardBody}>{data.addressLabel}</Text>
          </Card>
          <Card>
            <Field
              label="Progress update"
              value={progressMessage}
              onChangeText={onProgressMessageChange}
              placeholder="Share a quick update for the customer"
              multiline
            />
            <PrimaryButton
              label="Send Update"
              variant="secondary"
              onPress={() => void onSendProgressUpdate()}
              disabled={!data.canSendProgressUpdate}
            />
          </Card>
          <Card>
            <Text style={styles.cardTitle}>Progress photos</Text>
            <MediaUploadBox
              imageUri={progressPhotoUri}
              icon={<ImageIcon color={palette.mint} size={28} strokeWidth={2.5} />}
              label={data.progressPhotoActionLabel}
              onPress={onPickProgressPhoto}
              minHeight={132}
            />
            {data.progressPhotoUploaded ? (
              <Text style={styles.noticeText}>Progress photo uploaded.</Text>
            ) : null}
          </Card>
          <View style={styles.actions}>
            <PrimaryButton label="Complete Service" onPress={onCompleteService} />
            <PrimaryButton
              label="Report Issue"
              variant="danger"
              onPress={onReportIssue}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  withBottomNav: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 108,
  },
  content: {
    gap: spacing.md,
    padding: spacing.md,
  },
  timerCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    gap: spacing.xs,
    padding: spacing.md,
  },
  timerText: {
    color: palette.ink,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 0,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  cardMeta: {
    ...type.caption,
    color: palette.muted,
  },
  cardBody: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  actions: {
    gap: spacing.sm,
  },
  linkText: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '900',
  },
  noticeText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
  },
});
