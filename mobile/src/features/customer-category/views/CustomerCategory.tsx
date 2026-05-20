import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState, TopBar } from '../../../components/DesignKit';
import { ServiceListItem } from '../../../components/AppDisplay';
import { palette, spacing, type } from '../../../theme/serveaseDesign';
import {
  CatalogCategory,
  CatalogServiceItem,
} from '../../../shared/models/types';
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
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <Text style={styles.detailTitle}>{data.categoryName}</Text>
          <Text style={styles.cardMeta}>{data.serviceCountLabel}</Text>
          {data.services.map((service) => (
            <ServiceListItem
              key={service.id}
              service={service}
              onPress={() => onOpenService(service)}
            />
          ))}
          {!data.hasServices ? (
            <EmptyState title="No services found" body="Try another category." />
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  withBottomNav: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 108,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xl,
  },
  detailTitle: {
    ...type.title,
    color: palette.ink,
  },
  cardMeta: {
    ...type.caption,
    color: palette.muted,
  },
});
