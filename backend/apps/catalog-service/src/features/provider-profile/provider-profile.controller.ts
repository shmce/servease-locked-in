import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ProviderProfileService } from './provider-profile.service';
import {
  CreateProviderProfileInput,
  ProviderPortfolioMediaInput,
  ProviderPortfolioOrderItem,
  ProviderPortfolioMediaSummary,
  ProviderOwnedServiceInput,
  ProviderOwnedServiceSummary,
  AdminProviderApplicationReview,
  AdminProviderApplicationSummary,
  ProviderProfileSummary,
  SubmitProviderApplicationDocumentInput,
  UpdateProviderProfileInput,
  UpdateProviderApplicationReviewInput,
} from './provider-profile.types';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Controller('internal/providers')
export class ProviderProfileController {
  constructor(private readonly providerProfileService: ProviderProfileService) {}

  @Post()
  async create(
    @Body() body: CreateProviderProfileInput,
  ): Promise<{ data: ProviderProfileSummary }> {
    if (!UUID_PATTERN.test(body.userId) || !body.businessName?.trim()) {
      throw new HttpException(
        {
          error: {
            code: 'invalid_provider_profile_request',
            message: 'Provider profile request is invalid.',
            details: {},
          },
        },
        400,
      );
    }

    try {
      return {
        data: await this.providerProfileService.create({
          userId: body.userId,
          businessName: body.businessName.trim(),
          serviceDescription: body.serviceDescription ?? null,
          serviceArea: body.serviceArea ?? null,
        }),
      };
    } catch {
      throw new HttpException(
        {
          error: {
            code: 'provider_profile_dependency_unavailable',
            message: 'Provider profile creation failed.',
            details: {},
          },
        },
        503,
      );
    }
  }

  @Get('by-user/:userId')
  async show(@Param('userId') userId: string): Promise<{
    data: ProviderProfileSummary;
  }> {
    const data = await this.providerProfileService.findByUserId(userId);

    if (!data) {
      throw new HttpException(
        {
          error: {
            code: 'provider_profile_not_found',
            message: 'Provider profile was not found.',
            details: {},
          },
        },
        404,
      );
    }

    return { data };
  }

  @Patch('by-user/:userId')
  async update(
    @Param('userId') userId: string,
    @Body() body: UpdateProviderProfileInput,
  ): Promise<{ data: ProviderProfileSummary }> {
    if (!UUID_PATTERN.test(userId) || !body.businessName?.trim()) {
      throw new HttpException(
        {
          error: {
            code: 'invalid_provider_profile_request',
            message: 'Provider profile request is invalid.',
            details: {},
          },
        },
        400,
      );
    }

    try {
      return {
        data: await this.providerProfileService.update({
          userId,
          businessName: body.businessName.trim(),
          bio: body.bio?.trim() || null,
          serviceDescription: body.serviceDescription?.trim() || null,
          serviceArea: body.serviceArea?.trim() || null,
          yearsExperience:
            body.yearsExperience === undefined || body.yearsExperience === null
              ? null
              : Number(body.yearsExperience),
        }),
      };
    } catch {
      throw new HttpException(
        {
          error: {
            code: 'provider_profile_dependency_unavailable',
            message: 'Provider profile update failed.',
            details: {},
          },
        },
        503,
      );
    }
  }

  @Get('applications')
  async listApplications(
    @Query('status') status?: 'pending' | 'approved' | 'rejected',
    @Query('query') query?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: AdminProviderApplicationSummary[] }> {
    try {
      return {
        data: await this.providerProfileService.listProviderApplications({
          status: status ?? null,
          query: query ?? null,
          limit: limit ? Number(limit) : 100,
        }),
      };
    } catch {
      throw this.dependencyError('Provider application lookup failed.');
    }
  }

  @Get('applications/by-user/:userId')
  async getApplicationByUser(
    @Param('userId') userId: string,
  ): Promise<{ data: AdminProviderApplicationSummary }> {
    if (!UUID_PATTERN.test(userId)) {
      throw this.invalidRequest();
    }

    try {
      const data =
        await this.providerProfileService.getProviderApplicationByUserId(userId);
      if (!data) {
        throw new Error('provider_application_not_found');
      }
      return { data };
    } catch {
      throw this.dependencyError('Provider application lookup failed.');
    }
  }

  @Post('applications/documents')
  async submitApplicationDocument(
    @Body() body: SubmitProviderApplicationDocumentInput,
  ) {
    if (
      !UUID_PATTERN.test(body.userId) ||
      !body.documentType?.trim() ||
      (!body.fileUrl?.trim() && !body.storagePath?.trim())
    ) {
      throw this.invalidRequest();
    }

    try {
      return {
        data: await this.providerProfileService.submitProviderApplicationDocument({
          userId: body.userId,
          documentType: body.documentType,
          fileUrl: body.fileUrl ?? null,
          storagePath: body.storagePath ?? null,
        }),
      };
    } catch {
      throw this.dependencyError('Provider application document submission failed.');
    }
  }

  @Get('applications/:applicationId')
  async getApplication(
    @Param('applicationId') applicationId: string,
  ): Promise<{ data: AdminProviderApplicationSummary }> {
    if (!UUID_PATTERN.test(applicationId)) {
      throw this.invalidRequest();
    }

    try {
      const data =
        await this.providerProfileService.getProviderApplication(applicationId);
      if (!data) {
        throw new Error('provider_application_not_found');
      }
      return { data };
    } catch {
      throw this.dependencyError('Provider application lookup failed.');
    }
  }

  @Get('applications/:applicationId/documents/:documentId')
  async getApplicationDocument(
    @Param('applicationId') applicationId: string,
    @Param('documentId') documentId: string,
  ) {
    if (!UUID_PATTERN.test(applicationId) || !UUID_PATTERN.test(documentId)) {
      throw this.invalidRequest();
    }

    try {
      const data =
        await this.providerProfileService.getProviderApplicationDocument(
          applicationId,
          documentId,
        );
      if (!data) {
        throw this.notFound('Provider application document was not found.');
      }
      return { data };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw this.dependencyError('Provider application document lookup failed.');
    }
  }

  @Get('applications/:applicationId/review')
  async getApplicationReview(
    @Param('applicationId') applicationId: string,
  ): Promise<{ data: AdminProviderApplicationReview }> {
    if (!UUID_PATTERN.test(applicationId)) {
      throw this.invalidRequest();
    }

    try {
      const data =
        await this.providerProfileService.getProviderApplicationReview(
          applicationId,
        );
      if (!data) {
        throw this.notFound('Provider application review was not found.');
      }
      return { data };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw this.dependencyError('Provider application review lookup failed.');
    }
  }

  @Put('applications/:applicationId/review')
  async updateApplicationReview(
    @Param('applicationId') applicationId: string,
    @Body()
    body: Omit<UpdateProviderApplicationReviewInput, 'applicationId'>,
  ): Promise<{ data: AdminProviderApplicationReview }> {
    if (
      !UUID_PATTERN.test(applicationId) ||
      !body.adminUserId ||
      !UUID_PATTERN.test(body.adminUserId)
    ) {
      throw this.invalidRequest();
    }

    try {
      return {
        data: await this.providerProfileService.updateProviderApplicationReview({
          ...body,
          applicationId,
        }),
      };
    } catch {
      throw this.dependencyError('Provider application review update failed.');
    }
  }

  @Post('applications/:applicationId/review/notes')
  async addApplicationReviewNote(
    @Param('applicationId') applicationId: string,
    @Body() body: { adminUserId?: string; note?: string },
  ): Promise<{ data: AdminProviderApplicationReview }> {
    if (
      !UUID_PATTERN.test(applicationId) ||
      !body.adminUserId ||
      !UUID_PATTERN.test(body.adminUserId) ||
      !body.note?.trim()
    ) {
      throw this.invalidRequest();
    }

    try {
      return {
        data: await this.providerProfileService.addProviderApplicationReviewNote({
          applicationId,
          adminUserId: body.adminUserId,
          note: body.note,
        }),
      };
    } catch {
      throw this.dependencyError('Provider application review note failed.');
    }
  }

  @Post('applications/:applicationId/decision')
  async decideApplication(
    @Param('applicationId') applicationId: string,
    @Body()
    body: {
      adminUserId?: string;
      decision?: 'approved' | 'rejected';
      reason?: string;
    },
  ): Promise<{ data: AdminProviderApplicationSummary }> {
    if (
      !UUID_PATTERN.test(applicationId) ||
      !body.adminUserId ||
      !UUID_PATTERN.test(body.adminUserId) ||
      !body.decision ||
      !body.reason?.trim()
    ) {
      throw this.invalidRequest();
    }

    try {
      return {
        data: await this.providerProfileService.decideProviderApplication({
          applicationId,
          adminUserId: body.adminUserId,
          decision: body.decision,
          reason: body.reason,
        }),
      };
    } catch {
      throw this.dependencyError('Provider application decision failed.');
    }
  }

  @Post('portfolio')
  async addPortfolio(
    @Body() body: ProviderPortfolioMediaInput,
  ): Promise<{ data: ProviderPortfolioMediaSummary }> {
    if (!UUID_PATTERN.test(body.userId) || !body.fileUrl?.trim()) {
      throw this.invalidRequest();
    }

    try {
      return {
        data: await this.providerProfileService.addPortfolioMedia(body),
      };
    } catch {
      throw this.dependencyError('Provider portfolio upload failed.');
    }
  }

  @Put('portfolio/order')
  async reorderPortfolio(
    @Body() body: { userId: string; items?: ProviderPortfolioOrderItem[] },
  ): Promise<{ data: ProviderPortfolioMediaSummary[] }> {
    if (
      !UUID_PATTERN.test(body.userId) ||
      !Array.isArray(body.items) ||
      body.items.length === 0 ||
      body.items.some(
        (item) =>
          !UUID_PATTERN.test(item.id) ||
          !Number.isInteger(item.sortOrder) ||
          item.sortOrder < 0,
      )
    ) {
      throw this.invalidRequest();
    }

    try {
      return {
        data: await this.providerProfileService.reorderPortfolioMedia(
          body.userId,
          body.items,
        ),
      };
    } catch {
      throw this.dependencyError('Provider portfolio reorder failed.');
    }
  }

  @Get(':providerId/portfolio')
  async listPortfolio(
    @Param('providerId') providerId: string,
  ): Promise<{ data: ProviderPortfolioMediaSummary[] }> {
    if (!UUID_PATTERN.test(providerId)) {
      throw this.invalidRequest();
    }

    try {
      return {
        data: await this.providerProfileService.listPortfolioMedia(providerId),
      };
    } catch {
      throw this.dependencyError('Provider portfolio lookup failed.');
    }
  }

  @Delete('portfolio/:mediaId')
  @HttpCode(204)
  async deletePortfolio(
    @Param('mediaId') mediaId: string,
    @Body() body: { userId: string },
  ): Promise<void> {
    if (!UUID_PATTERN.test(body.userId) || !UUID_PATTERN.test(mediaId)) {
      throw this.invalidRequest();
    }

    try {
      await this.providerProfileService.deletePortfolioMedia(body.userId, mediaId);
    } catch {
      throw this.dependencyError('Provider portfolio delete failed.');
    }
  }

  @Put('portfolio/:mediaId')
  async replacePortfolio(
    @Param('mediaId') mediaId: string,
    @Body() body: ProviderPortfolioMediaInput,
  ): Promise<{ data: ProviderPortfolioMediaSummary }> {
    if (
      !UUID_PATTERN.test(body.userId) ||
      !UUID_PATTERN.test(mediaId) ||
      !body.fileUrl?.trim()
    ) {
      throw this.invalidRequest();
    }

    try {
      return {
        data: await this.providerProfileService.replacePortfolioMedia({
          ...body,
          mediaId,
        }),
      };
    } catch {
      throw this.dependencyError('Provider portfolio replacement failed.');
    }
  }

  @Get('by-user/:userId/services')
  async listOwnedServices(
    @Param('userId') userId: string,
  ): Promise<{ data: ProviderOwnedServiceSummary[] }> {
    if (!UUID_PATTERN.test(userId)) {
      throw this.invalidRequest();
    }

    try {
      return {
        data: await this.providerProfileService.listOwnedServices(userId),
      };
    } catch {
      throw this.dependencyError('Provider services lookup failed.');
    }
  }

  @Put('by-user/:userId/services')
  async replaceOwnedServices(
    @Param('userId') userId: string,
    @Body() body: { services?: ProviderOwnedServiceInput[] },
  ): Promise<{ data: ProviderOwnedServiceSummary[] }> {
    if (
      !UUID_PATTERN.test(userId) ||
      !Array.isArray(body.services) ||
      body.services.some((service) => !service.title?.trim())
    ) {
      throw this.invalidRequest();
    }

    try {
      return {
        data: await this.providerProfileService.replaceOwnedServices(
          userId,
          body.services,
        ),
      };
    } catch {
      throw this.dependencyError('Provider services update failed.');
    }
  }

  private invalidRequest(): HttpException {
    return new HttpException(
      {
        error: {
          code: 'invalid_provider_profile_request',
          message: 'Provider profile request is invalid.',
          details: {},
        },
      },
      400,
    );
  }

  private dependencyError(message: string): HttpException {
    return new HttpException(
      {
        error: {
          code: 'provider_profile_dependency_unavailable',
          message,
          details: {},
        },
      },
      503,
    );
  }

  private notFound(message: string): HttpException {
    return new HttpException(
      {
        error: {
          code: 'provider_profile_not_found',
          message,
          details: {},
        },
      },
      404,
    );
  }
}
