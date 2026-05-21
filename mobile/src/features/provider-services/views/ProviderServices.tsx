import { StyleSheet, Text, View } from 'react-native';
import {
  Badge,
  Card,
  EmptyState,
  Field,
  Pill,
  PrimaryButton,
  TopBar,
} from '../../../components/DesignKit';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import {
  BookingPricingMode,
  ProviderOwnedServiceSummary,
} from '../../../shared/models/types';
import {
  ScreenContent,
  ScreenScroll,
} from '../../../shared/components/ScreenLayout';
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
        subtitle="Manage your marketplace listings"
        onBack={onBack}
      />
      <ScreenScroll>
        <ScreenContent>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>My Services</Text>
            {data.hasServices ? (
              data.serviceRows.map((row) => (
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
                      <View style={styles.actionRow}>
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
                      <View style={styles.serviceHeader}>
                        <View style={styles.flex}>
                          <Text style={styles.serviceTitle}>{row.title}</Text>
                          <Text style={styles.serviceMeta}>{row.metaLabel}</Text>
                        </View>
                        <Badge label={row.statusLabel} tone={row.statusTone} />
                      </View>
                      <View style={styles.actionRow}>
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
              ))
            ) : (
              <EmptyState
                title="No services yet"
                body="Add a service below to start appearing in marketplace listings."
              />
            )}
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Add a Service</Text>
            {showAddServiceForm ? (
              <Card>
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
                <View style={styles.pillRow}>
                  {data.pricingModeOptions.map((option) => (
                    <Pill
                      key={option.value}
                      label={option.label}
                      selected={option.selected}
                      onPress={() => onNewServicePricingModeChange(option.value)}
                    />
                  ))}
                </View>
                <View style={styles.actionRow}>
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
          </View>

        </ScreenContent>
      </ScreenScroll>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  sectionBlock: {
    gap: spacing.sm,
  },
  sectionLabel: {
    color: palette.faint,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    paddingHorizontal: spacing.xs,
    textTransform: 'uppercase',
  },

  serviceHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.base,
    justifyContent: 'space-between',
  },
  serviceTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  serviceMeta: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },

  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
