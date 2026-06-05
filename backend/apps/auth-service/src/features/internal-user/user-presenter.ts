import { InternalUserResponse, StoredUserRecord } from './user.types';

export function presentInternalUser(user: StoredUserRecord): InternalUserResponse {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    contactNumber: user.contactNumber,
    avatarUrl: user.avatarUrl ?? null,
    avatarStoragePath: user.avatarStoragePath ?? null,
    role: user.role,
    status: user.status,
  };
}
