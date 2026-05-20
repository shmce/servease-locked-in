import { useState } from 'react';
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
import { Card, Pill, Section } from '../../../components/DesignKit';
import {
  BookingSummary,
  CatalogCategory,
  CatalogServiceItem,
  CurrentUserProfile,
  ProviderListing,
} from '../../../shared/models/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import {
  CategoryFilter,
  useCustomerExploreViewModel,
} from '../viewModels/useCustomerExploreViewModel';

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

const filterOptions: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'popular', label: 'Popular' },
  { key: 'top-rated', label: 'Top Rated' },
];

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
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const explore = useCustomerExploreViewModel({
    bookings,
    categories,
    categoryFilter,
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
              <Text style={styles.heroMuted}>Good afternoon</Text>
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
                <GuideIcon color={palette.mint} size={20} strokeWidth={2.5} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.guideStepLabel}>{data.guide.stepLabel}</Text>
                <Text style={styles.guideCardTitle}>{data.guide.title}</Text>
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
            <Text style={styles.guideBody}>{data.guide.body}</Text>
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
              See all
            </Text>
          }
        >
          <View style={styles.bookAgainList}>
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
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {booking.title}
                  </Text>
                  <Text style={styles.itemMeta} numberOfLines={1}>
                    {booking.subtitle}
                  </Text>
                </View>
                <View style={styles.rebookPill}>
                  <Text style={styles.rebookPillText}>Rebook</Text>
                </View>
              </Pressable>
            ))}
            {!data.hasBookAgainRows ? (
              <View style={styles.bookAgainEmpty}>
                <View style={styles.bookAgainEmptyIcon}>
                  <Sparkles color={palette.mint} size={18} strokeWidth={2.2} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.itemTitle}>No completed bookings yet</Text>
                  <Text style={styles.itemMeta}>Completed services appear here</Text>
                </View>
              </View>
            ) : null}
          </View>
        </Section>

        <Section
          title="Browse Categories"
          action={
            <Text style={styles.linkText} onPress={onViewAllServices}>
              View all
            </Text>
          }
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {filterOptions.map(({ key, label }) => (
              <Pill
                key={key}
                label={label}
                selected={categoryFilter === key}
                onPress={() => setCategoryFilter(key)}
              />
            ))}
          </ScrollView>

          <View style={styles.categoryList}>
            {data.categoryRows.map((category) => (
              <CategoryTile
                key={category.id}
                title={category.title}
                subtitle={category.subtitle}
                selected={category.isSelected}
                tag={category.isPopular ? 'Popular' : undefined}
                onPress={() => onSelectCategory(category.category)}
              />
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

  // Hero
  customerHero: {
    backgroundColor: palette.mint,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    gap: spacing.base,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.base,
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
    borderRadius: radius.lg,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  heroMuted: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '500',
  },
  heroName: {
    color: palette.white,
    fontSize: 20,
    fontWeight: '700',
  },
  notificationButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderColor: 'rgba(255,255,255,0.28)',
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
    minHeight: 48,
    paddingHorizontal: spacing.base,
    boxShadow: '0 4px 14px rgba(44,90,60,0.12)',
  },
  searchText: {
    color: palette.faint,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },

  // Page content
  content: {
    gap: spacing.lg,
    padding: spacing.base,
    paddingTop: spacing.lg,
  },

  // Guide card internals
  guideHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  guideIcon: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.sm,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  guideStepLabel: {
    color: palette.mint,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  guideCardTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 1,
  },
  guideDismissButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: spacing.xs,
  },
  guideDismissText: {
    color: palette.faint,
    fontSize: 12,
    fontWeight: '700',
  },
  guideBody: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
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
    width: 16,
  },
  guideNextButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
    minHeight: 36,
  },

  // Book again — vertical list
  bookAgainList: {
    gap: spacing.sm,
  },
  bookAgainCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 70,
    padding: spacing.sm,
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
  },
  bookAgainEmpty: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 70,
    padding: spacing.sm,
  },
  bookAgainEmptyIcon: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  bookAgainAvatar: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  bookAgainInitial: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '700',
  },
  rebookPill: {
    backgroundColor: palette.mintSoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  rebookPillText: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '700',
  },

  // Browse categories — filter + single column list
  filterRow: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categoryList: {
    gap: spacing.sm,
  },

  // Shared text
  itemTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  itemMeta: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    marginTop: 2,
  },
  linkText: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '700',
  },
  flex: {
    flex: 1,
  },
});
