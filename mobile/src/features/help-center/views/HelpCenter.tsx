import { ReactNode, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Calendar,
  CreditCard,
  Search,
  ShieldCheck,
  User,
  Wallet,
} from 'lucide-react-native';
import {
  EmptyState,
  Field,
  Pill,
  Section,
  TopBar,
} from '../../../components/DesignKit';
import { AppRole, AppScreen } from '../../../navigation/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { useHelpCenterViewModel } from '../viewModels/useHelpCenterViewModel';

type HelpCenterScreenProps = {
  role: AppRole;
  navigate: (screen: AppScreen, nextRole?: AppRole) => void;
  supportPanel: ReactNode;
};

function HelpFaqIcon({ kind }: { kind: string }) {
  if (kind === 'payment') {
    return <CreditCard color={palette.amber} size={16} />;
  }
  if (kind === 'safety' || kind === 'account') {
    return <ShieldCheck color={palette.violet} size={16} />;
  }
  if (kind === 'payout') {
    return <Wallet color={palette.mint} size={16} />;
  }
  if (kind === 'profile') {
    return <User color={palette.amber} size={16} />;
  }
  return <Calendar color={palette.blue} size={16} />;
}

export function HelpCenterScreen({
  role,
  navigate,
  supportPanel,
}: HelpCenterScreenProps) {
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);
  const help = useHelpCenterViewModel({ role });

  return (
    <>
      <View style={styles.helpHeader}>
        <TopBar title="Help Center" green onBack={() => navigate('more', role)} />
        <View style={styles.helpSearch}>
          <Search color={palette.faint} size={20} />
          <Field
            label=""
            value={help.data.query}
            onChangeText={help.setQuery}
            placeholder={help.data.searchPlaceholder}
          />
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalRail}
          >
            {help.data.categories.map((category) => (
              <Pill
                key={category}
                label={category === 'all' ? 'All' : category}
                selected={help.data.selectedCategory === category}
                onPress={() => help.setSelectedCategory(category)}
              />
            ))}
          </ScrollView>
          <Section title="Frequently Asked Questions">
            {help.data.filteredFaq.map((item) => (
              <Pressable
                key={item.id}
                style={[
                  styles.faqCard,
                  expandedFaqId === item.id && styles.faqCardOpen,
                ]}
                onPress={() => setExpandedFaqId(expandedFaqId === item.id ? null : item.id)}
              >
                <View style={styles.rowBetween}>
                  <View style={styles.faqIcon}>
                    <HelpFaqIcon kind={item.iconKind} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{item.question}</Text>
                    <Text style={styles.faqCategory}>{item.category}</Text>
                  </View>
                </View>
                {expandedFaqId === item.id ? (
                  <Text style={styles.cardBody}>{item.answer}</Text>
                ) : null}
              </Pressable>
            ))}
            {help.data.isEmpty ? (
              <EmptyState title="No results found" body="Try another search term." />
            ) : null}
          </Section>
          {supportPanel}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  helpHeader: {
    backgroundColor: palette.mint,
  },
  helpSearch: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    marginHorizontal: spacing.xl,
    paddingLeft: spacing.base,
  },
  withBottomNav: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 108,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xl,
  },
  horizontalRail: {
    gap: spacing.sm,
    paddingRight: spacing.xl,
  },
  faqCard: {
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: 14,
    borderWidth: 2,
    gap: spacing.md,
    padding: spacing.base,
    boxShadow: '0 4px 8px rgba(0,0,0,0.04)',
  },
  faqCardOpen: {
    backgroundColor: '#FAFFFE',
    borderColor: palette.mint,
  },
  faqIcon: {
    alignItems: 'center',
    backgroundColor: '#EFF7FE',
    borderRadius: radius.sm,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  faqCategory: {
    alignSelf: 'flex-start',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.sm,
    color: palette.mint,
    fontSize: 11,
    fontWeight: '800',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.base,
    justifyContent: 'space-between',
  },
  flex: {
    flex: 1,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  cardBody: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
