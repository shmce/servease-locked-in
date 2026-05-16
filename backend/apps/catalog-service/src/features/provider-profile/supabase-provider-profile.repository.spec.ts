import { SupabaseProviderProfileRepository } from './supabase-provider-profile.repository';

describe('SupabaseProviderProfileRepository provider application documents', () => {
  const applicationRow = {
    id: '11111111-1111-4111-8111-111111111111',
    application_reference: 'PA-1111111111',
    user_id: '22222222-2222-4222-8222-222222222222',
    business_name: 'GreenFix',
    service_area: 'Makati',
    service_description: 'Home repair',
    years_experience: 4,
    verification_status: 'pending' as const,
    is_active: true,
    average_rating: 0,
    review_count: 0,
    service_count: 1,
    document_count: 1,
    pending_document_count: 1,
    approved_document_count: 0,
    rejected_document_count: 0,
    latest_decision_reason: null,
    latest_decision_at: null,
    latest_decided_by: null,
    created_at: '2026-05-16T00:00:00.000Z',
    updated_at: '2026-05-16T00:00:00.000Z',
  };

  it('loads application documents through provider ownership and signs storage-only files', async () => {
    const documentRow = {
      id: '33333333-3333-4333-8333-333333333333',
      user_id: applicationRow.user_id,
      document_type: 'government_id',
      file_url: null,
      storage_path: 'provider-documents/user-1/government-id.jpg',
      status: 'pending' as const,
      created_at: '2026-05-16T01:00:00.000Z',
    };
    const applicationSingle = jest.fn().mockResolvedValue({
      data: applicationRow,
      error: null,
    });
    const documentSingle = jest.fn().mockResolvedValue({
      data: documentRow,
      error: null,
    });
    const documentFilter = {
      eq: jest.fn().mockReturnThis(),
      maybeSingle: documentSingle,
    };
    const documentTable = {
      select: jest.fn().mockReturnValue(documentFilter),
    };
    const storageObject = {
      createSignedUrl: jest
        .fn()
        .mockResolvedValueOnce({
          data: { signedUrl: 'https://storage.test/preview' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { signedUrl: 'https://storage.test/download' },
          error: null,
        }),
    };
    const client = {
      rpc: jest.fn().mockReturnValue({ maybeSingle: applicationSingle }),
      schema: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue(documentTable),
      }),
      storage: {
        from: jest.fn().mockReturnValue(storageObject),
      },
    };
    const repository = new SupabaseProviderProfileRepository(
      client as unknown as never,
    );

    const document = await repository.getProviderApplicationDocument(
      applicationRow.id,
      documentRow.id,
    );

    expect(client.rpc).toHaveBeenCalledWith(
      'servease_admin_get_provider_application',
      { p_provider_id: applicationRow.id },
    );
    expect(client.schema).toHaveBeenCalledWith('provider_catalog');
    expect(documentTable.select).toHaveBeenCalledWith(
      'id,user_id,document_type,file_url,storage_path,status,created_at',
    );
    expect(documentFilter.eq).toHaveBeenCalledWith('id', documentRow.id);
    expect(documentFilter.eq).toHaveBeenCalledWith(
      'user_id',
      applicationRow.user_id,
    );
    expect(storageObject.createSignedUrl).toHaveBeenNthCalledWith(
      1,
      documentRow.storage_path,
      600,
    );
    expect(storageObject.createSignedUrl).toHaveBeenNthCalledWith(
      2,
      documentRow.storage_path,
      600,
      { download: true },
    );
    expect(document).toEqual({
      id: documentRow.id,
      applicationId: applicationRow.id,
      userId: applicationRow.user_id,
      documentType: 'government_id',
      fileUrl: null,
      storagePath: documentRow.storage_path,
      status: 'pending',
      createdAt: documentRow.created_at,
      previewUrl: 'https://storage.test/preview',
      downloadUrl: 'https://storage.test/download',
    });
  });
});
