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
              <CategoryTile
                key={category.id}
                title={category.title}
                subtitle={category.subtitle}
                selected={category.isSelected}
                onPress={() => onSelectCategory(category.category)}
              />
            ))}
          </View>
        </Section>

        <Section
          title="Popular services"
          action={
            <Text style={styles.linkText} onPress={onViewAllServices}>
              View all
            </Text>
          }
        >
          {data.serviceRows.map((service) => (
            <Card
              key={service.id}
              selected={service.isSelected}
              onPress={() => onSelectService(service.service)}
            >
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{service.title}</Text>
                <Text style={styles.priceText}>{service.priceLabel}</Text>
              </View>
              <Text style={styles.cardBody}>{service.description}</Text>
            </Card>
          ))}
        </Section>

        <Section
          title="Top service providers"
          action={
            <Text style={styles.linkText} onPress={onViewTopProviders}>
              View all
            </Text>
          }
        >
          {data.providerRows.map((provider) => (
            <Card
              key={provider.id}
              selected={provider.isSelected}
              onPress={() => onSelectProvider(provider.provider)}
            >
              <View style={styles.rowBetween}>
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>{provider.title}</Text>
                  <Text style={styles.cardMeta}>{provider.providerBusinessName}</Text>
                </View>
                <Badge
                  label={provider.verificationStatus}
                  tone={provider.verificationTone}
                />
              </View>
              <Text style={styles.cardBody}>{provider.description}</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.priceText}>{provider.priceLabel}</Text>
                <Text style={styles.cardMeta}>{provider.ratingLabel}</Text>
              </View>
            </Card>
          ))}
        </Section>
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
  customerHero: {
    backgroundColor: palette.mint,
    gap: spacing.base,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
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
    borderRadius: 14,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  heroMuted: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    fontWeight: '700',
  },
  heroName: {
    color: palette.white,
    fontSize: 24,
    fontWeight: '900',
  },
  notificationButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.24)',
    borderColor: 'rgba(255,255,255,0.32)',
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    position: 'relative',
    width: 44,
  },
  heroUnreadDot: {
    backgroundColor: palette.coral,
    borderColor: 'rgba(86,196,144,0.8)',
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 9,
    position: 'absolute',
    right: 9,
    top: 8,
    width: 9,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
    boxShadow: '0 6px 16px rgba(44,90,60,0.12)',
  },
  searchText: {
    color: palette.faint,
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xl,
  },
  guideHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  guideIcon: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  guideDismissButton: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  guideDismissText: {
    color: palette.faint,
    fontSize: 13,
    fontWeight: '900',
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
    height: 8,
    width: 8,
  },
  guideDotActive: {
    backgroundColor: palette.mint,
    width: 18,
  },
  guideNextButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
    minHeight: 44,
  },
  bookAgainRailWrap: {
    position: 'relative',
  },
  bookAgainRailCue: {
    alignItems: 'center',
    backgroundColor: 'rgba(240,255,244,0.94)',
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.sm,
    top: 22,
    width: 36,
    boxShadow: '0 6px 14px rgba(0,0,0,0.08)',
  },
  horizontalRail: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  bookAgainCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 80,
    minWidth: 250,
    padding: spacing.base,
  },
  bookAgainAvatar: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  bookAgainInitial: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '900',
  },
  bookAgainTitle: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  flex: {
    flex: 1,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  cardBody: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
  },
  cardMeta: {
    ...type.caption,
    color: palette.muted,
  },
  linkText: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '900',
  },
  priceText: {
    color: palette.mint,
    fontSize: 18,
    fontWeight: '900',
  },
});
