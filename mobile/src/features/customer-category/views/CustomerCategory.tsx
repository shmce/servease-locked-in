import { useState } from 'react';
import { ChevronRight, Search, Star, X } from 'lucide-react-native';
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

        <CustomerSection title="Services">
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

          {!data.hasServices ? (
            <CustomerEmptyState
              title="No services found"
              body="Try a different search term."
            />
          ) : null}
        </CustomerSection>
      </CustomerContent>
    </CustomerScreen>
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
