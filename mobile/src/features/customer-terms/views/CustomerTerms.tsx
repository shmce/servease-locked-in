import { StyleSheet, Text } from 'react-native';
import { Card, TopBar } from '../../../components/DesignKit';
import { palette } from '../../../theme/serveaseDesign';
import {
  ScreenContent,
  ScreenScroll,
} from '../../../shared/components/ScreenLayout';
import { useCustomerTermsViewModel } from '../viewModels/useCustomerTermsViewModel';

type CustomerTermsScreenProps = {
  onBack: () => void;
};

export function CustomerTermsScreen({ onBack }: CustomerTermsScreenProps) {
  const terms = useCustomerTermsViewModel();

  return (
    <>
      <TopBar title="Terms & Privacy" onBack={onBack} />
      <ScreenScroll>
        <ScreenContent>
          {terms.data.termsSections.map((section) => (
            <Card key={section.title}>
              <Text style={styles.detailTitle}>{section.title}</Text>
              <Text style={styles.cardBody}>{section.body}</Text>
            </Card>
          ))}
        </ScreenContent>
      </ScreenScroll>
    </>
  );
}

const styles = StyleSheet.create({
  detailTitle: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
  },
  cardBody: {
    color: palette.body,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});
