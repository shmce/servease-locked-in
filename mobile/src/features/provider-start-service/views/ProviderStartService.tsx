import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Camera, CheckCircle } from 'lucide-react-native';
import {
  Card,
  Field,
  PrimaryButton,
  TopBar,
} from '../../../components/DesignKit';
import { BookingSummary } from '../../../shared/models/types';
import { palette, radius, spacing, type } from '../../../theme/serveaseDesign';
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
      <TopBar
        title="Start Service"
        subtitle={data.bookingReference}
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.withStickyFooter}>
        <View style={styles.content}>
          <Card>
            <Text style={styles.operationalTitle}>Ready to Start Service?</Text>
            <Text style={styles.cardBody}>
              Confirm the scope and document the starting condition before beginning work.
            </Text>
          </Card>
          <Card>
            <Text style={styles.cardTitle}>{data.serviceTitle}</Text>
            <Text style={styles.cardMeta}>{data.scheduleLabel}</Text>
            <Text style={styles.cardBody}>{data.addressLabel}</Text>
          </Card>
          <Card>
            <Text style={styles.cardTitle}>Pre-service checklist</Text>
            {data.checklistRows.map((row) => (
              <ChecklistRow
                key={row.key}
                checked={row.checked}
                label={row.label}
                onPress={() => onToggleChecklist(row.key)}
              />
            ))}
          </Card>
          <Card>
            <Text style={styles.cardTitle}>Before photo</Text>
            <Pressable
              style={styles.uploadBox}
              onPress={onPickBeforePhoto}
              accessibilityRole="button"
            >
              {beforePhotoUri ? (
                <Image source={{ uri: beforePhotoUri }} style={styles.uploadPreview} />
              ) : (
                <Camera color={palette.mint} size={28} strokeWidth={2.5} />
              )}
              <Text style={styles.linkText}>{data.beforePhotoActionLabel}</Text>
            </Pressable>
            {data.startingConditionUploaded ? (
              <Text style={styles.noticeText}>Starting condition photo uploaded.</Text>
            ) : null}
            <Field
              label="Photo note"
              value={photoCaption}
              onChangeText={onPhotoCaptionChange}
              placeholder="Example: Kitchen sink before repair"
            />
          </Card>
        </View>
      </ScrollView>
      <View style={styles.stickyFooter}>
        <PrimaryButton
          label="Start Service"
          onPress={() => void onStartService()}
          disabled={data.startDisabled}
        />
        <Text style={styles.footerLink} onPress={onBack}>
          Back to booking
        </Text>
        <View style={styles.footerHomeIndicator} />
      </View>
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
  withStickyFooter: {
    backgroundColor: palette.white,
    flexGrow: 1,
    paddingBottom: 132,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xl,
  },
  stickyFooter: {
    alignSelf: 'center',
    backgroundColor: palette.white,
    borderTopColor: palette.lineSoft,
    borderTopWidth: 1,
    bottom: 0,
    gap: spacing.sm,
    left: 0,
    maxWidth: 393,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    position: 'absolute',
    right: 0,
    width: '100%',
  },
  footerLink: {
    color: palette.mint,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  footerHomeIndicator: {
    alignSelf: 'center',
    backgroundColor: '#111111',
    borderRadius: radius.pill,
    height: 4,
    marginTop: spacing.xs,
    opacity: 0.18,
    width: 96,
  },
  uploadBox: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: palette.line,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    borderWidth: 2,
    gap: spacing.sm,
    minHeight: 160,
    paddingVertical: spacing.xxl,
  },
  uploadPreview: {
    borderRadius: radius.md,
    height: 120,
    width: '100%',
  },
  operationalTitle: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: '900',
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
    backgroundColor: palette.mint,
    borderColor: palette.mint,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  cardMeta: {
    ...type.caption,
    color: palette.muted,
  },
  cardBody: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
  },
  radioLabel: {
    color: palette.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
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
