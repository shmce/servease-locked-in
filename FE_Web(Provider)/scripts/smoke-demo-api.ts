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
const providerEmail = process.env.DEMO_PROVIDER_EMAIL ?? 'provider.demo@servease.test'
const expected = {
  bookingId: '88888888-8888-4888-8888-888888888888',
  conversationId: '99999999-9999-4999-8999-999999999999',
  paymentId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  payoutMethodId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  providerId: '55555555-5555-4555-8555-555555555555',
}

async function main() {
  await startCoreServices()

  const providerApi = await import('../src/services/serveaseProviderApi')
  const session = await providerApi.signInWithPassword(providerEmail, password)
  const token = session.accessToken

  const currentUser = await providerApi.getCurrentUser(token)
  assert(currentUser.user.role === 'provider', 'provider current user role mismatch')
  assert(
    currentUser.providerProfile?.id === expected.providerId,
    'provider current user profile mismatch',
  )

  const [
    profileSnapshot,
    dashboard,
    ownedServices,
    availability,
    bookings,
    booking,
    payments,
    payoutAccount,
    payoutMethods,
    payouts,
    userPreferences,
    conversations,
    notifications,
  ] =
    await Promise.all([
      providerApi.getProviderProfile(token),
      providerApi.getProviderDashboard(token),
      providerApi.listProviderOwnedServices(token),
      providerApi.getProviderAvailability(token),
      providerApi.listProviderBookings(token),
      providerApi.getProviderBooking(token, expected.bookingId),
      providerApi.listProviderPayments(token),
      providerApi.getProviderPayoutAccount(token),
      providerApi.listProviderPayoutMethods(token),
      providerApi.listProviderPayouts(token),
      providerApi.getUserPreferences(token),
      providerApi.listProviderConversations(token),
      providerApi.listProviderNotifications(token),
    ])

  assert(
    profileSnapshot.provider.id === expected.providerId,
    'provider profile snapshot mismatch',
  )
  assert(profileSnapshot.services.length > 0, 'provider profile services missing')
  assert(Array.isArray(profileSnapshot.portfolio), 'provider profile portfolio missing')
  assert(ownedServices.length > 0, 'provider owned services missing')
  const replacedServices = await providerApi.replaceProviderOwnedServices(
    token,
    ownedServices.map((service) => ({
      id: service.id,
      serviceId: service.serviceId,
      title: service.title,
      description: service.description,
      price: service.price,
      pricingMode: service.pricingMode,
      isActive: service.isActive,
    })),
  )
  assert(
    replacedServices.length === ownedServices.length,
    'provider owned services replace changed service count',
  )
  assert(
    dashboard.upcomingBookings.some((item) => item.id === expected.bookingId),
    'provider dashboard missing demo booking',
  )
  assert(availability.windows.length > 0, 'provider availability missing demo windows')
  assert(
    bookings.some((item) => item.id === expected.bookingId),
    'provider bookings missing demo booking',
  )
  assert(booking.id === expected.bookingId, 'provider booking detail mismatch')
  assert(
    payments.some((item) => item.id === expected.paymentId),
    'provider payments missing demo payment',
  )
  assert(
    payoutAccount.pendingBalance >= 0 && payoutAccount.availableBalance >= 0,
    'provider payout account returned invalid balances',
  )
  const demoPayoutMethod = payoutMethods.find(
    (item) => item.id === expected.payoutMethodId,
  )
  assert(Boolean(demoPayoutMethod), 'provider payout methods missing demo payout method')
  const upsertedPayoutMethod = await providerApi.upsertProviderPayoutMethod(
    token,
    {
      methodId: demoPayoutMethod!.id,
      methodType: demoPayoutMethod!.methodType,
      accountLabel: demoPayoutMethod!.accountLabel,
      accountName: demoPayoutMethod!.accountName,
      accountNumberLast4: demoPayoutMethod!.accountNumberLast4,
      isDefault: demoPayoutMethod!.isDefault,
    },
  )
  assert(
    upsertedPayoutMethod.id === expected.payoutMethodId,
    'provider payout method upsert returned wrong method',
  )
  assert(Array.isArray(payouts), 'provider payouts did not return an array')
  const updatedPreferences = await providerApi.updateUserPreferences(token, {
    pushNotificationsEnabled: userPreferences.pushNotificationsEnabled,
    notificationPreferences: {
      ...(userPreferences.notificationPreferences ?? {}),
      dailySummary: true,
      preferredTime: '09:00',
    },
  })
  assert(
    updatedPreferences.notificationPreferences.dailySummary === true,
    'provider notification preferences update failed',
  )
  await providerApi.updateUserPreferences(token, {
    pushNotificationsEnabled: userPreferences.pushNotificationsEnabled,
    darkModeEnabled: userPreferences.darkModeEnabled,
    language: userPreferences.language,
    notificationPreferences: userPreferences.notificationPreferences,
  })
  assert(
    conversations.some((item) => item.id === expected.conversationId),
    'provider conversations missing demo conversation',
  )
  assert(Array.isArray(notifications), 'provider notifications did not return an array')

  const messages = await providerApi.listProviderConversationMessages(
    token,
    expected.conversationId,
  )
  assert(messages.length > 0, 'provider conversation messages missing')

  const sentMessage = await providerApi.sendProviderConversationMessage(
    token,
    expected.conversationId,
    'Provider web smoke message.',
  )
  assert(
    sentMessage.conversationId === expected.conversationId,
    'provider sent message conversation mismatch',
  )
  assert(sentMessage.senderRole === 'provider', 'provider sent message role mismatch')

  console.log(
    JSON.stringify({
      ok: true,
      providerWebApiDemoVerified: true,
      bookingId: expected.bookingId,
      providerId: expected.providerId,
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
