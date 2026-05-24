import { InternalUserResponse, UserRole } from '../internal-user/user.types';

export interface RegisterUserInput {
  email: string;
  password: string;
  fullName: string;
  contactNumber?: string | null;
  birthdate?: string | null;
  role: UserRole;
}

export type RegisteredUserResponse = InternalUserResponse;
