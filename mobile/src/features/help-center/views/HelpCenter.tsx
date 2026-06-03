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
import {
  CustomerCard,
  CustomerContent,
  CustomerEmptyState,
  CustomerHeader,
  CustomerIconBlock,
  CustomerScreen,
  CustomerSection,
  customerText,
} from '../../../shared/components/CustomerUI';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { useHelpCenterViewModel } from '../viewModels/useHelpCenterViewModel';

type HelpCenterScreenProps = {
  role: AppRole;
  onBack: () => void;
  supportPanel: ReactNode;
};

function HelpFaqIcon({
  color = palette.mint,
  kind,
  size = 16,
}: {
  color?: string;
  kind: string;
  size?: number;
}) {
  if (kind === 'payment') {
    return <CreditCard color={color} size={size} />;
  }
  if (kind === 'safety' || kind === 'account') {
    return <ShieldCheck color={color} size={size} />;
  }
  if (kind === 'payout') {
    return <Wallet color={color} size={size} />;
  }
  if (kind === 'profile') {
    return <User color={color} size={size} />;
  }
  return <Calendar color={color} size={size} />;
}

export function HelpCenterScreen({
  role,
  onBack,
  supportPanel,
}: HelpCenterScreenProps) {
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);
  const help = useHelpCenterViewModel({ role });

  if (role === 'customer') {
    return (
      <CustomerScreen>
        <CustomerContent>
          <CustomerHeader
            title="Help Center"
            subtitle="Find answers or contact support"
            onBack={onBack}
          />

          <View style={styles.customerSearch}>
            <Search color="#7A828D" size={20} strokeWidth={2.1} />
            <TextInput
              style={styles.customerSearchInput}
              value={help.data.query}
              onChangeText={help.setQuery}
              placeholder={help.data.searchPlaceholder}
              placeholderTextColor="#A7AFB8"
              returnKeyType="search"
              autoCapitalize="none"
            />
          </View>

          <CustomerSection title="Topics">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.customerTopicRail}
            >
              {help.data.categories.map((category) => {
                const label = category === 'all' ? 'All' : category;
                const selected = help.data.selectedCategory === category;

                return (
                  <Pressable
                    key={category}
                    style={[styles.customerTopicChip, selected && styles.customerTopicChipActive]}
                    onPress={() => help.setSelectedCategory(category)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text
                      style={[
                        styles.customerTopicText,
                        selected && styles.customerTopicTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </CustomerSection>

          <CustomerSection title="Frequently asked">
            {help.data.filteredFaq.length ? (
              <View style={styles.customerFaqList}>
                {help.data.filteredFaq.map((item) => {
                  const expanded = expandedFaqId === item.id;

                  return (
                    <CustomerCard
                      key={item.id}
                      onPress={() => setExpandedFaqId(expanded ? null : item.id)}
                      selected={expanded}
                      accessibilityLabel={`Toggle help article: ${item.question}`}
                    >
                      <View style={styles.customerFaqRow}>
                        <CustomerIconBlock compact>
                          <HelpFaqIcon
                            color={palette.mintDeep}
                            kind={item.iconKind}
                            size={18}
                          />
                        </CustomerIconBlock>
                        <View style={styles.flex}>
                          <Text style={styles.customerFaqTitle} numberOfLines={2}>
                            {item.question}
                          </Text>
                          <Text style={styles.customerFaqMeta} numberOfLines={1}>
                            {item.category}
                          </Text>
                        </View>
                      </View>
                      {expanded ? (
                        <Text style={styles.customerFaqBody}>{item.answer}</Text>
                      ) : null}
                    </CustomerCard>
                  );
                })}
              </View>
            ) : (
              <CustomerEmptyState
                title="No results found"
                body="Try another search term or open a support ticket."
              />
            )}
          </CustomerSection>

          {supportPanel}
        </CustomerContent>
      </CustomerScreen>
    );
  }

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
  customerSearch: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#EEF0F2',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 54,
    paddingHorizontal: 14,
  },
  customerSearchInput: {
    ...customerText.body,
    flex: 1,
    paddingVertical: 0,
  },
  customerTopicRail: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  customerTopicChip: {
    backgroundColor: palette.white,
    borderColor: '#EEF0F2',
    borderRadius: radius.pill,
    borderWidth: 1,
    maxWidth: 172,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  customerTopicChipActive: {
    backgroundColor: '#F1FAF5',
    borderColor: 'rgba(0,160,85,0.35)',
  },
  customerTopicText: {
    color: '#68717E',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 18,
  },
  customerTopicTextActive: {
    color: palette.mintDeep,
    fontWeight: '600',
  },
  customerFaqList: {
    gap: spacing.md,
  },
  customerFaqRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  customerFaqTitle: {
    ...customerText.title,
    fontSize: 15,
    lineHeight: 20,
  },
  customerFaqMeta: {
    ...customerText.meta,
    marginTop: 2,
  },
  customerFaqBody: {
    ...customerText.body,
    borderTopColor: '#EEF0F2',
    borderTopWidth: 1,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
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
    minWidth: 0,
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
