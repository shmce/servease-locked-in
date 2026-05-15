import { ReactNode } from 'react';
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/designTokens';
import { StatusTone } from '../domain/booking';

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {action}
      </View>
      {children}
    </View>
  );
}

export function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  multiline,
  autoCapitalize,
  keyboardType,
  secureTextEntry,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  autoCapitalize?: 'none';
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

export function ActionButton({
  label,
  onPress,
  variant,
  disabled,
}: {
  label: string;
  onPress: () => void | Promise<void | null>;
  variant: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={[
        styles.button,
        variant === 'primary' && styles.primaryButton,
        variant === 'danger' && styles.dangerButton,
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text
        style={[
          styles.buttonText,
          (variant === 'primary' || variant === 'danger') && styles.solidButtonText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function ChoiceButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.choiceButton, selected && styles.selectedChoice]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.choiceText, selected && styles.selectedChoiceText]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function TabBar<T extends string>({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: { key: T; label: string; badge?: number }[];
  activeTab: T;
  onChange: (tab: T) => void;
}) {
  return (
    <View style={styles.tabBar} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const selected = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            style={[styles.tab, selected && styles.activeTab]}
            onPress={() => onChange(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.tabText, selected && styles.activeTabText]}>
              {tab.label}
            </Text>
            {tab.badge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{tab.badge}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export function StatusChip({ label, tone }: { label: string; tone: StatusTone }) {
  return (
    <View style={[styles.statusChip, statusToneStyle[tone]]}>
      <Text style={[styles.statusText, statusTextToneStyle[tone]]}>{label}</Text>
    </View>
  );
}

export function EmptyState({ text, action }: { text: string; action: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{text}</Text>
      <Text style={styles.emptyAction}>{action}</Text>
    </View>
  );
}

export function Page({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <View style={styles.page}>
      <View style={styles.pageHeader}>
        <View style={styles.pageCopy}>
          <Text style={styles.pageTitle}>{title}</Text>
          <Text style={styles.pageSubtitle}>{subtitle}</Text>
        </View>
        {action}
      </View>
      {children}
    </View>
  );
}

const statusToneStyle = {
  success: {
    backgroundColor: '#dcfce7',
    borderColor: colors.success,
  },
  warning: {
    backgroundColor: '#fef3c7',
    borderColor: colors.warning,
  },
  danger: {
    backgroundColor: '#fee2e2',
    borderColor: colors.danger,
  },
  neutral: {
    backgroundColor: colors.borderSoft,
    borderColor: colors.muted,
  },
};

const statusTextToneStyle = {
  success: {
    color: colors.success,
  },
  warning: {
    color: colors.warning,
  },
  danger: {
    color: colors.danger,
  },
  neutral: {
    color: colors.body,
  },
};

const styles = StyleSheet.create({
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
    ...typography.section,
    color: colors.ink,
  },
  page: {
    gap: spacing.base,
  },
  pageHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  pageCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  pageTitle: {
    ...typography.display,
    color: colors.ink,
  },
  pageSubtitle: {
    ...typography.body,
    color: colors.muted,
  },
  metric: {
    backgroundColor: colors.card,
    borderColor: colors.borderSoft,
    borderRadius: radius.sm,
    borderWidth: 1,
    flex: 1,
    minHeight: 72,
    padding: spacing.md,
  },
  metricValue: {
    ...typography.title,
    color: colors.ink,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.muted,
  },
  field: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.muted,
    fontWeight: '600',
  },
  input: {
    ...typography.body,
    backgroundColor: colors.canvas,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.ink,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  multilineInput: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  button: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  dangerButton: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  disabledButton: {
    opacity: 0.52,
  },
  buttonText: {
    ...typography.action,
    color: colors.ink,
    textAlign: 'center',
  },
  solidButtonText: {
    color: colors.brandInk,
  },
  choiceButton: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.full,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  selectedChoice: {
    backgroundColor: colors.brandSoft,
    borderColor: colors.brand,
  },
  choiceText: {
    ...typography.action,
    color: colors.body,
  },
  selectedChoiceText: {
    color: colors.brandPressed,
  },
  tabBar: {
    backgroundColor: colors.card,
    borderColor: colors.borderSoft,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  tab: {
    alignItems: 'center',
    borderRadius: radius.sm,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 0,
    paddingHorizontal: spacing.xs,
  },
  activeTab: {
    backgroundColor: colors.brandSoft,
  },
  tabText: {
    ...typography.action,
    color: colors.body,
  },
  activeTabText: {
    color: colors.brandPressed,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: radius.full,
    justifyContent: 'center',
    minHeight: 20,
    minWidth: 20,
    paddingHorizontal: spacing.xs,
  },
  badgeText: {
    ...typography.caption,
    color: colors.canvas,
    fontWeight: '700',
  },
  statusChip: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: colors.card,
    borderColor: colors.borderSoft,
    borderRadius: radius.sm,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.body,
  },
  emptyAction: {
    ...typography.caption,
    color: colors.brandPressed,
    fontWeight: '600',
  },
});
