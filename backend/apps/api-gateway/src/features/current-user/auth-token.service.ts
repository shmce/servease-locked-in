import { Injectable } from '@nestjs/common';
import { createSupabaseAuthClient } from '../../../../../libs/common/src';
import { AuthRequiredError, InvalidAuthTokenError } from './current-user.errors';

interface SupabaseAuthClient {
  auth: {
    getUser(token: string): PromiseLike<{
      data: {
        user: {
          id: string;
        } | null;
      };
      error: { message: string } | null;
    }>;
  };
}

@Injectable()
export class AuthTokenService {
  readonly authClient: SupabaseAuthClient;

  constructor(authClient?: SupabaseAuthClient) {
    this.authClient =
      authClient ?? (createSupabaseAuthClient() as unknown as SupabaseAuthClient);
  }

  async authenticate(authorization?: string): Promise<string> {
    const token = this.extractBearerToken(authorization);
    const { data, error } = await this.authClient.auth.getUser(token);

    if (error || !data.user) {
      throw new InvalidAuthTokenError();
    }

    return data.user.id;
  }

  private extractBearerToken(authorization?: string): string {
    if (!authorization) {
      throw new AuthRequiredError();
    }

    const match = authorization.trim().match(/^Bearer\s+(.+)$/i);
    const token = match?.[1]?.trim();

    if (!token) {
      throw new AuthRequiredError();
    }

    return token;
  }
}
