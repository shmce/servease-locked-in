import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Calendar,
  CheckCircle,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Gift,
  HelpCircle,
  Image as ImageIcon,
  Lock,
  MapPin,
  Settings,
  Star,
  User,
  Wallet,
  WalletCards,
} from 'lucide-react-native';
import {
  Badge,
  Card,
  EmptyState,
  SkeletonBlock,
  SkeletonCard,
  SkeletonCircle,
  SkeletonLine,
  TopBar,
} from './DesignKit';
import {
  bookingStatusChip,
  formatDateTime,
  formatMoney,
  nextActionLabel,
} from '../domain/booking';
import { categoryColorFor, categoryIconFor } from '../navigation/routeHelpers';
import { AppRole } from '../navigation/types';
import { palette, radius, spacing, type } from '../theme/serveaseDesign';
import {
  BookingSummary,
  CatalogServiceItem,
  ProviderListing,
} from '../shared/models/types';

export function BookingCard({
  booking,
  role,
  onPress,
}: {
  booking: BookingSummary;
  role: AppRole;
  onPress: () => void;
}) {
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`Open ${booking.serviceTitle ?? 'service'} booking`}
    >
      <View style={styles.bookingCardHeader}>
        <Text style={styles.cardTitle}>{booking.serviceTitle ?? 'Service booking'}</Text>
        <Badge {...bookingStatusChip(booking.status)} />
      </View>
      <Text style={styles.cardMeta}>Scheduled for {formatDateTime(booking.scheduledAt)}</Text>
      <Text style={styles.cardBody}>
        {booking.status === 'completed' ? 'Completed service' : 'One-time service'}
      </Text>
      <View style={styles.bookingCardFooter}>
        <View>
          <Text style={styles.tableLabel}>
            {role === 'provider' ? 'Customer' : 'Service Provider'}
          </Text>
          <Text style={styles.providerName}>
            {role === 'provider'
              ? booking.customerFullName ?? booking.customerId.slice(0, 8)
              : booking.providerBusinessName ?? booking.bookingReference}
          </Text>
        </View>
        <View style={styles.bookingActionButton}>
          <Text style={styles.bookingActionText}>{nextActionLabel(booking.status, role)}</Text>
        </View>
      </View>
    </Card>
  );
}

export function BookingCardSkeleton() {
  return (
    <SkeletonCard>
      <View style={styles.bookingCardHeader}>
        <SkeletonLine width="56%" height={16} />
        <SkeletonBlock width={74} height={24} radius={radius.pill} />
      </View>
      <SkeletonLine width="66%" />
      <SkeletonLine width="38%" />
      <View style={styles.bookingCardFooter}>
        <View style={styles.skeletonFooterCopy}>
          <SkeletonLine width={68} height={9} />
          <SkeletonLine width={122} height={12} />
        </View>
        <SkeletonBlock width={96} height={34} radius={radius.sm} />
      </View>
    </SkeletonCard>
  );
}

export function ServiceListItem({
  service,
  onPress,
}: {
  service: CatalogServiceItem;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.serviceListItem} onPress={onPress}>
      <View style={styles.serviceThumb}>
        <Text style={styles.serviceThumbText}>{service.name.slice(0, 1)}</Text>
      </View>
      <View style={styles.flex}>
        <Text style={styles.cardTitle}>{service.name}</Text>
        <Text style={styles.cardMeta} numberOfLines={2}>
          {service.description ?? 'Professional service available through ServEase.'}
        </Text>
        <Text style={styles.priceText}>From {formatMoney(service.price)}</Text>
      </View>
      <ChevronRight color={palette.faint} size={20} />
    </Pressable>
  );
}

export function ServiceListItemSkeleton() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.serviceListItem}
    >
      <SkeletonBlock width={90} height={90} radius={radius.md} />
      <View style={styles.skeletonListBody}>
        <SkeletonLine width="58%" height={15} />
        <SkeletonLine width="92%" />
        <SkeletonLine width="74%" />
        <SkeletonLine width={84} height={12} />
      </View>
      <SkeletonCircle size={20} />
    </View>
  );
}

export function ProviderListItem({
  provider,
  onPress,
}: {
  provider: ProviderListing;
  onPress: () => void;
}) {
  const name = provider.providerBusinessName ?? provider.title;

  return (
    <Pressable style={styles.providerListItem} onPress={onPress}>
      <View style={styles.providerListAvatar}>
        <Text style={styles.providerListAvatarText}>{name.slice(0, 1)}</Text>
      </View>
      <View style={styles.flex}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle} numberOfLines={1}>{name}</Text>
          {provider.verificationStatus === 'approved' ? (
            <CheckCircle color={palette.mint} size={16} />
          ) : null}
        </View>
        <Text style={styles.cardMeta}>{provider.title}</Text>
        <View style={styles.providerMetaRow}>
          <View style={styles.ratingRow}>
            <Star color="#FFC107" fill="#FFC107" size={13} />
            <Text style={styles.cardMeta}>{provider.averageRating.toFixed(1)}</Text>
          </View>
          <Text style={styles.cardMeta}>({provider.reviewCount})</Text>
          <MapPin color={palette.faint} size={13} />
          <Text style={styles.cardMeta}>Nearby</Text>
        </View>
        <Text style={styles.priceText}>{formatMoney(provider.price)}</Text>
      </View>
      <ChevronRight color={palette.faint} size={20} />
    </Pressable>
  );
}

export function ProviderListItemSkeleton() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.providerListItem}
    >
      <SkeletonCircle size={56} />
      <View style={styles.skeletonListBody}>
        <View style={styles.rowBetween}>
          <SkeletonLine width="62%" height={15} />
          <SkeletonCircle size={16} />
        </View>
        <SkeletonLine width="48%" />
        <SkeletonLine width="74%" />
        <SkeletonLine width={72} height={12} />
      </View>
      <SkeletonCircle size={20} />
    </View>
  );
}

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function ProfileInfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.profileInfoRow}>
      <Icon color={palette.faint} size={20} strokeWidth={2.2} />
      <View style={styles.flex}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.profileInfoValue}>{value}</Text>
      </View>
    </View>
  );
}

export function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.settingsSection}>
      <Text style={styles.settingsSectionTitle}>{title}</Text>
      <View style={styles.settingsSectionBody}>{children}</View>
    </View>
  );
}

export function SettingsRow({
  icon: Icon,
  label,
  value,
  toggleValue,
  onToggle,
  onPress,
}: {
  icon: typeof User;
  label: string;
  value?: string;
  toggleValue?: boolean;
  onToggle?: () => void;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={styles.settingsRow}
      onPress={onPress ?? onToggle}
      disabled={!onPress && !onToggle}
      accessibilityRole={onToggle ? 'switch' : onPress ? 'button' : undefined}
      accessibilityState={onToggle ? { checked: Boolean(toggleValue) } : undefined}
    >
      <View style={styles.settingsRowLeft}>
        <Icon color={palette.muted} size={20} strokeWidth={2.2} />
        <Text style={styles.optionLabel}>{label}</Text>
      </View>
      {onToggle ? (
        <View style={[styles.switchTrack, toggleValue && styles.switchTrackOn]}>
          <View style={[styles.switchThumb, toggleValue && styles.switchThumbOn]} />
        </View>
      ) : (
        <View style={styles.settingsRowRight}>
          {value ? <Text style={styles.cardMeta}>{value}</Text> : null}
          <ChevronRight color={palette.faint} size={20} />
        </View>
      )}
    </Pressable>
  );
}

export function CategoryTile({
  title,
  subtitle,
  selected,
  tag,
  onPress,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  tag?: string;
  onPress: () => void;
}) {
  const Icon = categoryIconFor(title);
  const colors = categoryColorFor(title);

  return (
    <Pressable
      style={[styles.categoryTile, selected && styles.categoryTileSelected]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={[styles.categoryIcon, { backgroundColor: colors.bg }]}>
        <Icon color={colors.color} size={22} strokeWidth={2.4} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.categoryTitle} numberOfLines={2}>{title}</Text>
        {tag ? (
          <View style={styles.categorySubRow}>
            <Text style={[styles.categorySub, styles.flex, { marginTop: 0 }]} numberOfLines={1}>
              {subtitle}
            </Text>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{tag}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.categorySub} numberOfLines={2}>{subtitle}</Text>
        )}
      </View>
      <ChevronRight color={selected ? palette.mint : palette.faint} size={18} />
    </Pressable>
  );
}

export function ProviderBookingRow({
  booking,
  onPress,
}: {
  booking: BookingSummary;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.providerBookingCard}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${booking.serviceTitle ?? 'service'} booking for ${
        booking.customerFullName ?? 'customer'
      }`}
    >
      <View style={styles.providerBookingRow}>
        <View style={styles.providerBookingCol}>
          <Text style={styles.tableLabel}>Customer</Text>
          <Text style={styles.tableValue}>
            {booking.customerFullName ?? booking.customerId.slice(0, 6)}
          </Text>
        </View>
        <View style={styles.providerBookingCol}>
          <Text style={styles.tableLabel}>Service</Text>
          <Text style={styles.tableValue}>{booking.serviceTitle ?? 'Service'}</Text>
        </View>
        <View style={styles.providerBookingCol}>
          <Text style={styles.tableLabel}>Amount</Text>
          <Text style={styles.priceText}>{formatMoney(booking.totalAmount)}</Text>
        </View>
      </View>
      <Text style={styles.cardMeta}>Scheduled for {formatDateTime(booking.scheduledAt)}</Text>
      <Badge {...bookingStatusChip(booking.status)} />
    </Pressable>
  );
}

const quickActionIcons: Record<string, typeof User> = {
  Availability: Calendar,
  Insights: BarChart3,
  Notifications: Bell,
  Payouts: Wallet,
  Portfolio: ImageIcon,
  Profile: User,
  'Request Payout': CircleDollarSign,
  Security: Lock,
  Services: BriefcaseBusiness,
  Settings,
  'Set Availability': Calendar,
  'Help Center': HelpCircle,
  'My Profile': User,
  'Refer a Friend': Gift,
  'Payment Methods': WalletCards,
  'Help & Support': HelpCircle,
  'Terms & Privacy': FileText,
};

export function QuickAction({
  label,
  badge,
  onPress,
}: {
  label: string;
  badge?: number;
  onPress: () => void;
}) {
  const Icon = quickActionIcons[label] ?? ChevronRight;

  return (
    <Pressable
      style={styles.quickAction}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.quickIcon}>
        <Icon color={palette.mint} size={20} strokeWidth={2.4} />
        {badge ? (
          <View style={styles.quickBadge}>
            <Text style={styles.quickBadgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.cardTitle}>{label}</Text>
    </Pressable>
  );
}

export function RoleCard({
  title,
  body,
  mark,
  onPress,
}: {
  title: string;
  body: string;
  mark: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.roleCard} onPress={onPress}>
      <View style={styles.roleIcon}>
        <Text style={styles.roleMark}>{mark}</Text>
      </View>
      <View style={styles.flex}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardMeta}>{body}</Text>
      </View>
      <Text style={styles.chevron}>{'>'}</Text>
    </Pressable>
  );
}

export function MissingSelection({ onBack }: { onBack: () => void }) {
  return (
    <>
      <TopBar title="Booking" onBack={onBack} />
      <View style={styles.content}>
        <EmptyState title="Nothing selected" body="Choose a booking first." />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xl,
  },
  skeletonListBody: {
    flex: 1,
    gap: spacing.sm,
  },
  skeletonFooterCopy: {
    gap: spacing.xs,
  },
  cardTitle: {
    ...type.section,
    color: palette.ink,
    fontWeight: '700',
  },
  cardBody: {
    ...type.body,
    color: palette.body,
  },
  cardMeta: {
    ...type.caption,
    color: palette.muted,
    fontWeight: '500',
  },
  label: {
    color: palette.body,
    fontSize: 14,
    fontWeight: '700',
  },
  priceText: {
    color: palette.mint,
    fontSize: 14,
    fontWeight: '700',
  },
  serviceListItem: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: palette.lineSoft,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    boxShadow: '0 3px 6px rgba(0,0,0,0.04)',
  },
  serviceThumb: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.md,
    height: 90,
    justifyContent: 'center',
    width: 90,
  },
  serviceThumbText: {
    color: palette.mint,
    fontSize: 38,
    fontWeight: '700',
  },
  providerListItem: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.base,
    boxShadow: '0 4px 8px rgba(0,0,0,0.07)',
  },
  providerListAvatar: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  providerListAvatarText: {
    color: palette.white,
    fontSize: 20,
    fontWeight: '700',
  },
  providerMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  providerBookingCard: {
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.base,
    padding: spacing.base,
  },
  infoRow: {
    alignItems: 'center',
    borderBottomColor: palette.lineSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 48,
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    color: palette.faint,
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  infoValue: {
    color: palette.ink,
    flex: 1.4,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  profileInfoRow: {
    alignItems: 'center',
    borderBottomColor: palette.lineSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.base,
  },
  profileInfoValue: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '800',
    marginTop: spacing.xxs,
  },
  settingsSection: {
    gap: spacing.sm,
  },
  settingsSectionTitle: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  settingsSectionBody: {
    overflow: 'hidden',
  },
  settingsRow: {
    alignItems: 'center',
    borderBottomColor: palette.lineSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 0,
  },
  settingsRowLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  settingsRowRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  optionLabel: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  switchTrack: {
    backgroundColor: palette.line,
    borderRadius: radius.pill,
    height: 28,
    justifyContent: 'center',
    paddingHorizontal: 3,
    width: 48,
  },
  switchTrackOn: {
    backgroundColor: palette.mint,
  },
  switchThumb: {
    backgroundColor: palette.white,
    borderRadius: radius.pill,
    height: 22,
    width: 22,
  },
  switchThumbOn: {
    alignSelf: 'flex-end',
  },
  categoryTile: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.base,
    boxShadow: '0 5px 10px rgba(0,0,0,0.05)',
  },
  categoryTileSelected: {
    borderColor: palette.mint,
    backgroundColor: palette.mintSoft,
  },
  categoryIcon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  categoryTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  categorySub: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    marginTop: spacing.xs,
  },
  categorySubRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  categoryTag: {
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  categoryTagText: {
    color: palette.mintDeep,
    fontSize: 10,
    fontWeight: '700',
  },
  providerBookingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  providerBookingCol: {
    flex: 1,
    gap: spacing.xs,
  },
  tableLabel: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '500',
  },
  tableValue: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  bookingCardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  bookingCardFooter: {
    alignItems: 'center',
    borderTopColor: palette.lineSoft,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingTop: spacing.md,
  },
  providerName: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '700',
    marginTop: spacing.xxs,
  },
  bookingActionButton: {
    backgroundColor: palette.mint,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  bookingActionText: {
    color: palette.white,
    fontSize: 13,
    fontWeight: '700',
  },
  quickAction: {
    backgroundColor: palette.white,
    borderRadius: radius.md,
    flex: 1,
    gap: spacing.sm,
    padding: spacing.base,
    boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
  },
  quickIcon: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  quickIconText: {
    color: palette.mint,
    fontSize: 18,
    fontWeight: '700',
  },
  quickBadge: {
    alignItems: 'center',
    backgroundColor: palette.red,
    borderRadius: radius.pill,
    height: 18,
    justifyContent: 'center',
    minWidth: 18,
    paddingHorizontal: 4,
    position: 'absolute',
    right: -4,
    top: -4,
  },
  quickBadgeText: {
    color: palette.white,
    fontSize: 10,
    fontWeight: '700',
  },
  roleCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.base,
    boxShadow: '0 5px 12px rgba(0,0,0,0.08)',
  },
  roleIcon: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  roleMark: {
    color: palette.mint,
    fontSize: 18,
    fontWeight: '700',
  },
  chevron: {
    color: palette.faint,
    fontSize: 24,
    fontWeight: '700',
  },
});
