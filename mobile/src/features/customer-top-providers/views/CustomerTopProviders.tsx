import { StyleSheet, Text, View } from 'react-native';
import { Search, Star } from 'lucide-react-native';
import {
  EmptyState,
  Field,
  TopBar,
} from '../../../components/DesignKit';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { ProviderListing } from '../../../shared/models/types';
import {
  CompactGrid,
  CompactGridItem,
  MarketplaceTile,
  ScreenContent,
  ScreenScroll,
  marketplaceTextStyles,
} from '../../../shared/components/ScreenLayout';
import { formatMoney } from '../../../shared/utils/booking';
import { useCustomerTopProvidersViewModel } from '../viewModels/useCustomerTopProvidersViewModel';

type CustomerTopProvidersScreenProps = {
  providers: ProviderListing[];
  marketplaceSearchQuery: string;
  onBack: () => void;
  onSearchQueryChange: (value: string) => void;
  onOpenProvider: (provider: ProviderListing) => void;
};

export function CustomerTopProvidersScreen({
  providers,
  marketplaceSearchQuery,
  onBack,
  onSearchQueryChange,
  onOpenProvider,
}: CustomerTopProvidersScreenProps) {
  const topProviders = useCustomerTopProvidersViewModel({
    providers,
    marketplaceSearchQuery,
  });
  const { data } = topProviders;

  return (
    <>
      <TopBar title="Top-rated Providers" onBack={onBack} />
      <ScreenScroll>
        <ScreenContent>
          <View style={styles.marketSearchShell}>
            <Search color={palette.faint} size={20} />
            <Field
              label=""
              value={marketplaceSearchQuery}
              onChangeText={onSearchQueryChange}
              placeholder="Search by name or service..."
            />
          </View>
          <CompactGrid>
            {data.visibleProviders.map((provider) => (
              <CompactGridItem key={provider.id}>
                <MarketplaceTile
                  title={provider.providerBusinessName ?? provider.title}
                  body={provider.description ?? provider.title}
                  meta={formatMoney(provider.price)}
                  onPress={() => onOpenProvider(provider)}
                  footer={
                    <View style={styles.ratingRow}>
                      <Star color="#FFC107" fill="#FFC107" size={13} />
                      <Text style={marketplaceTextStyles.meta}>
                        {provider.averageRating.toFixed(1)} rating
                      </Text>
                    </View>
                  }
                />
              </CompactGridItem>
            ))}
          </CompactGrid>
          {!data.hasVisibleProviders ? (
            <EmptyState title="No providers found" body="Try another search term." />
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
});
