import { ChevronRight, Search, X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
import { CatalogServiceItem } from '../../../shared/models/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import {
  CustomerServiceBrowseMode,
  useCustomerAllServicesViewModel,
} from '../viewModels/useCustomerAllServicesViewModel';

type CustomerAllServicesScreenProps = {
  title: string;
  mode?: CustomerServiceBrowseMode;
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
  services,
  marketplaceSearchQuery,
  isLoading = false,
  onBack,
  onSearchQueryChange,
  onOpenService,
}: CustomerAllServicesScreenProps) {
  const serviceList = useCustomerAllServicesViewModel({
    mode,
    services,
    marketplaceSearchQuery,
  });
  const { data } = serviceList;
  const showSkeletons = isLoading && services.length === 0;

  return (
    <CustomerScreen>
      <CustomerContent>
          <CustomerHeader
          title={data.title ?? title}
          subtitle="Find the right service for your home"
          onBack={onBack}
        />

        <CustomerSection>
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
        </CustomerSection>

        <CustomerSection title="Services">
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
  list: {
    gap: spacing.md,
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
