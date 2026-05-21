import { ReactNode } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { palette, radius, spacing, type } from '../../theme/serveaseDesign';

type ScreenScrollProps = {
  children: ReactNode;
  bottomInset?: number;
  surface?: 'cream' | 'white';
};

export function ScreenScroll({
  children,
  bottomInset = 108,
  surface = 'cream',
}: ScreenScrollProps) {
  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: bottomInset },
        surface === 'white' && styles.whiteSurface,
      ]}
    >
      {children}
    </ScrollView>
  );
}

export function ScreenContent({ children }: { children: ReactNode }) {
  return <View style={styles.content}>{children}</View>;
}

export function CompactGrid({ children }: { children: ReactNode }) {
  return <View style={styles.compactGrid}>{children}</View>;
}

export function CompactGridItem({ children }: { children: ReactNode }) {
  return <View style={styles.compactGridItem}>{children}</View>;
}

export function TwoColumnGrid({ children }: { children: ReactNode }) {
  return <View style={styles.compactGrid}>{children}</View>;
}

export function TwoColumnGridItem({ children }: { children: ReactNode }) {
  return <View style={styles.compactGridItem}>{children}</View>;
}

export function ActionRow({ children }: { children: ReactNode }) {
  return <View style={styles.actionRow}>{children}</View>;
}

export function FormStack({ children }: { children: ReactNode }) {
  return <View style={styles.formStack}>{children}</View>;
}

export function ScreenSection({
  children,
  title,
  action,
}: {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.screenSection}>
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

export function InfoCard({
  children,
  selected,
  onPress,
}: {
  children: ReactNode;
  selected?: boolean;
  onPress?: () => void;
}) {
  const content = (
    <View style={[styles.infoCard, selected && styles.infoCardSelected]}>
      {children}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {content}
    </Pressable>
  );
}

export function StickyFooter({
  children,
  maxWidth = 393,
}: {
  children: ReactNode;
  maxWidth?: number;
}) {
  return (
    <View style={[styles.stickyFooter, { maxWidth }]}>
      {children}
      <View style={styles.footerHomeIndicator} />
    </View>
  );
}

type MediaUploadBoxProps = {
  imageUri?: string | null;
  icon?: ReactNode;
  label: string;
  helper?: string | null;
  onPress: () => void;
  minHeight?: number;
  previewHeight?: number;
  surface?: 'white' | 'mint';
};

export function MediaUploadBox({
  imageUri,
  icon,
  label,
  helper,
  onPress,
  minHeight = 132,
  previewHeight = 116,
  surface = 'white',
}: MediaUploadBoxProps) {
  return (
    <Pressable
      style={[
        styles.mediaUploadBox,
        { minHeight },
        surface === 'mint' && styles.mediaUploadBoxMint,
      ]}
      onPress={onPress}
      accessibilityRole="button"
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[styles.mediaUploadPreview, { height: previewHeight }]}
        />
      ) : (
        icon
      )}
      {helper ? <Text style={styles.mediaUploadHelper}>{helper}</Text> : null}
      <Text style={styles.mediaUploadLabel}>{label}</Text>
    </Pressable>
  );
}

type MarketplaceTileProps = {
  title: string;
  body?: string | null;
  meta?: string | null;
  footer?: ReactNode;
  selected?: boolean;
  onPress: () => void;
};

export function MarketplaceTile({
  title,
  body,
  meta,
  footer,
  selected,
  onPress,
}: MarketplaceTileProps) {
  return (
    <Pressable
      style={[styles.marketplaceTile, selected && styles.marketplaceTileSelected]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text style={styles.tileTitle} numberOfLines={2}>
        {title}
      </Text>
      {meta ? (
        <Text style={styles.tileMeta} numberOfLines={1}>
          {meta}
        </Text>
      ) : null}
      {body ? (
        <Text style={styles.tileBody} numberOfLines={3}>
          {body}
        </Text>
      ) : null}
      {footer ? <View style={styles.tileFooter}>{footer}</View> : null}
    </Pressable>
  );
}

export const marketplaceTextStyles = StyleSheet.create({
  title: {
    ...type.section,
    color: palette.ink,
  },
  body: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  meta: {
    ...type.caption,
    color: palette.muted,
  },
  link: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '900',
  },
  price: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '900',
  },
});

const styles = StyleSheet.create({
  scrollContent: {
    backgroundColor: palette.cream,
    flexGrow: 1,
  },
  whiteSurface: {
    backgroundColor: palette.white,
  },
  content: {
    gap: spacing.md,
    padding: spacing.md,
  },
  compactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },
  compactGridItem: {
    width: '48%',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  formStack: {
    gap: spacing.md,
  },
  screenSection: {
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
  },
  infoCard: {
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.base,
  },
  infoCardSelected: {
    backgroundColor: palette.mintSoft,
    borderColor: palette.mint,
  },
  stickyFooter: {
    alignSelf: 'center',
    backgroundColor: palette.white,
    borderTopColor: palette.lineSoft,
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
  mediaUploadBox: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: spacing.sm,
    justifyContent: 'center',
    overflow: 'hidden',
    padding: spacing.md,
  },
  mediaUploadBoxMint: {
    backgroundColor: palette.mintSoft,
    borderColor: palette.mint,
    borderWidth: 2,
  },
  mediaUploadPreview: {
    alignSelf: 'stretch',
    borderRadius: radius.md,
  },
  mediaUploadHelper: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  mediaUploadLabel: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '900',
  },
  marketplaceTile: {
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 132,
    padding: spacing.base,
  },
  marketplaceTileSelected: {
    backgroundColor: palette.mintSoft,
    borderColor: palette.mint,
  },
  tileTitle: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  tileBody: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  tileMeta: {
    ...type.caption,
    color: palette.muted,
  },
  tileFooter: {
    marginTop: 'auto',
  },
});
