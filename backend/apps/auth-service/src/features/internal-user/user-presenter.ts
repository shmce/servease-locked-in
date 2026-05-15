import { InternalUserResponse, StoredUserRecord } from './user.types';

export function presentInternalUser(user: StoredUserRecord): InternalUserResponse {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    contactNumber: user.contactNumber,
    role: user.role,
    status: user.status,
  };
}
