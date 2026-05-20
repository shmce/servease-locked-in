import { useState } from 'react';
import { ChevronRight, Search, Star } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { EmptyState, TopBar } from '../../../components/DesignKit';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import {
  CatalogCategory,
  CatalogServiceItem,
  ProviderListing,
} from '../../../shared/models/types';
import { ScreenContent, ScreenScroll } from '../../../shared/components/ScreenLayout';
import { useCustomerCategoryViewModel } from '../viewModels/useCustomerCategoryViewModel';

type CustomerCategoryScreenProps = {
  categories: CatalogCategory[];
  providers?: ProviderListing[];
  selectedCategoryId: string | null;
  services: CatalogServiceItem[];
  onBack: () => void;
  onOpenService: (service: CatalogServiceItem) => void;
};

export function CustomerCategoryScreen({
  categories,
  providers,
  selectedCategoryId,
  services,
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

  return (
    <>
      <TopBar
        title={data.categoryName}
        subtitle={data.serviceCountLabel}
        onBack={onBack}
      />
      <ScreenScroll>
        <ScreenContent>
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
                <Text style={styles.searchClear}>✕</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.serviceList}>
            {data.serviceRows.map((row) => (
              <Pressable
                key={row.id}
                style={styles.serviceCard}
                onPress={() => onOpenService(row.service)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${row.name}`}
              >
                <View style={styles.serviceThumb}>
                  <Text style={styles.serviceThumbText}>{row.name.slice(0, 1)}</Text>
                </View>
                <View style={styles.serviceBody}>
                  <Text style={styles.serviceName} numberOfLines={1}>{row.name}</Text>
                  <Text style={styles.serviceDesc} numberOfLines={2}>{row.description}</Text>
                  <View style={styles.serviceFooter}>
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

          {!data.hasServices ? (
            <EmptyState title="No services found" body="Try a different search term." />
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
  serviceList: {
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
    padding: spacing.sm,
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
  },
  serviceThumb: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.md,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  serviceThumbText: {
    color: palette.mint,
    fontSize: 22,
    fontWeight: '900',
  },
  serviceBody: {
    flex: 1,
    gap: spacing.xs,
  },
  serviceName: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  serviceDesc: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 17,
  },
  serviceFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
