import assert from 'node:assert/strict';
import test from 'node:test';
import { buildProviderApplicationDocumentsViewModel } from './useProviderApplicationDocumentsViewModel';

test('provider application documents view model builds fixed checklist slots', () => {
  const viewModel = buildProviderApplicationDocumentsViewModel({
    documents: [
      {
        id: 'older-id',
        applicationId: 'provider-application-1',
        userId: 'user-1',
        documentType: 'government_id',
        fileUrl: null,
        storagePath: 'provider_document/user-1/older.jpg',
        status: 'rejected',
        createdAt: '2026-05-22T00:00:00.000Z',
        previewUrl: 'https://storage.test/older',
        downloadUrl: 'https://storage.test/older-download',
      },
      {
        id: 'newer-id',
        applicationId: 'provider-application-1',
        userId: 'user-1',
        documentType: 'government_id',
        fileUrl: null,
        storagePath: 'provider_document/user-1/newer.jpg',
        status: 'pending',
        createdAt: '2026-05-23T00:00:00.000Z',
        previewUrl: 'https://storage.test/newer',
        downloadUrl: 'https://storage.test/newer-download',
      },
    ],
    busyAction: null,
  });

  assert.equal(viewModel.data.requiredCount, 4);
  assert.equal(viewModel.data.uploadedRequiredCount, 1);
  assert.equal(viewModel.data.progressLabel, '1 of 4 required uploaded');
  assert.equal(viewModel.data.slots[0].id, 'government_id');
  assert.equal(viewModel.data.slots[0].document?.id, 'newer-id');
  assert.equal(viewModel.data.slots[0].statusLabel, 'Needs review');
  assert.equal(viewModel.data.slots[0].actionLabel, 'Replace');
  assert.equal(viewModel.data.slots[4].required, false);
});
