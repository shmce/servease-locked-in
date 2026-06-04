import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Camera } from 'lucide-react-native';
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
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { CurrentUserProfile } from '../../../shared/models/types';
import { useProviderEditProfileViewModel } from '../viewModels/useProviderEditProfileViewModel';

type ProviderEditProfileScreenProps = {
  profile: CurrentUserProfile | null;
  busyAction: string | null;
  profileAvatarUri?: string | null;
  profileFullName: string;
  profileContactNumber: string;
  profileBusinessName: string;
  onBack: () => void;
  onFullNameChange: (value: string) => void;
  onContactNumberChange: (value: string) => void;
  onBusinessNameChange: (value: string) => void;
  onPickAvatar: () => void;
  onSaveProfile: () => void;
};

export function ProviderEditProfileScreen({
  profile,
  busyAction,
  profileAvatarUri,
  profileFullName,
  profileContactNumber,
  profileBusinessName,
  onBack,
  onFullNameChange,
  onContactNumberChange,
  onBusinessNameChange,
  onPickAvatar,
  onSaveProfile,
}: ProviderEditProfileScreenProps) {
  const editProfile = useProviderEditProfileViewModel({
    profile,
    profileAvatarUri,
    busyAction,
  });
  const { data } = editProfile;

  return (
    <>
      <ProviderScreen bottomInset={148}>
        <ProviderContent>
          <ProviderHeader
            title="Edit Profile"
            subtitle="Update account and business details"
            onBack={onBack}
          />
          <ProviderCard>
            <View style={styles.avatarRow}>
              <Pressable
                style={[
                  styles.avatarCircle,
                  data.avatarDisabled && styles.avatarCircleDisabled,
                ]}
                onPress={onPickAvatar}
                disabled={data.avatarDisabled}
                accessibilityRole="button"
                accessibilityLabel="Update profile photo"
              >
                {data.avatarUri ? (
                  <Image
                    source={{ uri: data.avatarUri }}
                    style={styles.avatarImage}
                    accessibilityLabel="Profile photo"
                  />
                ) : (
                  <Text style={styles.avatarInitial}>{data.avatarInitial}</Text>
                )}
                <View style={styles.cameraBadge}>
                  <Camera color="#FFFFFF" size={14} strokeWidth={2.2} />
                </View>
              </Pressable>
              <View style={styles.avatarCopy}>
                <Text style={styles.avatarTitle} numberOfLines={1}>
                  {profileFullName || 'Provider profile'}
                </Text>
                <Text style={styles.avatarHint}>{data.avatarHint}</Text>
              </View>
            </View>
            <ProviderTextField
              label="Full Name"
              value={profileFullName}
              onChangeText={onFullNameChange}
              placeholder="Your full name"
            />
            <ProviderTextField
              label="Phone Number"
              value={profileContactNumber}
              onChangeText={onContactNumberChange}
              keyboardType="phone-pad"
              placeholder="+639000000000"
            />
            <ProviderTextField
              label="Business Name"
              value={profileBusinessName}
              onChangeText={onBusinessNameChange}
              placeholder="Your provider business name"
            />
            <Text style={styles.noticeText}>{data.notice}</Text>
          </ProviderCard>
        </ProviderContent>
      </ProviderScreen>
      <ProviderStickyFooter>
        <ProviderButton
          label={data.saveButtonLabel}
          onPress={onSaveProfile}
          disabled={!data.canSave}
        />
        <Text style={styles.footerLink} onPress={onBack}>
          Back to profile
        </Text>
      </ProviderStickyFooter>
    </>
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
    borderColor: '#FFFFFF',
    borderRadius: radius.pill,
    borderWidth: 3,
    bottom: -1,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: -1,
    width: 30,
  },
  avatarCopy: {
    flex: 1,
  },
  avatarTitle: {
    ...providerText.title,
    fontSize: 17,
    lineHeight: 23,
  },
  avatarHint: {
    ...providerText.meta,
    marginTop: 2,
  },
  noticeText: {
    ...providerText.meta,
    textAlign: 'center',
  },
  footerLink: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
