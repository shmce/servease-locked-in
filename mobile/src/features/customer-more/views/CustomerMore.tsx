import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Bell,
  ChevronRight,
  FileText,
  Gift,
  HelpCircle,
  LogOut,
  Settings as SettingsIcon,
  User,
  WalletCards,
} from 'lucide-react-native';
import { AppScreen } from '../../../navigation/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { CurrentUserProfile } from '../../../shared/models/types';
import {
  ScreenContent,
  ScreenScroll,
} from '../../../shared/components/ScreenLayout';
import {
  CustomerMoreMenuIcon,
  useCustomerMoreViewModel,
} from '../viewModels/useCustomerMoreViewModel';

type CustomerMoreScreenProps = {
  profile: CurrentUserProfile | null;
  navigate: (screen: AppScreen, nextRole?: 'customer') => void;
  signOut: () => void | Promise<void>;
  unreadNotificationCount?: number;
};

const menuIcons: Record<CustomerMoreMenuIcon, typeof User> = {
  user: User,
  bell: Bell,
  gift: Gift,
  wallet: WalletCards,
  settings: SettingsIcon,
  help: HelpCircle,
  file: FileText,
};

export function CustomerMoreScreen({
  profile,
  navigate,
  signOut,
  unreadNotificationCount = 0,
}: CustomerMoreScreenProps) {
  const more = useCustomerMoreViewModel({
    profile,
    unreadNotificationCount,
  });
  const { data } = more;

  return (
    <ScreenScroll>
      <ScreenContent>
        <View style={styles.moreProfileRow}>
          <View style={styles.moreAvatar}>
            <Text style={styles.moreAvatarText}>
              {data.displayName.slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.moreName}>{data.displayName}</Text>
            <Text style={styles.cardMeta}>{data.displayEmail}</Text>
          </View>
        </View>

        <View style={styles.moreMenuList}>
          {data.menuItems.map((item) => {
            const Icon = menuIcons[item.icon];
            const showBadge =
              item.screen === 'customerNotifications' &&
              data.unreadNotificationCount > 0;
            return (
              <Pressable
                key={item.label}
                style={styles.moreMenuItem}
                onPress={() => navigate(item.screen, 'customer')}
              >
                <Icon color={palette.ink} size={22} strokeWidth={2.2} />
                <Text style={styles.moreMenuLabel} numberOfLines={2}>
                  {item.label}
                </Text>
                {showBadge ? (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {data.unreadNotificationCount > 99
                        ? '99+'
                        : data.unreadNotificationCount}
                    </Text>
                  </View>
                ) : null}
                <ChevronRight
                  color={palette.faint}
                  size={18}
                  style={styles.menuChevron}
                />
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.logoutButton} onPress={() => void signOut()}>
          <LogOut color={palette.red} size={22} strokeWidth={2.2} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
        <Text style={styles.noticeText}>ServEase v1.0.0</Text>
      </ScreenContent>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  cardMeta: {
    color: palette.faint,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  },
  moreProfileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.base,
    marginBottom: spacing.sm,
  },
  moreAvatar: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  moreAvatarText: {
    color: palette.white,
    fontSize: 28,
    fontWeight: '900',
  },
  moreName: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  moreMenuList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },
  moreMenuItem: {
    alignItems: 'flex-start',
    backgroundColor: '#F5F5F5',
    borderRadius: radius.md,
    gap: spacing.sm,
    minHeight: 92,
    padding: spacing.base,
    position: 'relative',
    width: '48%',
  },
  moreMenuLabel: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    paddingRight: spacing.lg,
  },
  menuChevron: {
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
  },
  notificationBadge: {
    alignItems: 'center',
    backgroundColor: palette.red,
    borderRadius: radius.pill,
    height: 22,
    justifyContent: 'center',
    minWidth: 22,
    paddingHorizontal: 6,
    position: 'absolute',
    right: spacing.sm,
    top: 36,
  },
  notificationBadgeText: {
    color: palette.white,
    fontSize: 11,
    fontWeight: '900',
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    minHeight: 56,
  },
  logoutText: {
    color: palette.red,
    fontSize: 13,
    fontWeight: '900',
  },
  noticeText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    textAlign: 'center',
  },
});
