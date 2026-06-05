import { StyleSheet, Text, View } from 'react-native';
import { FileText } from 'lucide-react-native';
import {
  CustomerCard,
  CustomerContent,
  CustomerHeader,
  CustomerIconBlock,
  CustomerScreen,
  CustomerSection,
  customerText,
} from '../../../shared/components/CustomerUI';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { useCustomerTermsViewModel } from '../viewModels/useCustomerTermsViewModel';

type CustomerTermsScreenProps = {
  onBack: () => void;
};

export function CustomerTermsScreen({ onBack }: CustomerTermsScreenProps) {
  const terms = useCustomerTermsViewModel();

  return (
    <CustomerScreen>
      <CustomerContent>
        <CustomerHeader
          title="Terms & Privacy"
          subtitle="Readable policies for using ServEase"
          onBack={onBack}
        />

        <CustomerCard style={styles.introCard}>
          <CustomerIconBlock>
            <FileText color={palette.mintDeep} size={22} strokeWidth={2.1} />
          </CustomerIconBlock>
          <View style={styles.flex}>
            <Text style={styles.introTitle}>Legal Documents</Text>
            <Text style={styles.introBody}>
              Please read these documents carefully before using ServEase.
            </Text>
            <View style={styles.updatedPill}>
              <Text style={styles.updatedText}>Last updated: January 2025</Text>
            </View>
          </View>
        </CustomerCard>

        <CustomerSection title="Documents">
          <View style={styles.sectionList}>
            {terms.data.termsSections.map((section, index) => (
              <CustomerCard key={section.title}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionNumber}>
                    <Text style={styles.sectionNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.sectionTitle} numberOfLines={2}>
                    {section.title}
                  </Text>
                </View>
                <Text style={styles.sectionBody}>{section.body}</Text>
              </CustomerCard>
            ))}
          </View>
        </CustomerSection>

        <Text style={styles.footerNote}>
          For questions about these documents, contact us through Help & Support.
        </Text>
      </CustomerContent>
    </CustomerScreen>
  );
}

const styles = StyleSheet.create({
  introCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  introTitle: {
    ...customerText.title,
    fontSize: 17,
    lineHeight: 23,
  },
  introBody: {
    ...customerText.body,
    marginTop: 2,
  },
  updatedPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2F6',
    borderRadius: radius.sm,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  updatedText: {
    color: '#68717E',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 16,
  },
  sectionList: {
    gap: spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sectionNumber: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderRadius: radius.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  sectionNumberText: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 16,
  },
  sectionTitle: {
    ...customerText.title,
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  sectionBody: {
    ...customerText.body,
    borderTopColor: '#EEF0F2',
    borderTopWidth: 1,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  footerNote: {
    ...customerText.meta,
    textAlign: 'center',
  },
  flex: {
    flex: 1,
    minWidth: 0,
  },
});
