import { ChevronRight, Search, X } from 'lucide-react-native';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CatalogCategory, CatalogServiceItem } from '../../../shared/models/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';

type SheetServiceRow = {
  id: string;
  name: string;
  description: string;
  priceLabel: string;
  service: CatalogServiceItem;
};

type CategorySheetProps = {
  category: CatalogCategory | null;
  serviceRows: SheetServiceRow[];
  totalServiceCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectService: (service: CatalogServiceItem) => void;
  onSeeAll: () => void;
  onClose: () => void;
};

export function CategorySheet({
  category,
  serviceRows,
  totalServiceCount,
  searchQuery,
  onSearchChange,
  onSelectService,
  onSeeAll,
  onClose,
}: CategorySheetProps) {
  const serviceCountLabel =
    totalServiceCount === 0
      ? 'No services yet'
      : `${totalServiceCount} service${totalServiceCount !== 1 ? 's' : ''} available`;

  return (
    <Modal
      visible={category !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <View style={styles.flex}>
              <Text style={styles.categoryName}>{category?.name}</Text>
              <Text style={styles.serviceCount}>{serviceCountLabel}</Text>
            </View>
            <Pressable
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={8}
            >
              <X color={palette.muted} size={20} strokeWidth={2.2} />
            </Pressable>
          </View>

          <View style={styles.searchBar}>
            <Search color={palette.faint} size={16} strokeWidth={2.2} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder="Search services..."
              placeholderTextColor={palette.faint}
              returnKeyType="search"
              autoCapitalize="none"
            />
            {searchQuery.length > 0 ? (
              <Pressable
                onPress={() => onSearchChange('')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <Text style={styles.searchClear}>✕</Text>
              </Pressable>
            ) : null}
          </View>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {serviceRows.map((row) => (
              <Pressable
                key={row.id}
                style={styles.serviceCard}
                onPress={() => onSelectService(row.service)}
                accessibilityRole="button"
                accessibilityLabel={`Select ${row.name}`}
              >
                <View style={styles.serviceBody}>
                  <Text style={styles.serviceName} numberOfLines={1}>{row.name}</Text>
                  <Text style={styles.serviceDescription} numberOfLines={2}>
                    {row.description}
                  </Text>
                </View>
                <View style={styles.serviceRight}>
                  <Text style={styles.priceText}>{row.priceLabel}</Text>
                  <ChevronRight color={palette.faint} size={16} />
                </View>
              </Pressable>
            ))}

            {serviceRows.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>
                  {searchQuery ? 'No results found' : 'No services yet'}
                </Text>
                <Text style={styles.emptyBody}>
                  {searchQuery ? 'Try a different search term.' : 'Check back soon.'}
                </Text>
              </View>
            ) : null}
          </ScrollView>

          <Pressable
            style={styles.seeAllButton}
            onPress={onSeeAll}
            accessibilityRole="button"
          >
            <Text style={styles.seeAllText}>Browse all in {category?.name}</Text>
            <ChevronRight color={palette.white} size={16} strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: palette.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '72%',
    paddingBottom: spacing.xl,
  },
  dragHandle: {
    alignSelf: 'center',
    backgroundColor: palette.line,
    borderRadius: radius.pill,
    height: 4,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    width: 36,
  },

  // Header
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  flex: {
    flex: 1,
  },
  categoryName: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  serviceCount: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: palette.cream,
    borderRadius: radius.pill,
    height: 32,
    justifyContent: 'center',
    marginTop: 2,
    width: 32,
  },

  // Search bar
  searchBar: {
    alignItems: 'center',
    backgroundColor: palette.cream,
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.base,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
  },
  searchInput: {
    color: palette.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    minHeight: 44,
  },
  searchClear: {
    color: palette.faint,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 4,
  },

  // Service list
  list: {
    flexGrow: 0,
  },
  listContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
  },
  serviceCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
  },
  serviceBody: {
    flex: 1,
    gap: 3,
  },
  serviceName: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  serviceDescription: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 17,
  },
  serviceRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  priceText: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '800',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  emptyBody: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '400',
    marginTop: 4,
  },

  // Browse all button
  seeAllButton: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginHorizontal: spacing.base,
    marginTop: spacing.sm,
    minHeight: 48,
  },
  seeAllText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
