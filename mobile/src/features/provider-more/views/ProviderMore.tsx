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
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen } from '../../../navigation/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { CurrentUserProfile } from '../../../shared/models/types';
import {
  ProviderCard,
  ProviderContent,
  ProviderHeader,
  ProviderIconBlock,
  ProviderScreen,
  ProviderSection,
  providerText,
} from '../../../shared/components/ProviderUI';
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
    <ProviderScreen>
      <ProviderContent>
        <ProviderHeader
          title="More"
          subtitle="Manage your provider workspace"
        />
        <ProviderCard style={styles.profileRow}>
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
            onPress={() => navigate('providerProfileView', 'provider')}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <Text style={styles.editBadgeText}>Edit</Text>
          </Pressable>
        </ProviderCard>

        {menuGroups.map((group) => {
          const groupItems = allItems.filter((i) => group.labels.includes(i.label));
          if (groupItems.length === 0) return null;
          return (
            <ProviderSection key={group.title} title={group.title}>
              <ProviderCard style={styles.menuCard}>
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
                      <ProviderIconBlock compact>
                        <Icon color={palette.mintDeep} size={18} strokeWidth={2.2} />
                      </ProviderIconBlock>
                      <Text style={styles.menuLabel}>{action.label}</Text>
                      <ActionBadge badge={action.badge} />
                      {action.badge ? (
                        <View style={styles.menuBadge}>
                          <Text style={styles.menuBadgeText}>
                            {action.badge > 99 ? '99+' : action.badge}
                          </Text>
                        </View>
                      ) : null}
                      <ChevronRight color={palette.mintDeep} size={16} />
                    </Pressable>
                  );
                })}
              </ProviderCard>
            </ProviderSection>
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
      </ProviderContent>
    </ProviderScreen>
  );
}

function ActionBadge({ badge }: { badge?: number }) {
  return badge ? null : null;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.base,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderColor: '#A7E5C2',
    borderWidth: 1,
    borderRadius: radius.pill,
    height: 52,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 52,
  },
  avatarImage: {
    height: 52,
    width: 52,
  },
  avatarText: {
    color: palette.mintDeep,
    fontSize: 22,
    fontWeight: '600',
  },
  profileName: {
    ...providerText.title,
  },
  profileEmail: {
    ...providerText.meta,
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
    fontWeight: '600',
  },
  menuCard: {
    gap: 0,
    overflow: 'hidden',
    padding: 0,
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
  menuLabel: {
    color: '#202733',
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
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
    borderColor: '#FADADA',
    borderRadius: radius.lg,
    borderWidth: 1,
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
    fontWeight: '600',
  },
  versionText: {
    color: '#8B95A1',
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
  },
});
