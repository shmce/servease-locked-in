import { useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react-native';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  SkeletonBlock,
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
import { InlineRefreshHint } from '../../../shared/components/LoadingStates';
import { CatalogCategory, CatalogServiceItem } from '../../../shared/models/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import {
  CustomerServiceCategoryFilterOption,
  CustomerServiceBrowseMode,
  CustomerServiceSortMode,
  CustomerServiceSortOption,
  useCustomerAllServicesViewModel,
} from '../viewModels/useCustomerAllServicesViewModel';

type CustomerAllServicesScreenProps = {
  title: string;
  mode?: CustomerServiceBrowseMode;
  categories: CatalogCategory[];
  services: CatalogServiceItem[];
  marketplaceSearchQuery: string;
  isLoading?: boolean;
  onBack: () => void;
  onSearchQueryChange: (value: string) => void;
  onOpenService: (service: CatalogServiceItem) => void;
};

export function CustomerAllServicesScreen({
  title,
  mode = 'all',
  categories,
  services,
  marketplaceSearchQuery,
  isLoading = false,
  onBack,
  onSearchQueryChange,
  onOpenService,
}: CustomerAllServicesScreenProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<CustomerServiceSortMode>('default');
  const [isRefinementOpen, setRefinementOpen] = useState(false);
  const serviceList = useCustomerAllServicesViewModel({
    categories,
    mode,
    services,
    marketplaceSearchQuery,
    selectedCategoryId,
    sortMode,
  });
  const { data } = serviceList;
  const showSkeletons = isLoading && services.length === 0;
  const isRefreshing = isLoading && services.length > 0;

  function clearRefinements() {
    setSelectedCategoryId(null);
    setSortMode('default');
  }

  return (
    <>
      <CustomerScreen>
        <CustomerContent>
          <CustomerHeader
            title={data.title ?? title}
            subtitle="Find the right service for your home"
            onBack={onBack}
          />

          <CustomerSection>
            <View style={styles.searchRefinementRow}>
              <View style={styles.searchBar}>
                <Search color={palette.faint} size={16} strokeWidth={2.2} />
                <TextInput
                  style={styles.searchInput}
                  value={marketplaceSearchQuery}
                  onChangeText={onSearchQueryChange}
                  placeholder="Search for services..."
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
              <Pressable
                style={[
                  styles.refinementButton,
                  data.refinement.hasActiveRefinements &&
                    styles.refinementButtonActive,
                ]}
                onPress={() => setRefinementOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={data.filterButtonLabel}
              >
                <SlidersHorizontal
                  color={
                    data.refinement.hasActiveRefinements
                      ? palette.mintDeep
                      : '#7D8791'
                  }
                  size={20}
                  strokeWidth={2.3}
                />
                {data.refinement.activeFilterCount > 0 ? (
                  <View style={styles.refinementBadge}>
                    <Text style={styles.refinementBadgeText}>
                      {data.refinement.activeFilterCount}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            </View>

            {data.refinement.hasActiveRefinements ? (
              <View style={styles.activeRefinementRow}>
                <Text style={styles.activeRefinementText} numberOfLines={1}>
                  {data.refinement.summary}
                </Text>
                <Pressable
                  onPress={clearRefinements}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={data.clearRefinementsLabel}
                >
                  <Text style={styles.clearRefinementText}>Clear</Text>
                </Pressable>
              </View>
            ) : null}
          </CustomerSection>

          <CustomerSection title="Services">
            {isRefreshing ? <InlineRefreshHint label="Refreshing services" /> : null}
            <View style={styles.list}>
              {showSkeletons
                ? Array.from({ length: 5 }).map((_, index) => (
                    <ServiceRowSkeleton key={`service-row-skeleton-${index}`} />
                  ))
                : data.visibleServices.map((row) => (
                    <CustomerCard
                      key={row.service.id}
                      onPress={() => onOpenService(row.service)}
                      accessibilityLabel={`View providers for ${row.service.name}`}
                    >
                      <View style={styles.serviceRow}>
                        <View style={styles.serviceThumb}>
                          <Text style={styles.serviceThumbText}>
                            {row.service.name.slice(0, 1)}
                          </Text>
                        </View>
                        <View style={styles.serviceBody}>
                          <Text style={styles.serviceName} numberOfLines={1}>
                            {row.service.name}
                          </Text>
                          <Text style={styles.serviceDescription} numberOfLines={2}>
                            {row.description}
                          </Text>
                        </View>
                        <View style={styles.serviceRight}>
                          <Text style={styles.priceLabel}>{row.priceLabel}</Text>
                          <ChevronRight color={palette.faint} size={18} />
                        </View>
                      </View>
                    </CustomerCard>
                  ))}
              {!showSkeletons && data.hasVisibleServices && data.pagination.totalPages > 1 ? (
                <PaginationControls
                  pageLabel={data.pagination.pageLabel}
                  hasPreviousPage={data.pagination.hasPreviousPage}
                  hasNextPage={data.pagination.hasNextPage}
                  onPrevious={serviceList.actions.goToPreviousPage}
                  onNext={serviceList.actions.goToNextPage}
                />
              ) : null}
            </View>

            {!showSkeletons && !data.hasVisibleServices ? (
              <CustomerEmptyState
                title={data.emptyState.title}
                body={data.emptyState.body}
              />
            ) : null}
          </CustomerSection>
        </CustomerContent>
      </CustomerScreen>

      <ServiceRefinementSheet
        categoryOptions={data.categoryFilterOptions}
        sortOptions={data.sortOptions}
        visible={isRefinementOpen}
        onClear={clearRefinements}
        onClose={() => setRefinementOpen(false)}
        onSelectCategory={setSelectedCategoryId}
        onSelectSort={setSortMode}
      />
    </>
  );
}

function ServiceRefinementSheet({
  categoryOptions,
  sortOptions,
  visible,
  onClear,
  onClose,
  onSelectCategory,
  onSelectSort,
}: {
  categoryOptions: CustomerServiceCategoryFilterOption[];
  sortOptions: CustomerServiceSortOption[];
  visible: boolean;
  onClear: () => void;
  onClose: () => void;
  onSelectCategory: (categoryId: string | null) => void;
  onSelectSort: (sortMode: CustomerServiceSortMode) => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.sheetOverlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitleCopy}>
              <Text style={styles.sheetTitle}>Filter services</Text>
              <Text style={styles.sheetBody}>
                Refine the service list without changing your search.
              </Text>
            </View>
            <Pressable
              style={styles.sheetCloseButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close service filters"
            >
              <X color="#69736F" size={18} strokeWidth={2.2} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.sheetScroll}
            contentContainerStyle={styles.sheetScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.optionGroupTitle}>Category</Text>
            <View style={styles.optionGroup}>
              {categoryOptions.map((option) => (
                <FilterOptionRow
                  key={option.id ?? 'all-categories'}
                  title={option.label}
                  body={`${option.serviceCount} ${
                    option.serviceCount === 1 ? 'service' : 'services'
                  }`}
                  isSelected={option.isSelected}
                  onPress={() => onSelectCategory(option.id)}
                />
              ))}
            </View>

            <Text style={styles.optionGroupTitle}>Sort</Text>
            <View style={styles.optionGroup}>
              {sortOptions.map((option) => (
                <FilterOptionRow
                  key={option.value}
                  title={option.label}
                  body={option.description}
                  isSelected={option.isSelected}
                  onPress={() => onSelectSort(option.value)}
                />
              ))}
            </View>
          </ScrollView>

          <View style={styles.sheetActions}>
            <Pressable
              style={styles.clearButton}
              onPress={onClear}
              accessibilityRole="button"
              accessibilityLabel="Clear service filters"
            >
              <Text style={styles.clearButtonText}>Clear filters</Text>
            </Pressable>
            <Pressable
              style={styles.doneButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Apply service filters"
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function FilterOptionRow({
  title,
  body,
  isSelected,
  onPress,
}: {
  title: string;
  body: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.optionRow, isSelected && styles.optionRowSelected]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ selected: isSelected }}
    >
      <View style={styles.optionCopy}>
        <Text
          style={[
            styles.optionTitle,
            isSelected && styles.optionTitleSelected,
          ]}
        >
          {title}
        </Text>
        <Text style={styles.optionBody}>{body}</Text>
      </View>
      {isSelected ? (
        <CheckCircle2 color={palette.mintDeep} size={20} strokeWidth={2.3} />
      ) : null}
    </Pressable>
  );
}

function PaginationControls({
  pageLabel,
  hasPreviousPage,
  hasNextPage,
  onPrevious,
  onNext,
}: {
  pageLabel: string;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <View style={styles.paginationRow}>
      <Pressable
        style={[styles.paginationButton, !hasPreviousPage && styles.paginationButtonDisabled]}
        onPress={onPrevious}
        disabled={!hasPreviousPage}
        accessibilityRole="button"
        accessibilityState={{ disabled: !hasPreviousPage }}
        accessibilityLabel="Previous services page"
      >
        <Text
          style={[
            styles.paginationButtonText,
            !hasPreviousPage && styles.paginationButtonTextDisabled,
          ]}
        >
          Previous
        </Text>
      </Pressable>
      <Text style={styles.paginationLabel}>{pageLabel}</Text>
      <Pressable
        style={[styles.paginationButton, !hasNextPage && styles.paginationButtonDisabled]}
        onPress={onNext}
        disabled={!hasNextPage}
        accessibilityRole="button"
        accessibilityState={{ disabled: !hasNextPage }}
        accessibilityLabel="Next services page"
      >
        <Text
          style={[
            styles.paginationButtonText,
            !hasNextPage && styles.paginationButtonTextDisabled,
          ]}
        >
          Next
        </Text>
      </Pressable>
    </View>
  );
}

function ServiceRowSkeleton() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.serviceSkeletonCard}
    >
      <View style={styles.serviceThumb} />
      <View style={styles.serviceBody}>
        <SkeletonLine width="52%" height={14} />
        <SkeletonLine width="88%" height={10} />
        <SkeletonLine width="66%" height={10} />
      </View>
      <View style={styles.serviceRight}>
        <SkeletonLine width={74} height={12} />
        <SkeletonBlock width={18} height={18} radius={radius.pill} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchRefinementRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#EEF0F2',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
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
  refinementButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#EEF0F2',
    borderRadius: 10,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    position: 'relative',
    width: 48,
  },
  refinementButtonActive: {
    backgroundColor: '#EFF9F3',
    borderColor: '#CDEEDD',
  },
  refinementBadge: {
    alignItems: 'center',
    backgroundColor: palette.mintDeep,
    borderColor: palette.white,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 18,
    justifyContent: 'center',
    position: 'absolute',
    right: -4,
    top: -5,
    width: 18,
  },
  refinementBadgeText: {
    color: palette.white,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 12,
  },
  activeRefinementRow: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    minHeight: 34,
    paddingHorizontal: spacing.md,
  },
  activeRefinementText: {
    color: '#1B6844',
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 16,
  },
  clearRefinementText: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 16,
  },
  list: {
    gap: spacing.md,
  },
  sheetOverlay: {
    backgroundColor: 'rgba(0,0,0,0.34)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: palette.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '82%',
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.base,
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: '#DDE1E5',
    borderRadius: radius.pill,
    height: 4,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
    width: 42,
  },
  sheetHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sheetTitleCopy: {
    flex: 1,
  },
  sheetTitle: {
    color: '#16191E',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 25,
  },
  sheetBody: {
    color: '#68707D',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 18,
    marginTop: 3,
  },
  sheetCloseButton: {
    alignItems: 'center',
    backgroundColor: '#F5F6F7',
    borderRadius: radius.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  sheetScroll: {
    maxHeight: 420,
  },
  sheetScrollContent: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  optionGroupTitle: {
    color: '#22262C',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  optionGroup: {
    gap: spacing.sm,
  },
  optionRow: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#E4E6E8',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 64,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionRowSelected: {
    backgroundColor: '#EFF9F3',
    borderColor: '#CDEEDD',
  },
  optionCopy: {
    flex: 1,
    minWidth: 0,
  },
  optionTitle: {
    color: '#22262C',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 19,
  },
  optionTitleSelected: {
    color: palette.mintDeep,
  },
  optionBody: {
    color: '#68707D',
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 16,
    marginTop: 2,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  clearButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#DCEEE5',
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  clearButtonText: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
  },
  doneButton: {
    alignItems: 'center',
    backgroundColor: palette.mintDeep,
    borderRadius: radius.md,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  doneButtonText: {
    color: palette.white,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
  },
  paginationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  paginationButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#DCEEE5',
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    minWidth: 88,
    paddingHorizontal: spacing.sm,
  },
  paginationButtonDisabled: {
    opacity: 0.48,
  },
  paginationButtonText: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
  },
  paginationButtonTextDisabled: {
    color: '#9AA3AE',
  },
  paginationLabel: {
    color: '#6D7480',
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
    textAlign: 'center',
  },
  serviceSkeletonCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#EEF0F2',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 72,
    padding: 14,
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
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  serviceThumbText: {
    color: palette.mintDeep,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0,
  },
  serviceBody: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  serviceName: {
    ...customerText.title,
    fontSize: 15,
    lineHeight: 20,
  },
  serviceDescription: {
    ...customerText.meta,
  },
  serviceRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  priceLabel: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
  },
});
