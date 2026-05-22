import { CheckCircle, ChevronRight, Search, Star } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  EmptyState,
  SkeletonBlock,
  SkeletonCircle,
  SkeletonLine,
  TopBar,
} from '../../../components/DesignKit';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { ProviderListing } from '../../../shared/models/types';
import { ScreenContent, ScreenScroll } from '../../../shared/components/ScreenLayout';
import { useCustomerTopProvidersViewModel } from '../viewModels/useCustomerTopProvidersViewModel';

type CustomerTopProvidersScreenProps = {
  providers: ProviderListing[];
  marketplaceSearchQuery: string;
  isLoading?: boolean;
  onBack: () => void;
  onSearchQueryChange: (value: string) => void;
  onOpenProvider: (provider: ProviderListing) => void;
};

export function CustomerTopProvidersScreen({
  providers,
  marketplaceSearchQuery,
  isLoading = false,
  onBack,
  onSearchQueryChange,
  onOpenProvider,
}: CustomerTopProvidersScreenProps) {
  const topProviders = useCustomerTopProvidersViewModel({
    providers,
    marketplaceSearchQuery,
  });
  const { data } = topProviders;
  const showSkeletons = isLoading && providers.length === 0;

  return (
    <>
      <TopBar title="Choose a Provider" onBack={onBack} />
      <ScreenScroll>
        <ScreenContent>
          <View style={styles.searchBar}>
            <Search color={palette.faint} size={16} strokeWidth={2.2} />
            <TextInput
              style={styles.searchInput}
              value={marketplaceSearchQuery}
              onChangeText={onSearchQueryChange}
              placeholder="Search by name or service..."
              placeholderTextColor={palette.faint}
              returnKeyType="search"
              autoCapitalize="none"
            />
            {marketplaceSearchQuery.length > 0 ? (
              <Pressable
                onPress={() => onSearchQueryChange('')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <Text style={styles.searchClear}>✕</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.providerList}>
            {showSkeletons
              ? Array.from({ length: 5 }).map((_, index) => (
                  <ProviderRowSkeleton key={`provider-row-skeleton-${index}`} />
                ))
              : data.providerRows.map((row) => (
                  <Pressable
                    key={row.id}
                    style={styles.providerCard}
                    onPress={() => onOpenProvider(row.provider)}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${row.name} provider profile`}
                  >
                    <View style={styles.providerAvatar}>
                      <Text style={styles.providerInitial}>{row.initial}</Text>
                    </View>
                    <View style={styles.providerBody}>
                      <View style={styles.nameRow}>
                        <Text style={styles.providerName} numberOfLines={1}>{row.name}</Text>
                        {row.isVerified ? (
                          <CheckCircle color={palette.mint} size={15} strokeWidth={2.2} />
                        ) : null}
                      </View>
                      <Text style={styles.serviceTitle} numberOfLines={1}>{row.serviceTitle}</Text>
                      <View style={styles.providerMeta}>
                        {row.hasRating ? (
                          <View style={styles.ratingRow}>
                            <Star color="#FFC107" fill="#FFC107" size={13} />
                            <Text style={styles.ratingText}>{row.ratingLabel}</Text>
                            <Text style={styles.reviewText}>({row.reviewCount})</Text>
                          </View>
                        ) : (
                          <Text style={styles.noRatingText}>No reviews yet</Text>
                        )}
                      </View>
                    </View>
                    <ChevronRight color={palette.faint} size={18} />
                  </Pressable>
                ))}
          </View>

          {!showSkeletons && !data.hasVisibleProviders ? (
            <EmptyState title="No providers found" body="Try a different search term." />
          ) : null}
        </ScreenContent>
      </ScreenScroll>
    </>
  );
}

function ProviderRowSkeleton() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.providerCard}
    >
      <SkeletonCircle size={48} />
      <View style={styles.providerBody}>
        <View style={styles.nameRow}>
          <SkeletonLine width="58%" height={14} />
          <SkeletonCircle size={15} />
        </View>
        <SkeletonLine width="44%" height={10} />
        <SkeletonLine width="34%" height={10} style={styles.providerMetaSkeleton} />
      </View>
      <SkeletonBlock width={18} height={18} radius={radius.pill} />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 46,
    paddingHorizontal: spacing.base,
  },
  searchInput: {
    color: palette.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    minHeight: 46,
  },
  searchClear: {
    color: palette.faint,
    fontSize: 13,
    fontWeight: '700',
  },
  providerList: {
    gap: spacing.sm,
  },
  providerCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
  },
  providerAvatar: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  providerInitial: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '800',
  },
  providerBody: {
    flex: 1,
    gap: spacing.xs,
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  providerName: {
    color: palette.ink,
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  serviceTitle: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '500',
  },
  providerMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  providerMetaSkeleton: {
    marginTop: spacing.xs,
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
  },
  ratingText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  reviewText: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '500',
  },
  noRatingText: {
    color: palette.faint,
    fontSize: 11,
    fontWeight: '500',
  },
  priceText: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '800',
  },
});
