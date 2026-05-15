import { Controller, Get, HttpException, Param } from '@nestjs/common';
import { InternalUserService } from './internal-user.service';
import { InternalUserResponse } from './user.types';
import { UserNotFoundError } from './internal-user.errors';

@Controller('internal/users')
export class InternalUserController {
  constructor(private readonly internalUserService: InternalUserService) {}

  @Get(':userId')
  async show(@Param('userId') userId: string): Promise<{
    data: InternalUserResponse;
  }> {
    try {
      const data = await this.internalUserService.findById(userId);
      return { data };
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new HttpException(
          {
            error: {
              code: 'user_not_found',
              message: 'User was not found.',
              details: {},
            },
          },
          404,
        );
      }

      throw new HttpException(
        {
          error: {
            code: 'profile_dependency_unavailable',
            message: 'User lookup failed.',
            details: {},
          },
        },
        503,
      );
    }
  }
}
