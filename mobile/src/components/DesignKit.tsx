import { ReactNode, useEffect, useRef } from 'react';
import { ArrowLeft, Check } from 'lucide-react-native';
import {
  Animated,
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useEntranceMotion, usePressScale } from './Motion';
import { palette, radius, spacing, type } from '../theme/serveaseDesign';

export function PhoneFrame({ children }: { children: ReactNode }) {
  return <View style={styles.phoneFrame}>{children}</View>;
}

export function StatusStrip() {
  return null;
}

export function TopBar({
  title,
  subtitle,
  onBack,
  right,
  green,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
  green?: boolean;
}) {
  return (
    <View style={[styles.topBar, green && styles.greenTopBar]}>
      {onBack ? (
        <Pressable
          style={styles.iconButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ArrowLeft color={green ? palette.white : palette.ink} size={24} strokeWidth={2.4} />
        </Pressable>
      ) : null}
      <View style={styles.topBarCopy}>
        <Text style={[styles.topTitle, green && styles.lightText]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.topSubtitle, green && styles.lightSubText]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function Section({
  title,
  action,
  children,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      {title ? (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {action}
        </View>
      ) : null}
      {children}
    </View>
  );
}

export function Card({
  children,
  selected,
  onPress,
  accessibilityLabel,
}: {
  children: ReactNode;
  selected?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const entranceStyle = useEntranceMotion();
  const content = (
    <Animated.View style={[styles.card, selected && styles.selectedCard, entranceStyle]}>
      {children}
    </Animated.View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? 'Open details'}
    >
      {content}
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void | Promise<void>;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const press = usePressScale(disabled);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      disabled={disabled}
      accessibilityRole="button"
    >
      <Animated.View
        style={[
          styles.button,
          variant === 'secondary' && styles.secondaryButton,
          variant === 'danger' && styles.dangerButton,
          disabled && styles.disabled,
          { transform: [{ scale: press.scale }] },
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            variant === 'secondary' && styles.secondaryButtonText,
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function Field({
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
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.faint}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize="none"
      />
    </View>
  );
}

export function Pill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={[styles.pill, selected && styles.pillSelected]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function Badge({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'success' | 'warning' | 'danger' | 'neutral';
}) {
  return (
    <View style={[styles.badge, badgeTone[tone]]}>
      <Text style={[styles.badgeText, badgeTextTone[tone]]}>{label}</Text>
    </View>
  );
}

export function MetricCard({
  label,
  value,
  featured,
}: {
  label: string;
  value: string | number;
  featured?: boolean;
}) {
  return (
    <View style={[styles.metricCard, featured && styles.featuredMetric]}>
      <Text style={[styles.metricLabel, featured && styles.featuredMetricLabel]}>{label}</Text>
      <Text style={[styles.metricValue, featured && styles.featuredMetricValue]}>{value}</Text>
    </View>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

export function BottomNavigation<T extends string>({
  tabs,
  active,
  onChange,
  unreadCount = 0,
}: {
  tabs: { key: T; label: string; mark?: string; icon?: ReactNode }[];
  active: T;
  onChange: (key: T) => void;
  unreadCount?: number;
}) {
  return (
    <View style={styles.bottomNav}>
      <View style={styles.bottomNavRow}>
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          return (
            <BottomNavigationItem
              key={tab.key}
              icon={tab.icon}
              isActive={isActive}
              label={tab.label}
              mark={tab.mark}
              unreadCount={unreadCount}
              onPress={() => onChange(tab.key)}
            />
          );
        })}
      </View>
      <View style={styles.homeIndicator} />
    </View>
  );
}

function BottomNavigationItem({
  icon,
  isActive,
  label,
  mark,
  unreadCount,
  onPress,
}: {
  icon?: ReactNode;
  isActive: boolean;
  label: string;
  mark?: string;
  unreadCount: number;
  onPress: () => void;
}) {
  const activeScale = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(activeScale, {
      toValue: isActive ? 1 : 0,
      damping: 16,
      mass: 0.7,
      stiffness: 240,
      useNativeDriver: true,
    }).start();
  }, [activeScale, isActive]);

  return (
    <Pressable
      style={styles.navItem}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      <Animated.View
        style={[
          styles.navIcon,
          isActive && styles.navIconActive,
          {
            transform: [
              {
                scale: activeScale.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.08],
                }),
              },
            ],
          },
        ]}
      >
        {icon ?? (
          <Text style={[styles.navMark, isActive && styles.navMarkActive]}>
            {mark ?? label.slice(0, 1)}
          </Text>
        )}
        {label === 'Messages' && unreadCount > 0 ? (
          <View style={styles.unreadDot} />
        ) : null}
      </Animated.View>
      <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function StatusTimeline({
  steps,
}: {
  steps: { label: string; completed: boolean }[];
}) {
  const completedCount = steps.filter((step) => step.completed).length;
  const progress = (
    steps.length > 1 ? `${Math.max(0, completedCount - 1) * (100 / (steps.length - 1))}%` : '0%'
  ) as `${number}%`;

  return (
    <View style={styles.timeline}>
      <View style={styles.timelineLine} />
      <View style={[styles.timelineProgress, { width: progress }]} />
      <View style={styles.timelineSteps}>
        {steps.map((step) => (
          <View key={step.label} style={styles.timelineStep}>
            <View style={[styles.timelineCircle, step.completed && styles.timelineDone]}>
              {step.completed ? (
                <Check color={palette.white} size={18} strokeWidth={3} />
              ) : (
                <View style={styles.timelineDot} />
              )}
            </View>
            <Text style={[styles.timelineLabel, step.completed && styles.timelineLabelDone]}>
              {step.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const badgeTone = {
  success: { backgroundColor: '#EAF8F0' },
  warning: { backgroundColor: '#FEF3C7' },
  danger: { backgroundColor: '#FEE2E2' },
  neutral: { backgroundColor: '#F3F4F6' },
};

const badgeTextTone = {
  success: { color: palette.mintDeep },
  warning: { color: '#B45309' },
  danger: { color: palette.red },
  neutral: { color: palette.muted },
};

const styles = StyleSheet.create({
  phoneFrame: {
    backgroundColor: palette.white,
    flex: 1,
    maxWidth: 393,
    overflow: 'hidden',
    width: '100%',
    alignSelf: 'center',
  },
  statusStrip: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    flexDirection: 'row',
    height: 47,
    justifyContent: 'space-between',
    paddingHorizontal: 27,
  },
  statusText: {
    color: palette.white,
    fontSize: 13,
    fontWeight: '800',
  },
  topBar: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderBottomColor: palette.lineSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 69,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  greenTopBar: {
    backgroundColor: palette.mint,
    borderBottomWidth: 0,
  },
  iconButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    marginLeft: -10,
    width: 44,
  },
  topBarCopy: {
    flex: 1,
  },
  topTitle: {
    ...type.section,
    color: palette.ink,
  },
  topSubtitle: {
    ...type.caption,
    color: palette.muted,
    marginTop: spacing.xs,
  },
  lightText: {
    color: palette.white,
  },
  lightSubText: {
    color: 'rgba(255,255,255,0.82)',
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
    ...type.section,
    color: palette.ink,
    fontWeight: '700',
  },
  card: {
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.base,
    boxShadow: '0 3px 6px rgba(0,0,0,0.05)',
  },
  selectedCard: {
    borderColor: palette.mint,
    boxShadow: '0 4px 8px rgba(86,196,144,0.18)',
  },
  button: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderColor: palette.mint,
    borderRadius: 50,
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.base,
    boxShadow: '0 4px 10px rgba(86,196,144,0.18)',
  },
  secondaryButton: {
    backgroundColor: palette.white,
  },
  dangerButton: {
    backgroundColor: palette.red,
    borderColor: palette.red,
  },
  disabled: {
    opacity: 0.45,
  },
  buttonText: {
    ...type.action,
    color: palette.white,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: palette.mint,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    color: palette.body,
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    backgroundColor: palette.input,
    borderColor: 'transparent',
    borderRadius: radius.md,
    borderWidth: 2,
    color: palette.ink,
    fontSize: 13,
    fontWeight: '500',
    minHeight: 48,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  pill: {
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.pill,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
  },
  pillSelected: {
    backgroundColor: palette.mintSoft,
    borderColor: palette.mint,
  },
  pillText: {
    ...type.caption,
    color: palette.body,
    fontWeight: '800',
  },
  pillTextSelected: {
    color: palette.mintDeep,
  },
  badge: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    ...type.caption,
    fontWeight: '800',
  },
  metricCard: {
    backgroundColor: palette.white,
    borderRadius: radius.md,
    flex: 1,
    gap: spacing.xs,
    padding: spacing.base,
    boxShadow: '0 3px 6px rgba(0,0,0,0.06)',
  },
  featuredMetric: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  metricLabel: {
    ...type.caption,
    color: palette.muted,
  },
  featuredMetricLabel: {
    fontSize: 13,
  },
  metricValue: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: '800',
  },
  featuredMetricValue: {
    color: palette.mint,
    fontSize: 34,
  },
  empty: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  emptyTitle: {
    ...type.section,
    color: palette.ink,
    textAlign: 'center',
  },
  emptyBody: {
    ...type.body,
    color: palette.muted,
    textAlign: 'center',
  },
  bottomNav: {
    backgroundColor: palette.white,
    borderTopColor: 'rgba(44, 42, 40, 0.07)',
    borderTopWidth: 1,
    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
    maxWidth: 393,
    width: '100%',
    alignSelf: 'center',
  },
  bottomNavRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
    minHeight: 58,
  },
  navIcon: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 32,
    justifyContent: 'center',
    width: 48,
  },
  navIconActive: {
    backgroundColor: palette.mintSoft,
  },
  navMark: {
    color: '#B0A89E',
    fontSize: 14,
    fontWeight: '800',
  },
  navMarkActive: {
    color: palette.mint,
  },
  navLabel: {
    color: '#B0A89E',
    fontSize: 10,
    fontWeight: '700',
  },
  navLabelActive: {
    color: palette.mint,
    fontWeight: '800',
  },
  unreadDot: {
    backgroundColor: palette.coral,
    borderColor: palette.white,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 10,
    position: 'absolute',
    right: 8,
    top: 2,
    width: 10,
  },
  homeIndicator: {
    alignSelf: 'center',
    backgroundColor: palette.ink,
    borderRadius: radius.pill,
    height: 5,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
    width: 134,
  },
  timeline: {
    paddingTop: spacing.sm,
  },
  timelineLine: {
    backgroundColor: palette.line,
    height: 2,
    left: spacing.base,
    position: 'absolute',
    right: spacing.base,
    top: 25,
  },
  timelineProgress: {
    backgroundColor: palette.mint,
    height: 2,
    left: spacing.base,
    position: 'absolute',
    top: 25,
  },
  timelineSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineStep: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  timelineCircle: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  timelineDone: {
    backgroundColor: palette.mint,
    borderColor: palette.mint,
  },
  timelineDot: {
    backgroundColor: palette.line,
    borderRadius: radius.pill,
    height: 8,
    width: 8,
  },
  timelineLabel: {
    color: palette.faint,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  timelineLabelDone: {
    color: palette.ink,
  },
});
