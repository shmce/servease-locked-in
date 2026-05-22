import { Inject, Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { UserNotFoundError } from './internal-user.errors';
import { presentInternalUser } from './user-presenter';
import {
  InternalUserResponse,
  StoredUserRecord,
  TwoFactorProvisioningResponse,
  TwoFactorStateRecord,
  TwoFactorStatusResponse,
  UpdateInternalUserInput,
  UserSessionRecord,
} from './user.types';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
authenticator.options = { window: 1 };

export interface UserRepository {
  findById(userId: string): Promise<StoredUserRecord | null>;
  update(input: UpdateInternalUserInput): Promise<StoredUserRecord | null>;
  anonymizeAccount?(userId: string): Promise<StoredUserRecord | null>;
  listSessions?(userId: string): Promise<UserSessionRecord[]>;
  beginTwoFactor?(userId: string, secret: string): Promise<TwoFactorStateRecord | null>;
  confirmTwoFactor?(userId: string): Promise<TwoFactorStateRecord | null>;
  disableTwoFactor?(userId: string): Promise<TwoFactorStateRecord | null>;
  getTwoFactor?(userId: string): Promise<TwoFactorStateRecord | null>;
}

@Injectable()
export class EmptyUserRepository implements UserRepository {
  async findById(): Promise<StoredUserRecord | null> {
    return null;
  }

  async update(): Promise<StoredUserRecord | null> {
    return null;
  }

  async listSessions(): Promise<UserSessionRecord[]> {
    return [];
  }

  async anonymizeAccount(): Promise<StoredUserRecord | null> {
    return null;
  }

  async beginTwoFactor(): Promise<TwoFactorStateRecord | null> {
    return null;
  }

  async confirmTwoFactor(): Promise<TwoFactorStateRecord | null> {
    return null;
  }

  async disableTwoFactor(): Promise<TwoFactorStateRecord | null> {
    return null;
  }

  async getTwoFactor(): Promise<TwoFactorStateRecord | null> {
    return null;
  }
}

@Injectable()
export class InternalUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async findById(userId: string): Promise<InternalUserResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    return presentInternalUser(user);
  }

  async update(input: UpdateInternalUserInput): Promise<InternalUserResponse> {
    const user = await this.userRepository.update(input);

    if (!user) {
      throw new UserNotFoundError();
    }

    return presentInternalUser(user);
  }

  async listSessions(userId: string): Promise<UserSessionRecord[]> {
    if (!this.userRepository.listSessions) {
      return [];
    }
    return this.userRepository.listSessions(userId);
  }

  async anonymizeAccount(userId: string): Promise<InternalUserResponse> {
    if (!this.userRepository.anonymizeAccount) {
      throw new UserNotFoundError();
    }

    const user = await this.userRepository.anonymizeAccount(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    return presentInternalUser(user);
  }

  async beginTwoFactor(
    userId: string,
    label?: string | null,
  ): Promise<TwoFactorProvisioningResponse> {
    if (!this.userRepository.beginTwoFactor) {
      throw new UserNotFoundError();
    }

    const user = await this.findById(userId);
    const secret = authenticator.generateSecret();
    const state = await this.userRepository.beginTwoFactor(userId, secret);

    if (!state?.secret) {
      throw new UserNotFoundError();
    }

    const accountLabel = label?.trim() || user.email;
    const otpauthUrl = authenticator.keyuri(accountLabel, 'ServEase', secret);
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 240,
    });

    return {
      enabled: false,
      secret,
      otpauthUrl,
      qrCodeDataUrl,
    };
  }

  async getTwoFactorStatus(userId: string): Promise<TwoFactorStatusResponse> {
    if (!this.userRepository.getTwoFactor) {
      throw new UserNotFoundError();
    }

    const state = await this.userRepository.getTwoFactor(userId);
    if (!state) {
      throw new UserNotFoundError();
    }

    return {
      enabled: state.enabled,
      verifiedAt: state.verifiedAt,
    };
  }

  async verifyTwoFactor(
    userId: string,
    code: string,
  ): Promise<TwoFactorStatusResponse> {
    if (!this.userRepository.getTwoFactor || !this.userRepository.confirmTwoFactor) {
      throw new UserNotFoundError();
    }

    const state = await this.userRepository.getTwoFactor(userId);
    if (!state?.secret || !(await this.isValidToken(code, state.secret))) {
      throw new UserNotFoundError();
    }

    const confirmed = await this.userRepository.confirmTwoFactor(userId);
    if (!confirmed) {
      throw new UserNotFoundError();
    }

    return {
      enabled: confirmed.enabled,
      verifiedAt: confirmed.verifiedAt,
    };
  }

  async disableTwoFactor(
    userId: string,
    code?: string | null,
  ): Promise<TwoFactorStatusResponse> {
    if (!this.userRepository.getTwoFactor || !this.userRepository.disableTwoFactor) {
      throw new UserNotFoundError();
    }

    const state = await this.userRepository.getTwoFactor(userId);
    if (!state) {
      throw new UserNotFoundError();
    }
    if (
      state.enabled &&
      (!state.secret || !(await this.isValidToken(code ?? '', state.secret)))
    ) {
      throw new UserNotFoundError();
    }

    const disabled = await this.userRepository.disableTwoFactor(userId);
    if (!disabled) {
      throw new UserNotFoundError();
    }

    return {
      enabled: disabled.enabled,
      verifiedAt: disabled.verifiedAt,
    };
  }

  private async isValidToken(code: string, secret: string): Promise<boolean> {
    const normalized = code.trim().replace(/\s/g, '');
    if (!/^\d{6}$/.test(normalized)) {
      return false;
    }

    return authenticator.verify({
      token: normalized,
      secret,
    });
  }
}
