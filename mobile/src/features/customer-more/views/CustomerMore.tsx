import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { QuickAction } from '../../../components/AppDisplay';
import { TopBar } from '../../../components/DesignKit';
import { AppScreen } from '../../../navigation/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { CurrentUserProfile } from '../../../shared/models/types';
import { ActionRow } from '../../../shared/components/ScreenLayout';
import { useCustomerMoreViewModel } from '../viewModels/useCustomerMoreViewModel';

type CustomerMoreScreenProps = {
  profile: CurrentUserProfile | null;
  navigate: (screen: AppScreen, nextRole?: 'customer') => void;
  signOut: () => void | Promise<void>;
  unreadNotificationCount?: number;
};

export function CustomerMoreScreen({
  profile,
  navigate,
  signOut,
  unreadNotificationCount = 0,
}: CustomerMoreScreenProps) {
  const more = useCustomerMoreViewModel({ profile, unreadNotificationCount });
  const { data } = more;

  return (
    <>
      <TopBar title="More" subtitle="Account and preferences" />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>

          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{data.initial}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.name}>{data.displayName}</Text>
              <Text style={styles.email}>{data.displayEmail}</Text>
            </View>
          </View>

          {data.actionRows.map((row) => (
            <ActionRow key={row.map((a) => a.label).join('-')}>
              {row.map((action) => (
                <QuickAction
                  key={action.label}
                  label={action.label}
                  badge={action.badge}
                  onPress={() => navigate(action.screen, 'customer')}
                />
              ))}
            </ActionRow>
          ))}

          <Pressable style={styles.logoutButton} onPress={() => void signOut()}>
            <LogOut color={palette.red} size={20} strokeWidth={2.2} />
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>

          <Text style={styles.versionText}>ServEase v1.0.0</Text>

        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  withBottomNav: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 108,
  },
  content: {
    gap: spacing.md,
    padding: spacing.md,
  },
  flex: {
    flex: 1,
  },

  profileRow: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.base,
    padding: spacing.base,
    marginBottom: spacing.xs,
    boxShadow: '0 4px 8px rgba(0,0,0,0.06)',
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
  name: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  email: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },

  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    minHeight: 52,
    marginTop: spacing.xs,
  },
  logoutText: {
    color: palette.red,
    fontSize: 14,
    fontWeight: '700',
  },

  versionText: {
    color: palette.faint,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
