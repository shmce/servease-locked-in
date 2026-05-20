import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, TopBar } from '../../../components/DesignKit';
import { AppScreen } from '../../../navigation/types';
import { palette, spacing } from '../../../theme/serveaseDesign';
import { useCustomerTermsViewModel } from '../viewModels/useCustomerTermsViewModel';

type CustomerTermsScreenProps = {
  navigate: (screen: AppScreen, nextRole?: 'customer') => void;
};

export function CustomerTermsScreen({ navigate }: CustomerTermsScreenProps) {
  const terms = useCustomerTermsViewModel();

  return (
    <>
      <TopBar title="Terms & Privacy" onBack={() => navigate('more', 'customer')} />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          {terms.data.termsSections.map((section) => (
            <Card key={section.title}>
              <Text style={styles.detailTitle}>{section.title}</Text>
              <Text style={styles.cardBody}>{section.body}</Text>
            </Card>
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
    gap: spacing.lg,
    padding: spacing.xl,
  },
  detailTitle: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  cardBody: {
    color: palette.body,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
  },
});
