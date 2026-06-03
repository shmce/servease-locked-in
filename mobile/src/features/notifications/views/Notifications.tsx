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
import { AppRole } from '../../../navigation/types';
import {
  CustomerBadge,
  CustomerCard,
  CustomerContent,
  CustomerEmptyState,
  CustomerHeader,
  CustomerIconBlock,
  CustomerScreen,
  CustomerSection,
  customerText,
} from '../../../shared/components/CustomerUI';
import { NotificationSummary } from '../../../shared/models/types';
import { palette, spacing } from '../../../theme/serveaseDesign';
import { useNotificationsViewModel } from '../viewModels/useNotificationsViewModel';

type NotificationsScreenProps = {
  notifications: NotificationSummary[];
  onBack: () => void;
  openNotification: (notification: NotificationSummary) => Promise<void>;
  role: AppRole;
};

function NotificationIcon({
  color = palette.white,
  kind,
}: {
  color?: string;
  kind: string;
}) {
  if (kind === 'payment') {
    return <CreditCard color={color} size={20} />;
  }
  if (kind === 'booking') {
    return <Calendar color={color} size={20} />;
  }
  if (kind === 'promo') {
    return <Gift color={color} size={20} />;
  }
  if (kind === 'support') {
    return <MessageCircle color={color} size={20} />;
  }
  return <Bell color={color} size={20} />;
}

export function NotificationsScreen({
  notifications,
  onBack,
  openNotification,
  role,
}: NotificationsScreenProps) {
  const notificationsView = useNotificationsViewModel({ notifications });

  if (role === 'customer') {
    return (
      <CustomerScreen>
        <CustomerContent>
          <CustomerHeader
            title="Notifications"
            subtitle="Updates about your services and account"
            onBack={onBack}
            right={
              notificationsView.data.unreadCount > 0 ? (
                <CustomerBadge
                  label={`${notificationsView.data.unreadCount} new`}
                  tone="success"
                />
              ) : null
            }
          />

          <CustomerSection>
            {notificationsView.data.visibleNotifications.length ? (
              <View style={styles.customerNotificationList}>
                {notificationsView.data.visibleNotifications.map((item) => (
                  <CustomerCard
                    key={item.notification.id}
                    onPress={() => void openNotification(item.notification)}
                    selected={item.isUnread}
                    accessibilityLabel={`Open notification: ${item.title}`}
                  >
                    <View style={styles.customerNotificationRow}>
                      <CustomerIconBlock compact>
                        <NotificationIcon
                          color={palette.mintDeep}
                          kind={item.iconKind}
                        />
                      </CustomerIconBlock>
                      <View style={styles.flex}>
                        <Text style={styles.customerCardTitle} numberOfLines={2}>
                          {item.title}
                        </Text>
                        <Text style={styles.customerCardBody} numberOfLines={2}>
                          {item.body}
                        </Text>
                        <Text style={styles.customerCardMeta}>
                          {item.createdAtLabel}
                        </Text>
                      </View>
                      {item.isUnread ? <View style={styles.notificationUnreadDot} /> : null}
                    </View>
                  </CustomerCard>
                ))}
              </View>
            ) : (
              <CustomerEmptyState
                title="No notifications yet"
                body="We'll notify you when something arrives."
              />
            )}
          </CustomerSection>
        </CustomerContent>
      </CustomerScreen>
    );
  }

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
  customerNotificationList: {
    gap: spacing.md,
  },
  customerNotificationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  customerCardTitle: {
    ...customerText.title,
    fontSize: 15,
    lineHeight: 20,
  },
  customerCardBody: {
    ...customerText.body,
    marginTop: 2,
  },
  customerCardMeta: {
    ...customerText.meta,
    marginTop: spacing.xs,
  },
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
