import { ChevronRight, Search } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  EmptyState,
  SkeletonBlock,
  SkeletonLine,
  TopBar,
} from '../../../components/DesignKit';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { CatalogServiceItem } from '../../../shared/models/types';
import { ScreenContent, ScreenScroll } from '../../../shared/components/ScreenLayout';
import { useCustomerAllServicesViewModel } from '../viewModels/useCustomerAllServicesViewModel';

type CustomerAllServicesScreenProps = {
  title: string;
  services: CatalogServiceItem[];
  marketplaceSearchQuery: string;
  isLoading?: boolean;
  onBack: () => void;
  onSearchQueryChange: (value: string) => void;
  onOpenService: (service: CatalogServiceItem) => void;
};

export function CustomerAllServicesScreen({
  title,
  services,
  marketplaceSearchQuery,
  isLoading = false,
  onBack,
  onSearchQueryChange,
  onOpenService,
}: CustomerAllServicesScreenProps) {
  const serviceList = useCustomerAllServicesViewModel({
    services,
    marketplaceSearchQuery,
  });
  const { data } = serviceList;
  const showSkeletons = isLoading && services.length === 0;

  return (
    <>
      <TopBar title={title} onBack={onBack} />
      <ScreenScroll>
        <ScreenContent>
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
                <Text style={styles.searchClear}>✕</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.list}>
            {showSkeletons
              ? Array.from({ length: 5 }).map((_, index) => (
                  <ServiceRowSkeleton key={`service-row-skeleton-${index}`} />
                ))
              : data.visibleServices.map((row) => (
                  <Pressable
                    key={row.service.id}
                    style={styles.serviceCard}
                    onPress={() => onOpenService(row.service)}
                    accessibilityRole="button"
                    accessibilityLabel={`View providers for ${row.service.name}`}
                  >
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
                  </Pressable>
                ))}
          </View>

          {!showSkeletons && !data.hasVisibleServices ? (
            <EmptyState
              title="No services found"
              body="Try searching with different keywords."
            />
          ) : null}
        </ScreenContent>
      </ScreenScroll>
    </>
  );
}

function ServiceRowSkeleton() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.serviceCard}
    >
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
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.base,
  },
  searchInput: {
    color: palette.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    minHeight: 48,
  },
  searchClear: {
    color: palette.faint,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  list: {
    gap: spacing.sm,
  },
  serviceCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 72,
    padding: spacing.base,
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
  },
  serviceBody: {
    flex: 1,
    gap: 4,
  },
  serviceName: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  serviceDescription: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  serviceRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  priceLabel: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '800',
  },
});
