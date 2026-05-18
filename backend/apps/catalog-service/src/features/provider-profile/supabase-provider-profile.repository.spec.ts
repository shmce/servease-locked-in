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
      rpc: jest.fn((functionName: string) => {
        if (functionName === 'servease_admin_get_provider_application') {
          return { maybeSingle: applicationSingle };
        }
        return { maybeSingle: documentSingle };
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
    expect(client.rpc).toHaveBeenCalledWith(
      'servease_admin_get_provider_application_document',
      {
        p_provider_id: applicationRow.id,
        p_document_id: documentRow.id,
      },
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

  it('loads application details with an empty document list through RPC', async () => {
    const applicationSingle = jest.fn().mockResolvedValue({
      data: applicationRow,
      error: null,
    });
    const documentsList = jest.fn().mockResolvedValue({
      data: [],
      error: null,
    });
    const client = {
      rpc: jest.fn((functionName: string) => {
        if (functionName === 'servease_admin_get_provider_application') {
          return { maybeSingle: applicationSingle };
        }
        return documentsList();
      }),
      storage: {
        from: jest.fn(),
      },
    };
    const repository = new SupabaseProviderProfileRepository(
      client as unknown as never,
    );

    const application = await repository.getProviderApplication(
      applicationRow.id,
    );

    expect(client.rpc).toHaveBeenCalledWith(
      'servease_admin_list_provider_application_documents',
      { p_provider_id: applicationRow.id },
    );
    expect(application?.documents).toEqual([]);
  });

  it('submits provider application documents through RPC', async () => {
    const documentRow = {
      id: '33333333-3333-4333-8333-333333333333',
      user_id: applicationRow.user_id,
      document_type: 'government_id',
      file_url: 'https://storage.test/provider-document.pdf',
      storage_path: 'provider_document/user-1/provider-document.pdf',
      status: 'pending' as const,
      created_at: '2026-05-19T01:00:00.000Z',
    };
    const submitSingle = jest.fn().mockResolvedValue({
      data: documentRow,
      error: null,
    });
    const client = {
      rpc: jest.fn((functionName: string) => {
        if (functionName === 'servease_admin_list_provider_applications') {
          return Promise.resolve({
            data: [applicationRow],
            error: null,
          });
        }
        return { maybeSingle: submitSingle };
      }),
      storage: {
        from: jest.fn(),
      },
    };
    const repository = new SupabaseProviderProfileRepository(
      client as unknown as never,
    );

    const document = await repository.submitProviderApplicationDocument({
      userId: applicationRow.user_id,
      documentType: 'government_id',
      fileUrl: documentRow.file_url,
      storagePath: documentRow.storage_path,
    });

    expect(client.rpc).toHaveBeenCalledWith(
      'servease_submit_provider_application_document',
      {
        p_user_id: applicationRow.user_id,
        p_document_type: 'government_id',
        p_file_url: documentRow.file_url,
        p_storage_path: documentRow.storage_path,
      },
    );
    expect(document).toEqual(
      expect.objectContaining({
        id: documentRow.id,
        applicationId: applicationRow.id,
        documentType: 'government_id',
        status: 'pending',
      }),
    );
  });

  it('persists and maps provider application review state through RPC', async () => {
    const reviewRow = {
      application_id: applicationRow.id,
      kyc_checklist: [
        { id: 'identity', label: 'Identity matches documents', checked: true },
      ],
      business_checklist: [
        { id: 'permit', label: 'Business Permit', checked: true },
      ],
      verification_records: [
        {
          id: 'nbi',
          label: 'NBI Clearance',
          status: 'verified' as const,
          reference: 'NBI-123',
          checkedAt: '2026-05-19T00:00:00.000Z',
          details: null,
        },
      ],
      ocr_data: { governmentIdNumber: 'PSN-123' },
      notes: [
        {
          id: '44444444-4444-4444-8444-444444444444',
          adminUserId: '99999999-9999-4999-8999-999999999999',
          note: 'Documents reviewed.',
          createdAt: '2026-05-19T00:00:00.000Z',
        },
      ],
      is_complete: true,
      updated_by: '99999999-9999-4999-8999-999999999999',
      updated_at: '2026-05-19T00:00:00.000Z',
    };
    const maybeSingle = jest.fn().mockResolvedValue({
      data: reviewRow,
      error: null,
    });
    const client = {
      rpc: jest.fn().mockReturnValue({ maybeSingle }),
      storage: {
        from: jest.fn(),
      },
    };
    const repository = new SupabaseProviderProfileRepository(
      client as unknown as never,
    );

    const review = await repository.updateProviderApplicationReview({
      applicationId: applicationRow.id,
      adminUserId: '99999999-9999-4999-8999-999999999999',
      kycChecklist: reviewRow.kyc_checklist,
      businessChecklist: reviewRow.business_checklist,
      verificationRecords: reviewRow.verification_records,
      ocrData: reviewRow.ocr_data,
    });

    expect(client.rpc).toHaveBeenCalledWith(
      'servease_admin_update_provider_application_review',
      {
        p_provider_id: applicationRow.id,
        p_admin_user_id: '99999999-9999-4999-8999-999999999999',
        p_kyc_checklist: reviewRow.kyc_checklist,
        p_business_checklist: reviewRow.business_checklist,
        p_verification_records: reviewRow.verification_records,
        p_ocr_data: reviewRow.ocr_data,
      },
    );
    expect(review).toEqual({
      applicationId: applicationRow.id,
      kycChecklist: reviewRow.kyc_checklist,
      businessChecklist: reviewRow.business_checklist,
      verificationRecords: reviewRow.verification_records,
      ocrData: reviewRow.ocr_data,
      notes: reviewRow.notes,
      isComplete: true,
      updatedBy: '99999999-9999-4999-8999-999999999999',
      updatedAt: '2026-05-19T00:00:00.000Z',
    });
  });
});

describe('SupabaseProviderProfileRepository provider portfolio order', () => {
  it('replaces portfolio media through the ownership-safe RPC', async () => {
    const row = {
      id: '33333333-3333-4333-8333-333333333333',
      provider_id: '11111111-1111-4111-8111-111111111111',
      uploaded_by: '22222222-2222-4222-8222-222222222222',
      file_url: 'https://storage.test/replacement.jpg',
      file_name: 'replacement.jpg',
      mime_type: 'image/jpeg',
      storage_path: 'provider_portfolio/provider-user-1/replacement.jpg',
      file_size: 4096,
      caption: 'Replacement project',
      sort_order: 0,
      created_at: '2026-05-17T01:00:00.000Z',
    };
    const maybeSingle = jest.fn().mockResolvedValue({
      data: row,
      error: null,
    });
    const client = {
      rpc: jest.fn().mockReturnValue({ maybeSingle }),
    };
    const repository = new SupabaseProviderProfileRepository(
      client as unknown as never,
    );

    const result = await repository.replacePortfolioMedia({
      userId: row.uploaded_by,
      mediaId: row.id,
      fileUrl: row.file_url,
      fileName: row.file_name,
      mimeType: row.mime_type,
      storagePath: row.storage_path,
      fileSize: row.file_size,
      caption: row.caption,
    });

    expect(client.rpc).toHaveBeenCalledWith(
      'servease_replace_provider_portfolio_media',
      {
        p_user_id: row.uploaded_by,
        p_media_id: row.id,
        p_file_url: row.file_url,
        p_file_name: row.file_name,
        p_mime_type: row.mime_type,
        p_storage_path: row.storage_path,
        p_file_size: row.file_size,
        p_caption: row.caption,
      },
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: row.id,
        fileUrl: row.file_url,
        storagePath: row.storage_path,
      }),
    );
  });

  it('updates portfolio media order through the ownership-safe RPC', async () => {
    const rows = [
      {
        id: '33333333-3333-4333-8333-333333333333',
        provider_id: '11111111-1111-4111-8111-111111111111',
        uploaded_by: '22222222-2222-4222-8222-222222222222',
        file_url: 'https://cdn.servease.test/after.jpg',
        file_name: 'after.jpg',
        mime_type: 'image/jpeg',
        storage_path: null,
        file_size: 2048,
        caption: 'After cleaning',
        sort_order: 0,
        created_at: '2026-05-17T02:00:00.000Z',
      },
      {
        id: '44444444-4444-4444-8444-444444444444',
        provider_id: '11111111-1111-4111-8111-111111111111',
        uploaded_by: '22222222-2222-4222-8222-222222222222',
        file_url: 'https://cdn.servease.test/before.jpg',
        file_name: 'before.jpg',
        mime_type: 'image/jpeg',
        storage_path: null,
        file_size: 1024,
        caption: 'Before cleaning',
        sort_order: 1,
        created_at: '2026-05-17T01:00:00.000Z',
      },
    ];
    const client = {
      rpc: jest.fn().mockResolvedValue({
        data: rows,
        error: null,
      }),
    };
    const repository = new SupabaseProviderProfileRepository(
      client as unknown as never,
    );

    const result = await repository.reorderPortfolioMedia(
      '22222222-2222-4222-8222-222222222222',
      [
        { id: rows[0].id, sortOrder: 0 },
        { id: rows[1].id, sortOrder: 1 },
      ],
    );

    expect(client.rpc).toHaveBeenCalledWith(
      'servease_update_provider_portfolio_order',
      {
        p_user_id: '22222222-2222-4222-8222-222222222222',
        p_items: [
          { id: rows[0].id, sortOrder: 0 },
          { id: rows[1].id, sortOrder: 1 },
        ],
      },
    );
    expect(result).toEqual([
      expect.objectContaining({ id: rows[0].id, sortOrder: 0 }),
      expect.objectContaining({ id: rows[1].id, sortOrder: 1 }),
    ]);
  });
});
