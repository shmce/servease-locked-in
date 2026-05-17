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

  if (url === 'http://gateway.test/v1/uploads') {
    return jsonResponse(201, {
      data: {
        bucket: 'servease-uploads',
        path: 'provider_progress/provider-user-1/progress.jpg',
        publicUrl: 'https://storage.test/progress.jpg',
        kind: 'provider_progress',
        contentType: 'image/jpeg',
        size: 2048,
      },
    })
  }

  if (url === 'http://gateway.test/v1/bookings/booking-1/attachments') {
    return jsonResponse(201, {
      data: {
        id: 'attachment-1',
        bookingId: 'booking-1',
        uploadedBy: 'provider-user-1',
        mediaKind: 'provider_progress',
        fileUrl: 'https://storage.test/progress.jpg',
        fileName: 'progress.jpg',
        mimeType: 'image/jpeg',
        storagePath: 'provider_progress/provider-user-1/progress.jpg',
        fileSize: 2048,
        caption: 'Progress photo',
        createdAt: '2026-05-17T08:00:00.000Z',
      },
    })
  }

  if (url === 'http://gateway.test/v1/bookings/booking-1/service-updates') {
    if (init?.method === 'POST') {
      return jsonResponse(201, {
        data: {
          id: 'update-1',
          bookingId: 'booking-1',
          actorId: 'provider-user-1',
          updateType: 'progress',
          message: 'Work is halfway done.',
          checklist: null,
          attachmentId: 'attachment-1',
          createdAt: '2026-05-17T08:01:00.000Z',
        },
      })
    }

    return jsonResponse(200, {
      data: [
        {
          id: 'update-1',
          bookingId: 'booking-1',
          actorId: 'provider-user-1',
          updateType: 'progress',
          message: 'Work is halfway done.',
          checklist: null,
          attachmentId: 'attachment-1',
          createdAt: '2026-05-17T08:01:00.000Z',
        },
      ],
    })
  }

  return jsonResponse(404, {
    error: { code: 'not_found', message: `Unexpected request ${url}` },
  })
}

const file = new File(['progress-image'], 'progress.jpg', { type: 'image/jpeg' })
const upload = await api.uploadProviderProgressPhoto('provider-token', file)
const attachment = await api.createProviderBookingAttachment(
  'provider-token',
  'booking-1',
  {
    mediaKind: 'provider_progress',
    fileUrl: upload.publicUrl,
    fileName: file.name,
    mimeType: file.type,
    storagePath: upload.path,
    fileSize: upload.size,
    caption: 'Progress photo',
  },
)
const created = await api.createProviderBookingServiceUpdate(
  'provider-token',
  'booking-1',
  {
    updateType: 'progress',
    message: 'Work is halfway done.',
    attachmentId: attachment.id,
  },
)
const updates = await api.listProviderBookingServiceUpdates(
  'provider-token',
  'booking-1',
)

assert.equal(upload.kind, 'provider_progress')
assert.equal(attachment.id, 'attachment-1')
assert.equal(created.attachmentId, 'attachment-1')
assert.equal(updates[0]?.message, 'Work is halfway done.')
assert.equal(calls[0]?.url, 'http://gateway.test/v1/uploads')
assert.equal(calls[0]?.init?.method, 'POST')
assert.ok(calls[0]?.init?.body instanceof FormData)
assert.equal(calls[1]?.url, 'http://gateway.test/v1/bookings/booking-1/attachments')
assert.equal(calls[1]?.init?.method, 'POST')
assert.deepEqual(JSON.parse(String(calls[1]?.init?.body)), {
  mediaKind: 'provider_progress',
  fileUrl: 'https://storage.test/progress.jpg',
  fileName: 'progress.jpg',
  mimeType: 'image/jpeg',
  storagePath: 'provider_progress/provider-user-1/progress.jpg',
  fileSize: 2048,
  caption: 'Progress photo',
})
assert.equal(calls[2]?.url, 'http://gateway.test/v1/bookings/booking-1/service-updates')
assert.equal(calls[2]?.init?.method, 'POST')
assert.deepEqual(JSON.parse(String(calls[2]?.init?.body)), {
  updateType: 'progress',
  message: 'Work is halfway done.',
  attachmentId: 'attachment-1',
})
assert.equal(calls[3]?.url, 'http://gateway.test/v1/bookings/booking-1/service-updates')
assert.equal(calls[3]?.init?.method, 'GET')

function jsonResponse(status: number, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response
}
