import {
  Bell,
  CreditCard,
  FileText,
  Gift,
  HelpCircle,
  MapPin,
  LogOut,
  Settings as SettingsIcon,
  ShieldCheck,
  User,
} from 'lucide-react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen } from '../../../navigation/types';
import {
  CustomerBadge,
  CustomerCard,
  CustomerContent,
  CustomerHeader,
  CustomerRow,
  CustomerScreen,
  CustomerSection,
  customerText,
} from '../../../shared/components/CustomerUI';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { CurrentUserProfile } from '../../../shared/models/types';
import { useCustomerMoreViewModel } from '../viewModels/useCustomerMoreViewModel';

type CustomerMoreScreenProps = {
  profile: CurrentUserProfile | null;
  navigate: (screen: AppScreen, nextRole?: 'customer') => void;
  signOut: () => void | Promise<void>;
  unreadNotificationCount?: number;
};

const itemIcon: Record<string, typeof User> = {
  'My Profile': User,
  'Notifications': Bell,
  'Refer a Friend': Gift,
  'Saved Addresses': MapPin,
  'Payment Methods': CreditCard,
  'Security': ShieldCheck,
  'Settings': SettingsIcon,
  'Help & Support': HelpCircle,
  'Terms & Privacy': FileText,
};

const menuGroups = [
  { title: 'Account', labels: ['My Profile', 'Saved Addresses', 'Refer a Friend', 'Payment Methods'] },
  { title: 'Preferences', labels: ['Notifications', 'Security', 'Settings'] },
  { title: 'Support', labels: ['Help & Support', 'Terms & Privacy'] },
];

export function CustomerMoreScreen({
  profile,
  navigate,
  signOut,
  unreadNotificationCount = 0,
}: CustomerMoreScreenProps) {
  const more = useCustomerMoreViewModel({ profile, unreadNotificationCount });
  const { data } = more;
  const allItems = data.actionRows.flat();

  return (
    <CustomerScreen>
      <CustomerContent>
        <CustomerHeader
          title="More"
          subtitle="Manage your account and preferences"
        />

        <CustomerCard style={styles.profileCard}>
          <View style={styles.avatar}>
            {data.avatarUri ? (
              <Image
                source={{ uri: data.avatarUri }}
                style={styles.avatarImage}
                accessibilityLabel="Profile photo"
              />
            ) : (
              <Text style={styles.avatarText}>{data.initial}</Text>
            )}
          </View>
          <View style={styles.flex}>
            <Text style={styles.profileName}>{data.displayName}</Text>
            <Text style={styles.profileEmail}>{data.displayEmail}</Text>
          </View>
          <Pressable
            style={styles.editBadge}
            onPress={() => navigate('customerProfile', 'customer')}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <Text style={styles.editBadgeText}>Edit</Text>
          </Pressable>
        </CustomerCard>

        {menuGroups.map((group) => {
          const groupItems = allItems.filter((i) => group.labels.includes(i.label));
          if (groupItems.length === 0) return null;
          return (
            <CustomerSection key={group.title} title={group.title}>
              <CustomerCard style={styles.menuCard}>
                {groupItems.map((item, index) => {
                  const Icon = itemIcon[item.label] ?? User;
                  return (
                    <View
                      key={item.label}
                      style={index < groupItems.length - 1 && styles.menuRowDivider}
                    >
                      <CustomerRow
                        icon={
                          <Icon color={palette.mintDeep} size={18} strokeWidth={2.1} />
                        }
                        title={item.label}
                        meta={
                          item.badge ? (
                            <CustomerBadge
                              label={item.badge > 99 ? '99+' : String(item.badge)}
                              tone="danger"
                            />
                          ) : undefined
                        }
                        onPress={() => navigate(item.screen, 'customer')}
                      />
                    </View>
                  );
                })}
              </CustomerCard>
            </CustomerSection>
          );
        })}

        <Pressable
          style={styles.logoutButton}
          onPress={() => void signOut()}
          accessibilityRole="button"
        >
          <LogOut color={palette.red} size={18} strokeWidth={2.2} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>

        <Text style={styles.versionText}>ServEase v1.0.0</Text>
      </CustomerContent>
    </CustomerScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  profileCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.base,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderRadius: radius.pill,
    height: 50,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 50,
  },
  avatarImage: {
    height: 50,
    width: 50,
  },
  avatarText: {
    color: palette.mintDeep,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0,
  },
  profileName: {
    ...customerText.title,
    fontSize: 16,
    lineHeight: 21,
  },
  profileEmail: {
    ...customerText.meta,
    marginTop: 2,
  },
  editBadge: {
    backgroundColor: '#F1FAF5',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  editBadgeText: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
  },
  menuCard: {
    gap: 0,
    overflow: 'hidden',
  },
  menuRowDivider: {
    borderBottomColor: '#EEF0F2',
    borderBottomWidth: 1,
  },

  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#FFF7F7',
    borderColor: '#F7D9D9',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 52,
  },
  logoutText: {
    color: palette.red,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0,
  },
  versionText: {
    color: palette.faint,
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0,
    textAlign: 'center',
  },
});
