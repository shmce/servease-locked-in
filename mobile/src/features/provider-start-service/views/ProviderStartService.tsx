import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Camera, CheckCircle } from 'lucide-react-native';
import { BookingSummary } from '../../../shared/models/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { MediaUploadBox } from '../../../shared/components/ScreenLayout';
import {
  ProviderButton,
  ProviderCard,
  ProviderContent,
  ProviderHeader,
  ProviderScreen,
  ProviderStickyFooter,
  ProviderTextField,
  providerText,
} from '../../../shared/components/ProviderUI';
import {
  ProviderStartChecklistKey,
  ProviderStartChecklistState,
  useProviderStartServiceViewModel,
} from '../viewModels/useProviderStartServiceViewModel';

type ProviderStartServiceScreenProps = {
  booking: BookingSummary;
  checklist: ProviderStartChecklistState;
  photoCaption: string;
  beforePhotoUri: string | null;
  beforePhotoUrl: string | null;
  busyAction: string | null;
  onBack: () => void;
  onToggleChecklist: (key: ProviderStartChecklistKey) => void;
  onPickBeforePhoto: () => void;
  onPhotoCaptionChange: (caption: string) => void;
  onStartService: () => Promise<void>;
};

export function ProviderStartServiceScreen({
  booking,
  checklist,
  photoCaption,
  beforePhotoUri,
  beforePhotoUrl,
  busyAction,
  onBack,
  onToggleChecklist,
  onPickBeforePhoto,
  onPhotoCaptionChange,
  onStartService,
}: ProviderStartServiceScreenProps) {
  const startService = useProviderStartServiceViewModel({
    booking,
    checklist,
    beforePhotoUri,
    beforePhotoUrl,
    busyAction,
  });
  const { data } = startService;

  return (
    <>
      <ProviderScreen bottomInset={148}>
        <ProviderContent>
          <ProviderHeader
            title="Start Service"
            subtitle={data.bookingReference}
            onBack={onBack}
          />
          <ProviderCard>
            <Text style={styles.operationalTitle}>Ready to Start Service?</Text>
            <Text style={styles.cardBody}>
              Confirm the scope and document the starting condition before beginning work.
            </Text>
          </ProviderCard>
          <ProviderCard>
            <Text style={styles.cardTitle}>{data.serviceTitle}</Text>
            <Text style={styles.cardMeta}>{data.scheduleLabel}</Text>
            <Text style={styles.cardBody}>{data.addressLabel}</Text>
            {data.servicePinLabel ? (
              <Text style={styles.cardMeta}>{data.servicePinLabel}</Text>
            ) : null}
          </ProviderCard>
          <ProviderCard>
            <Text style={styles.cardTitle}>Pre-service checklist</Text>
            {data.checklistRows.map((row) => (
              <ChecklistRow
                key={row.key}
                checked={row.checked}
                label={row.label}
                onPress={() => onToggleChecklist(row.key)}
              />
            ))}
          </ProviderCard>
          <ProviderCard>
            <Text style={styles.cardTitle}>Before photo</Text>
            <MediaUploadBox
              imageUri={beforePhotoUri}
              icon={<Camera color={palette.mintDeep} size={28} strokeWidth={2.5} />}
              label={data.beforePhotoActionLabel}
              onPress={onPickBeforePhoto}
              minHeight={132}
              previewHeight={120}
            />
            {data.startingConditionUploaded ? (
              <Text style={styles.noticeText}>Starting condition photo uploaded.</Text>
            ) : null}
            <ProviderTextField
              label="Photo note"
              value={photoCaption}
              onChangeText={onPhotoCaptionChange}
              placeholder="Example: Kitchen sink before repair"
            />
          </ProviderCard>
        </ProviderContent>
      </ProviderScreen>
      <ProviderStickyFooter>
        <ProviderButton
          label="Start Service"
          onPress={() => void onStartService()}
          disabled={data.startDisabled}
        />
        <Text style={styles.footerLink} onPress={onBack}>
          Back to booking
        </Text>
      </ProviderStickyFooter>
    </>
  );
}

function ChecklistRow({
  label,
  checked,
  onPress,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.checklistRow} onPress={onPress} accessibilityRole="button">
      <View style={[styles.checkboxBox, checked && styles.checkboxBoxChecked]}>
        {checked ? <CheckCircle color={palette.white} size={16} strokeWidth={3} /> : null}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  footerLink: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  operationalTitle: {
    color: '#202733',
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 30,
  },
  checklistRow: {
    alignItems: 'center',
    borderBottomColor: palette.lineSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 52,
  },
  checkboxBox: {
    alignItems: 'center',
    borderColor: palette.line,
    borderRadius: radius.sm,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  checkboxBoxChecked: {
    backgroundColor: palette.mintDeep,
    borderColor: palette.mintDeep,
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
  radioLabel: {
    color: '#202733',
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
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
