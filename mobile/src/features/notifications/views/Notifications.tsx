import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Bell,
  Calendar,
  CreditCard,
  Gift,
  MessageCircle,
} from 'lucide-react-native';
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
import {
  ProviderBadge,
  ProviderCard,
  ProviderContent,
  ProviderEmptyState,
  ProviderHeader,
  ProviderIconBlock,
  ProviderScreen,
  ProviderSection,
  providerText,
} from '../../../shared/components/ProviderUI';
import { ListSectionSkeleton } from '../../../shared/components/LoadingStates';
import { NotificationSummary } from '../../../shared/models/types';
import { palette, spacing } from '../../../theme/serveaseDesign';
import { useNotificationsViewModel } from '../viewModels/useNotificationsViewModel';

type NotificationsScreenProps = {
  notifications: NotificationSummary[];
  isLoading?: boolean;
  markAllReadDisabled?: boolean;
  markAllReadPending?: boolean;
  onBack: () => void;
  onMarkAllRead?: () => void | Promise<void>;
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
  isLoading = false,
  markAllReadDisabled = true,
  markAllReadPending = false,
  onBack,
  onMarkAllRead,
  openNotification,
  role,
}: NotificationsScreenProps) {
  const notificationsView = useNotificationsViewModel({ notifications });
  const isInitialLoading = isLoading && notifications.length === 0;
  const showMarkAllRead =
    notificationsView.data.unreadCount > 0 && Boolean(onMarkAllRead);
  const markAllReadLabel = markAllReadPending ? 'Marking...' : 'Mark all read';
  const headerActions = showMarkAllRead ? (
    <View style={styles.headerActions}>
      <Pressable
        style={[
          styles.markAllButton,
          markAllReadDisabled && styles.markAllButtonDisabled,
        ]}
        onPress={() => void onMarkAllRead?.()}
        disabled={markAllReadDisabled}
        accessibilityRole="button"
        accessibilityLabel={markAllReadLabel}
      >
        <Text style={styles.markAllButtonText} numberOfLines={1}>
          {markAllReadLabel}
        </Text>
      </Pressable>
      <CustomerBadge
        label={`${notificationsView.data.unreadCount} new`}
        tone="success"
      />
    </View>
  ) : null;
  const providerHeaderActions = showMarkAllRead ? (
    <View style={styles.headerActions}>
      <Pressable
        style={[
          styles.markAllButton,
          markAllReadDisabled && styles.markAllButtonDisabled,
        ]}
        onPress={() => void onMarkAllRead?.()}
        disabled={markAllReadDisabled}
        accessibilityRole="button"
        accessibilityLabel={markAllReadLabel}
      >
        <Text style={styles.markAllButtonText} numberOfLines={1}>
          {markAllReadLabel}
        </Text>
      </Pressable>
      <ProviderBadge label={`${notificationsView.data.unreadCount} new`} tone="success" />
    </View>
  ) : null;

  if (role === 'customer') {
    return (
      <CustomerScreen>
        <CustomerContent>
          <CustomerHeader
            title="Notifications"
            subtitle="Updates about your services and account"
            onBack={onBack}
            right={headerActions}
          />

          <CustomerSection>
            {isInitialLoading ? (
              <ListSectionSkeleton count={4} label="Loading notifications" />
            ) : notificationsView.data.visibleNotifications.length ? (
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
    <ProviderScreen>
      <ProviderContent>
        <ProviderHeader
          title="Notifications"
          subtitle="Updates about your provider workspace"
          onBack={onBack}
          right={providerHeaderActions}
        />
        <ProviderSection>
          {isInitialLoading ? (
            <ListSectionSkeleton count={4} label="Loading notifications" />
          ) : (
            notificationsView.data.visibleNotifications.map((item) => (
              <ProviderCard
                key={item.notification.id}
                onPress={() => void openNotification(item.notification)}
                selected={item.isUnread}
                accessibilityLabel={`Open notification: ${item.title}`}
              >
                <View style={styles.notificationCard}>
                  <ProviderIconBlock compact>
                    <NotificationIcon color={palette.mintDeep} kind={item.iconKind} />
                  </ProviderIconBlock>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardBody}>{item.body}</Text>
                    <Text style={styles.cardMeta}>{item.createdAtLabel}</Text>
                  </View>
                  {item.isUnread ? <View style={styles.notificationUnreadDot} /> : null}
                </View>
              </ProviderCard>
            ))
          )}
          {!isInitialLoading && notificationsView.data.isEmpty ? (
            <ProviderEmptyState
              title="No notifications yet"
              body="We'll notify you when something arrives."
            />
          ) : null}
        </ProviderSection>
      </ProviderContent>
    </ProviderScreen>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  markAllButton: {
    backgroundColor: '#EAF8F1',
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
  },
  markAllButtonDisabled: {
    opacity: 0.55,
  },
  markAllButtonText: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 16,
  },
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
  notificationCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  notificationUnreadDot: {
    backgroundColor: palette.mintDeep,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  flex: {
    flex: 1,
  },
  cardTitle: {
    ...providerText.title,
    fontSize: 15,
    lineHeight: 20,
  },
  cardBody: {
    ...providerText.body,
    marginTop: 2,
  },
  cardMeta: {
    ...providerText.meta,
    marginTop: spacing.xs,
  },
});
