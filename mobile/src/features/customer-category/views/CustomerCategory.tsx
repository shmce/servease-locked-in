import { StyleSheet, Text, View } from 'react-native';
import { EmptyState, TopBar } from '../../../components/DesignKit';
import { spacing } from '../../../theme/serveaseDesign';
import {
  CatalogCategory,
  CatalogServiceItem,
} from '../../../shared/models/types';
import {
  CompactGrid,
  CompactGridItem,
  MarketplaceTile,
  ScreenContent,
  ScreenScroll,
  marketplaceTextStyles,
} from '../../../shared/components/ScreenLayout';
import { formatMoney } from '../../../shared/utils/booking';
import { useCustomerCategoryViewModel } from '../viewModels/useCustomerCategoryViewModel';

type CustomerCategoryScreenProps = {
  categories: CatalogCategory[];
  selectedCategoryId: string | null;
  services: CatalogServiceItem[];
  onBack: () => void;
  onOpenService: (service: CatalogServiceItem) => void;
};

export function CustomerCategoryScreen({
  categories,
  selectedCategoryId,
  services,
  onBack,
  onOpenService,
}: CustomerCategoryScreenProps) {
  const category = useCustomerCategoryViewModel({
    categories,
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
          <View style={styles.headerCopy}>
            <Text style={marketplaceTextStyles.title}>{data.categoryName}</Text>
            <Text style={marketplaceTextStyles.meta}>{data.serviceCountLabel}</Text>
          </View>
          <CompactGrid>
            {data.services.map((service) => (
              <CompactGridItem key={service.id}>
                <MarketplaceTile
                  title={service.name}
                  body={service.description ?? 'Bookable service'}
                  onPress={() => onOpenService(service)}
                  footer={
                    <Text style={marketplaceTextStyles.price}>
                      {formatMoney(service.price)}
                    </Text>
                  }
                />
              </CompactGridItem>
            ))}
          </CompactGrid>
          {!data.hasServices ? (
            <EmptyState title="No services found" body="Try another category." />
          ) : null}
        </ScreenContent>
      </ScreenScroll>
    </>
  );
}

const styles = StyleSheet.create({
  headerCopy: {
    gap: spacing.xs,
  },
});
