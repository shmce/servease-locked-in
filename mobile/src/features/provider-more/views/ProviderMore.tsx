import {
  BarChart2,
  Bell,
  Calendar,
  ChevronRight,
  FileText,
  HelpCircle,
  Layers,
  LogOut,
  Send,
  Settings as SettingsIcon,
  ShieldCheck,
  User,
  Wallet,
  Wrench,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppScreen } from '../../../navigation/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { CurrentUserProfile } from '../../../shared/models/types';
import { useProviderMoreViewModel } from '../viewModels/useProviderMoreViewModel';

type ProviderMoreScreenProps = {
  profile: CurrentUserProfile | null;
  navigate: (screen: AppScreen, nextRole?: 'provider') => void;
  signOut?: () => void | Promise<void>;
  unreadNotificationCount?: number;
};

const itemIcon: Record<string, typeof User> = {
  'Profile': User,
  'Portfolio': Layers,
  'Services': Wrench,
  'Application': FileText,
  'Availability': Calendar,
  'Payouts': Wallet,
  'Request Payout': Send,
  'Insights': BarChart2,
  'Notifications': Bell,
  'Help Center': HelpCircle,
  'Security': ShieldCheck,
  'Settings': SettingsIcon,
};

const menuGroups = [
  {
    title: 'Business',
    labels: ['Profile', 'Portfolio', 'Services', 'Application', 'Availability'],
  },
  { title: 'Finance', labels: ['Payouts', 'Request Payout'] },
  { title: 'Activity', labels: ['Insights', 'Notifications'] },
  { title: 'Support', labels: ['Help Center', 'Security', 'Settings'] },
];

export function ProviderMoreScreen({
  profile,
  navigate,
  signOut,
  unreadNotificationCount = 0,
}: ProviderMoreScreenProps) {
  const providerMore = useProviderMoreViewModel({ profile, unreadNotificationCount });
  const { data } = providerMore;
  const allItems = data.actionRows.flat();
  const handleSignOut = () => {
    if (typeof signOut === 'function') {
      void signOut();
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>

          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{data.initial}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.profileName}>{data.displayName}</Text>
              <Text style={styles.profileEmail}>{data.displayEmail}</Text>
            </View>
            <Pressable
              style={styles.editBadge}
              onPress={() => navigate('providerProfileView', 'provider')}
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
                  {groupItems.map((action, index) => {
                    const Icon = itemIcon[action.label] ?? ChevronRight;
                    return (
                      <Pressable
                        key={action.label}
                        style={[
                          styles.menuRow,
                          index < groupItems.length - 1 && styles.menuRowDivider,
                        ]}
                        onPress={() => navigate(action.screen, 'provider')}
                        accessibilityRole="button"
                        accessibilityLabel={action.label}
                      >
                        <View style={styles.menuIconBg}>
                          <Icon color={palette.mint} size={18} strokeWidth={2.2} />
                        </View>
                        <Text style={styles.menuLabel}>{action.label}</Text>
                        <ActionBadge badge={action.badge} />
                        {action.badge ? (
                          <View style={styles.menuBadge}>
                            <Text style={styles.menuBadgeText}>
                              {action.badge > 99 ? '99+' : action.badge}
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
            style={[styles.logoutButton, !signOut && styles.logoutButtonDisabled]}
            onPress={handleSignOut}
            disabled={!signOut}
            accessibilityRole="button"
          >
            <LogOut color={palette.red} size={18} strokeWidth={2.2} />
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>

          <Text style={styles.versionText}>ServEase v1.0.0</Text>
        </View>
      </ScrollView>
    </>
  );
}

function ActionBadge({ badge }: { badge?: number }) {
  return badge ? null : null;
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

  profileRow: {
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
  logoutButtonDisabled: {
    opacity: 0.45,
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
