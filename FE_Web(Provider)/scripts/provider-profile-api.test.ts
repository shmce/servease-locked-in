import assert from 'node:assert/strict'

process.env.NEXT_PUBLIC_API_BASE_URL = 'http://gateway.test'

const api = await import('../src/services/serveaseProviderApi')

let requestBody: unknown = null

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input)

  if (url !== 'http://gateway.test/v1/me' || init?.method !== 'PATCH') {
    return jsonResponse(404, {
      error: { code: 'not_found', message: `Unexpected request ${url}` },
    })
  }

  requestBody = JSON.parse(String(init.body))

  return jsonResponse(200, {
    data: {
      user: {
        id: 'provider-user-1',
        email: 'provider@servease.test',
        fullName: 'Provider User',
        contactNumber: null,
        role: 'provider',
        status: 'active',
      },
      customerProfile: null,
      providerProfile: {
        id: 'provider-1',
        businessName: 'GreenFix Home Services',
        bio: 'Licensed home repair provider.',
        serviceDescription: 'Electrical and plumbing support.',
        serviceArea: 'Metro Manila',
        yearsExperience: 9,
        verificationStatus: 'approved',
        averageRating: 4.8,
        reviewCount: 12,
      },
    },
  })
}

const profile = await api.updateCurrentUserProfile('provider-token', {
  fullName: 'Provider User',
  businessName: 'GreenFix Home Services',
  bio: 'Licensed home repair provider.',
  serviceDescription: 'Electrical and plumbing support.',
  serviceArea: 'Metro Manila',
  yearsExperience: 9,
})

assert.equal(profile.providerProfile?.yearsExperience, 9)
assert.deepEqual(requestBody, {
  fullName: 'Provider User',
  businessName: 'GreenFix Home Services',
  bio: 'Licensed home repair provider.',
  serviceDescription: 'Electrical and plumbing support.',
  serviceArea: 'Metro Manila',
  yearsExperience: 9,
})

function jsonResponse(status: number, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response
}
