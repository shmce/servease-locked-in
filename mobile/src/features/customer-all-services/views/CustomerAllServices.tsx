import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Search, Star } from 'lucide-react-native';
import { EmptyState, Field, TopBar } from '../../../components/DesignKit';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { CatalogServiceItem } from '../../../shared/models/types';
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
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <View style={styles.marketSearchShell}>
            <Search color={palette.faint} size={20} />
            <Field
              label=""
              value={marketplaceSearchQuery}
              onChangeText={onSearchQueryChange}
              placeholder="Search for services..."
            />
          </View>
          <View style={styles.serviceGrid}>
            {data.visibleServices.map((row) => (
              <Pressable
                key={row.service.id}
                style={styles.serviceTile}
                onPress={() => onOpenService(row.service)}
              >
                <View style={styles.serviceImageMock}>
                  <Text style={styles.serviceImageInitial}>{row.initial}</Text>
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {row.service.name}
                </Text>
                <Text style={styles.cardMeta} numberOfLines={2}>
                  {row.description}
                </Text>
                <View style={styles.ratingRow}>
                  <Star color="#FFC107" fill="#FFC107" size={13} />
                  <Text style={styles.cardMeta}>{row.ratingLabel}</Text>
                </View>
                <Text style={styles.priceText}>{row.priceLabel}</Text>
              </Pressable>
            ))}
          </View>
          {!data.hasVisibleServices ? (
            <EmptyState
              title="No services found"
              body="Try searching with different keywords."
            />
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
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  serviceTile: {
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  serviceImageMock: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.md,
    height: 72,
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  serviceImageInitial: {
    color: palette.mint,
    fontSize: 28,
    fontWeight: '900',
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  cardMeta: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  priceText: {
    color: palette.mint,
    fontSize: 14,
    fontWeight: '900',
  },
});
