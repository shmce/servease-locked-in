import {
  Bell,
  ChevronRight,
  MessageCircle,
  Search,
  Sparkles,
  Star,
  User,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CategoryTile } from '../../../components/AppDisplay';
import { Badge, Card, Section } from '../../../components/DesignKit';
import {
  BookingSummary,
  CatalogCategory,
  CatalogServiceItem,
  CurrentUserProfile,
  ProviderListing,
} from '../../../shared/models/types';
import { palette, radius, spacing, type } from '../../../theme/serveaseDesign';
import { useCustomerExploreViewModel } from '../viewModels/useCustomerExploreViewModel';

type CustomerExploreScreenProps = {
  bookings: BookingSummary[];
  categories: CatalogCategory[];
  customerGuideDismissed: boolean;
  customerGuideStep: number;
  profile: CurrentUserProfile | null;
  providers: ProviderListing[];
  selectedCategoryId: string | null;
  selectedProviderId: string | null;
  selectedServiceId: string | null;
  services: CatalogServiceItem[];
  unreadCount: number;
  onDismissGuide: () => void;
  onNextGuideStep: () => void;
  onOpenBooking: (booking: BookingSummary) => void;
  onSearch: () => void;
  onSelectCategory: (category: CatalogCategory) => void;
  onSelectProvider: (provider: ProviderListing) => void;
  onSelectService: (service: CatalogServiceItem) => void;
  onShowNotifications: () => void;
  onShowRecentBookings: () => void;
  onViewAllServices: () => void;
  onViewTopProviders: () => void;
};

const guideIcons = {
  search: Search,
  star: Star,
  message: MessageCircle,
};

export function CustomerExploreScreen({
  bookings,
  categories,
  customerGuideDismissed,
  customerGuideStep,
  profile,
  providers,
  selectedCategoryId,
  selectedProviderId,
  selectedServiceId,
  services,
  unreadCount,
  onDismissGuide,
  onNextGuideStep,
  onOpenBooking,
  onSearch,
  onSelectCategory,
  onSelectProvider,
  onSelectService,
  onShowNotifications,
  onShowRecentBookings,
  onViewAllServices,
  onViewTopProviders,
}: CustomerExploreScreenProps) {
  const explore = useCustomerExploreViewModel({
    bookings,
    categories,
    customerGuideDismissed,
    customerGuideStep,
    profile,
    providers,
    selectedCategoryId,
    selectedProviderId,
    selectedServiceId,
    services,
    unreadCount,
  });
  const { data } = explore;
  const GuideIcon = guideIcons[data.guide.iconKey];

  return (
    <ScrollView contentContainerStyle={styles.withBottomNav}>
      <View style={styles.customerHero}>
        <View style={styles.heroRow}>
          <View style={styles.heroIdentity}>
            <View style={styles.heroAvatar}>
              <User color={palette.white} size={20} strokeWidth={2.4} />
            </View>
            <View>
              <Text style={styles.heroMuted}>Good Afternoon</Text>
              <Text style={styles.heroName}>{data.customerName}</Text>
            </View>
          </View>
          <Pressable
            style={styles.notificationButton}
            onPress={onShowNotifications}
            accessibilityRole="button"
            accessibilityLabel={data.notificationAccessibilityLabel}
          >
            <Bell color={palette.white} size={20} strokeWidth={2.2} />
            {data.unreadCount > 0 ? <View style={styles.heroUnreadDot} /> : null}
          </Pressable>
        </View>
        <Pressable style={styles.searchBar} onPress={onSearch}>
          <Search color={palette.faint} size={18} strokeWidth={2.2} />
          <Text style={styles.searchText}>Search for services...</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {data.guide.isVisible ? (
          <Card>
            <View style={styles.guideHeaderRow}>
              <View style={styles.guideIcon}>
                <GuideIcon color={palette.mint} size={22} strokeWidth={2.5} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.cardMeta}>{data.guide.stepLabel}</Text>
                <Text style={styles.cardTitle}>{data.guide.title}</Text>
              </View>
              <Pressable
                style={styles.guideDismissButton}
                onPress={onDismissGuide}
                accessibilityRole="button"
                accessibilityLabel="Dismiss getting started guide"
              >
                <Text style={styles.guideDismissText}>Skip</Text>
              </Pressable>
            </View>
            <Text style={styles.cardBody}>{data.guide.body}</Text>
            <View style={styles.guideFooterRow}>
              <View style={styles.guideDots}>
                {Array.from({ length: data.guide.totalSteps }).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.guideDot,
                      index === data.guide.currentStep && styles.guideDotActive,
                    ]}
                  />
                ))}
              </View>
              <Pressable
                style={styles.guideNextButton}
                onPress={onNextGuideStep}
                accessibilityRole="button"
                accessibilityLabel="Show next getting started tip"
              >
                <Text style={styles.linkText}>{data.guide.nextLabel}</Text>
                <ChevronRight color={palette.mint} size={16} strokeWidth={2.5} />
              </Pressable>
            </View>
          </Card>
        ) : null}

        <Section
          title="Book it again"
          action={
            <Text style={styles.linkText} onPress={onShowRecentBookings}>
              Recent
            </Text>
          }
        >
          <View style={styles.bookAgainRailWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalRail}
            >
              {data.bookAgainRows.map((booking) => (
                <Pressable
                  key={booking.id}
                  style={styles.bookAgainCard}
                  onPress={() => onOpenBooking(booking.booking)}
                  accessibilityRole="button"
                >
                  <View style={styles.bookAgainAvatar}>
                    <Text style={styles.bookAgainInitial}>{booking.initial}</Text>
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.bookAgainTitle} numberOfLines={1}>
                      {booking.title}
                    </Text>
                    <Text style={styles.cardMeta} numberOfLines={1}>
                      {booking.subtitle}
                    </Text>
                  </View>
                  <ChevronRight color={palette.faint} size={18} />
                </Pressable>
              ))}
              {!data.hasBookAgainRows ? (
                <View style={styles.bookAgainCard}>
                  <View style={styles.bookAgainAvatar}>
                    <Sparkles color={palette.white} size={18} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.bookAgainTitle}>No completed bookings yet</Text>
                    <Text style={styles.cardMeta}>Completed services appear here</Text>
                  </View>
                </View>
              ) : null}
            </ScrollView>
            {data.hasBookAgainCue ? (
              <View pointerEvents="none" style={styles.bookAgainRailCue}>
                <ChevronRight color={palette.mint} size={20} strokeWidth={2.6} />
              </View>
            ) : null}
          </View>
        </Section>

        <Section
          title="Browse categories"
          action={
            <Text style={styles.linkText} onPress={onViewAllServices}>
              View all
            </Text>
          }
        >
          <View style={styles.categoryGrid}>
            {data.categoryRows.map((category) => (
              <View key={category.id} style={styles.categoryTileWrapper}>
                <CategoryTile
                  title={category.title}
                  subtitle={category.subtitle}
                  selected={category.isSelected}
                  onPress={() => onSelectCategory(category.category)}
                />
                {category.badges.length > 0 ? (
                  <View style={styles.categoryBadgeAnchor}>
                    {category.badges.map((badge) => (
                      <Badge
                        key={badge.label}
                        label={badge.label}
                        tone={badge.tone}
                      />
                    ))}
                  </View>

                ) : null}
              </View>
            ))}
          </View>
        </Section>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  withBottomNav: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 96,
  },
  customerHero: {
    backgroundColor: palette.mint,
    gap: spacing.base,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.base,
  },
  heroRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroIdentity: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroAvatar: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  heroMuted: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '500',
  },
  heroName: {
    color: palette.white,
    fontSize: 20,
    fontWeight: '900',
  },
  notificationButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.24)',
    borderColor: 'rgba(255,255,255,0.32)',
    borderRadius: radius.md,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    position: 'relative',
    width: 40,
  },
  heroUnreadDot: {
    backgroundColor: palette.coral,
    borderColor: 'rgba(86,196,144,0.8)',
    borderRadius: radius.pill,
    borderWidth: 1.5,
    height: 8,
    position: 'absolute',
    right: 8,
    top: 7,
    width: 8,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
    boxShadow: '0 4px 12px rgba(44,90,60,0.08)',
  },
  searchText: {
    color: palette.faint,
    fontSize: 13,
    fontWeight: '500',
  },
  content: {
    gap: spacing.md,
    padding: spacing.md,
  },
  guideHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  guideIcon: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.sm,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  guideDismissButton: {
    alignItems: 'center',
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  guideDismissText: {
    color: palette.faint,
    fontSize: 12,
    fontWeight: '700',
  },
  guideFooterRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  guideDots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  guideDot: {
    backgroundColor: palette.line,
    borderRadius: radius.pill,
    height: 6,
    width: 6,
  },
  guideDotActive: {
    backgroundColor: palette.mint,
    width: 14,
  },
  guideNextButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
    minHeight: 38,
  },
  bookAgainRailWrap: {
    position: 'relative',
  },
  bookAgainRailCue: {
    alignItems: 'center',
    backgroundColor: 'rgba(240,255,244,0.94)',
    borderRadius: radius.pill,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.xs,
    top: 20,
    width: 32,
    boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
  },
  horizontalRail: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  bookAgainCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 72,
    minWidth: 230,
    padding: spacing.sm,
  },
  bookAgainAvatar: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  bookAgainInitial: {
    color: palette.white,
    fontSize: 13,
    fontWeight: '700',
  },
  bookAgainTitle: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },
  categoryTileWrapper: {
    position: 'relative',
    width: '48%',
  },
  categoryBadgeAnchor: {
    gap: spacing.xs,
    position: 'absolute',
    right: 16,
    top: 16,
    pointerEvents: 'none',
    zIndex: 10,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  flex: {
    flex: 1,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  cardBody: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
  },
  cardMeta: {
    ...type.caption,
    fontSize: 11,
    color: palette.muted,
  },
  linkText: {
    color: palette.mint,
    fontSize: 12,
    fontWeight: '700',
  },
  priceText: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '700',
  },
});
