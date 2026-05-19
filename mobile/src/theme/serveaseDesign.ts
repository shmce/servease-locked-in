export const palette = {
  mint: '#56C490',
  mintDark: '#3DAE76',
  mintDeep: '#00A055',
  mintSoft: '#EEF9F3',
  cream: '#FAF8F5',
  // Legacy. Do not use in new code. Use palette.alert or palette.mint.
  coral: '#FF8C7A',
  red: '#EF4444',
  alert: '#EF4444',
  // Legacy. Do not use in new code. Use palette.alert or palette.mint.
  blue: '#5AAFF0',
  // Legacy. Do not use in new code. Use palette.alert or palette.mint.
  violet: '#7B8FF5',
  // Legacy. Do not use in new code. Use palette.alert or palette.mint.
  amber: '#F5A83A',
  ink: '#2C2A28',
  body: '#374151',
  muted: '#6B7280',
  faint: '#9B8E84',
  line: '#E5E7EB',
  lineSoft: '#F2F2F2',
  input: '#F5F0EA',
  white: '#FFFFFF',
  surface: '#F5F7FA',
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
};

export const homeTokens = {
  heroPadding: spacing.lg,
  cardGap: spacing.md,
  sectionGap: spacing.xl,
  pillGap: spacing.sm,
};

export const type = {
  hero: {
    fontSize: 28,
    fontWeight: '800' as const,
    lineHeight: 34,
  },
  title: {
    fontSize: 22,
    fontWeight: '800' as const,
    lineHeight: 28,
  },
  section: {
    fontSize: 16,
    fontWeight: '800' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 17,
  },
  action: {
    fontSize: 15,
    fontWeight: '800' as const,
    lineHeight: 20,
  },
};
