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
import { ProfileInfoRow } from '../../../components/AppDisplay';
import { CurrentUserProfile } from '../../../shared/models/types';
import { palette, radius } from '../../../theme/serveaseDesign';
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
          <View style={styles.profileHero}>
            <Pressable
              style={styles.profileAvatarLarge}
              onPress={() => void pickCustomerAvatar()}
              accessibilityRole="button"
              accessibilityLabel="Update profile photo"
            >
              {profileView.data.avatarUri ? (
                <Image
                  source={{ uri: profileView.data.avatarUri }}
                  style={styles.profileAvatarImage}
                  accessibilityLabel="Profile photo"
                />
              ) : (
                <Text style={styles.profileAvatarLargeText}>
                  {profileView.data.avatarInitial}
                </Text>
              )}
              <View style={styles.cameraBadge}>
                <Camera color={palette.white} size={15} />
              </View>
            </Pressable>
            <Text style={styles.cardMeta}>Tap the photo to update it.</Text>
          </View>
          <Field
            label="Full Name"
            value={profileFullName}
            onChangeText={setProfileFullName}
            placeholder="Your full name"
          />
          <ProfileInfoRow
            icon={Mail}
            label="Email Address"
            value={profileView.data.emailLabel}
          />
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
          <PrimaryButton
            label={profileView.data.saveLabel}
            onPress={() => void saveProfile()}
            disabled={profileView.isSaving}
          />
          {profileView.error ? <Text style={styles.cardMeta}>{profileView.error}</Text> : null}
        </ScreenContent>
      </ScreenScroll>
    </>
  );
}

const styles = StyleSheet.create({
  profileHero: {
    alignItems: 'center',
  },
  profileAvatarLarge: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 96,
    justifyContent: 'center',
    position: 'relative',
    width: 96,
  },
  profileAvatarImage: {
    borderRadius: radius.pill,
    height: 96,
    width: 96,
  },
  profileAvatarLargeText: {
    color: palette.white,
    fontSize: 40,
    fontWeight: '900',
  },
  cameraBadge: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderColor: palette.white,
    borderRadius: radius.pill,
    borderWidth: 4,
    bottom: 0,
    height: 34,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 34,
  },
  cardMeta: {
    color: palette.faint,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  },
});
