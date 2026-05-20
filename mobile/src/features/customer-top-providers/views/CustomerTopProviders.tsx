import { ScrollView, StyleSheet, View } from 'react-native';
import { Search } from 'lucide-react-native';
import {
  EmptyState,
  Field,
  TopBar,
} from '../../../components/DesignKit';
import { ProviderListItem } from '../../../components/AppDisplay';
import { palette, spacing } from '../../../theme/serveaseDesign';
import { ProviderListing } from '../../../shared/models/types';
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
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <View style={styles.marketSearchShell}>
            <Search color={palette.faint} size={20} />
            <Field
              label=""
              value={marketplaceSearchQuery}
              onChangeText={onSearchQueryChange}
              placeholder="Search by name or service..."
            />
          </View>
          {data.visibleProviders.map((provider) => (
            <ProviderListItem
              key={provider.id}
              provider={provider}
              onPress={() => onOpenProvider(provider)}
            />
          ))}
          {!data.hasVisibleProviders ? (
            <EmptyState title="No providers found" body="Try another search term." />
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
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingLeft: spacing.base,
  },
});
