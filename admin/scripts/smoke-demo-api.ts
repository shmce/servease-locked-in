import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

const appRoot = process.cwd()
const repoRoot = resolve(appRoot, '..')
const backendDir = resolve(repoRoot, 'backend')
const processes: ChildProcess[] = []

loadEnv(resolve(repoRoot, '.env'))
loadEnv(resolve(appRoot, '.env'))
loadEnv(resolve(appRoot, '.env.local'))
mapSupabaseEnv()

const gatewayUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5001'
const password = process.env.DEMO_ACCOUNT_PASSWORD ?? 'ServEaseDemo#2026'
const adminEmail = process.env.DEMO_ADMIN_EMAIL ?? 'admin.demo@servease.test'
const expected = {
  categoryId: '11111111-1111-4111-8111-111111111111',
  serviceId: '33333333-3333-4333-8333-333333333333',
  providerId: '55555555-5555-4555-8555-555555555555',
  paymentId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  refundId: 'abababab-abab-4aba-8aba-abababababab',
  supportTicketId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  bookingId: '88888888-8888-4888-8888-888888888888',
  disputeId: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
}

async function main() {
  await startCoreServices()

  const adminApi = await import('../src/services/serveaseAdminApi')
  const session = await adminApi.signInWithPassword(adminEmail, password)
  const token = session.accessToken

  const currentUser = await adminApi.getCurrentUser(token)
  assert(currentUser.user.role === 'admin', 'admin current user role mismatch')
  assert(currentUser.user.status === 'active', 'admin current user is not active')

  const [
    categories,
    services,
    providers,
    payments,
    pendingPayments,
    payouts,
    requestedPayouts,
    refunds,
    requestedRefunds,
    commissionRules,
    tickets,
    openTickets,
    bookings,
    confirmedBookings,
    disputes,
    openDisputes,
    promotions,
    providerApplications,
  ] =
    await Promise.all([
      step('catalog categories', adminApi.listCatalogCategories()),
      step('catalog services', adminApi.listCatalogServices(expected.categoryId)),
      step('provider listings', adminApi.listProviderListings(expected.serviceId)),
      step('admin payments', adminApi.listAdminPayments(token)),
      step('admin pending payments', adminApi.listAdminPayments(token, 'pending')),
      step('admin payouts', adminApi.listAdminPayouts(token)),
      step('admin requested payouts', adminApi.listAdminPayouts(token, 'requested')),
      step('admin refunds', adminApi.listAdminRefunds(token)),
      step('admin requested refunds', adminApi.listAdminRefunds(token, 'requested')),
      step('admin commission rules', adminApi.listAdminCommissionRules(token)),
      step('admin support tickets', adminApi.listAdminSupportTickets(token)),
      step('admin open support tickets', adminApi.listAdminSupportTickets(token, 'open')),
      step('admin bookings', adminApi.listAdminBookings(token)),
      step('admin confirmed bookings', adminApi.listAdminBookings(token, { status: 'confirmed' })),
      step('admin disputes', adminApi.listAdminDisputes(token)),
      step('admin open disputes', adminApi.listAdminDisputes(token, 'open')),
      step('admin promotions', adminApi.listAdminPromotions(token, 'active')),
      step('admin provider applications', adminApi.listAdminProviderApplications(token)),
    ])

  assert(
    categories.some((item) => item.id === expected.categoryId),
    'admin catalog categories missing demo category',
  )
  assert(
    services.some((item) => item.id === expected.serviceId),
    'admin catalog services missing demo service',
  )
  assert(
    providers.some((item) => item.providerId === expected.providerId),
    'admin provider listings missing demo provider',
  )
  assert(
    payments.some((item) => item.id === expected.paymentId),
    'admin payments missing demo payment',
  )
  assert(
    pendingPayments.some((item) => item.id === expected.paymentId),
    'admin pending payment filter missing demo payment',
  )
  assert(Array.isArray(payouts), 'admin payouts did not return an array')
  assert(Array.isArray(requestedPayouts), 'admin requested payout filter failed')
  assert(
    refunds.some((item) => item.id === expected.refundId),
    'admin refunds missing demo refund',
  )
  assert(
    requestedRefunds.some((item) => item.id === expected.refundId),
    'admin requested refund filter missing demo refund',
  )
  assert(
    commissionRules.some((item) => item.id === 'platform-default'),
    'admin commission rules missing platform default rule',
  )
  assert(
    tickets.some((item) => item.id === expected.supportTicketId),
    'admin support tickets missing demo ticket',
  )
  assert(
    openTickets.some((item) => item.id === expected.supportTicketId),
    'admin open support filter missing demo ticket',
  )
  assert(
    bookings.some((item) => item.id === expected.bookingId),
    'admin bookings missing demo booking',
  )
  assert(
    confirmedBookings.some((item) => item.id === expected.bookingId),
    'admin confirmed booking filter missing demo booking',
  )
  assert(
    disputes.some((item) => item.id === expected.disputeId),
    'admin disputes missing demo dispute',
  )
  assert(
    openDisputes.some((item) => item.id === expected.disputeId),
    'admin open disputes filter missing demo dispute',
  )
  assert(
    promotions.some((item) => item.code === 'SERVEASE10'),
    'admin promotions missing demo promotion',
  )
  assert(
    providerApplications.some((item) => item.id === expected.providerId),
    'admin provider applications missing demo provider profile',
  )

  const disputeDetail = await adminApi.getAdminDispute(token, expected.disputeId)
  assert(disputeDetail.id === expected.disputeId, 'admin dispute detail mismatch')
  const bookingDetail = await adminApi.getAdminBooking(token, expected.bookingId)
  assert(bookingDetail.id === expected.bookingId, 'admin booking detail mismatch')
  const providerApplicationDetail = await adminApi.getAdminProviderApplication(
    token,
    expected.providerId,
  )
  assert(
    providerApplicationDetail.id === expected.providerId,
    'admin provider application detail mismatch',
  )
  const providerApplicationReview = await adminApi.getAdminProviderApplicationReview(
    token,
    expected.providerId,
  )
  assert(
    providerApplicationReview.applicationId === expected.providerId,
    'admin provider application review detail mismatch',
  )
  const updatedProviderApplicationReview =
    await adminApi.updateAdminProviderApplicationReview(token, expected.providerId, {
      kycChecklist: providerApplicationReview.kycChecklist.map((item) => ({
        ...item,
        checked: true,
      })),
      businessChecklist: providerApplicationReview.businessChecklist.map((item) => ({
        ...item,
        checked: true,
      })),
      verificationRecords: providerApplicationReview.verificationRecords,
      ocrData: providerApplicationReview.ocrData,
    })
  assert(
    updatedProviderApplicationReview.isComplete,
    'admin provider application review update did not complete approval gate',
  )
  const notedProviderApplicationReview =
    await adminApi.addAdminProviderApplicationReviewNote(
      token,
      expected.providerId,
      'Demo admin smoke review note',
    )
  assert(
    notedProviderApplicationReview.notes.some(
      (item) => item.note === 'Demo admin smoke review note',
    ),
    'admin provider application review note missing after create',
  )
  const ocrProviderApplicationReview =
    await adminApi.runAdminProviderApplicationOcr(token, expected.providerId)
  assert(
    ocrProviderApplicationReview.applicationId === expected.providerId,
    'admin provider application OCR review mismatch',
  )

  const resolvedDispute = await adminApi.resolveAdminDispute(token, expected.disputeId)
  assert(resolvedDispute.status === 'resolved', 'admin dispute resolve failed')
  const escalatedBooking = await adminApi.escalateAdminBooking(token, expected.bookingId, {
    reason: 'Demo admin smoke escalation',
    priority: 'high',
  })
  assert(
    escalatedBooking.escalationCount > 0,
    'admin booking escalation did not create an escalation row',
  )

  const [updatedPayment, updatedTicket] = await Promise.all([
    adminApi.updateAdminPaymentStatus(token, expected.paymentId, 'pending'),
    adminApi.updateAdminSupportTicketStatus(token, expected.supportTicketId, 'open'),
  ])
  assert(updatedPayment.status === 'pending', 'admin payment status update failed')
  assert(updatedTicket.status === 'open', 'admin ticket status update failed')
  const cancelledBooking = await adminApi.cancelAdminBooking(token, expected.bookingId, {
    reason: 'Demo admin smoke cancellation',
  })
  assert(cancelledBooking.status === 'cancelled', 'admin booking cancellation failed')

  const auditLogs = await adminApi.listAdminAuditLogs(token, { limit: 50 })
  assert(
    auditLogs.some((item) => item.entityType === 'Payment' && item.entityId === expected.paymentId),
    'admin audit logs missing payment update audit row',
  )
  assert(
    auditLogs.some((item) => item.entityType === 'Support Ticket' && item.entityId === expected.supportTicketId),
    'admin audit logs missing support ticket audit row',
  )
  assert(
    auditLogs.some((item) => item.entityType === 'Booking' && item.entityId === expected.bookingId),
    'admin audit logs missing booking audit row',
  )
  const auditCsv = await adminApi.exportAdminAuditLogsCsv(token, { limit: 50 })
  assert(auditCsv.includes('entityType'), 'admin audit CSV export missing headers')

  console.log(
    JSON.stringify({
      ok: true,
      adminApiDemoVerified: true,
      paymentId: expected.paymentId,
      supportTicketId: expected.supportTicketId,
      bookingId: expected.bookingId,
      disputeId: expected.disputeId,
      auditLogCount: auditLogs.length,
    }),
  )
}

async function startCoreServices(): Promise<void> {
  await Promise.all([
    startService('auth-service', 8501),
    startService('user-service', 8502),
    startService('catalog-service', 8503),
    startService('booking-service', 8504),
    startService('availability-service', 8505),
    startService('messaging-service', 8506),
    startService('payment-service', 8507),
    startService('review-service', 8508),
    startService('notification-service', 8509),
    startService('support-service', 8510),
    startService('admin-service', 8511),
  ])
  await startService('api-gateway', 5001)
}

async function startService(appName: string, port: number): Promise<void> {
  if (await isHealthy(port)) {
    return
  }

  const child = spawn('node', [`dist/apps/${appName}/src/main.js`], {
    cwd: backendDir,
    env: {
      ...process.env,
      PORT: appName === 'api-gateway' ? String(port) : process.env.PORT,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  processes.push(child)

  let logs = ''
  child.stdout?.on('data', (chunk) => {
    logs += chunk.toString()
  })
  child.stderr?.on('data', (chunk) => {
    logs += chunk.toString()
  })

  await waitForHealthy(port, appName, () => logs)
}

async function isHealthy(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${port}/health/live`)
    return response.ok
  } catch {
    return false
  }
}

async function waitForHealthy(
  port: number,
  appName: string,
  getLogs: () => string,
): Promise<void> {
  const deadline = Date.now() + 15000
  let lastError: Error | null = null

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://localhost:${port}/health/live`)
      if (response.ok) {
        return
      }
      lastError = new Error(`${appName} health returned ${response.status}`)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
    }
    await sleep(250)
  }

  throw new Error(
    `${appName} did not become healthy on port ${port}: ${lastError?.message ?? 'timeout'}\n${getLogs()}`,
  )
}

function loadEnv(path: string): void {
  if (!existsSync(path)) {
    return
  }

  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }
    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex < 1) {
      continue
    }
    const key = trimmed.slice(0, separatorIndex)
    const value = trimmed.slice(separatorIndex + 1).replace(/^["']|["']$/g, '')
    process.env[key] ??= value
  }
}

function mapSupabaseEnv(): void {
  process.env.NEXT_PUBLIC_API_BASE_URL ??= 'http://localhost:5001'
  process.env.NEXT_PUBLIC_SUPABASE_URL ??= process.env.SUPABASE_URL
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??=
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

async function step<T>(label: string, promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${label}: ${message}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function stopProcesses(): Promise<void> {
  await Promise.all(processes.reverse().map((child) => stopProcess(child)))
}

function stopProcess(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, 3000)

    child.once('exit', () => {
      clearTimeout(timeout)
      resolve()
    })
    child.kill('SIGKILL')
  })
}

void (async () => {
  try {
    await main()
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  } finally {
    await stopProcesses()
  }
})()
