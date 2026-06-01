import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
} from 'lucide-react-native';
import { palette, radius, spacing, type } from '../../../theme/serveaseDesign';

export function AuthContent({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      contentContainerStyle={styles.authContent}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

export function AuthPanel({ children }: { children: ReactNode }) {
  return <View style={styles.authPanel}>{children}</View>;
}

export function AuthHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <View style={styles.authHeader}>
      <Text style={styles.authEyebrow}>{eyebrow}</Text>
      <Text style={styles.authHero}>{title}</Text>
      <Text style={styles.authSubhead}>{body}</Text>
    </View>
  );
}

export function AuthOptionStack({ children }: { children: ReactNode }) {
  return <View style={styles.authOptionStack}>{children}</View>;
}

export function AuthOptionCard({
  icon,
  title,
  body,
  meta,
  onPress,
}: {
  icon: 'customer' | 'provider';
  title: string;
  body: string;
  meta: string;
  onPress: () => void;
}) {
  const Icon = icon === 'provider' ? BriefcaseBusiness : CalendarDays;

  return (
    <Pressable
      style={styles.authOptionCard}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={meta}
    >
      <View style={styles.authOptionIcon}>
        <Icon color={palette.mintDeep} size={22} strokeWidth={2.5} />
      </View>
      <View style={styles.authOptionCopy}>
        <Text style={styles.authOptionMeta}>{meta}</Text>
        <Text style={styles.authOptionTitle}>{title}</Text>
        <Text style={styles.authOptionBody}>{body}</Text>
      </View>
      <View style={styles.authOptionArrow}>
        <ArrowRight color={palette.mintDeep} size={20} strokeWidth={2.6} />
      </View>
    </Pressable>
  );
}

export function SocialButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      style={[styles.socialButton, disabled && styles.socialButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Text style={styles.googleMark}>G</Text>
      <Text style={styles.socialText}>{label}</Text>
    </Pressable>
  );
}

export function AuthNotice({ notice }: { notice: string }) {
  if (!notice.trim()) {
    return null;
  }

  return (
    <View style={styles.noticeBox} accessibilityRole="alert">
      <Text style={styles.noticeText}>{notice}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  authContent: {
    backgroundColor: '#F8FBF9',
    flexGrow: 1,
    gap: spacing.base,
    padding: spacing.base,
    paddingBottom: spacing.xl,
  },
  authHeader: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  authEyebrow: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 17,
    textTransform: 'uppercase',
  },
  authHero: {
    ...type.hero,
    color: palette.ink,
  },
  authSubhead: {
    ...type.body,
    color: palette.muted,
  },
  authOptionStack: {
    gap: spacing.md,
  },
  authOptionCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: 'rgba(86,196,144,0.14)',
    borderRadius: radius.lg,
    borderWidth: 1,
    elevation: 2,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 112,
    padding: spacing.base,
    shadowColor: '#113C2B',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  authOptionIcon: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  authOptionCopy: {
    flex: 1,
    gap: 3,
  },
  authOptionMeta: {
    color: palette.mintDeep,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 15,
    textTransform: 'uppercase',
  },
  authOptionTitle: {
    color: palette.ink,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 23,
  },
  authOptionBody: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  authOptionArrow: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  authPanel: {
    backgroundColor: palette.white,
    borderColor: 'rgba(86,196,144,0.12)',
    borderRadius: radius.lg,
    borderWidth: 1,
    elevation: 2,
    gap: spacing.md,
    padding: spacing.base,
    shadowColor: '#113C2B',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
  },
  socialButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: spacing.base,
  },
  socialButtonDisabled: {
    opacity: 0.58,
  },
  googleMark: {
    color: '#4285F4',
    fontSize: 18,
    fontWeight: '900',
  },
  socialText: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  noticeText: {
    color: palette.body,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
  },
  noticeBox: {
    backgroundColor: palette.mintSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
});
