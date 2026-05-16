import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ChevronRight,
  FileText,
  Gift,
  HelpCircle,
  History,
  LogOut,
  Settings as SettingsIcon,
  User,
  WalletCards,
} from 'lucide-react-native';
import { AppScreen } from '../navigation/types';
import { palette, radius, spacing } from '../theme/serveaseDesign';
import { CurrentUserProfile } from '../../services/serveaseApi';

type CustomerMoreScreenProps = {
  profile: CurrentUserProfile | null;
  navigate: (screen: AppScreen, nextRole?: 'customer') => void;
  signOut: () => void | Promise<void>;
};

const menuItems = [
  { label: 'My Profile', icon: User, screen: 'customerProfile' as AppScreen },
  { label: 'Service History', icon: History, screen: 'customerServiceHistory' as AppScreen },
  { label: 'Refer a Friend', icon: Gift, screen: 'customerReferral' as AppScreen },
  { label: 'Payment Methods', icon: WalletCards, screen: 'customerPaymentMethods' as AppScreen },
  { label: 'Settings', icon: SettingsIcon, screen: 'customerSettings' as AppScreen },
  { label: 'Help & Support', icon: HelpCircle, screen: 'customerHelp' as AppScreen },
  { label: 'Terms & Privacy', icon: FileText, screen: 'customerTerms' as AppScreen },
];

export function CustomerMoreScreen({
  profile,
  navigate,
  signOut,
}: CustomerMoreScreenProps) {
  const displayName = profile?.user.fullName ?? 'Customer';
  const displayEmail = profile?.user.email ?? 'customer@example.com';

  return (
    <ScrollView contentContainerStyle={styles.withBottomNav}>
      <View style={styles.content}>
        <View style={styles.moreProfileRow}>
          <View style={styles.moreAvatar}>
            <Text style={styles.moreAvatarText}>{displayName.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.moreName}>{displayName}</Text>
            <Text style={styles.cardMeta}>{displayEmail}</Text>
          </View>
        </View>

        <View style={styles.moreMenuList}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Pressable
                key={item.label}
                style={styles.moreMenuItem}
                onPress={() => navigate(item.screen, 'customer')}
              >
                <Icon color={palette.ink} size={22} strokeWidth={2.2} />
                <Text style={styles.moreMenuLabel}>{item.label}</Text>
                <ChevronRight color={palette.faint} size={20} />
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.logoutButton} onPress={() => void signOut()}>
          <LogOut color={palette.red} size={22} strokeWidth={2.2} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
        <Text style={styles.noticeText}>ServEase v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  withBottomNav: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 108,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xl,
  },
  flex: {
    flex: 1,
  },
  cardMeta: {
    color: palette.faint,
    fontSize: 13,
    fontWeight: '600',
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
    gap: spacing.md,
  },
  moreMenuItem: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.base,
    minHeight: 56,
    paddingHorizontal: spacing.base,
  },
  moreMenuLabel: {
    color: palette.ink,
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
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
    fontSize: 15,
    fontWeight: '900',
  },
  noticeText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },
});
