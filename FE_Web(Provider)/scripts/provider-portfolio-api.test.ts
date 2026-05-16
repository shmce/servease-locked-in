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
    return {
      ok: true,
      status: 204,
      json: async () => {
        throw new Error('204 responses do not have JSON bodies')
      },
    } as unknown as Response
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

function jsonResponse(status: number, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response
}
