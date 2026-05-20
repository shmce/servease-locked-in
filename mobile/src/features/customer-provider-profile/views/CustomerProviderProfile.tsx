import { CheckCircle, MessageCircle, Star } from 'lucide-react-native';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Card,
  EmptyState,
  Pill,
  PrimaryButton,
  Section,
  TopBar,
} from '../../../components/DesignKit';
import { InfoRow, ServiceListItem } from '../../../components/AppDisplay';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import {
  ProviderAvailabilitySchedule,
  ProviderListing,
  ProviderPortfolioMediaSummary,
  ReviewSummary,
} from '../../../shared/models/types';
import { ActionRow, StickyFooter } from '../../../shared/components/ScreenLayout';
import {
  CustomerProviderProfileTab,
  useCustomerProviderProfileViewModel,
} from '../viewModels/useCustomerProviderProfileViewModel';

type CustomerProviderProfileScreenProps = {
  provider: ProviderListing;
  availability: ProviderAvailabilitySchedule | null;
  portfolioMedia: ProviderPortfolioMediaSummary[];
  reviews: ReviewSummary[];
  selectedTab: CustomerProviderProfileTab;
  isAuthenticated: boolean;
  busyAction: string | null;
  onBack: () => void;
  onBook: () => void;
  onMessage: () => void;
  onTabChange: (tab: CustomerProviderProfileTab) => void;
  onFlagReview: (reviewId: string) => void;
};

export function CustomerProviderProfileScreen({
  provider,
  availability,
  portfolioMedia,
  reviews,
  selectedTab,
  isAuthenticated,
  busyAction,
  onBack,
  onBook,
  onMessage,
  onTabChange,
  onFlagReview,
}: CustomerProviderProfileScreenProps) {
  const profile = useCustomerProviderProfileViewModel({
    provider,
    availability,
    portfolioMedia,
    reviews,
    selectedTab,
    isAuthenticated,
    busyAction,
  });
  const { data } = profile;

  return (
    <>
      <TopBar title="Provider Profile" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <View style={styles.heroInner}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{data.avatarInitial}</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.nameBlock}>
            <View style={styles.nameRow}>
              <Text style={styles.providerName}>{data.displayName}</Text>
              {data.verificationTone === 'success' ? (
                <CheckCircle color={palette.mint} size={18} strokeWidth={2.2} />
              ) : null}
            </View>
            <Text style={styles.serviceLabel}>{provider.title}</Text>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statCell}>
              <View style={styles.statValueRow}>
                <Star color="#FFC107" fill="#FFC107" size={14} />
                <Text style={styles.statValue}>{data.ratingLabel}</Text>
              </View>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Text style={styles.statValue}>{data.reviewCountLabel}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Text style={[styles.statValue, styles.statValueMint]}>{data.servicePriceLabel}</Text>
              <Text style={styles.statLabel}>Starting price</Text>
            </View>
          </View>

          <ActionRow>
            <PrimaryButton label="Book Now" onPress={onBook} />
            <Pressable
              style={styles.messageButton}
              onPress={onMessage}
              accessibilityRole="button"
              accessibilityLabel="Message provider"
            >
              <MessageCircle color={palette.mint} size={18} strokeWidth={2.2} />
              <Text style={styles.messageButtonText}>Message</Text>
            </Pressable>
          </ActionRow>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabRail}
          >
            {data.tabs.map((tab) => (
              <Pill
                key={tab}
                label={tab}
                selected={data.activeTab === tab}
                onPress={() => onTabChange(tab)}
              />
            ))}
          </ScrollView>

          <ProviderProfileTabContent
            data={data}
            provider={provider}
            onBook={onBook}
            onFlagReview={onFlagReview}
          />
        </View>
      </ScrollView>
      <StickyFooter>
        <PrimaryButton label="Book Service" onPress={onBook} />
      </StickyFooter>
    </>
  );
}

function ProviderProfileTabContent({
  data,
  provider,
  onBook,
  onFlagReview,
}: {
  data: ReturnType<typeof useCustomerProviderProfileViewModel>['data'];
  provider: ProviderListing;
  onBook: () => void;
  onFlagReview: (reviewId: string) => void;
}) {
  if (data.activeTab === 'Services') {
    return (
      <Section title="Services">
        <ServiceListItem service={data.serviceItem} onPress={onBook} />
      </Section>
    );
  }

  if (data.activeTab === 'Portfolio') {
    return (
      <Section title="Portfolio">
        <View style={styles.portfolioGrid}>
          {data.portfolioItems.map((item) => (
            <View key={item.id} style={styles.portfolioTile}>
              <Image source={{ uri: item.fileUrl }} style={styles.portfolioImage} />
              {item.caption ? (
                <Text style={styles.portfolioCaption} numberOfLines={1}>
                  {item.caption}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
        {!data.hasPortfolioItems ? (
          <EmptyState title="No portfolio yet" body="Provider work samples will appear here." />
        ) : null}
      </Section>
    );
  }

  if (data.activeTab === 'Reviews') {
    return (
      <Section title="Reviews">
        {data.reviewCards.map((review) => (
          <Card key={review.id}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewRatingRow}>
                <Star color="#FFC107" fill="#FFC107" size={13} />
                <Text style={styles.reviewRating}>{review.ratingLabel}</Text>
              </View>
              {review.canFlag ? (
                <Text style={styles.flagLabel} onPress={() => onFlagReview(review.id)}>
                  {review.flagLabel}
                </Text>
              ) : null}
            </View>
            <Text style={styles.reviewText}>{review.reviewText}</Text>
          </Card>
        ))}
        {!data.hasReviews ? (
          <EmptyState title="No reviews yet" body="Reviews for this provider appear here." />
        ) : null}
      </Section>
    );
  }

  if (data.activeTab === 'Availability') {
    return (
      <Section title="Availability">
        <Card>
          <Text style={styles.cardSectionTitle}>Available booking windows</Text>
          {data.activeAvailabilityWindows.map((window) => (
            <InfoRow key={window.id} label={window.label} value={window.value} />
          ))}
          {!data.hasActiveAvailabilityWindows ? (
            <Text style={styles.emptyNote}>No public availability windows are active yet.</Text>
          ) : null}
        </Card>
        {data.hasDaysOff ? (
          <Card>
            <Text style={styles.cardSectionTitle}>Unavailable dates</Text>
            {data.daysOff.map((dayOff) => (
              <InfoRow key={dayOff.id} label={dayOff.label} value={dayOff.value} />
            ))}
          </Card>
        ) : null}
      </Section>
    );
  }

  return (
    <Section title="About">
      <Card>
        <Text style={styles.aboutBody}>{data.description}</Text>
      </Card>
      <Card>
        {data.aboutRows.map((row, index) => (
          <View
            key={row.key}
            style={[styles.detailRow, index < data.aboutRows.length - 1 && styles.detailRowBorder]}
          >
            <Text style={styles.detailLabel}>{row.label}</Text>
            <Text style={styles.detailValue}>{row.value}</Text>
          </View>
        ))}
      </Card>
    </Section>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 132,
  },

  // Hero
  hero: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    height: 148,
    justifyContent: 'flex-end',
    paddingBottom: 0,
  },
  heroInner: {
    marginBottom: -48,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.white,
    borderRadius: radius.pill,
    borderWidth: 4,
    boxShadow: '0 6px 16px rgba(44,90,60,0.18)',
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  avatarInitial: {
    color: palette.mint,
    fontSize: 38,
    fontWeight: '700',
  },

  // Body
  body: {
    gap: spacing.md,
    marginTop: spacing.xl,
    padding: spacing.base,
    paddingTop: spacing.lg,
  },
  nameBlock: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  providerName: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  serviceLabel: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Stats card
  statsCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1,
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
    flexDirection: 'row',
    paddingVertical: spacing.base,
  },
  statCell: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xxs,
  },
  statValueRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  statValue: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  statValueMint: {
    color: palette.mint,
  },
  statLabel: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '500',
  },
  statDivider: {
    backgroundColor: palette.line,
    height: 32,
    width: 1,
  },

  // Message button (secondary action)
  messageButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.mint,
    borderRadius: radius.md,
    borderWidth: 1.5,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.base,
  },
  messageButtonText: {
    color: palette.mint,
    fontSize: 15,
    fontWeight: '700',
  },

  // Tabs
  tabRail: {
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },

  // Portfolio
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  portfolioTile: {
    backgroundColor: palette.mintSoft,
    borderRadius: radius.md,
    height: 128,
    overflow: 'hidden',
    width: '48%',
  },
  portfolioImage: {
    alignSelf: 'stretch',
    flex: 1,
  },
  portfolioCaption: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    bottom: 0,
    color: palette.white,
    fontSize: 11,
    fontWeight: '700',
    left: 0,
    padding: spacing.xs,
    position: 'absolute',
    right: 0,
  },

  // Reviews
  reviewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  reviewRatingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  reviewRating: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  flagLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '500',
  },
  reviewText: {
    color: palette.body,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
  },

  // Availability / About
  cardSectionTitle: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  emptyNote: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '500',
  },
  aboutBody: {
    color: palette.body,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  detailRowBorder: {
    borderBottomColor: palette.line,
    borderBottomWidth: 1,
  },
  detailLabel: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  detailValue: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
});
