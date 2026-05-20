import { ScrollView, StyleSheet, View } from 'react-native';
import { QuickAction } from '../../../components/AppDisplay';
import { TopBar } from '../../../components/DesignKit';
import { AppScreen } from '../../../navigation/types';
import { palette, spacing } from '../../../theme/serveaseDesign';
import { ActionRow } from '../../../shared/components/ScreenLayout';
import { useProviderMoreViewModel } from '../viewModels/useProviderMoreViewModel';

type ProviderMoreScreenProps = {
  navigate: (screen: AppScreen, nextRole?: 'provider') => void;
};

export function ProviderMoreScreen({ navigate }: ProviderMoreScreenProps) {
  const providerMore = useProviderMoreViewModel();

  return (
    <>
      <TopBar title="More" subtitle="Provider tools and account settings" />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          {providerMore.data.actionRows.map((row) => (
            <ActionRow key={row.map((action) => action.label).join('-')}>
              {row.map((action) => (
                <QuickAction
                  key={action.label}
                  label={action.label}
                  onPress={() => navigate(action.screen, 'provider')}
                />
              ))}
            </ActionRow>
          ))}
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
    gap: spacing.md,
    padding: spacing.md,
  },
});
