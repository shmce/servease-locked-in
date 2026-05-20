import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AuthTokenService } from '../current-user/auth-token.service';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import {
  CatalogDependencyUnavailableError,
  InvalidCatalogFilterError,
} from './catalog.errors';
import { CatalogGatewayService } from './catalog.service';
import {
  CatalogCategory,
  CatalogServiceItem,
  ProviderPortfolioMediaInput,
  ProviderPortfolioMediaReplacementInput,
  ProviderPortfolioOrderItem,
  ProviderPortfolioMediaSummary,
  ProviderServiceListing,
} from './catalog.types';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Controller('v1/catalog')
export class CatalogController {
  constructor(
    private readonly catalogGatewayService: CatalogGatewayService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  @Get('categories')
  async categories(): Promise<{ data: CatalogCategory[] }> {
    try {
      return {
        data: await this.catalogGatewayService.listCategories(),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('services')
  async services(
    @Query('categoryId') categoryId?: string,
  ): Promise<{ data: CatalogServiceItem[] }> {
    try {
      this.validateOptionalUuid(categoryId);
      return {
        data: await this.catalogGatewayService.listServices(categoryId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('providers')
  async providers(
    @Query('serviceId') serviceId?: string,
    @Query('providerId') providerId?: string,
  ): Promise<{ data: ProviderServiceListing[] }> {
    try {
      this.validateOptionalUuid(serviceId);
      this.validateOptionalUuid(providerId);
      return {
        data: await this.catalogGatewayService.listProviderListings(
          serviceId,
          providerId,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('providers/:providerId/portfolio')
  async providerPortfolio(
    @Param('providerId') providerId: string,
  ): Promise<{ data: ProviderPortfolioMediaSummary[] }> {
    try {
      this.validateOptionalUuid(providerId);
      return {
        data: await this.catalogGatewayService.listProviderPortfolio(providerId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('provider/portfolio')
  async addProviderPortfolioMedia(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: ProviderPortfolioMediaInput,
  ): Promise<{ data: ProviderPortfolioMediaSummary }> {
    try {
      this.validatePortfolioMedia(body);
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.catalogGatewayService.addProviderPortfolioMedia(
          userId,
          body,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Put('provider/portfolio/order')
  async reorderProviderPortfolioMedia(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: { items?: ProviderPortfolioOrderItem[] },
  ): Promise<{ data: ProviderPortfolioMediaSummary[] }> {
    try {
      this.validatePortfolioOrder(body.items);
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.catalogGatewayService.reorderProviderPortfolioMedia(
          userId,
          body.items,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Delete('provider/portfolio/:mediaId')
  @HttpCode(204)
  async deleteProviderPortfolioMedia(
    @Headers('authorization') authorization: string | undefined,
    @Param('mediaId') mediaId: string,
  ): Promise<void> {
    try {
      this.validateOptionalUuid(mediaId);
      const userId = await this.authTokenService.authenticate(authorization);
      await this.catalogGatewayService.deleteProviderPortfolioMedia(userId, mediaId);
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Put('provider/portfolio/:mediaId')
  async replaceProviderPortfolioMedia(
    @Headers('authorization') authorization: string | undefined,
    @Param('mediaId') mediaId: string,
    @Body() body: ProviderPortfolioMediaReplacementInput,
  ): Promise<{ data: ProviderPortfolioMediaSummary }> {
    try {
      this.validateOptionalUuid(mediaId);
      this.validatePortfolioMedia(body);
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.catalogGatewayService.replaceProviderPortfolioMedia(
          userId,
          mediaId,
          body,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private validateOptionalUuid(value?: string): void {
    if (value && !UUID_PATTERN.test(value)) {
      throw new InvalidCatalogFilterError();
    }
  }

  private validatePortfolioMedia(body: ProviderPortfolioMediaInput): void {
    if (!body.fileUrl?.trim()) {
      throw new InvalidCatalogFilterError();
    }
  }

  private validatePortfolioOrder(
    items?: ProviderPortfolioOrderItem[],
  ): asserts items is ProviderPortfolioOrderItem[] {
    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      items.some(
        (item) =>
          !item.id ||
          !Number.isInteger(item.sortOrder) ||
          item.sortOrder < 0,
      )
    ) {
      throw new InvalidCatalogFilterError();
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof InvalidCatalogFilterError) {
      return new HttpException(
        {
          error: {
            code: 'invalid_catalog_filter',
            message: 'Catalog filter is invalid.',
            details: {},
          },
        },
        400,
      );
    }

    if (error instanceof AuthRequiredError) {
      return new HttpException(
        {
          error: {
            code: 'auth_required',
            message: 'Authentication is required.',
            details: {},
          },
        },
        401,
      );
    }

    if (error instanceof InvalidAuthTokenError) {
      return new HttpException(
        {
          error: {
            code: 'invalid_auth_token',
            message: 'Authentication token is invalid.',
            details: {},
          },
        },
        401,
      );
    }

    if (error instanceof CatalogDependencyUnavailableError) {
      return new HttpException(
        {
          error: {
            code: 'catalog_dependency_unavailable',
            message: 'Catalog service is unavailable.',
            details: {},
          },
        },
        503,
      );
    }

    return new HttpException(
      {
        error: {
          code: 'catalog_dependency_unavailable',
          message: 'Catalog lookup failed.',
          details: {},
        },
      },
      503,
    );
  }
}
