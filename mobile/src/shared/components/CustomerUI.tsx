import { ReactNode } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { MotionPressable, MotionView } from '../../components/Motion';
import { palette, radius, spacing } from '../../theme/serveaseDesign';

type CustomerScreenProps = {
  children: ReactNode;
  bottomInset?: number;
  contentStyle?: StyleProp<ViewStyle>;
};

export function CustomerScreen({
  children,
  bottomInset = 112,
  contentStyle,
}: CustomerScreenProps) {
  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: bottomInset },
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

export function CustomerContent({ children }: { children: ReactNode }) {
  return (
    <MotionView style={styles.content} variant="content">
      {children}
    </MotionView>
  );
}

export function CustomerHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string | null;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <MotionPressable
          contentStyle={styles.backButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ArrowLeft color="#4B5563" size={21} strokeWidth={2.2} />
        </MotionPressable>
      ) : null}
      <View style={styles.headerCopy}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.headerSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View style={styles.headerRight}>{right}</View> : null}
    </View>
  );
}

export function CustomerSection({
  title,
  action,
  children,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <MotionView style={styles.section} variant="content">
      {title ? (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {action}
        </View>
      ) : null}
      {children}
    </MotionView>
  );
}

export function CustomerCard({
  children,
  onPress,
  selected,
  style,
  accessibilityLabel,
}: {
  children: ReactNode;
  onPress?: () => void;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const cardStyle = [styles.card, selected && styles.cardSelected, style];
  const content = (
    <MotionView style={cardStyle} variant="card">
      {children}
    </MotionView>
  );

  if (!onPress) {
    return content;
  }

  return (
    <MotionView variant="card">
      <MotionPressable
        contentStyle={cardStyle}
        onPress={onPress}
        selected={selected}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? 'Open details'}
      >
        {children}
      </MotionPressable>
    </MotionView>
  );
}

export function CustomerIconBlock({
  children,
  compact = false,
}: {
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <View style={[styles.iconBlock, compact && styles.iconBlockCompact]}>
      {children}
    </View>
  );
}

export function CustomerBadge({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'danger' | 'neutral' | 'success' | 'warning';
}) {
  return (
    <MotionView
      style={[styles.badge, badgeToneStyles[tone].badge]}
      variant="listItem"
    >
      <Text style={[styles.badgeText, badgeToneStyles[tone].text]} numberOfLines={1}>
        {label}
      </Text>
    </MotionView>
  );
}

export function CustomerRow({
  icon,
  title,
  subtitle,
  meta,
  onPress,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string | null;
  meta?: ReactNode;
  onPress?: () => void;
}) {
  const content = (
    <MotionView style={styles.row} variant="listItem">
      {icon ? <CustomerIconBlock compact>{icon}</CustomerIconBlock> : null}
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.rowSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {meta}
      {onPress ? <ChevronRight color="#B0A89E" size={18} strokeWidth={2.1} /> : null}
    </MotionView>
  );

  if (!onPress) {
    return content;
  }

  return (
    <MotionPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {content}
    </MotionPressable>
  );
}

export function CustomerEmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <MotionView style={styles.emptyState} variant="content">
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </MotionView>
  );
}

export const customerText = StyleSheet.create({
  title: {
    color: '#202733',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 24,
  },
  body: {
    color: '#606A77',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 20,
  },
  meta: {
    color: '#7A828D',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 18,
  },
  action: {
    color: palette.mintDeep,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 19,
  },
});

const badgeToneStyles = {
  danger: {
    badge: {
      backgroundColor: '#FEECEC',
    },
    text: {
      color: '#C2413D',
    },
  },
  neutral: {
    badge: {
      backgroundColor: '#EEF2F6',
    },
    text: {
      color: '#5F6671',
    },
  },
  success: {
    badge: {
      backgroundColor: palette.mintSoft,
    },
    text: {
      color: palette.mintDeep,
    },
  },
  warning: {
    badge: {
      backgroundColor: '#FFF4DF',
    },
    text: {
      color: '#C96B00',
    },
  },
} as const;

const styles = StyleSheet.create({
  scrollContent: {
    backgroundColor: palette.white,
    flexGrow: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 54,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#EEF0F2',
    borderRadius: radius.md,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  headerRight: {
    flexShrink: 0,
  },
  headerTitle: {
    color: '#202733',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 30,
  },
  headerSubtitle: {
    color: '#68717E',
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 21,
    marginTop: 3,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#202733',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 23,
  },
  card: {
    backgroundColor: palette.white,
    borderColor: '#EEF0F2',
    borderRadius: 10,
    borderWidth: 1,
    gap: spacing.sm,
    padding: 14,
  },
  cardSelected: {
    backgroundColor: '#F1FAF5',
    borderColor: 'rgba(0,160,85,0.28)',
  },
  iconBlock: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  iconBlockCompact: {
    borderRadius: radius.pill,
    height: 36,
    width: 36,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    maxWidth: 112,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 16,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 58,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    color: '#202733',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 20,
  },
  rowSubtitle: {
    color: '#7A828D',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 18,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#FBFCFD',
    borderColor: '#EEF0F2',
    borderRadius: 10,
    borderWidth: 1,
    padding: spacing.xl,
  },
  emptyTitle: {
    color: '#202733',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 23,
    textAlign: 'center',
  },
  emptyBody: {
    color: '#68717E',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 21,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
