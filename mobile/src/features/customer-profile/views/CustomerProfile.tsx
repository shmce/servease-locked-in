import { ReactNode } from 'react';
import {
  Image,
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Camera, Mail, MapPin, Phone, User } from 'lucide-react-native';
import {
  CustomerCard,
  CustomerContent,
  CustomerHeader,
  CustomerIconBlock,
  CustomerScreen,
  CustomerSection,
  customerText,
} from '../../../shared/components/CustomerUI';
import { CurrentUserProfile } from '../../../shared/models/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
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

function ProfileField({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldRow}>
      <CustomerIconBlock compact>{icon}</CustomerIconBlock>
      <View style={styles.flex}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A7AFB8"
          keyboardType={keyboardType}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : undefined}
        />
      </View>
    </View>
  );
}

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
    <CustomerScreen>
      <CustomerContent>
        <CustomerHeader
          title="My Profile"
          subtitle="Keep your customer details up to date"
          onBack={onBack}
        />

        <CustomerCard>
          <View style={styles.avatarRow}>
            <Pressable
              style={[
                styles.avatarCircle,
                profileView.data.avatarDisabled && styles.avatarCircleDisabled,
              ]}
              onPress={() => void pickCustomerAvatar()}
              disabled={profileView.data.avatarDisabled}
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
                <Camera color={palette.white} size={14} strokeWidth={2.2} />
              </View>
            </Pressable>
            <View style={styles.flex}>
              <Text style={styles.avatarTitle} numberOfLines={1}>
                {profileFullName || 'Customer profile'}
              </Text>
              <Text style={styles.avatarHint}>{profileView.data.avatarHint}</Text>
            </View>
          </View>
        </CustomerCard>

        <CustomerSection title="Personal information">
          <CustomerCard style={styles.formCard}>
            <ProfileField
              icon={<User color={palette.mintDeep} size={18} strokeWidth={2.1} />}
              label="Full name"
              value={profileFullName}
              onChangeText={setProfileFullName}
              placeholder="Your full name"
            />
            <View style={styles.lockedEmailRow}>
              <CustomerIconBlock compact>
                <Mail color={palette.mintDeep} size={18} strokeWidth={2.1} />
              </CustomerIconBlock>
              <View style={styles.flex}>
                <Text style={styles.fieldLabel}>Email address</Text>
                <Text style={styles.lockedValue} numberOfLines={1}>
                  {profileView.data.emailLabel}
                </Text>
              </View>
              <View style={styles.lockedBadge}>
                <Text style={styles.lockedText}>Locked</Text>
              </View>
            </View>
          </CustomerCard>
        </CustomerSection>

        <CustomerSection title="Contact details">
          <CustomerCard style={styles.formCard}>
            <ProfileField
              icon={<Phone color={palette.mintDeep} size={18} strokeWidth={2.1} />}
              label="Phone number"
              value={profileContactNumber}
              onChangeText={setProfileContactNumber}
              keyboardType="phone-pad"
              placeholder="+639000000000"
            />
            <ProfileField
              icon={<MapPin color={palette.mintDeep} size={18} strokeWidth={2.1} />}
              label="Address"
              value={profileAddress}
              onChangeText={setProfileAddress}
              placeholder="Unit, street, city"
              multiline
            />
          </CustomerCard>
        </CustomerSection>

        <Pressable
          style={[styles.saveButton, profileView.isSaving && styles.saveButtonDisabled]}
          onPress={() => void saveProfile()}
          disabled={profileView.isSaving}
          accessibilityRole="button"
        >
          <Text style={styles.saveButtonText}>{profileView.data.saveLabel}</Text>
        </Pressable>

        {profileView.error ? (
          <Text style={styles.errorText}>{profileView.error}</Text>
        ) : null}
      </CustomerContent>
    </CustomerScreen>
  );
}

const styles = StyleSheet.create({
  avatarRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  avatarCircle: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderColor: 'rgba(0,160,85,0.22)',
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 82,
    justifyContent: 'center',
    position: 'relative',
    width: 82,
  },
  avatarCircleDisabled: {
    opacity: 0.6,
  },
  avatarImage: {
    borderRadius: radius.pill,
    height: 82,
    width: 82,
  },
  avatarInitial: {
    color: palette.mintDeep,
    fontSize: 30,
    fontWeight: '600',
    letterSpacing: 0,
  },
  cameraBadge: {
    alignItems: 'center',
    backgroundColor: palette.mintDeep,
    borderColor: palette.white,
    borderRadius: radius.pill,
    borderWidth: 3,
    bottom: -1,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: -1,
    width: 30,
  },
  avatarTitle: {
    ...customerText.title,
    fontSize: 17,
    lineHeight: 23,
  },
  avatarHint: {
    ...customerText.meta,
    marginTop: 2,
  },
  formCard: {
    gap: 0,
    paddingVertical: 0,
  },
  fieldRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 68,
    paddingVertical: spacing.md,
  },
  lockedEmailRow: {
    alignItems: 'center',
    borderTopColor: '#EEF0F2',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 68,
    paddingVertical: spacing.md,
  },
  flex: {
    flex: 1,
    minWidth: 0,
  },
  fieldLabel: {
    ...customerText.meta,
    color: '#7A828D',
  },
  input: {
    ...customerText.body,
    color: '#202733',
    minHeight: 28,
    padding: 0,
  },
  multilineInput: {
    minHeight: 74,
    paddingTop: spacing.xs,
  },
  lockedValue: {
    ...customerText.body,
    color: '#202733',
    marginTop: 2,
  },
  lockedBadge: {
    backgroundColor: '#EEF2F6',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  lockedText: {
    color: '#68717E',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 16,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: palette.mintDeep,
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  saveButtonDisabled: {
    opacity: 0.45,
  },
  saveButtonText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 20,
  },
  errorText: {
    color: palette.red,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    textAlign: 'center',
  },
});
