import {
  ApiOptions,
  PushDevicePlatform,
  PushDeviceSummary,
  RegisterPushDeviceRequest,
  registerPushDevice,
  unregisterPushDevice,
} from './serveaseApi';

type PermissionStatus = 'denied' | 'granted' | 'undetermined' | string;

export interface PushNotificationsAdapter {
  getPermissionsAsync(): Promise<{ status: PermissionStatus }>;
  requestPermissionsAsync(): Promise<{ status: PermissionStatus }>;
  getExpoPushTokenAsync(): Promise<{ data: string }>;
}

export type PushRegistrationStatus =
  | 'disabled'
  | 'permission_denied'
  | 'registered'
  | 'unsupported';

export interface SyncPushRegistrationInput {
  enabled: boolean;
  apiOptions: ApiOptions;
  platform?: PushDevicePlatform;
  deviceId?: string | null;
  notifications: PushNotificationsAdapter;
  registerDevice?: (
    body: RegisterPushDeviceRequest,
    options: ApiOptions,
  ) => Promise<PushDeviceSummary>;
  unregisterDevice?: (
    token: string,
    options: ApiOptions,
  ) => Promise<{ ok: boolean }>;
}

export async function syncPushRegistration({
  enabled,
  apiOptions,
  platform = 'web',
  deviceId = null,
  notifications,
  registerDevice = registerPushDevice,
  unregisterDevice = unregisterPushDevice,
}: SyncPushRegistrationInput): Promise<{
  status: PushRegistrationStatus;
  device?: PushDeviceSummary;
}> {
  if (!enabled) {
    const existingPermission = await notifications.getPermissionsAsync();
    if (existingPermission.status === 'granted') {
      const expoToken = await notifications.getExpoPushTokenAsync();
      if (expoToken.data) {
        await unregisterDevice(expoToken.data, apiOptions);
      }
    }
    return { status: 'disabled' };
  }

  const existingPermission = await notifications.getPermissionsAsync();
  const finalPermission =
    existingPermission.status === 'granted'
      ? existingPermission
      : await notifications.requestPermissionsAsync();

  if (finalPermission.status !== 'granted') {
    return { status: 'permission_denied' };
  }

  const expoToken = await notifications.getExpoPushTokenAsync();
  if (!expoToken.data) {
    return { status: 'unsupported' };
  }

  return {
    status: 'registered',
    device: await registerDevice(
      {
        token: expoToken.data,
        platform,
        deviceId,
      },
      apiOptions,
    ),
  };
}

export async function syncExpoPushRegistration(
  enabled: boolean,
  apiOptions: ApiOptions,
  platform: string = 'web',
): Promise<PushRegistrationStatus> {
  const notifications = await import('expo-notifications');
  const result = await syncPushRegistration({
    enabled,
    apiOptions,
    platform: normalizePlatform(platform),
    notifications,
  });
  return result.status;
}

function normalizePlatform(platform: string): PushDevicePlatform {
  if (platform === 'android' || platform === 'ios') {
    return platform;
  }
  return 'web';
}
