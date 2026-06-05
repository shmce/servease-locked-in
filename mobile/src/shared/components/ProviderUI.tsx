import { ReactNode } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import {
  KeyboardTypeOptions,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { MotionPressable, MotionView } from '../../components/Motion';
import { palette, radius, spacing } from '../../theme/serveaseDesign';

type ProviderScreenProps = {
  children: ReactNode;
  bottomInset?: number;
  contentStyle?: StyleProp<ViewStyle>;
};

export function ProviderScreen({
  children,
  bottomInset = 112,
  contentStyle,
}: ProviderScreenProps) {
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

export function ProviderContent({ children }: { children: ReactNode }) {
  return (
    <MotionView style={styles.content} variant="content">
      {children}
    </MotionView>
  );
}

export function ProviderHeader({
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
        <Text style={styles.headerTitle} numberOfLines={2}>
          {title}
        </Text>
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

export function ProviderSection({
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
          <Text style={styles.sectionTitle} numberOfLines={2}>
            {title}
          </Text>
          {action ? <View style={styles.sectionAction}>{action}</View> : null}
        </View>
      ) : null}
      {children}
    </MotionView>
  );
}

export function ProviderCard({
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

export function ProviderIconBlock({
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

export function ProviderBadge({
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

export function ProviderRow({
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
      {icon ? <ProviderIconBlock compact>{icon}</ProviderIconBlock> : null}
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
      {meta ? <View style={styles.rowMeta}>{meta}</View> : null}
      {onPress ? <ChevronRight color="#32A66F" size={18} strokeWidth={2.2} /> : null}
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

export function ProviderEmptyState({
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

export function ProviderButton({
  label,
  onPress,
  disabled,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void | Promise<void>;
  disabled?: boolean;
  variant?: 'danger' | 'primary' | 'secondary';
}) {
  return (
    <MotionPressable
      contentStyle={[
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'danger' && styles.buttonDanger,
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text
        style={[
          styles.buttonText,
          variant === 'secondary' && styles.buttonSecondaryText,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </MotionPressable>
  );
}

export function ProviderActionRow({ children }: { children: ReactNode }) {
  return (
    <MotionView style={styles.actionRow} variant="content">
      {children}
    </MotionView>
  );
}

export function ProviderTextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A0A7B2"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize="none"
      />
    </View>
  );
}

export function ProviderPill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <MotionPressable
      contentStyle={[styles.pill, selected && styles.pillSelected]}
      onPress={onPress}
      disabled={!onPress}
      selected={selected}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { selected: Boolean(selected) } : undefined}
    >
      <Text style={[styles.pillText, selected && styles.pillTextSelected]} numberOfLines={1}>
        {label}
      </Text>
    </MotionPressable>
  );
}

export function ProviderMetricCard({
  label,
  value,
  meta,
}: {
  label: string;
  value: string | number;
  meta?: string | null;
}) {
  return (
    <ProviderCard style={styles.metricCard}>
      <Text style={styles.metricValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.metricLabel} numberOfLines={2}>
        {label}
      </Text>
      {meta ? (
        <Text style={styles.metricMeta} numberOfLines={1}>
          {meta}
        </Text>
      ) : null}
    </ProviderCard>
  );
}

export function ProviderStickyFooter({
  children,
  maxWidth = 393,
}: {
  children: ReactNode;
  maxWidth?: number;
}) {
  return (
    <MotionView style={[styles.stickyFooter, { maxWidth }]} variant="sheet">
      {children}
      <View style={styles.footerHomeIndicator} />
    </MotionView>
  );
}

export const providerText = StyleSheet.create({
  display: {
    color: '#202733',
    fontSize: 26,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 32,
  },
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
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 34,
  },
  headerSubtitle: {
    color: '#66717E',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 23,
    marginTop: spacing.xs,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#202733',
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 24,
  },
  sectionAction: {
    flexShrink: 0,
  },
  card: {
    backgroundColor: palette.white,
    borderColor: '#EEF0F2',
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.base,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.035,
    shadowRadius: 18,
  },
  cardSelected: {
    backgroundColor: palette.mintSoft,
    borderColor: '#A7E5C2',
  },
  iconBlock: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.md,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  iconBlockCompact: {
    borderRadius: radius.pill,
    height: 42,
    width: 42,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 17,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 62,
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
    color: '#6D7480',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 18,
    marginTop: 2,
  },
  rowMeta: {
    flexShrink: 0,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    borderColor: '#EEF0F2',
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
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
    color: '#6D7480',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 20,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: palette.mintDeep,
    borderColor: palette.mintDeep,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  buttonSecondary: {
    backgroundColor: palette.white,
    borderColor: '#DCE4DF',
  },
  buttonDanger: {
    backgroundColor: '#D64A4A',
    borderColor: '#D64A4A',
  },
  buttonDisabled: {
    opacity: 0.48,
  },
  buttonText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 20,
    textAlign: 'center',
  },
  buttonSecondaryText: {
    color: '#202733',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    color: '#69717D',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 18,
  },
  input: {
    backgroundColor: '#FAFBFC',
    borderColor: '#E7EAEE',
    borderRadius: radius.md,
    borderWidth: 1,
    color: '#202733',
    fontSize: 15,
    fontWeight: '400',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  pill: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#E2E7E4',
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: spacing.md,
  },
  pillSelected: {
    backgroundColor: palette.mintSoft,
    borderColor: '#A7E5C2',
  },
  pillText: {
    color: '#606A77',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 18,
  },
  pillTextSelected: {
    color: palette.mintDeep,
    fontWeight: '600',
  },
  metricCard: {
    flex: 1,
    minHeight: 94,
  },
  metricValue: {
    color: '#202733',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 28,
  },
  metricLabel: {
    color: '#6D7480',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 18,
  },
  metricMeta: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 17,
  },
  stickyFooter: {
    alignSelf: 'center',
    backgroundColor: palette.white,
    borderTopColor: '#EEF0F2',
    borderTopWidth: 1,
    bottom: 0,
    gap: spacing.sm,
    left: 0,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    position: 'absolute',
    right: 0,
  },
  footerHomeIndicator: {
    alignSelf: 'center',
    backgroundColor: palette.ink,
    borderRadius: radius.pill,
    height: 5,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
    opacity: 0.18,
    width: 118,
  },
});
