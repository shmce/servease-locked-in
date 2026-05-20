import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Star } from 'lucide-react-native';
import {
  Badge,
  Card,
  EmptyState,
  MetricCard,
  Pill,
  PrimaryButton,
  Section,
  TopBar,
} from '../../../components/DesignKit';
import { InfoRow, ServiceListItem } from '../../../components/AppDisplay';
import { palette, radius, spacing, type } from '../../../theme/serveaseDesign';
import {
  ProviderAvailabilitySchedule,
  ProviderListing,
  ProviderPortfolioMediaSummary,
  ReviewSummary,
} from '../../../shared/models/types';
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
      <ScrollView contentContainerStyle={styles.withStickyFooter}>
        <View style={styles.providerCover} />
        <View style={styles.providerProfileBody}>
          <View style={styles.providerProfileAvatar}>
            <Text style={styles.providerProfileAvatarText}>{data.avatarInitial}</Text>
          </View>
          <Text style={styles.profileName}>{data.displayName}</Text>
          <View style={styles.wrap}>
            <Badge label={data.verificationStatus} tone={data.verificationTone} />
            <Badge label="Marketplace provider" tone="neutral" />
          </View>
          <View style={styles.profileStatsGrid}>
            <MetricCard label="Rating" value={data.ratingLabel} />
            <MetricCard label="Reviews" value={data.reviewCountLabel} />
            <MetricCard label="Service" value={data.servicePriceLabel} />
          </View>
          <View style={styles.profileActionRow}>
            <PrimaryButton label="Book Now" onPress={onBook} />
            <PrimaryButton label="Message" variant="secondary" onPress={onMessage} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalRail}
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
            onBook={onBook}
            onFlagReview={onFlagReview}
          />
        </View>
      </ScrollView>
      <View style={styles.stickyFooter}>
        <PrimaryButton label="Book Service" onPress={onBook} />
        <View style={styles.footerHomeIndicator} />
      </View>
    </>
  );
}

function ProviderProfileTabContent({
  data,
  onBook,
  onFlagReview,
}: {
  data: ReturnType<typeof useCustomerProviderProfileViewModel>['data'];
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
                <Text style={styles.portfolioText} numberOfLines={1}>
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
            <View style={styles.rowBetween}>
              <View style={styles.ratingRow}>
                <Star color="#FFC107" fill="#FFC107" size={14} />
                <Text style={styles.cardTitle}>{review.ratingLabel}</Text>
              </View>
              {review.canFlag ? (
                <Text style={styles.cardMeta} onPress={() => onFlagReview(review.id)}>
                  {review.flagLabel}
                </Text>
              ) : null}
            </View>
            <Text style={styles.cardBody}>{review.reviewText}</Text>
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
          <Text style={styles.cardTitle}>Available booking windows</Text>
          {data.activeAvailabilityWindows.map((window) => (
            <InfoRow key={window.id} label={window.label} value={window.value} />
          ))}
          {!data.hasActiveAvailabilityWindows ? (
            <Text style={styles.cardMeta}>No public availability windows are active yet.</Text>
          ) : null}
        </Card>
        {data.hasDaysOff ? (
          <Card>
            <Text style={styles.cardTitle}>Unavailable dates</Text>
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
        <Text style={styles.cardBody}>{data.description}</Text>
        {data.aboutRows.map((row) => (
          <InfoRow key={row.key} label={row.label} value={row.value} />
        ))}
      </Card>
    </Section>
  );
}

const styles = StyleSheet.create({
  withStickyFooter: {
    backgroundColor: palette.white,
    flexGrow: 1,
    paddingBottom: 132,
  },
  providerCover: {
    backgroundColor: palette.mint,
    height: 160,
    width: '100%',
  },
  providerProfileBody: {
    gap: spacing.lg,
    marginTop: -50,
    padding: spacing.xl,
  },
  providerProfileAvatar: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.white,
    borderRadius: radius.pill,
    borderWidth: 4,
    height: 100,
    justifyContent: 'center',
    boxShadow: '0 5px 10px rgba(0,0,0,0.12)',
    width: 100,
  },
  providerProfileAvatarText: {
    color: palette.mint,
    fontSize: 40,
    fontWeight: '900',
  },
  profileName: {
    color: palette.ink,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  profileStatsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  profileActionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  horizontalRail: {
    gap: spacing.md,
    paddingRight: spacing.sm,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  portfolioTile: {
    backgroundColor: palette.mintSoft,
    borderRadius: radius.md,
    height: 150,
    overflow: 'hidden',
    width: '47%',
  },
  portfolioImage: {
    flex: 1,
    width: '100%',
  },
  portfolioText: {
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
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  cardTitle: {
    ...type.section,
    color: palette.ink,
  },
  cardBody: {
    ...type.body,
    color: palette.body,
  },
  cardMeta: {
    ...type.caption,
    color: palette.muted,
  },
  stickyFooter: {
    alignSelf: 'center',
    backgroundColor: palette.white,
    borderTopColor: palette.lineSoft,
    borderTopWidth: 1,
    bottom: 0,
    gap: spacing.sm,
    left: 0,
    maxWidth: 393,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    position: 'absolute',
    right: 0,
    width: '100%',
  },
  footerHomeIndicator: {
    alignSelf: 'center',
    backgroundColor: palette.ink,
    borderRadius: radius.pill,
    height: 5,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
    width: 134,
  },
});
