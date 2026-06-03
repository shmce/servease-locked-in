import { CheckCircle, ChevronRight, Search, Star, X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  SkeletonBlock,
  SkeletonCircle,
  SkeletonLine,
} from '../../../components/DesignKit';
import {
  CustomerCard,
  CustomerContent,
  CustomerEmptyState,
  CustomerHeader,
  CustomerScreen,
  CustomerSection,
  customerText,
} from '../../../shared/components/CustomerUI';
import { ProviderListing } from '../../../shared/models/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
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
    <CustomerScreen>
      <CustomerContent>
        <CustomerHeader
          title="Choose a Provider"
          subtitle="Compare trusted pros for your service"
          onBack={onBack}
        />

        <CustomerSection>
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
                <X color={palette.faint} size={16} strokeWidth={2.2} />
              </Pressable>
            ) : null}
          </View>
        </CustomerSection>

        <CustomerSection title="Providers">
          <View style={styles.providerList}>
            {showSkeletons
              ? Array.from({ length: 5 }).map((_, index) => (
                  <ProviderRowSkeleton key={`provider-row-skeleton-${index}`} />
                ))
              : data.providerRows.map((row) => (
                  <CustomerCard
                    key={row.id}
                    onPress={() => onOpenProvider(row.provider)}
                    accessibilityLabel={`Open ${row.name} provider profile`}
                  >
                    <View style={styles.providerRow}>
                      <View style={styles.providerAvatar}>
                        <Text style={styles.providerInitial}>{row.initial}</Text>
                      </View>
                      <View style={styles.providerBody}>
                        <View style={styles.nameRow}>
                          <Text style={styles.providerName} numberOfLines={1}>
                            {row.name}
                          </Text>
                          {row.isVerified ? (
                            <CheckCircle
                              color={palette.mintDeep}
                              size={15}
                              strokeWidth={2.2}
                            />
                          ) : null}
                        </View>
                        <Text style={styles.serviceTitle} numberOfLines={1}>
                          {row.serviceTitle}
                        </Text>
                        <View style={styles.providerMeta}>
                          {row.hasRating ? (
                            <View style={styles.ratingRow}>
                              <Star color="#FFB020" fill="#FFB020" size={13} />
                              <Text style={styles.ratingText}>{row.ratingLabel}</Text>
                              <Text style={styles.reviewText}>({row.reviewCount})</Text>
                            </View>
                          ) : (
                            <Text style={styles.noRatingText}>No reviews yet</Text>
                          )}
                          <Text style={styles.priceText}>{row.priceLabel}</Text>
                        </View>
                      </View>
                      <ChevronRight color={palette.faint} size={18} />
                    </View>
                  </CustomerCard>
                ))}
          </View>

          {!showSkeletons && !data.hasVisibleProviders ? (
            <CustomerEmptyState
              title="No providers found"
              body="Try a different search term."
            />
          ) : null}
        </CustomerSection>
      </CustomerContent>
    </CustomerScreen>
  );
}

function ProviderRowSkeleton() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.providerSkeletonCard}
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
    borderColor: '#EEF0F2',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.base,
  },
  searchInput: {
    color: '#202733',
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0,
    minHeight: 48,
  },
  providerList: {
    gap: spacing.md,
  },
  providerSkeletonCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#EEF0F2',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: 14,
  },
  providerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  providerAvatar: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderRadius: radius.pill,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  providerInitial: {
    color: palette.mintDeep,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0,
  },
  providerBody: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  providerName: {
    ...customerText.title,
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    minWidth: 0,
  },
  serviceTitle: {
    ...customerText.meta,
  },
  providerMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginTop: 2,
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
    color: '#202733',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
  },
  reviewText: {
    ...customerText.meta,
    fontSize: 11,
    lineHeight: 15,
  },
  noRatingText: {
    ...customerText.meta,
    fontSize: 11,
    lineHeight: 15,
  },
  priceText: {
    color: palette.mintDeep,
    flexShrink: 0,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
  },
});
