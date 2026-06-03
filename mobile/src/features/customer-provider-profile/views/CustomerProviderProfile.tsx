import { ReactNode } from 'react';
import { CheckCircle, MessageCircle, Star } from 'lucide-react-native';
import {
  Image,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from 'react-native';
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
      <CustomerScreen bottomInset={164}>
        <CustomerContent>
          <CustomerHeader
            title={data.displayName}
            subtitle={provider.title}
            onBack={onBack}
            right={
              data.verificationTone === 'success' ? (
                <CustomerIconBlock compact>
                  <CheckCircle
                    color={palette.mintDeep}
                    size={18}
                    strokeWidth={2.2}
                  />
                </CustomerIconBlock>
              ) : null
            }
          />

          <CustomerCard style={styles.summaryCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{data.avatarInitial}</Text>
            </View>
            <View style={styles.summaryBody}>
              <Text style={styles.summaryTitle} numberOfLines={1}>
                {data.displayName}
              </Text>
              <Text style={styles.summaryText} numberOfLines={2}>
                {data.description}
              </Text>
            </View>
          </CustomerCard>

          <CustomerCard style={styles.statsCard}>
            <StatCell
              icon={<Star color="#FFB020" fill="#FFB020" size={14} />}
              label="Rating"
              value={data.ratingLabel}
            />
            <View style={styles.statDivider} />
            <StatCell label="Reviews" value={String(data.reviewCountLabel)} />
            <View style={styles.statDivider} />
            <StatCell
              label="Starts at"
              value={data.servicePriceLabel}
              valueStyle={styles.statValueMint}
            />
          </CustomerCard>

          <View style={styles.actionRow}>
            <Pressable
              style={styles.bookButton}
              onPress={onBook}
              accessibilityRole="button"
              accessibilityLabel="Book provider"
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
            </Pressable>
            <Pressable
              style={styles.messageButton}
              onPress={onMessage}
              accessibilityRole="button"
              accessibilityLabel="Message provider"
            >
              <MessageCircle color={palette.mintDeep} size={18} strokeWidth={2.2} />
              <Text style={styles.messageButtonText}>Message</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabRail}
          >
            {data.tabs.map((tab) => (
              <Pressable
                key={tab}
                style={[
                  styles.tabPill,
                  data.activeTab === tab && styles.tabPillSelected,
                ]}
                onPress={() => onTabChange(tab)}
                accessibilityRole="button"
                accessibilityState={{ selected: data.activeTab === tab }}
              >
                <Text
                  style={[
                    styles.tabText,
                    data.activeTab === tab && styles.tabTextSelected,
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <ProviderProfileTabContent
            data={data}
            onBook={onBook}
            onFlagReview={onFlagReview}
          />
        </CustomerContent>
      </CustomerScreen>

      <View style={styles.stickyFooter}>
        <Pressable
          style={styles.footerButton}
          onPress={onBook}
          accessibilityRole="button"
          accessibilityLabel="Book service"
        >
          <Text style={styles.footerButtonText}>Book Service</Text>
        </Pressable>
      </View>
    </>
  );
}

function StatCell({
  icon,
  label,
  value,
  valueStyle,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
  valueStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={styles.statCell}>
      <View style={styles.statValueRow}>
        {icon}
        <Text style={[styles.statValue, valueStyle]}>{value}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
      <CustomerSection title="Services">
        <CustomerCard onPress={onBook} accessibilityLabel="Book this service">
          <Text style={styles.cardSectionTitle}>{data.serviceItem.name}</Text>
          {data.serviceItem.description ? (
            <Text style={styles.aboutBody}>{data.serviceItem.description}</Text>
          ) : null}
          <Text style={styles.servicePrice}>{data.servicePriceLabel}</Text>
        </CustomerCard>
      </CustomerSection>
    );
  }

  if (data.activeTab === 'Portfolio') {
    return (
      <CustomerSection title="Portfolio">
        {data.hasPortfolioItems ? (
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
        ) : (
          <CustomerEmptyState
            title="No portfolio yet"
            body="Provider work samples will appear here."
          />
        )}
      </CustomerSection>
    );
  }

  if (data.activeTab === 'Reviews') {
    return (
      <CustomerSection title="Reviews">
        {data.hasReviews ? (
          <View style={styles.reviewList}>
            {data.reviewCards.map((review) => (
              <CustomerCard key={review.id}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewRatingRow}>
                    <Star color="#FFB020" fill="#FFB020" size={13} />
                    <Text style={styles.reviewRating}>{review.ratingLabel}</Text>
                  </View>
                  {review.canFlag ? (
                    <Text style={styles.flagLabel} onPress={() => onFlagReview(review.id)}>
                      {review.flagLabel}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.reviewText}>{review.reviewText}</Text>
              </CustomerCard>
            ))}
          </View>
        ) : (
          <CustomerEmptyState
            title="No reviews yet"
            body="Reviews for this provider appear here."
          />
        )}
      </CustomerSection>
    );
  }

  if (data.activeTab === 'Availability') {
    return (
      <CustomerSection title="Availability">
        <CustomerCard>
          <Text style={styles.cardSectionTitle}>Available booking windows</Text>
          {data.activeAvailabilityWindows.map((window) => (
            <DetailRow key={window.id} label={window.label} value={window.value} />
          ))}
          {!data.hasActiveAvailabilityWindows ? (
            <Text style={styles.emptyNote}>
              No public availability windows are active yet.
            </Text>
          ) : null}
        </CustomerCard>
        {data.hasDaysOff ? (
          <CustomerCard>
            <Text style={styles.cardSectionTitle}>Unavailable dates</Text>
            {data.daysOff.map((dayOff) => (
              <DetailRow key={dayOff.id} label={dayOff.label} value={dayOff.value} />
            ))}
          </CustomerCard>
        ) : null}
      </CustomerSection>
    );
  }

  return (
    <CustomerSection title="About">
      <CustomerCard>
        <Text style={styles.aboutBody}>{data.description}</Text>
      </CustomerCard>
      <CustomerCard>
        {data.aboutRows.map((row, index) => (
          <DetailRow
            key={row.key}
            label={row.label}
            value={row.value}
            showBorder={index < data.aboutRows.length - 1}
          />
        ))}
      </CustomerCard>
    </CustomerSection>
  );
}

function DetailRow({
  label,
  showBorder,
  value,
}: {
  label: string;
  showBorder?: boolean;
  value: string;
}) {
  return (
    <View style={[styles.detailRow, showBorder && styles.detailRowBorder]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.base,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderRadius: radius.pill,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  avatarInitial: {
    color: palette.mintDeep,
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0,
  },
  summaryBody: {
    flex: 1,
    minWidth: 0,
  },
  summaryTitle: {
    ...customerText.title,
    fontSize: 16,
    lineHeight: 21,
  },
  summaryText: {
    ...customerText.body,
    marginTop: 2,
  },
  statsCard: {
    alignItems: 'center',
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
    color: '#202733',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0,
  },
  statValueMint: {
    color: palette.mintDeep,
  },
  statLabel: {
    ...customerText.meta,
    fontSize: 11,
    lineHeight: 15,
  },
  statDivider: {
    backgroundColor: '#EEF0F2',
    height: 32,
    width: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bookButton: {
    alignItems: 'center',
    backgroundColor: palette.mintDeep,
    borderRadius: radius.pill,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.base,
  },
  bookButtonText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0,
  },
  messageButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#BDE8D0',
    borderRadius: radius.pill,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.base,
  },
  messageButtonText: {
    color: palette.mintDeep,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0,
  },
  tabRail: {
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  tabPill: {
    backgroundColor: palette.white,
    borderColor: '#EEF0F2',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  tabPillSelected: {
    backgroundColor: '#F1FAF5',
    borderColor: '#BDE8D0',
  },
  tabText: {
    color: '#69717D',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0,
  },
  tabTextSelected: {
    color: palette.mintDeep,
    fontWeight: '600',
  },
  cardSectionTitle: {
    ...customerText.title,
    fontSize: 15,
    lineHeight: 20,
  },
  servicePrice: {
    color: palette.mintDeep,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 20,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  portfolioTile: {
    backgroundColor: '#F1FAF5',
    borderRadius: 10,
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
    fontWeight: '600',
    left: 0,
    letterSpacing: 0,
    padding: spacing.xs,
    position: 'absolute',
    right: 0,
  },
  reviewList: {
    gap: spacing.md,
  },
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
    color: '#202733',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
  },
  flagLabel: {
    ...customerText.meta,
    color: palette.mintDeep,
  },
  reviewText: {
    ...customerText.body,
  },
  emptyNote: {
    ...customerText.meta,
  },
  aboutBody: {
    ...customerText.body,
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  detailRowBorder: {
    borderBottomColor: '#EEF0F2',
    borderBottomWidth: 1,
  },
  detailLabel: {
    ...customerText.meta,
  },
  detailValue: {
    color: '#202733',
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 18,
    textAlign: 'right',
  },
  stickyFooter: {
    backgroundColor: palette.white,
    borderTopColor: '#EEF0F2',
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    position: 'absolute',
    right: 0,
  },
  footerButton: {
    alignItems: 'center',
    backgroundColor: palette.mintDeep,
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 50,
  },
  footerButtonText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0,
  },
});
