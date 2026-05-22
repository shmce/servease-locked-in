import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
import type {
  BookingPricingMode,
  CatalogCategory,
  CatalogServiceItem,
  ProviderApplicationStatus,
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
  editServiceServiceId: string;
  newServiceTitle: string;
  newServicePrice: string;
  newServiceServiceId: string;
  newServicePricingMode: BookingPricingMode;
  categories: CatalogCategory[];
  services: CatalogServiceItem[];
  showAddServiceForm: boolean;
  busyAction: string | null;
  providerVerificationStatus: ProviderApplicationStatus['verificationStatus'] | null;
  onOpenApplicationDocuments: () => void;
  onBack: () => void;
  onEditServiceTitleChange: (value: string) => void;
  onEditServicePriceChange: (value: string) => void;
  onEditServiceServiceIdChange: (value: string) => void;
  onStartEditService: (service: ProviderOwnedServiceSummary) => void;
  onCancelEditService: () => void;
  onSaveOwnedServiceEdit: () => void;
  onToggleOwnedServiceActive: (serviceId: string) => void;
  onRemoveOwnedService: (serviceId: string) => void;
  onNewServiceTitleChange: (value: string) => void;
  onNewServicePriceChange: (value: string) => void;
  onNewServiceServiceIdChange: (value: string) => void;
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
  editServiceServiceId,
  newServiceTitle,
  newServicePrice,
  newServiceServiceId,
  newServicePricingMode,
  categories,
  services,
  showAddServiceForm,
  busyAction,
  providerVerificationStatus,
  onOpenApplicationDocuments,
  onBack,
  onEditServiceTitleChange,
  onEditServicePriceChange,
  onEditServiceServiceIdChange,
  onStartEditService,
  onCancelEditService,
  onSaveOwnedServiceEdit,
  onToggleOwnedServiceActive,
  onRemoveOwnedService,
  onNewServiceTitleChange,
  onNewServicePriceChange,
  onNewServiceServiceIdChange,
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
    providerVerificationStatus,
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
          {data.isServiceManagementLocked ? (
            <Card>
              <View style={styles.lockedHeader}>
                <View style={styles.flex}>
                  <Text style={styles.lockedTitle}>{data.lockedTitle}</Text>
                  <Text style={styles.lockedBody}>{data.lockedBody}</Text>
                </View>
                <Badge label="Locked" tone="warning" />
              </View>
            </Card>
          ) : null}

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
                      <CatalogServicePicker
                        categories={categories}
                        services={services}
                        selectedServiceId={editServiceServiceId}
                        onSelectService={onEditServiceServiceIdChange}
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
                      {data.canManageServices ? (
                        <View style={styles.actionRow}>
                          {row.canEdit ? (
                            <PrimaryButton
                              label="Edit"
                              variant="secondary"
                              onPress={() => onStartEditService(row.service)}
                            />
                          ) : null}
                          <PrimaryButton
                            label={row.toggleButtonLabel}
                            variant="secondary"
                            onPress={() => onToggleOwnedServiceActive(row.id)}
                            disabled={row.isToggleDisabled}
                          />
                        </View>
                      ) : null}
                      {data.canManageServices ? (
                        <PrimaryButton
                          label={row.removeButtonLabel}
                          variant="danger"
                          onPress={() => onRemoveOwnedService(row.id)}
                          disabled={row.isRemoveDisabled}
                        />
                      ) : null}
                    </>
                  )}
                </Card>
              ))
            ) : (
              <EmptyState
                title="No services yet"
                body={
                  data.isServiceManagementLocked
                    ? 'Services will appear here after your application is approved.'
                    : 'Add a service below to start appearing in marketplace listings.'
                }
              />
            )}
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Add a Service</Text>
            {data.isServiceManagementLocked ? (
              <Card>
                <Text style={styles.lockedTitle}>Services locked</Text>
                <Text style={styles.lockedBody}>
                  Your listings open after the admin team approves your provider
                  application.
                </Text>
                <PrimaryButton
                  label="Upload documents"
                  variant="secondary"
                  onPress={onOpenApplicationDocuments}
                />
              </Card>
            ) : showAddServiceForm ? (
              <Card>
                <CatalogServicePicker
                  categories={categories}
                  services={services}
                  selectedServiceId={newServiceServiceId}
                  onSelectService={onNewServiceServiceIdChange}
                />
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

function CatalogServicePicker({
  categories,
  services,
  selectedServiceId,
  onSelectService,
}: {
  categories: CatalogCategory[];
  services: CatalogServiceItem[];
  selectedServiceId: string;
  onSelectService: (value: string) => void;
}) {
  const selectedService = services.find((service) => service.id === selectedServiceId);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    selectedService?.categoryId ?? '',
  );
  const categoriesWithServices = categories.filter((category) =>
    services.some((service) => service.categoryId === category.id),
  );
  const categoryServices = services.filter(
    (service) => service.categoryId === selectedCategoryId,
  );

  useEffect(() => {
    if (selectedService?.categoryId && selectedService.categoryId !== selectedCategoryId) {
      setSelectedCategoryId(selectedService.categoryId);
    }
  }, [selectedCategoryId, selectedService?.categoryId]);

  return (
    <View style={styles.catalogPicker}>
      <Text style={styles.catalogPickerLabel}>Category</Text>
      <View style={styles.catalogChoiceGrid}>
        {categoriesWithServices.map((category) => (
          <Pressable
            key={category.id}
            style={[
              styles.catalogChoice,
              selectedCategoryId === category.id && styles.catalogChoiceSelected,
            ]}
            onPress={() => {
              setSelectedCategoryId(category.id);
              onSelectService('');
            }}
          >
            <Text
              style={[
                styles.catalogChoiceText,
                selectedCategoryId === category.id && styles.catalogChoiceTextSelected,
              ]}
            >
              {category.name}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.catalogPickerLabel}>Catalog service</Text>
      <View style={styles.catalogChoiceGrid}>
        {categoryServices.map((service) => (
          <Pressable
            key={service.id}
            style={[
              styles.catalogChoice,
              selectedServiceId === service.id && styles.catalogChoiceSelected,
            ]}
            onPress={() => onSelectService(service.id)}
          >
            <Text
              style={[
                styles.catalogChoiceText,
                selectedServiceId === service.id && styles.catalogChoiceTextSelected,
              ]}
            >
              {service.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
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
  lockedHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.base,
    justifyContent: 'space-between',
  },
  lockedTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  lockedBody: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  catalogPicker: {
    backgroundColor: palette.surface,
    borderColor: palette.lineSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  catalogPickerLabel: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  catalogChoiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  catalogChoice: {
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.pill,
    borderWidth: 1,
    maxWidth: '100%',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  catalogChoiceSelected: {
    backgroundColor: palette.mint,
    borderColor: palette.mint,
  },
  catalogChoiceText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
  catalogChoiceTextSelected: {
    color: palette.white,
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
