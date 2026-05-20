import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Card,
  Field,
  PrimaryButton,
  TopBar,
} from '../../../components/DesignKit';
import { palette, spacing, type } from '../../../theme/serveaseDesign';
import { CurrentUserProfile } from '../../../shared/models/types';
import { StickyFooter } from '../../../shared/components/ScreenLayout';
import { useProviderEditProfileViewModel } from '../viewModels/useProviderEditProfileViewModel';

type ProviderEditProfileScreenProps = {
  profile: CurrentUserProfile | null;
  busyAction: string | null;
  profileFullName: string;
  profileContactNumber: string;
  profileBusinessName: string;
  onBack: () => void;
  onFullNameChange: (value: string) => void;
  onContactNumberChange: (value: string) => void;
  onBusinessNameChange: (value: string) => void;
  onSaveProfile: () => void;
};

export function ProviderEditProfileScreen({
  profile,
  busyAction,
  profileFullName,
  profileContactNumber,
  profileBusinessName,
  onBack,
  onFullNameChange,
  onContactNumberChange,
  onBusinessNameChange,
  onSaveProfile,
}: ProviderEditProfileScreenProps) {
  const editProfile = useProviderEditProfileViewModel({
    profile,
    busyAction,
  });
  const { data } = editProfile;

  return (
    <>
      <TopBar
        title="Edit Profile"
        subtitle="Update account and business details"
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.withStickyFooter}>
        <View style={styles.content}>
          <Card>
            <Field
              label="Full Name"
              value={profileFullName}
              onChangeText={onFullNameChange}
              placeholder="Your full name"
            />
            <Field
              label="Phone Number"
              value={profileContactNumber}
              onChangeText={onContactNumberChange}
              keyboardType="phone-pad"
              placeholder="+639000000000"
            />
            <Field
              label="Business Name"
              value={profileBusinessName}
              onChangeText={onBusinessNameChange}
              placeholder="Your provider business name"
            />
            <Text style={styles.noticeText}>{data.notice}</Text>
          </Card>
        </View>
      </ScrollView>
      <StickyFooter>
        <PrimaryButton
          label={data.saveButtonLabel}
          onPress={onSaveProfile}
          disabled={!data.canSave}
        />
        <Text style={styles.footerLink} onPress={onBack}>
          Back to profile
        </Text>
      </StickyFooter>
    </>
  );
}

const styles = StyleSheet.create({
  withStickyFooter: {
    backgroundColor: palette.white,
    flexGrow: 1,
    paddingBottom: 132,
  },
  content: {
    gap: spacing.md,
    padding: spacing.md,
  },
  noticeText: {
    ...type.caption,
    color: palette.muted,
    textAlign: 'center',
  },
  footerLink: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
});
