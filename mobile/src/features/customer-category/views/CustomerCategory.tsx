import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Star, X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
import { palette, spacing } from '../../../theme/serveaseDesign';
import { useCustomerCategoryViewModel } from '../viewModels/useCustomerCategoryViewModel';

type CustomerCategoryScreenProps = {
  categories: CatalogCategory[];
  providers?: ProviderListing[];
  selectedCategoryId: string | null;
  services: CatalogServiceItem[];
  isLoading?: boolean;
  onBack: () => void;
  onOpenService: (service: CatalogServiceItem) => void;
};

export function CustomerCategoryScreen({
  categories,
  providers,
  selectedCategoryId,
  services,
  isLoading = false,
  onBack,
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

        <CustomerSection>
          <View style={styles.searchBar}>
            <Search color={palette.faint} size={16} strokeWidth={2.2} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search services..."
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
        </CustomerSection>

        <CustomerSection
          title="Services"
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
                  onPress={() => onOpenService(row.service)}
                  accessibilityLabel={`Open ${row.name}`}
                >
                  <View style={styles.serviceRow}>
                    <View style={styles.serviceThumb}>
                      <Text style={styles.serviceThumbText}>
                        {row.name.slice(0, 1)}
                      </Text>
                    </View>
                    <View style={styles.serviceBody}>
                      <View style={styles.serviceTitleRow}>
                        <Text style={styles.serviceName} numberOfLines={1}>
                          {row.name}
                        </Text>
                        <Text style={styles.priceText}>{row.priceLabel}</Text>
                      </View>
                      <Text style={styles.serviceDesc} numberOfLines={2}>
                        {row.description}
                      </Text>
                      {row.hasRating ? (
                        <View style={styles.ratingRow}>
                          <Star color="#FFB020" fill="#FFB020" size={13} />
                          <Text style={styles.ratingText}>{row.ratingLabel}</Text>
                          <Text style={styles.reviewText}>({row.reviewCount})</Text>
                        </View>
                      ) : (
                        <Text style={styles.noRatingText}>No reviews yet</Text>
                      )}
                    </View>
                    <ChevronRight color={palette.faint} size={18} />
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
  serviceList: {
    gap: spacing.md,
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
  serviceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  serviceThumb: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  serviceThumbText: {
    color: palette.mintDeep,
    fontSize: 19,
    fontWeight: '600',
    letterSpacing: 0,
  },
  serviceBody: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  serviceTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  serviceName: {
    ...customerText.title,
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    minWidth: 0,
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
  priceText: {
    color: palette.mintDeep,
    flexShrink: 0,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
  },
});
