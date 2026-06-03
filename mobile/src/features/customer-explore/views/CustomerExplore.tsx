import { useState } from 'react';
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronRight,
  Droplets,
  HandHeart,
  Headphones,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  SprayCan,
  Star,
  Tag,
  Wrench,
  Zap,
} from 'lucide-react-native';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
} from 'react-native';
import {
  BookingSummary,
  CatalogCategory,
  CatalogServiceItem,
  CurrentUserProfile,
  ProviderListing,
} from '../../../shared/models/types';
import {
  InlineRefreshHint,
  ListSectionSkeleton,
} from '../../../shared/components/LoadingStates';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { CategoryFilter, useCustomerExploreViewModel } from '../viewModels/useCustomerExploreViewModel';
import { CategorySheet } from './CategorySheet';

const exploreImages = {
  avatar: require('../../../../assets/explore/customer-explore-avatar.png'),
  hero: require('../../../../assets/explore/customer-explore-hero-home.png'),
  recommendations: {
    aircon: require('../../../../assets/explore/customer-explore-aircon.png'),
    cleaning: require('../../../../assets/explore/customer-explore-cleaning.png'),
    repairs: require('../../../../assets/explore/customer-explore-repairs.png'),
  },
} as const;

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
  onTrackBooking?: (booking: BookingSummary) => void;
  isCatalogLoading?: boolean;
  isProfileLoading?: boolean;
  onViewAllServices: () => void;
  onViewTopProviders: () => void;
};

type ExploreData = ReturnType<typeof useCustomerExploreViewModel>['data'];
type ReferenceCategoryRow = ExploreData['referenceCategoryRows'][number];
type RecommendedServiceRow = ExploreData['recommendedServiceRows'][number];
type TrustRow = ExploreData['referenceTrustRows'][number];

export function CustomerExploreScreen(props: CustomerExploreScreenProps) {
  const { width } = useWindowDimensions();
  const [sheetCategory, setSheetCategory] = useState<CatalogCategory | null>(null);
  const [sheetSearchQuery, setSheetSearchQuery] = useState('');
  const categoryFilter: CategoryFilter = 'all';

  const explore = useCustomerExploreViewModel({
    bookings: props.bookings,
    categories: props.categories,
    categoryFilter,
    customerGuideDismissed: props.customerGuideDismissed,
    customerGuideStep: props.customerGuideStep,
    profile: props.profile,
    providers: props.providers,
    selectedCategoryId: props.selectedCategoryId,
    selectedProviderId: props.selectedProviderId,
    selectedServiceId: props.selectedServiceId,
    services: props.services,
    sheetCategoryId: sheetCategory?.id ?? null,
    sheetSearchQuery,
    isProfileLoading: props.isProfileLoading,
    unreadCount: props.unreadCount,
  });

  const { data } = explore;
  const contentWidth = Math.max(width - 40, 280);
  const categoryTileWidth = Math.min(62, Math.max(58, Math.floor((contentWidth - spacing.sm * 4) / 5)));
  const recommendationCardWidth = Math.min(112, Math.max(104, Math.floor((contentWidth - spacing.sm * 2) / 3)));
  const isCatalogInitialLoading =
    Boolean(props.isCatalogLoading) &&
    props.categories.length === 0 &&
    props.services.length === 0 &&
    props.providers.length === 0;
  const isCatalogRefreshing =
    Boolean(props.isCatalogLoading) && !isCatalogInitialLoading;

  function openSheet(category: CatalogCategory) {
    setSheetCategory(category);
    setSheetSearchQuery('');
  }

  function closeSheet() {
    setSheetCategory(null);
    setSheetSearchQuery('');
  }

  function handleCategoryPress(category: CatalogCategory | null) {
    if (!category) {
      return;
    }

    openSheet(category);
  }

  function handleSeeAllCategory() {
    if (sheetCategory) {
      props.onSelectCategory(sheetCategory);
    }
    closeSheet();
  }

  function handleRecommendationPress(service: CatalogServiceItem | null) {
    if (!service) {
      props.onSearch();
      return;
    }

    props.onSelectService(service);
  }

  function handleBookingCardPress() {
    const booking = data.upcomingBookingCard.booking;
    if (!booking) {
      props.onSearch();
      return;
    }

    if (booking.status === 'in_progress' && props.onTrackBooking) {
      props.onTrackBooking(booking);
      return;
    }

    props.onOpenBooking(booking);
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <ExploreHeader
            customerName={data.customerName}
            locationLabel={data.locationLabel}
            unreadCount={data.unreadCount}
            onAvatarPress={props.onShowNotifications}
          />

          <SearchFilterRow onFilter={props.onSearch} onSearch={props.onSearch} />

          <HeroCard onBook={props.onSearch} />

          {isCatalogRefreshing ? (
            <InlineRefreshHint label="Refreshing catalog" />
          ) : null}

          {isCatalogInitialLoading ? (
            <ExploreCatalogSkeleton />
          ) : (
            <>
              <CategoryRail
                rows={data.referenceCategoryRows}
                tileWidth={categoryTileWidth}
                onPress={handleCategoryPress}
              />

              <RecommendedSection
                cardWidth={recommendationCardWidth}
                rows={data.recommendedServiceRows}
                onPress={handleRecommendationPress}
                onSeeAll={props.onViewAllServices}
              />
            </>
          )}

          <UpcomingBookingCard
            card={data.upcomingBookingCard}
            onPress={handleBookingCardPress}
          />

          <TrustStrip rows={data.referenceTrustRows} />
        </View>
      </ScrollView>

      <CategorySheet
        category={sheetCategory}
        serviceRows={data.sheetServiceRows}
        totalServiceCount={data.sheetTotalServiceCount}
        searchQuery={sheetSearchQuery}
        onSearchChange={setSheetSearchQuery}
        onSelectService={(service) => {
          closeSheet();
          props.onSelectService(service);
        }}
        onSeeAll={handleSeeAllCategory}
        onClose={closeSheet}
      />
    </View>
  );
}

function ExploreCatalogSkeleton() {
  return (
    <View style={styles.catalogLoadingGroup}>
      <ListSectionSkeleton count={4} label="Loading service categories" />
    </View>
  );
}

function ExploreHeader({
  customerName,
  locationLabel,
  unreadCount,
  onAvatarPress,
}: {
  customerName: string;
  locationLabel: string;
  unreadCount: number;
  onAvatarPress: () => void;
}) {
  const displayName = compactCustomerName(customerName);

  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.greeting}>Good afternoon,</Text>
        <Text style={styles.customerName} numberOfLines={1}>
          {displayName} 👋
        </Text>
        <View style={styles.locationRow}>
          <MapPin color={palette.mintDeep} size={17} strokeWidth={2.6} />
          <Text style={styles.locationText} numberOfLines={1}>
            {locationLabel}
          </Text>
          <ChevronDown color="#69736F" size={16} strokeWidth={2.4} />
        </View>
      </View>

      <Pressable
        style={styles.avatarButton}
        onPress={onAvatarPress}
        accessibilityRole="button"
        accessibilityLabel={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : 'Notifications'
        }
      >
        <Image source={exploreImages.avatar} style={styles.avatarImage} />
        {unreadCount > 0 ? <View style={styles.unreadDot} /> : null}
      </Pressable>
    </View>
  );
}

function compactCustomerName(customerName: string): string {
  const [firstName] = customerName.trim().split(/\s+/);
  return firstName || 'You';
}

function SearchFilterRow({
  onFilter,
  onSearch,
}: {
  onFilter: () => void;
  onSearch: () => void;
}) {
  return (
    <View style={styles.searchRow}>
      <Pressable
        style={styles.searchBox}
        onPress={onSearch}
        accessibilityRole="button"
        accessibilityLabel="Search for a service or task"
      >
        <Search color="#8A95A1" size={20} strokeWidth={2.1} />
        <Text style={styles.searchPlaceholder} numberOfLines={1}>
          Search for a service or task
        </Text>
      </Pressable>

      <Pressable
        style={styles.filterButton}
        onPress={onFilter}
        accessibilityRole="button"
        accessibilityLabel="Filter services"
      >
        <SlidersHorizontal color={palette.mintDeep} size={23} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

function HeroCard({ onBook }: { onBook: () => void }) {
  return (
    <View style={styles.heroCard}>
      <View style={styles.heroCopy}>
        <Text style={styles.heroTitle}>
          Trusted help for{'\n'}
          <Text style={styles.heroTitleAccent}>your home</Text>
        </Text>
        <Text style={styles.heroBody}>
          Verified pros. Clear pricing.{'\n'}Hassle-free booking.
        </Text>
        <Pressable
          style={styles.heroButton}
          onPress={onBook}
          accessibilityRole="button"
          accessibilityLabel="Book a service"
        >
          <Text style={styles.heroButtonText}>Book a service</Text>
          <ArrowRight color={palette.white} size={16} strokeWidth={2.5} />
        </Pressable>
      </View>
      <Image
        source={exploreImages.hero}
        style={styles.heroImage}
        resizeMode="contain"
        accessible={false}
      />
    </View>
  );
}

function CategoryRail({
  rows,
  tileWidth,
  onPress,
}: {
  rows: ReferenceCategoryRow[];
  tileWidth: number;
  onPress: (category: CatalogCategory | null) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryRow}
    >
      {rows.map((row) => (
        <CategoryTile
          key={row.id}
          row={row}
          tileWidth={tileWidth}
          onPress={() => onPress(row.category)}
        />
      ))}
    </ScrollView>
  );
}

function CategoryTile({
  row,
  tileWidth,
  onPress,
}: {
  row: ReferenceCategoryRow;
  tileWidth: number;
  onPress: () => void;
}) {
  const Icon = categoryIconFor(row.iconKey);
  const isDisabled = !row.isAvailable;

  return (
    <Pressable
      style={[
        styles.categoryTile,
        { width: tileWidth },
        row.isSelected && styles.categoryTileSelected,
        isDisabled && styles.categoryTileDisabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={
        isDisabled
          ? `${row.label} category not available yet`
          : `Browse ${row.label}`
      }
      accessibilityState={{ disabled: isDisabled, selected: row.isSelected }}
    >
      <Icon
        color={isDisabled ? '#A9B0B8' : palette.mintDeep}
        size={21}
        strokeWidth={2.05}
      />
      <Text
        style={[styles.categoryLabel, isDisabled && styles.categoryLabelDisabled]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.82}
      >
        {row.label}
      </Text>
      {isDisabled ? (
        <Text style={styles.categoryStatus} numberOfLines={1}>
          Soon
        </Text>
      ) : null}
    </Pressable>
  );
}

function RecommendedSection({
  cardWidth,
  rows,
  onPress,
  onSeeAll,
}: {
  cardWidth: number;
  rows: RecommendedServiceRow[];
  onPress: (service: CatalogServiceItem | null) => void;
  onSeeAll: () => void;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended for you</Text>
        <Pressable
          style={styles.seeAllButton}
          onPress={onSeeAll}
          accessibilityRole="button"
          accessibilityLabel="See all recommended services"
        >
          <Text style={styles.seeAllText}>See all</Text>
          <ChevronRight color={palette.mintDeep} size={18} strokeWidth={2.4} />
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recommendationRow}
      >
        {rows.map((row) => (
          <RecommendationCard
            key={row.id}
            row={row}
            width={cardWidth}
            onPress={() => onPress(row.service)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function RecommendationCard({
  row,
  width,
  onPress,
}: {
  row: RecommendedServiceRow;
  width: number;
  onPress: () => void;
}) {
  const imageSource = exploreImages.recommendations[
    row.imageKey as keyof typeof exploreImages.recommendations
  ] as ImageSourcePropType;

  return (
    <Pressable
      style={[styles.recommendationCard, { width }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Book ${row.title}`}
    >
      <Image
        source={imageSource}
        style={[styles.recommendationImage, { height: Math.round(width * 0.66) }]}
        resizeMode="cover"
      />
      <View style={styles.recommendationBody}>
        <Text style={styles.recommendationTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.88}>
          {row.title}
        </Text>
        <Text style={styles.recommendationProvider} numberOfLines={1}>
          {row.providerLabel}
        </Text>
        <View style={styles.recommendationMeta}>
          <View style={styles.ratingRow}>
            <Star color="#F5A83A" fill="#F5A83A" size={13} strokeWidth={1.8} />
            <Text style={styles.ratingText}>{row.ratingLabel}</Text>
          </View>
          <Text style={styles.priceText}>{row.priceLabel}</Text>
        </View>
        <View style={styles.fastPill}>
          <Text style={styles.fastPillText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.76}>
            {row.pillLabel}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function UpcomingBookingCard({
  card,
  onPress,
}: {
  card: ExploreData['upcomingBookingCard'];
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.upcomingCard}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={card.booking ? `Open ${card.title} booking` : 'Book a service'}
    >
      <View style={styles.upcomingIconBox}>
        <Calendar color={palette.mintDeep} size={27} strokeWidth={2.1} />
      </View>
      <View style={styles.upcomingText}>
        <Text style={styles.upcomingStatus}>{card.statusLabel}</Text>
        <Text style={styles.upcomingTitle} numberOfLines={1}>
          {card.title}
        </Text>
        <Text style={styles.upcomingMeta} numberOfLines={1}>
          {card.meta}
        </Text>
      </View>
      <Image source={exploreImages.avatar} style={styles.bookingAvatar} />
      <ChevronRight color="#7E8582" size={24} strokeWidth={2.1} />
    </Pressable>
  );
}

function TrustStrip({ rows }: { rows: TrustRow[] }) {
  return (
    <View style={styles.trustStrip}>
      {rows.map((row, index) => {
        const Icon = trustIconFor(row.iconKey);

        return (
          <View key={row.title} style={styles.trustItem}>
            {index > 0 ? <View style={styles.trustDivider} /> : null}
            <Icon color={palette.mintDeep} size={22} strokeWidth={1.9} />
            <View style={styles.trustText}>
              <Text style={styles.trustTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82}>
                {row.title}
              </Text>
              <Text style={styles.trustBody} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82}>
                {row.body}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function categoryIconFor(key: ReferenceCategoryRow['iconKey']) {
  switch (key) {
    case 'cleaning':
      return SprayCan;
    case 'plumbing':
      return Droplets;
    case 'electrical':
      return Zap;
    case 'home-care':
      return HandHeart;
    case 'repairs':
    default:
      return Wrench;
  }
}

function trustIconFor(key: TrustRow['iconKey']) {
  switch (key) {
    case 'tag':
      return Tag;
    case 'headphones':
      return Headphones;
    case 'shield':
    default:
      return ShieldCheck;
  }
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.white,
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 112,
  },
  content: {
    gap: 12,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 76,
  },
  headerText: {
    flex: 1,
    paddingRight: spacing.md,
  },
  greeting: {
    color: '#444C57',
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 22,
  },
  customerName: {
    color: '#16191E',
    fontSize: 25,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 30,
    marginTop: 2,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    maxWidth: '100%',
  },
  locationText: {
    color: '#43464C',
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 20,
  },
  avatarButton: {
    alignItems: 'center',
    borderColor: 'rgba(0,160,85,0.26)',
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 58,
    justifyContent: 'center',
    overflow: 'visible',
    position: 'relative',
    width: 58,
  },
  avatarImage: {
    borderRadius: radius.pill,
    height: 50,
    width: 50,
  },
  unreadDot: {
    backgroundColor: palette.mintDeep,
    borderColor: palette.white,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 11,
    position: 'absolute',
    right: 3,
    top: 4,
    width: 11,
  },
  searchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#E3E5E8',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 58,
    paddingHorizontal: spacing.md,
  },
  searchPlaceholder: {
    color: '#9AA0AA',
    flex: 1,
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 18,
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#E3E5E8',
    borderRadius: 16,
    borderWidth: 1,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  heroCard: {
    backgroundColor: '#F3F8F5',
    borderRadius: 18,
    flexDirection: 'row',
    minHeight: 176,
    overflow: 'hidden',
    paddingLeft: spacing.md,
    paddingVertical: spacing.md,
    position: 'relative',
  },
  heroCopy: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 154,
    zIndex: 2,
  },
  heroTitle: {
    color: '#101418',
    fontSize: 23,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 29,
  },
  heroTitleAccent: {
    color: palette.mintDeep,
  },
  heroBody: {
    color: '#68707D',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  heroButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: palette.mintDeep,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 38,
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingHorizontal: 14,
  },
  heroButtonText: {
    color: palette.white,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
  },
  heroImage: {
    bottom: 2,
    height: 166,
    position: 'absolute',
    right: -6,
    width: 202,
  },
  categoryRow: {
    gap: spacing.sm,
  },
  catalogLoadingGroup: {
    gap: spacing.md,
  },
  categoryTile: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#E4E6E8',
    borderRadius: 16,
    borderWidth: 1,
    gap: 5,
    height: 76,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  categoryTileSelected: {
    backgroundColor: palette.white,
    borderColor: '#CDEEDD',
  },
  categoryTileDisabled: {
    backgroundColor: '#F5F6F7',
    borderColor: '#ECEFF1',
  },
  categoryLabel: {
    color: '#22262C',
    fontSize: 9,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 11,
    maxWidth: '100%',
    textAlign: 'center',
  },
  categoryLabelDisabled: {
    color: '#7D8791',
  },
  categoryStatus: {
    color: '#8A95A1',
    fontSize: 7,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 9,
    textAlign: 'center',
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#22262C',
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 24,
  },
  seeAllButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
    minHeight: 28,
  },
  seeAllText: {
    color: palette.mintDeep,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0,
  },
  recommendationRow: {
    gap: spacing.sm,
  },
  recommendationCard: {
    backgroundColor: palette.white,
    borderColor: '#E4E6E8',
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  recommendationImage: {
    backgroundColor: '#EEF3F1',
    width: '100%',
  },
  recommendationBody: {
    gap: 2,
    paddingBottom: 6,
    paddingHorizontal: 7,
    paddingTop: 6,
  },
  recommendationTitle: {
    color: '#141820',
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 15,
  },
  recommendationProvider: {
    color: '#49515C',
    fontSize: 9.5,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 13,
  },
  recommendationMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  ratingText: {
    color: '#252A31',
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 14,
  },
  priceText: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 16,
  },
  fastPill: {
    alignSelf: 'stretch',
    backgroundColor: '#EFF9F3',
    borderRadius: radius.pill,
    marginTop: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  fastPillText: {
    color: '#15794B',
    fontSize: 7,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 11,
    textAlign: 'center',
  },
  upcomingCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#E4E6E8',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 102,
    paddingHorizontal: spacing.md,
  },
  upcomingIconBox: {
    alignItems: 'center',
    backgroundColor: '#EAF7F0',
    borderRadius: 16,
    height: 62,
    justifyContent: 'center',
    width: 62,
  },
  upcomingText: {
    flex: 1,
    minWidth: 0,
  },
  upcomingStatus: {
    color: palette.mintDeep,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 19,
  },
  upcomingTitle: {
    color: '#151920',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 23,
    marginTop: spacing.xs,
  },
  upcomingMeta: {
    color: '#69707A',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  bookingAvatar: {
    borderColor: 'rgba(0,160,85,0.28)',
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 54,
    width: 54,
  },
  trustStrip: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
  },
  trustItem: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 56,
    minWidth: 0,
    position: 'relative',
  },
  trustDivider: {
    backgroundColor: '#E2E4E5',
    bottom: 2,
    left: -spacing.xs,
    position: 'absolute',
    top: 2,
    width: 1,
  },
  trustText: {
    flex: 1,
    minWidth: 0,
  },
  trustTitle: {
    color: '#20242B',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 18,
  },
  trustBody: {
    color: '#7A818B',
    fontSize: 8.5,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 12,
    marginTop: 1,
  },
});
