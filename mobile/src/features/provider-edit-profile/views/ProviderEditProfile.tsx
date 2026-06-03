import { StyleSheet, Text } from 'react-native';
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
import { palette } from '../../../theme/serveaseDesign';
import { CurrentUserProfile } from '../../../shared/models/types';
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
      <ProviderScreen bottomInset={148}>
        <ProviderContent>
          <ProviderHeader
            title="Edit Profile"
            subtitle="Update account and business details"
            onBack={onBack}
          />
          <ProviderCard>
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
