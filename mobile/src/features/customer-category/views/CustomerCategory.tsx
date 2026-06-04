import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Star, X } from 'lucide-react-native';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  CustomerCard,
  CustomerContent,
  CustomerEmptyState,
  CustomerHeader,
  CustomerScreen,
  CustomerSection,
  customerText,
} from '../../../shared/components/CustomerUI';
import {
  InlineRefreshHint,
  ListSectionSkeleton,
} from '../../../shared/components/LoadingStates';
import {
  CatalogCategory,
  CatalogServiceItem,
  ProviderListing,
} from '../../../shared/models/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { useCustomerCategoryViewModel } from '../viewModels/useCustomerCategoryViewModel';

type CustomerCategoryScreenProps = {
  categories: CatalogCategory[];
  providers?: ProviderListing[];
  selectedCategoryId: string | null;
  services: CatalogServiceItem[];
  isLoading?: boolean;
  onBack: () => void;
  onOpenCategory?: (category: CatalogCategory | null) => void;
  onOpenService: (service: CatalogServiceItem) => void;
};

export function CustomerCategoryScreen({
  categories,
  providers,
  selectedCategoryId,
  services,
  isLoading = false,
  onBack,
  onOpenCategory,
  onOpenService,
}: CustomerCategoryScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const category = useCustomerCategoryViewModel({
    categories,
    providers,
    searchQuery,
    selectedCategoryId,
    services,
  });
  const { data } = category;
  const isInitialLoading = isLoading && data.serviceRows.length === 0;
  const isRefreshing = isLoading && data.serviceRows.length > 0;

  return (
    <CustomerScreen>
      <CustomerContent>
        <CustomerHeader
          title={data.categoryName}
          subtitle={data.serviceCountLabel}
          onBack={onBack}
        />

        <View style={styles.categoryHero}>
          <Text style={styles.heroEyebrow}>Browse category</Text>
          <Text style={styles.heroTitle} numberOfLines={2}>
            {data.categoryName}
          </Text>
          <Text style={styles.heroBody} numberOfLines={3}>
            {data.categoryDescription}
          </Text>
          <View style={styles.heroMetaPill}>
            <Text style={styles.heroMetaText}>{data.serviceCountLabel}</Text>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Search color={palette.faint} size={16} strokeWidth={2.2} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={data.searchPlaceholder}
            placeholderTextColor={palette.faint}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {searchQuery.length > 0 ? (
            <Pressable
              onPress={() => setSearchQuery('')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <X color={palette.faint} size={16} strokeWidth={2.2} />
            </Pressable>
          ) : null}
        </View>

        {onOpenCategory ? (
          <CustomerSection title="Explore by category">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRail}
            >
              {data.categoryRows.map((row) => (
                <Pressable
                  key={row.id}
                  style={[
                    styles.categoryChip,
                    row.isSelected && styles.categoryChipSelected,
                  ]}
                  onPress={() => onOpenCategory(row.category)}
                  accessibilityRole="button"
                  accessibilityLabel={`Browse ${row.label}`}
                  accessibilityState={{ selected: row.isSelected }}
                >
                  <Text
                    style={[
                      styles.categoryChipTitle,
                      row.isSelected && styles.categoryChipTitleSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {row.label}
                  </Text>
                  <Text
                    style={[
                      styles.categoryChipMeta,
                      row.isSelected && styles.categoryChipMetaSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {row.serviceCountLabel}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </CustomerSection>
        ) : null}

        <CustomerSection
          title={
            data.categoryName === 'Services'
              ? 'All services'
              : `${data.categoryName} services`
          }
          action={
            data.hasServices ? (
              <Text style={styles.pageRange}>{data.pagination.itemRangeLabel}</Text>
            ) : null
          }
        >
          {isRefreshing ? <InlineRefreshHint label="Refreshing services" /> : null}

          {isInitialLoading ? (
            <ListSectionSkeleton count={5} label="Loading category services" />
          ) : (
            <View style={styles.serviceList}>
              {data.serviceRows.map((row) => (
                <CustomerCard
                  key={row.id}
                  style={styles.serviceCard}
                  onPress={() => onOpenService(row.service)}
                  accessibilityLabel={`Open ${row.name}`}
                >
                  <View style={styles.serviceCardHeader}>
                    <View style={styles.serviceIdentity}>
                      <View style={styles.serviceThumb}>
                        <Text style={styles.serviceThumbText}>
                          {row.name.slice(0, 1)}
                        </Text>
                      </View>
                      <View style={styles.serviceTitleCopy}>
                        <Text style={styles.serviceName} numberOfLines={2}>
                          {row.name}
                        </Text>
                        <Text style={styles.serviceDesc} numberOfLines={2}>
                          {row.description}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.pricePill}>
                      <Text style={styles.priceText}>{row.priceLabel}</Text>
                    </View>
                  </View>
                  <View style={styles.serviceFooter}>
                    <View style={styles.serviceMetaRow}>
                      {row.hasRating ? (
                        <View style={styles.ratingRow}>
                          <Star color="#FFB020" fill="#FFB020" size={13} />
                          <Text style={styles.ratingText}>{row.ratingLabel}</Text>
                          <Text style={styles.reviewText}>
                            {row.reviewCount} reviews
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.noRatingText}>No reviews yet</Text>
                      )}
                    </View>
                    <View style={styles.openServicePill}>
                      <Text style={styles.openServiceText}>View</Text>
                      <ChevronRight color={palette.mintDeep} size={16} />
                    </View>
                  </View>
                </CustomerCard>
              ))}
            </View>
          )}

          {!isInitialLoading && !data.hasServices ? (
            <CustomerEmptyState
              title={data.emptyState.title}
              body={data.emptyState.body}
            />
          ) : null}

          {!isInitialLoading && data.hasServices ? (
            <PaginationControls
              hasNextPage={data.pagination.hasNextPage}
              hasPreviousPage={data.pagination.hasPreviousPage}
              pageLabel={data.pagination.pageLabel}
              onNext={category.actions.goToNextPage}
              onPrevious={category.actions.goToPreviousPage}
            />
          ) : null}
        </CustomerSection>
      </CustomerContent>
    </CustomerScreen>
  );
}

function PaginationControls({
  hasNextPage,
  hasPreviousPage,
  pageLabel,
  onNext,
  onPrevious,
}: {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageLabel: string;
  onNext: () => void;
  onPrevious: () => void;
}) {
  return (
    <View style={styles.paginationRow}>
      <Pressable
        style={[
          styles.pageButton,
          !hasPreviousPage && styles.pageButtonDisabled,
        ]}
        disabled={!hasPreviousPage}
        onPress={onPrevious}
        accessibilityRole="button"
        accessibilityLabel="Previous services page"
        accessibilityState={{ disabled: !hasPreviousPage }}
      >
        <ChevronLeft
          color={hasPreviousPage ? palette.mintDeep : palette.faint}
          size={16}
          strokeWidth={2.4}
        />
        <Text
          style={[
            styles.pageButtonText,
            !hasPreviousPage && styles.pageButtonTextDisabled,
          ]}
        >
          Previous
        </Text>
      </Pressable>

      <Text style={styles.pageLabel}>{pageLabel}</Text>

      <Pressable
        style={[styles.pageButton, !hasNextPage && styles.pageButtonDisabled]}
        disabled={!hasNextPage}
        onPress={onNext}
        accessibilityRole="button"
        accessibilityLabel="Next services page"
        accessibilityState={{ disabled: !hasNextPage }}
      >
        <Text
          style={[
            styles.pageButtonText,
            !hasNextPage && styles.pageButtonTextDisabled,
          ]}
        >
          Next
        </Text>
        <ChevronRight
          color={hasNextPage ? palette.mintDeep : palette.faint}
          size={16}
          strokeWidth={2.4}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  categoryHero: {
    backgroundColor: '#F1FAF5',
    borderColor: '#D9F0E4',
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  heroEyebrow: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#202733',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 30,
  },
  heroBody: {
    ...customerText.body,
  },
  heroMetaPill: {
    alignSelf: 'flex-start',
    backgroundColor: palette.white,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  heroMetaText: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 16,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#EEF0F2',
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 54,
    paddingHorizontal: spacing.base,
  },
  searchInput: {
    color: '#202733',
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0,
    minHeight: 54,
  },
  categoryRail: {
    gap: spacing.sm,
    paddingRight: spacing.base,
  },
  categoryChip: {
    backgroundColor: palette.white,
    borderColor: '#E9ECEF',
    borderRadius: radius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 74,
    paddingHorizontal: spacing.base,
    width: 128,
  },
  categoryChipSelected: {
    backgroundColor: '#EAF8F1',
    borderColor: '#BFE9D3',
  },
  categoryChipTitle: {
    color: '#202733',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 18,
  },
  categoryChipTitleSelected: {
    color: palette.mintDeep,
  },
  categoryChipMeta: {
    color: '#7A828D',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 16,
    marginTop: 3,
  },
  categoryChipMetaSelected: {
    color: '#168452',
  },
  serviceList: {
    gap: spacing.md,
  },
  serviceCard: {
    gap: spacing.base,
  },
  pageRange: {
    color: palette.faint,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 16,
  },
  paginationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  pageButton: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 4,
    minHeight: 38,
    minWidth: 98,
    paddingHorizontal: spacing.md,
  },
  pageButtonDisabled: {
    backgroundColor: '#F5F6F7',
  },
  pageButtonText: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 16,
  },
  pageButtonTextDisabled: {
    color: palette.faint,
  },
  pageLabel: {
    color: '#606A77',
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 16,
    textAlign: 'center',
  },
  serviceCardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  serviceIdentity: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minWidth: 0,
  },
  serviceThumb: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderRadius: radius.lg,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  serviceThumbText: {
    color: palette.mintDeep,
    fontSize: 19,
    fontWeight: '600',
    letterSpacing: 0,
  },
  serviceTitleCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  serviceFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceMetaRow: {
    flex: 1,
    minWidth: 0,
  },
  serviceName: {
    ...customerText.title,
    fontSize: 16,
    lineHeight: 21,
  },
  serviceDesc: {
    ...customerText.meta,
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
    marginTop: 2,
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
    marginTop: 2,
  },
  pricePill: {
    backgroundColor: '#EAF8F1',
    borderRadius: radius.pill,
    flexShrink: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  priceText: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
  },
  openServicePill: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  openServiceText: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 18,
  },
});
