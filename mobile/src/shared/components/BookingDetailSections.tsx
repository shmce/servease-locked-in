import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import {
  Badge,
  Card,
  Section,
} from '../../components/DesignKit';
import {
  BookingServiceUpdateSummary,
  BookingSummary,
  BookingTimelineEventSummary,
} from '../models/types';
import {
  formatDateTime,
  timelineEventLabel,
} from '../utils/booking';
import { palette, spacing } from '../../theme/serveaseDesign';

type BookingMediaSectionProps = {
  booking: BookingSummary;
  onRemoveAttachment: (attachmentId: string) => void;
};

type BookingServiceUpdatesSectionProps = {
  updates: BookingServiceUpdateSummary[];
};

type BookingTimelineEventsSectionProps = {
  events: BookingTimelineEventSummary[];
};

export function BookingMediaSection({
  booking,
  onRemoveAttachment,
}: BookingMediaSectionProps) {
  const attachments = booking.attachments ?? [];
  if (!attachments.length) {
    return null;
  }

  return (
    <Section title="Media">
      <View style={styles.portfolioGrid}>
        {attachments.map((attachment) => (
          <View key={attachment.id} style={styles.portfolioTile}>
            <Image source={{ uri: attachment.fileUrl }} style={styles.portfolioImage} />
            <Text style={styles.portfolioText}>
              {attachment.mediaKind === 'provider_progress'
                ? 'Provider update'
                : 'Reference photo'}
            </Text>
            <Pressable
              style={styles.deleteOverlay}
              onPress={() => onRemoveAttachment(attachment.id)}
              accessibilityRole="button"
            >
              <Trash2 color={palette.white} size={16} strokeWidth={2.6} />
            </Pressable>
          </View>
        ))}
      </View>
    </Section>
  );
}

export function BookingServiceUpdatesSection({
  updates,
}: BookingServiceUpdatesSectionProps) {
  if (!updates.length) {
    return null;
  }

  return (
    <Section title="Service Updates">
      {updates.slice(0, 6).map((update) => (
        <Card key={update.id}>
          <View style={styles.rowBetween}>
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>{serviceUpdateTitle(update)}</Text>
              <Text style={styles.cardMeta}>{formatDateTime(update.createdAt)}</Text>
            </View>
            <Badge
              label={update.updateType}
              tone={update.updateType === 'completion' ? 'success' : 'neutral'}
            />
          </View>
          {update.message ? <Text style={styles.cardBody}>{update.message}</Text> : null}
          {update.checklist ? (
            <View style={styles.updateChecklist}>
              <Text style={styles.noticeText}>
                Scope {update.checklist.scopeConfirmed ? 'confirmed' : 'pending'} - Tools{' '}
                {update.checklist.toolsReady ? 'ready' : 'pending'} - Instructions{' '}
                {update.checklist.instructionsReviewed ? 'reviewed' : 'pending'}
              </Text>
            </View>
          ) : null}
        </Card>
      ))}
    </Section>
  );
}

export function BookingTimelineEventsSection({
  events,
}: BookingTimelineEventsSectionProps) {
  if (!events.length) {
    return null;
  }

  return (
    <Section title="Booking Timeline">
      {events.map((event) => (
        <Card key={event.id}>
          <View style={styles.rowBetween}>
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>{timelineEventLabel(event)}</Text>
              <Text style={styles.cardMeta}>{formatDateTime(event.createdAt)}</Text>
            </View>
            <Badge label={event.eventType.replace(/_/g, ' ')} tone="neutral" />
          </View>
        </Card>
      ))}
    </Section>
  );
}

function serviceUpdateTitle(update: BookingServiceUpdateSummary): string {
  if (update.updateType === 'checklist') {
    return 'Pre-service checklist';
  }
  if (update.updateType === 'completion') {
    return 'Completion update';
  }
  return 'Progress update';
}

const styles = StyleSheet.create({
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  portfolioTile: {
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    width: '48%',
  },
  portfolioImage: {
    aspectRatio: 1,
    width: '100%',
  },
  portfolioText: {
    backgroundColor: palette.white,
    color: palette.muted,
    fontSize: 11,
    fontWeight: '700',
    padding: spacing.sm,
  },
  deleteOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(24, 18, 12, 0.72)',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
    width: 32,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  flex: {
    flex: 1,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  cardMeta: {
    color: palette.faint,
    fontSize: 12,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  cardBody: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
  },
  updateChecklist: {
    backgroundColor: palette.lineSoft,
    borderRadius: 14,
    padding: spacing.md,
  },
  noticeText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
  },
});
