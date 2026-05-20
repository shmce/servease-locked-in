import { StyleSheet, Text, View } from 'react-native';
import { Search, Star } from 'lucide-react-native';
import { EmptyState, Field, TopBar } from '../../../components/DesignKit';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { CatalogServiceItem } from '../../../shared/models/types';
import {
  CompactGrid,
  CompactGridItem,
  MarketplaceTile,
  ScreenContent,
  ScreenScroll,
  marketplaceTextStyles,
} from '../../../shared/components/ScreenLayout';
import { useCustomerAllServicesViewModel } from '../viewModels/useCustomerAllServicesViewModel';

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
          <View style={styles.marketSearchShell}>
            <Search color={palette.faint} size={20} />
            <Field
              label=""
              value={marketplaceSearchQuery}
              onChangeText={onSearchQueryChange}
              placeholder="Search for services..."
            />
          </View>
          <CompactGrid>
            {data.visibleServices.map((row) => (
              <CompactGridItem key={row.service.id}>
                <MarketplaceTile
                  title={row.service.name}
                  body={row.description}
                  onPress={() => onOpenService(row.service)}
                  footer={
                    <View style={styles.tileFooter}>
                      <View style={styles.ratingRow}>
                        <Star color="#FFC107" fill="#FFC107" size={13} />
                        <Text style={marketplaceTextStyles.meta}>{row.ratingLabel}</Text>
                      </View>
                      <Text style={marketplaceTextStyles.price}>{row.priceLabel}</Text>
                    </View>
                  }
                />
              </CompactGridItem>
            ))}
          </CompactGrid>
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
  marketSearchShell: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingLeft: spacing.base,
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  tileFooter: {
    gap: spacing.xs,
  },
});
