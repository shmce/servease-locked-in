import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LockKeyhole, Wrench } from 'lucide-react-native';
import {
  ProviderActionRow,
  ProviderBadge,
  ProviderButton,
  ProviderCard,
  ProviderContent,
  ProviderEmptyState,
  ProviderHeader,
  ProviderIconBlock,
  ProviderPill,
  ProviderScreen,
  ProviderSection,
  ProviderTextField,
  providerText,
} from '../../../shared/components/ProviderUI';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import type {
  BookingPricingMode,
  CatalogCategory,
  CatalogServiceItem,
  ProviderApplicationStatus,
  ProviderOwnedServiceSummary,
} from '../../../shared/models/types';
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
    <ProviderScreen>
      <ProviderContent>
        <ProviderHeader
          title="Services"
          subtitle="Manage your marketplace listings"
          onBack={onBack}
        />

        {data.isServiceManagementLocked ? (
          <ProviderCard>
            <View style={styles.lockedHeader}>
              <ProviderIconBlock>
                <LockKeyhole color={palette.mintDeep} size={24} strokeWidth={2.3} />
              </ProviderIconBlock>
              <View style={styles.flex}>
                <Text style={styles.lockedTitle}>{data.lockedTitle}</Text>
                <Text style={styles.lockedBody}>{data.lockedBody}</Text>
              </View>
              <ProviderBadge label="Locked" tone="warning" />
            </View>
          </ProviderCard>
        ) : null}

        <ProviderSection title="My Services">
          {data.hasServices ? (
            data.serviceRows.map((row) => (
              <ProviderCard key={row.id}>
                {row.isEditing ? (
                  <>
                    <ProviderTextField
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
                    <ProviderTextField
                      label="Price"
                      value={editServicePrice}
                      onChangeText={onEditServicePriceChange}
                      keyboardType="decimal-pad"
                    />
                    <ProviderActionRow>
                      <ProviderButton
                        label={data.saveEditButtonLabel}
                        onPress={onSaveOwnedServiceEdit}
                        disabled={data.isSaveEditDisabled}
                      />
                      <ProviderButton
                        label="Cancel"
                        variant="secondary"
                        onPress={onCancelEditService}
                      />
                    </ProviderActionRow>
                  </>
                ) : (
                  <>
                    <View style={styles.serviceHeader}>
                      <ProviderIconBlock>
                        <Wrench color={palette.mintDeep} size={25} strokeWidth={2.3} />
                      </ProviderIconBlock>
                      <View style={styles.flex}>
                        <Text style={styles.serviceTitle} numberOfLines={2}>
                          {row.title}
                        </Text>
                        <Text style={styles.serviceMeta}>{row.metaLabel}</Text>
                      </View>
                      <ProviderBadge label={row.statusLabel} tone={row.statusTone} />
                    </View>
                    {data.canManageServices ? (
                      <View style={styles.serviceActions}>
                        {row.canEdit ? (
                          <ProviderButton
                            label="Edit"
                            variant="secondary"
                            onPress={() => onStartEditService(row.service)}
                          />
                        ) : null}
                        <ProviderButton
                          label={row.toggleButtonLabel}
                          variant="secondary"
                          onPress={() => onToggleOwnedServiceActive(row.id)}
                          disabled={row.isToggleDisabled}
                        />
                        <ProviderButton
                          label={row.removeButtonLabel}
                          variant="danger"
                          onPress={() => onRemoveOwnedService(row.id)}
                          disabled={row.isRemoveDisabled}
                        />
                      </View>
                    ) : null}
                  </>
                )}
              </ProviderCard>
            ))
          ) : (
            <ProviderEmptyState
              title="No services yet"
              body={
                data.isServiceManagementLocked
                  ? 'Services will appear here after your application is approved.'
                  : 'Add a service below to start appearing in marketplace listings.'
              }
            />
          )}
        </ProviderSection>

        <ProviderSection title="Add a Service">
          {data.isServiceManagementLocked ? (
            <ProviderCard>
              <Text style={styles.lockedTitle}>Services locked</Text>
              <Text style={styles.lockedBody}>
                Your listings open after the admin team approves your provider
                application.
              </Text>
              <ProviderButton
                label="Upload documents"
                variant="secondary"
                onPress={onOpenApplicationDocuments}
              />
            </ProviderCard>
          ) : showAddServiceForm ? (
            <ProviderCard>
              <CatalogServicePicker
                categories={categories}
                services={services}
                selectedServiceId={newServiceServiceId}
                onSelectService={onNewServiceServiceIdChange}
              />
              <ProviderTextField
                label="Service title"
                value={newServiceTitle}
                onChangeText={onNewServiceTitleChange}
                placeholder="e.g. Deep house cleaning"
              />
              <ProviderTextField
                label="Price (PHP)"
                value={newServicePrice}
                onChangeText={onNewServicePriceChange}
                keyboardType="decimal-pad"
                placeholder="1500"
              />
              <View style={styles.pillRow}>
                {data.pricingModeOptions.map((option) => (
                  <ProviderPill
                    key={option.value}
                    label={option.label}
                    selected={option.selected}
                    onPress={() => onNewServicePricingModeChange(option.value)}
                  />
                ))}
              </View>
              <ProviderActionRow>
                <ProviderButton
                  label={data.saveNewServiceButtonLabel}
                  onPress={onSaveNewService}
                  disabled={data.isSaveNewServiceDisabled}
                />
                <ProviderButton
                  label="Cancel"
                  variant="secondary"
                  onPress={onCancelAddService}
                />
              </ProviderActionRow>
            </ProviderCard>
          ) : (
            <ProviderButton label="Add new service" onPress={onShowAddServiceForm} />
          )}
        </ProviderSection>
      </ProviderContent>
    </ProviderScreen>
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
              numberOfLines={1}
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
              numberOfLines={1}
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

  lockedHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.base,
  },
  lockedTitle: {
    ...providerText.title,
    fontSize: 16,
    lineHeight: 21,
  },
  lockedBody: {
    ...providerText.body,
    marginTop: spacing.xs,
  },

  serviceHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.base,
  },
  serviceTitle: {
    color: '#202733',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
  },
  serviceMeta: {
    ...providerText.meta,
    marginTop: 3,
  },
  serviceActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  catalogPicker: {
    backgroundColor: '#F8FAF9',
    borderColor: '#EEF0F2',
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  catalogPickerLabel: {
    color: '#202733',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  catalogChoiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  catalogChoice: {
    backgroundColor: palette.white,
    borderColor: '#E7EBEF',
    borderRadius: radius.pill,
    borderWidth: 1,
    maxWidth: '100%',
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
  },
  catalogChoiceSelected: {
    backgroundColor: palette.mintSoft,
    borderColor: '#A7E5C2',
  },
  catalogChoiceText: {
    color: '#5F6671',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  catalogChoiceTextSelected: {
    color: palette.mintDeep,
    fontWeight: '600',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
