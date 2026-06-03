import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Camera, Mail } from 'lucide-react-native';
import {
  Field,
  PrimaryButton,
  TopBar,
} from '../../../components/DesignKit';
import { CurrentUserProfile } from '../../../shared/models/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import {
  ScreenContent,
  ScreenScroll,
} from '../../../shared/components/ScreenLayout';
import { useCustomerProfileViewModel } from '../viewModels/useCustomerProfileViewModel';

type CustomerProfileScreenProps = {
  profile: CurrentUserProfile | null;
  customerAvatarUri: string | null;
  profileFullName: string;
  profileContactNumber: string;
  profileAddress: string;
  busyAction: string | null;
  onBack: () => void;
  setProfileFullName: (value: string) => void;
  setProfileContactNumber: (value: string) => void;
  setProfileAddress: (value: string) => void;
  pickCustomerAvatar: () => Promise<void>;
  saveProfile: () => Promise<void>;
};

export function CustomerProfileScreen({
  profile,
  customerAvatarUri,
  profileFullName,
  profileContactNumber,
  profileAddress,
  busyAction,
  onBack,
  setProfileFullName,
  setProfileContactNumber,
  setProfileAddress,
  pickCustomerAvatar,
  saveProfile,
}: CustomerProfileScreenProps) {
  const profileView = useCustomerProfileViewModel({
    profile,
    customerAvatarUri,
    busyAction,
  });

  return (
    <>
      <TopBar title="My Profile" onBack={onBack} />
      <ScreenScroll>
        <ScreenContent>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <Pressable
              style={styles.avatarCircle}
              onPress={() => void pickCustomerAvatar()}
              accessibilityRole="button"
              accessibilityLabel="Update profile photo"
            >
              {profileView.data.avatarUri ? (
                <Image
                  source={{ uri: profileView.data.avatarUri }}
                  style={styles.avatarImage}
                  accessibilityLabel="Profile photo"
                />
              ) : (
                <Text style={styles.avatarInitial}>
                  {profileView.data.avatarInitial}
                </Text>
              )}
              <View style={styles.cameraBadge}>
                <Camera color={palette.white} size={14} />
              </View>
            </Pressable>
            <Text style={styles.avatarHint}>Stored on this device only</Text>
          </View>

          {/* Personal info section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>Personal Information</Text>
            <View style={styles.formCard}>
              <Field
                label="Full Name"
                value={profileFullName}
                onChangeText={setProfileFullName}
                placeholder="Your full name"
              />
              <View style={styles.emailRow}>
                <Mail color={palette.faint} size={18} strokeWidth={2} />
                <View style={styles.flex}>
                  <Text style={styles.fieldLabel}>Email Address</Text>
                  <Text style={styles.fieldValue}>{profileView.data.emailLabel}</Text>
                </View>
                <View style={styles.lockedBadge}>
                  <Text style={styles.lockedText}>Locked</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Contact section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>Contact Details</Text>
            <View style={styles.formCard}>
              <Field
                label="Phone Number"
                value={profileContactNumber}
                onChangeText={setProfileContactNumber}
                keyboardType="phone-pad"
                placeholder="+639000000000"
              />
              <Field
                label="Address"
                value={profileAddress}
                onChangeText={setProfileAddress}
                placeholder="Unit, street, city"
                multiline
              />
            </View>
          </View>

          <PrimaryButton
            label={profileView.data.saveLabel}
            onPress={() => void saveProfile()}
            disabled={profileView.isSaving}
          />
          {profileView.error ? (
            <Text style={styles.errorText}>{profileView.error}</Text>
          ) : null}

        </ScreenContent>
      </ScreenScroll>
    </>
  );
}

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  avatarCircle: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 96,
    justifyContent: 'center',
    position: 'relative',
    width: 96,
  },
  avatarImage: {
    borderRadius: radius.pill,
    height: 96,
    width: 96,
  },
  avatarInitial: {
    color: palette.white,
    fontSize: 40,
    fontWeight: '900',
  },
  cameraBadge: {
    alignItems: 'center',
    backgroundColor: palette.mintDark,
    borderColor: palette.white,
    borderRadius: radius.pill,
    borderWidth: 3,
    bottom: 0,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 32,
  },
  avatarHint: {
    color: palette.faint,
    fontSize: 13,
    fontWeight: '500',
  },

  formSection: {
    gap: spacing.sm,
  },
  sectionLabel: {
    color: palette.faint,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    paddingHorizontal: spacing.xs,
    textTransform: 'uppercase',
  },
  formCard: {
    gap: spacing.md,
    overflow: 'hidden',
  },
  flex: { flex: 1 },

  emailRow: {
    alignItems: 'center',
    borderTopColor: palette.lineSoft,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.base,
    minHeight: 64,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  fieldLabel: {
    color: palette.faint,
    fontSize: 12,
    fontWeight: '500',
  },
  fieldValue: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  lockedBadge: {
    backgroundColor: palette.lineSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  lockedText: {
    color: palette.faint,
    fontSize: 11,
    fontWeight: '700',
  },

  errorText: {
    color: palette.red,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    textAlign: 'center',
  },
});
