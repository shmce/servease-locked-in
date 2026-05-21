import { ReactNode, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  Pill,
  Section,
  TopBar,
} from '../../../components/DesignKit';
import { AppRole } from '../../../navigation/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { useHelpCenterViewModel } from '../viewModels/useHelpCenterViewModel';

type HelpCenterScreenProps = {
  role: AppRole;
  onBack: () => void;
  supportPanel: ReactNode;
};

function HelpFaqIcon({ kind }: { kind: string }) {
  if (kind === 'payment') {
    return <CreditCard color={palette.mint} size={16} />;
  }
  if (kind === 'safety' || kind === 'account') {
    return <ShieldCheck color={palette.mint} size={16} />;
  }
  if (kind === 'payout') {
    return <Wallet color={palette.mint} size={16} />;
  }
  if (kind === 'profile') {
    return <User color={palette.mint} size={16} />;
  }
  return <Calendar color={palette.mint} size={16} />;
}

export function HelpCenterScreen({
  role,
  onBack,
  supportPanel,
}: HelpCenterScreenProps) {
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);
  const help = useHelpCenterViewModel({ role });

  return (
    <>
      <View style={styles.helpHeader}>
        <TopBar title="Help Center" green onBack={onBack} />
        <View style={styles.helpSearch}>
          <Search color="rgba(255,255,255,0.7)" size={16} strokeWidth={2.2} />
          <TextInput
            style={styles.searchInput}
            value={help.data.query}
            onChangeText={help.setQuery}
            placeholder={help.data.searchPlaceholder}
            placeholderTextColor="rgba(255,255,255,0.55)"
            returnKeyType="search"
            autoCapitalize="none"
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
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    color: palette.white,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 0,
  },
  withBottomNav: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 108,
  },
  content: {
    gap: spacing.md,
    padding: spacing.md,
  },
  horizontalRail: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  faqCard: {
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  faqCardOpen: {
    borderBottomColor: palette.mintSoft,
    borderBottomWidth: 1,
  },
  faqIcon: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
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
    fontWeight: '700',
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
    fontSize: 13,
    fontWeight: '700',
  },
  cardBody: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});
