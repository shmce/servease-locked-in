import { Search } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { EmptyState, TopBar } from '../../../components/DesignKit';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { CatalogServiceItem } from '../../../shared/models/types';
import { ScreenContent, ScreenScroll } from '../../../shared/components/ScreenLayout';
import { useCustomerAllServicesViewModel } from '../viewModels/useCustomerAllServicesViewModel';
import { ChevronRight } from 'lucide-react-native';

type CustomerAllServicesScreenProps = {
  title: string;
  services: CatalogServiceItem[];
  marketplaceSearchQuery: string;
  onBack: () => void;
  onSearchQueryChange: (value: string) => void;
  onOpenService: (service: CatalogServiceItem) => void;
};

export function CustomerAllServicesScreen({
  title,
  services,
  marketplaceSearchQuery,
  onBack,
  onSearchQueryChange,
  onOpenService,
}: CustomerAllServicesScreenProps) {
  const serviceList = useCustomerAllServicesViewModel({
    services,
    marketplaceSearchQuery,
  });
  const { data } = serviceList;

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
            {data.visibleServices.map((row) => (
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

          {!data.hasVisibleServices ? (
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
