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
import {
  ProviderCard,
  ProviderContent,
  ProviderEmptyState,
  ProviderHeader,
  ProviderIconBlock,
  ProviderPill,
  ProviderScreen,
  ProviderSection,
  providerText,
} from '../../../shared/components/ProviderUI';
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
    <ProviderScreen>
      <ProviderContent>
        <ProviderHeader
          title="Help Center"
          subtitle="Find answers or contact support"
          onBack={onBack}
        />
        <View style={styles.helpSearch}>
          <Search color="#87919D" size={20} strokeWidth={2.1} />
          <TextInput
            style={styles.searchInput}
            value={help.data.query}
            onChangeText={help.setQuery}
            placeholder={help.data.searchPlaceholder}
            placeholderTextColor="#A0A7B2"
            returnKeyType="search"
            autoCapitalize="none"
          />
        </View>

        <ProviderSection title="Topics">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalRail}
          >
            {help.data.categories.map((category) => (
              <ProviderPill
                key={category}
                label={category === 'all' ? 'All' : category}
                selected={help.data.selectedCategory === category}
                onPress={() => help.setSelectedCategory(category)}
              />
            ))}
          </ScrollView>
        </ProviderSection>

        <ProviderSection title="Frequently Asked Questions">
          {help.data.filteredFaq.map((item) => (
            <ProviderCard
              key={item.id}
              onPress={() => setExpandedFaqId(expandedFaqId === item.id ? null : item.id)}
              selected={expandedFaqId === item.id}
              accessibilityLabel={`Toggle help article: ${item.question}`}
            >
              <View style={styles.faqCard}>
                <View style={styles.rowBetween}>
                  <ProviderIconBlock compact>
                    <HelpFaqIcon color={palette.mintDeep} kind={item.iconKind} size={18} />
                  </ProviderIconBlock>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{item.question}</Text>
                    <Text style={styles.faqCategory}>{item.category}</Text>
                  </View>
                </View>
                {expandedFaqId === item.id ? (
                  <Text style={styles.cardBody}>{item.answer}</Text>
                ) : null}
              </View>
            </ProviderCard>
          ))}
          {help.data.isEmpty ? (
            <ProviderEmptyState
              title="No results found"
              body="Try another search term."
            />
          ) : null}
        </ProviderSection>
        {supportPanel}
      </ProviderContent>
    </ProviderScreen>
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
  helpSearch: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#EEF0F2',
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 58,
    paddingHorizontal: spacing.base,
  },
  searchInput: {
    color: '#202733',
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0,
    paddingVertical: 0,
  },
  horizontalRail: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  faqCard: {
    gap: spacing.md,
  },
  faqCategory: {
    alignSelf: 'flex-start',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    color: palette.mintDeep,
    fontSize: 11,
    fontWeight: '600',
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
    ...providerText.title,
    fontSize: 15,
    lineHeight: 20,
  },
  cardBody: {
    ...providerText.body,
    borderTopColor: '#EEF0F2',
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
});
