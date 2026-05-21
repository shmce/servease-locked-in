import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Bell,
  Calendar,
  CreditCard,
  Gift,
  MessageCircle,
} from 'lucide-react-native';
import {
  Badge,
  EmptyState,
  TopBar,
} from '../../../components/DesignKit';
import { NotificationSummary } from '../../../shared/models/types';
import { palette, spacing } from '../../../theme/serveaseDesign';
import { useNotificationsViewModel } from '../viewModels/useNotificationsViewModel';

type NotificationsScreenProps = {
  notifications: NotificationSummary[];
  onBack: () => void;
  openNotification: (notification: NotificationSummary) => Promise<void>;
};

function NotificationIcon({ kind }: { kind: string }) {
  if (kind === 'payment') {
    return <CreditCard color={palette.white} size={20} />;
  }
  if (kind === 'booking') {
    return <Calendar color={palette.white} size={20} />;
  }
  if (kind === 'promo') {
    return <Gift color={palette.white} size={20} />;
  }
  if (kind === 'support') {
    return <MessageCircle color={palette.white} size={20} />;
  }
  return <Bell color={palette.white} size={20} />;
}

export function NotificationsScreen({
  notifications,
  onBack,
  openNotification,
}: NotificationsScreenProps) {
  const notificationsView = useNotificationsViewModel({ notifications });

  return (
    <>
      <TopBar
        title="Notifications"
        onBack={onBack}
        right={
          notificationsView.data.unreadCount > 0 ? (
            <Badge label={`${notificationsView.data.unreadCount} new`} tone="success" />
          ) : null
        }
      />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          {notificationsView.data.visibleNotifications.map((item) => (
            <Pressable
              key={item.notification.id}
              style={[
                styles.notificationCard,
                item.isUnread && styles.notificationCardUnread,
              ]}
              onPress={() => void openNotification(item.notification)}
            >
              <View style={styles.notificationIcon}>
                <NotificationIcon kind={item.iconKind} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardBody}>{item.body}</Text>
                <Text style={styles.cardMeta}>{item.createdAtLabel}</Text>
              </View>
              {item.isUnread ? <View style={styles.notificationUnreadDot} /> : null}
            </Pressable>
          ))}
          {notificationsView.data.isEmpty ? (
            <EmptyState title="No notifications yet" body="We'll notify you when something arrives." />
          ) : null}
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
  notificationCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.base,
  },
  notificationCardUnread: {
    borderColor: palette.mint,
  },
  notificationIcon: {
    alignItems: 'center',
    backgroundColor: palette.ink,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  notificationUnreadDot: {
    backgroundColor: palette.mint,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  flex: {
    flex: 1,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  cardBody: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  cardMeta: {
    color: palette.faint,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  },
});
