import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Badge,
  Card,
  EmptyState,
  Field,
  Pill,
  PrimaryButton,
  Section,
  TopBar,
} from '../../../components/DesignKit';
import { palette, spacing, type } from '../../../theme/serveaseDesign';
import {
  BookingPricingMode,
  ProviderOwnedServiceSummary,
} from '../../../shared/models/types';
import { useProviderServicesViewModel } from '../viewModels/useProviderServicesViewModel';

type ProviderServicesScreenProps = {
  ownedServices: ProviderOwnedServiceSummary[];
  editingServiceId: string | null;
  editServiceTitle: string;
  editServicePrice: string;
  newServiceTitle: string;
  newServicePrice: string;
  newServicePricingMode: BookingPricingMode;
  showAddServiceForm: boolean;
  busyAction: string | null;
  onBack: () => void;
  onEditServiceTitleChange: (value: string) => void;
  onEditServicePriceChange: (value: string) => void;
  onStartEditService: (service: ProviderOwnedServiceSummary) => void;
  onCancelEditService: () => void;
  onSaveOwnedServiceEdit: () => void;
  onToggleOwnedServiceActive: (serviceId: string) => void;
  onRemoveOwnedService: (serviceId: string) => void;
  onNewServiceTitleChange: (value: string) => void;
  onNewServicePriceChange: (value: string) => void;
  onNewServicePricingModeChange: (value: BookingPricingMode) => void;
  onSaveNewService: () => void;
  onShowAddServiceForm: () => void;
  onCancelAddService: () => void;
};

export function ProviderServicesScreen({
  ownedServices,
  editingServiceId,
  editServiceTitle,
  editServicePrice,
  newServiceTitle,
  newServicePrice,
  newServicePricingMode,
  showAddServiceForm,
  busyAction,
  onBack,
  onEditServiceTitleChange,
  onEditServicePriceChange,
  onStartEditService,
  onCancelEditService,
  onSaveOwnedServiceEdit,
  onToggleOwnedServiceActive,
  onRemoveOwnedService,
  onNewServiceTitleChange,
  onNewServicePriceChange,
  onNewServicePricingModeChange,
  onSaveNewService,
  onShowAddServiceForm,
  onCancelAddService,
}: ProviderServicesScreenProps) {
  const providerServices = useProviderServicesViewModel({
    ownedServices,
    editingServiceId,
    newServicePricingMode,
    busyAction,
  });
  const { data } = providerServices;

  return (
    <>
      <TopBar
        title="Services"
        subtitle="Manage marketplace listings"
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <Section title="My Services">
            {data.serviceRows.map((row) => (
              <Card key={row.id}>
                {row.isEditing ? (
                  <>
                    <Field
                      label="Title"
                      value={editServiceTitle}
                      onChangeText={onEditServiceTitleChange}
                    />
                    <Field
                      label="Price"
                      value={editServicePrice}
                      onChangeText={onEditServicePriceChange}
                      keyboardType="decimal-pad"
                    />
                    <View style={styles.twoButtons}>
                      <PrimaryButton
                        label={data.saveEditButtonLabel}
                        onPress={onSaveOwnedServiceEdit}
                        disabled={data.isSaveEditDisabled}
                      />
                      <PrimaryButton
                        label="Cancel"
                        variant="secondary"
                        onPress={onCancelEditService}
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.rowBetween}>
                      <View style={styles.flex}>
                        <Text style={styles.cardTitle}>{row.title}</Text>
                        <Text style={styles.cardMeta}>{row.metaLabel}</Text>
                      </View>
                      <Badge label={row.statusLabel} tone={row.statusTone} />
                    </View>
                    <View style={styles.serviceActionRow}>
                      <PrimaryButton
                        label="Edit"
                        variant="secondary"
                        onPress={() => onStartEditService(row.service)}
                      />
                      <PrimaryButton
                        label={row.toggleButtonLabel}
                        variant="secondary"
                        onPress={() => onToggleOwnedServiceActive(row.id)}
                        disabled={row.isToggleDisabled}
                      />
                    </View>
                    <PrimaryButton
                      label={row.removeButtonLabel}
                      variant="danger"
                      onPress={() => onRemoveOwnedService(row.id)}
                      disabled={row.isRemoveDisabled}
                    />
                  </>
                )}
              </Card>
            ))}
            {!data.hasServices ? (
              <EmptyState
                title="No services yet"
                body="Add services to appear in marketplace listings."
              />
            ) : null}
            {showAddServiceForm ? (
              <Card>
                <Text style={styles.cardTitle}>Add new service</Text>
                <Field
                  label="Service title"
                  value={newServiceTitle}
                  onChangeText={onNewServiceTitleChange}
                  placeholder="e.g. Deep house cleaning"
                />
                <Field
                  label="Price (PHP)"
                  value={newServicePrice}
                  onChangeText={onNewServicePriceChange}
                  keyboardType="decimal-pad"
                  placeholder="1500"
                />
                <View style={styles.wrap}>
                  {data.pricingModeOptions.map((option) => (
                    <Pill
                      key={option.value}
                      label={option.label}
                      selected={option.selected}
                      onPress={() => onNewServicePricingModeChange(option.value)}
                    />
                  ))}
                </View>
                <View style={styles.twoButtons}>
                  <PrimaryButton
                    label={data.saveNewServiceButtonLabel}
                    onPress={onSaveNewService}
                    disabled={data.isSaveNewServiceDisabled}
                  />
                  <PrimaryButton
                    label="Cancel"
                    variant="secondary"
                    onPress={onCancelAddService}
                  />
                </View>
              </Card>
            ) : (
              <PrimaryButton
                label="Add new service"
                onPress={onShowAddServiceForm}
              />
            )}
          </Section>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  withBottomNav: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 108,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xl,
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
    ...type.section,
    color: palette.ink,
  },
  cardMeta: {
    ...type.caption,
    color: palette.muted,
  },
  twoButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  serviceActionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 12,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
