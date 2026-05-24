import {
  Bell,
  ChevronRight,
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
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppScreen } from '../../../navigation/types';
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
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{data.initial}</Text>
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
        </View>

        {menuGroups.map((group) => {
          const groupItems = allItems.filter((i) => group.labels.includes(i.label));
          if (groupItems.length === 0) return null;
          return (
            <View key={group.title} style={styles.menuGroup}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <View style={styles.menuCard}>
                {groupItems.map((item, index) => {
                  const Icon = itemIcon[item.label] ?? ChevronRight;
                  return (
                    <Pressable
                      key={item.label}
                      style={[
                        styles.menuRow,
                        index < groupItems.length - 1 && styles.menuRowDivider,
                      ]}
                      onPress={() => navigate(item.screen, 'customer')}
                      accessibilityRole="button"
                      accessibilityLabel={item.label}
                    >
                      <View style={styles.menuIconBg}>
                        <Icon color={palette.mint} size={18} strokeWidth={2.2} />
                      </View>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                      {item.badge ? (
                        <View style={styles.menuBadge}>
                          <Text style={styles.menuBadgeText}>
                            {item.badge > 99 ? '99+' : item.badge}
                          </Text>
                        </View>
                      ) : null}
                      <ChevronRight color={palette.line} size={16} />
                    </Pressable>
                  );
                })}
              </View>
            </View>
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 108,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.base,
    paddingTop: spacing.lg,
  },
  flex: { flex: 1 },

  profileCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.base,
    padding: spacing.base,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  avatarText: {
    color: palette.white,
    fontSize: 22,
    fontWeight: '700',
  },
  profileName: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  profileEmail: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  editBadge: {
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
  },
  editBadgeText: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '700',
  },

  menuGroup: {
    gap: spacing.xs,
  },
  groupTitle: {
    color: palette.faint,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    paddingHorizontal: spacing.xs,
    textTransform: 'uppercase',
  },
  menuCard: {
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  },
  menuRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.base,
    minHeight: 58,
    paddingHorizontal: spacing.base,
  },
  menuRowDivider: {
    borderBottomColor: palette.lineSoft,
    borderBottomWidth: 1,
  },
  menuIconBg: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.sm,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  menuLabel: {
    color: palette.ink,
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  menuBadge: {
    alignItems: 'center',
    backgroundColor: palette.red,
    borderRadius: radius.pill,
    height: 20,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 4,
  },
  menuBadgeText: {
    color: palette.white,
    fontSize: 11,
    fontWeight: '700',
  },

  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 52,
  },
  logoutText: {
    color: palette.red,
    fontSize: 15,
    fontWeight: '700',
  },
  versionText: {
    color: palette.faint,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
