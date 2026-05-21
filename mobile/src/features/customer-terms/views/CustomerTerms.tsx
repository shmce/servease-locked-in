import { StyleSheet, Text, View } from 'react-native';
import { FileText } from 'lucide-react-native';
import { TopBar } from '../../../components/DesignKit';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
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

          <View style={styles.heroBanner}>
            <View style={styles.heroIcon}>
              <FileText color={palette.white} size={26} strokeWidth={2.2} />
            </View>
            <Text style={styles.heroTitle}>Legal Documents</Text>
            <Text style={styles.heroBody}>
              Please read our terms and privacy policy carefully before using ServEase.
            </Text>
            <View style={styles.updatedPill}>
              <Text style={styles.updatedText}>Last updated: January 2025</Text>
            </View>
          </View>

          {terms.data.termsSections.map((section, index) => (
            <View key={section.title} style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumber}>
                  <Text style={styles.sectionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <View style={styles.divider} />
              <Text style={styles.sectionBody}>{section.body}</Text>
            </View>
          ))}

          <Text style={styles.footerNote}>
            For questions about these documents, contact us through Help & Support.
          </Text>

        </ScreenContent>
      </ScreenScroll>
    </>
  );
}

const styles = StyleSheet.create({
  heroBanner: {
    alignItems: 'center',
    backgroundColor: palette.ink,
    borderRadius: radius.lg,
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.pill,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  heroTitle: {
    color: palette.white,
    fontSize: 20,
    fontWeight: '700',
  },
  heroBody: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    textAlign: 'center',
  },
  updatedPill: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.pill,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xxs,
  },
  updatedText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
  },

  sectionCard: {
    borderTopColor: palette.lineSoft,
    borderTopWidth: 1,
    gap: spacing.md,
    paddingVertical: spacing.base,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sectionNumber: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  sectionNumberText: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    color: palette.ink,
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    backgroundColor: palette.lineSoft,
    height: 1,
  },
  sectionBody: {
    color: palette.body,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 20,
  },

  footerNote: {
    color: palette.faint,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    textAlign: 'center',
  },
});
