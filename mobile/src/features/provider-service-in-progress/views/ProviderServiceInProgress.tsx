import { StyleSheet, Text, View } from 'react-native';
import { Clock, Image as ImageIcon } from 'lucide-react-native';
import {
  BookingSummary,
  BookingTimelineEventSummary,
} from '../../../shared/models/types';
import { palette, spacing } from '../../../theme/serveaseDesign';
import { MediaUploadBox } from '../../../shared/components/ScreenLayout';
import {
  ProviderButton,
  ProviderCard,
  ProviderContent,
  ProviderHeader,
  ProviderScreen,
  ProviderTextField,
  providerText,
} from '../../../shared/components/ProviderUI';
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
    <ProviderScreen>
      <ProviderContent>
        <ProviderHeader
          title="Service in Progress"
          subtitle={data.bookingReference}
          onBack={onBack}
        />
        <ProviderCard style={styles.timerCard}>
          <Clock color={palette.mintDeep} size={28} strokeWidth={2.5} />
          <Text style={styles.timerText}>{data.timerLabel}</Text>
          <Text style={styles.cardMeta}>{data.startedAtLabel}</Text>
        </ProviderCard>
        <ProviderCard>
          <Text style={styles.cardTitle}>{data.serviceTitle}</Text>
          <Text style={styles.cardBody}>{data.addressLabel}</Text>
        </ProviderCard>
        <ProviderCard>
          <ProviderTextField
            label="Progress update"
            value={progressMessage}
            onChangeText={onProgressMessageChange}
            placeholder="Share a quick update for the customer"
            multiline
          />
          <ProviderButton
            label="Send Update"
            variant="secondary"
            onPress={() => void onSendProgressUpdate()}
            disabled={!data.canSendProgressUpdate}
          />
        </ProviderCard>
        <ProviderCard>
          <Text style={styles.cardTitle}>Progress photos</Text>
          <MediaUploadBox
            imageUri={progressPhotoUri}
            icon={<ImageIcon color={palette.mintDeep} size={28} strokeWidth={2.5} />}
            label={data.progressPhotoActionLabel}
            onPress={onPickProgressPhoto}
            minHeight={132}
          />
          {data.progressPhotoUploaded ? (
            <Text style={styles.noticeText}>Progress photo uploaded.</Text>
          ) : null}
        </ProviderCard>
        <View style={styles.actions}>
          <ProviderButton label="Complete Service" onPress={onCompleteService} />
          <ProviderButton
            label="Report Issue"
            variant="danger"
            onPress={onReportIssue}
          />
        </View>
      </ProviderContent>
    </ProviderScreen>
  );
}

const styles = StyleSheet.create({
  timerCard: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  timerText: {
    color: '#202733',
    fontSize: 36,
    fontWeight: '600',
    letterSpacing: 0,
  },
  cardTitle: {
    ...providerText.title,
    fontSize: 15,
    lineHeight: 20,
  },
  cardMeta: {
    ...providerText.meta,
  },
  cardBody: {
    ...providerText.body,
  },
  actions: {
    gap: spacing.sm,
  },
  linkText: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '600',
  },
  noticeText: {
    color: '#6D7480',
    fontSize: 12,
    fontWeight: '500',
  },
});
