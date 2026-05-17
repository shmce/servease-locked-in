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
        path: 'message_attachment/provider-user-1/2026-05-17/file.jpg',
        publicUrl: 'https://storage.test/message.jpg',
        kind: 'message_attachment',
        contentType: 'image/jpeg',
        size: 1024,
      },
    })
  }

  if (url === 'http://gateway.test/v1/conversations/conversation-1/messages') {
    return jsonResponse(201, {
      data: {
        id: 'message-1',
        conversationId: 'conversation-1',
        senderId: 'provider-user-1',
        senderRole: 'provider',
        content: 'Sent an image',
        deliveryStatus: 'sent',
        createdAt: '2026-05-17T08:00:00.000Z',
        attachment: {
          fileUrl: 'https://storage.test/message.jpg',
          fileName: 'message.jpg',
          mimeType: 'image/jpeg',
          storagePath: 'message_attachment/provider-user-1/2026-05-17/file.jpg',
          fileSize: 1024,
        },
      },
    })
  }

  return jsonResponse(404, {
    error: { code: 'not_found', message: `Unexpected request ${url}` },
  })
}

const file = new File(['image-bytes'], 'message.jpg', { type: 'image/jpeg' })
const upload = await api.uploadProviderMessageAttachment('provider-token', file)
const message = await api.sendProviderConversationMessage(
  'provider-token',
  'conversation-1',
  'Sent an image',
  {
    fileUrl: upload.publicUrl,
    fileName: file.name,
    mimeType: file.type,
    storagePath: upload.path,
    fileSize: upload.size,
  },
)

assert.equal(upload.kind, 'message_attachment')
assert.equal(message.attachment?.fileUrl, 'https://storage.test/message.jpg')
assert.equal(calls[0]?.url, 'http://gateway.test/v1/uploads')
assert.equal(calls[0]?.init?.method, 'POST')
assert.equal(
  calls[0]?.init?.headers &&
    (calls[0].init.headers as Record<string, string>).authorization,
  'Bearer provider-token',
)
assert.ok(calls[0]?.init?.body instanceof FormData)
assert.equal(
  calls[1]?.url,
  'http://gateway.test/v1/conversations/conversation-1/messages',
)
assert.equal(calls[1]?.init?.method, 'POST')
assert.deepEqual(JSON.parse(String(calls[1]?.init?.body)), {
  content: 'Sent an image',
  attachment: {
    fileUrl: 'https://storage.test/message.jpg',
    fileName: 'message.jpg',
    mimeType: 'image/jpeg',
    storagePath: 'message_attachment/provider-user-1/2026-05-17/file.jpg',
    fileSize: 1024,
  },
})

function jsonResponse(status: number, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response
}
