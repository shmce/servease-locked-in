import assert from 'node:assert/strict'

process.env.NEXT_PUBLIC_API_BASE_URL = 'http://gateway.test'

const api = await import('../src/services/serveaseProviderApi')

interface FetchCall {
  url: string
  init: RequestInit | undefined
}

const calls: FetchCall[] = []

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input)
  calls.push({ url, init })

  if (url === 'http://gateway.test/v1/provider/profile') {
    return jsonResponse(200, {
      data: {
        account: {
          id: 'provider-user-1',
          email: 'provider@servease.test',
          fullName: 'Provider User',
          contactNumber: null,
          role: 'provider',
          status: 'active',
        },
        provider: {
          id: 'provider-1',
          businessName: 'Provider Studio',
          verificationStatus: 'approved',
          averageRating: 4.8,
          reviewCount: 12,
        },
        services: [],
        portfolio: [
          {
            id: 'media-2',
            providerId: 'provider-1',
            uploadedBy: 'provider-user-1',
            fileUrl: 'https://cdn.servease.test/after.jpg',
            fileName: 'after.jpg',
            mimeType: 'image/jpeg',
            storagePath: null,
            fileSize: 2048,
            caption: 'After cleaning',
            sortOrder: 2,
            createdAt: '2026-05-17T02:00:00.000Z',
          },
          {
            id: 'media-1',
            providerId: 'provider-1',
            uploadedBy: 'provider-user-1',
            fileUrl: 'https://cdn.servease.test/before.jpg',
            fileName: 'before.jpg',
            mimeType: 'image/jpeg',
            storagePath: null,
            fileSize: 1024,
            caption: 'Before cleaning',
            sortOrder: 0,
            createdAt: '2026-05-17T01:00:00.000Z',
          },
        ],
      },
    })
  }

  if (url === 'http://gateway.test/v1/catalog/provider/portfolio') {
    return jsonResponse(201, {
      data: {
        id: 'media-3',
        providerId: 'provider-1',
        uploadedBy: 'provider-user-1',
        fileUrl: 'https://cdn.servease.test/new.jpg',
        fileName: 'new.jpg',
        mimeType: 'image/jpeg',
        storagePath: null,
        fileSize: null,
        caption: 'New project',
        sortOrder: 3,
        createdAt: '2026-05-17T03:00:00.000Z',
      },
    })
  }

  if (url === 'http://gateway.test/v1/catalog/provider/portfolio/media-1') {
    if (init?.method === 'PUT') {
      return jsonResponse(200, {
        data: {
          id: 'media-1',
          providerId: 'provider-1',
          uploadedBy: 'provider-user-1',
          fileUrl: 'https://storage.test/replacement.jpg',
          fileName: 'replacement.jpg',
          mimeType: 'image/jpeg',
          storagePath: 'provider_portfolio/provider-user-1/replacement.jpg',
          fileSize: 4096,
          caption: 'Replacement project',
          sortOrder: 0,
          createdAt: '2026-05-17T01:00:00.000Z',
        },
      })
    }

    return noContentResponse()
  }

  if (url === 'http://gateway.test/v1/catalog/provider/portfolio/order') {
    return jsonResponse(200, {
      data: [
        {
          id: 'media-2',
          providerId: 'provider-1',
          uploadedBy: 'provider-user-1',
          fileUrl: 'https://cdn.servease.test/after.jpg',
          fileName: 'after.jpg',
          mimeType: 'image/jpeg',
          storagePath: null,
          fileSize: 2048,
          caption: 'After cleaning',
          sortOrder: 0,
          createdAt: '2026-05-17T02:00:00.000Z',
        },
        {
          id: 'media-1',
          providerId: 'provider-1',
          uploadedBy: 'provider-user-1',
          fileUrl: 'https://cdn.servease.test/before.jpg',
          fileName: 'before.jpg',
          mimeType: 'image/jpeg',
          storagePath: null,
          fileSize: 1024,
          caption: 'Before cleaning',
          sortOrder: 1,
          createdAt: '2026-05-17T01:00:00.000Z',
        },
      ],
    })
  }

  if (url === 'http://gateway.test/v1/uploads') {
    return jsonResponse(201, {
      data: {
        bucket: 'servease-uploads',
        path: 'provider_portfolio/provider-user-1/replacement.jpg',
        publicUrl: 'https://storage.test/replacement.jpg',
        kind: 'provider_portfolio',
        contentType: 'image/jpeg',
        size: 4096,
      },
    })
  }

  return jsonResponse(404, {
    error: { code: 'not_found', message: `Unexpected request ${url}` },
  })
}

const portfolio = await api.listCurrentProviderPortfolioMedia('provider-token')
assert.deepEqual(
  portfolio.map((item) => item.id),
  ['media-1', 'media-2'],
  'current provider portfolio should be sorted by sortOrder',
)

const created = await api.addProviderPortfolioMedia('provider-token', {
  fileUrl: 'https://cdn.servease.test/new.jpg',
  fileName: 'new.jpg',
  mimeType: 'image/jpeg',
  caption: 'New project',
})
assert.equal(created.id, 'media-3')

await api.deleteProviderPortfolioMedia('provider-token', 'media-1')
const reordered = await api.reorderProviderPortfolioMedia('provider-token', [
  { id: 'media-2', sortOrder: 0 },
  { id: 'media-1', sortOrder: 1 },
])
const replacementFile = new File(['replacement-bytes'], 'replacement.jpg', {
  type: 'image/jpeg',
})
const upload = await api.uploadProviderPortfolioMedia(
  'provider-token',
  replacementFile,
)
const replaced = await api.replaceProviderPortfolioMedia(
  'provider-token',
  'media-1',
  {
    fileUrl: upload.publicUrl,
    fileName: replacementFile.name,
    mimeType: replacementFile.type,
    storagePath: upload.path,
    fileSize: upload.size,
    caption: 'Replacement project',
  },
)

assert.equal(calls[0]?.init?.method, 'GET')
assert.equal(
  calls[0]?.init?.headers &&
    (calls[0].init.headers as Record<string, string>).authorization,
  'Bearer provider-token',
)
assert.equal(calls[1]?.init?.method, 'POST')
assert.deepEqual(JSON.parse(String(calls[1]?.init?.body)), {
  fileUrl: 'https://cdn.servease.test/new.jpg',
  fileName: 'new.jpg',
  mimeType: 'image/jpeg',
  caption: 'New project',
})
assert.equal(calls[2]?.init?.method, 'DELETE')
assert.deepEqual(
  reordered.map((item) => `${item.id}:${item.sortOrder}`),
  ['media-2:0', 'media-1:1'],
)
assert.equal(calls[3]?.url, 'http://gateway.test/v1/catalog/provider/portfolio/order')
assert.equal(calls[3]?.init?.method, 'PUT')
assert.deepEqual(JSON.parse(String(calls[3]?.init?.body)), {
  items: [
    { id: 'media-2', sortOrder: 0 },
    { id: 'media-1', sortOrder: 1 },
  ],
})
assert.equal(upload.kind, 'provider_portfolio')
assert.equal(calls[4]?.url, 'http://gateway.test/v1/uploads')
assert.equal(calls[4]?.init?.method, 'POST')
assert.equal(
  calls[4]?.init?.headers &&
    (calls[4].init.headers as Record<string, string>).authorization,
  'Bearer provider-token',
)
assert.ok(calls[4]?.init?.body instanceof FormData)
assert.equal(replaced.fileUrl, 'https://storage.test/replacement.jpg')
assert.equal(calls[5]?.url, 'http://gateway.test/v1/catalog/provider/portfolio/media-1')
assert.equal(calls[5]?.init?.method, 'PUT')
assert.deepEqual(JSON.parse(String(calls[5]?.init?.body)), {
  fileUrl: 'https://storage.test/replacement.jpg',
  fileName: 'replacement.jpg',
  mimeType: 'image/jpeg',
  storagePath: 'provider_portfolio/provider-user-1/replacement.jpg',
  fileSize: 4096,
  caption: 'Replacement project',
})

function jsonResponse(status: number, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response
}

function noContentResponse(): Response {
  return {
    ok: true,
    status: 204,
    json: async () => {
      throw new Error('204 responses do not have JSON bodies')
    },
  } as unknown as Response
}
