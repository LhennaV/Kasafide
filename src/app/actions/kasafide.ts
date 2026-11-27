'use server'

import { appAuth } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { ownsPath, ownsPublicUrl } from '@/lib/storage'

export type ActionResult = {
  ok: boolean
  message?: string
  error?: string
  slug?: string
}

export async function toggleSavedListingAction(listingId: string): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user) {
    return { ok: false, error: 'Please sign in to save properties.' }
  }

  const payload = await getPayloadClient()
  const currentIds = (user.savedListings ?? []).map((item) =>
    typeof item === 'object' && item !== null ? String(item.id) : String(item),
  )
  const exists = currentIds.includes(String(listingId))
  const nextIds = exists
    ? currentIds.filter((id) => id !== String(listingId))
    : [...currentIds, String(listingId)]

  await payload.update({
    collection: 'users',
    id: user.id,
    user,
    overrideAccess: false,
    data: { savedListings: nextIds },
  })

  return {
    ok: true,
    message: exists ? 'Removed from Saved Listings.' : 'Saved to your shortlist!',
  }
}

export async function submitViewingRequestAction(input: {
  listingId: string
  sellerId: string
  preferredDate: string
  preferredTime: string
  notes?: string
}): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user) return { ok: false, error: 'Please sign in to request a viewing.' }

  if (!input.preferredDate || !input.preferredTime) {
    return { ok: false, error: 'Please choose both a preferred date and time.' }
  }

  const payload = await getPayloadClient()
  await payload.create({
    collection: 'viewing-requests',
    user,
    overrideAccess: false,
    data: {
      listing: input.listingId,
      buyer: user.id,
      seller: input.sellerId,
      preferredDate: input.preferredDate.trim(),
      preferredTime: input.preferredTime.trim(),
      notes: input.notes?.trim() || '',
      status: 'pending',
    },
  })

  await payload.create({
    collection: 'messages',
    user,
    overrideAccess: false,
    data: {
      sender: user.id,
      recipient: input.sellerId,
      listing: input.listingId,
      messageType: 'viewing_request',
      body: `Viewing requested for ${input.preferredDate} at ${input.preferredTime}. ${input.notes?.trim() || ''}`.trim(),
      read: false,
    },
  })

  return { ok: true, message: 'Viewing request sent to the verified owner!' }
}

export async function updateViewingStatusAction(input: {
  viewingId: string
  status: 'accepted' | 'declined' | 'completed'
}): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  const payload = await getPayloadClient()
  await payload.update({
    collection: 'viewing-requests',
    id: input.viewingId,
    user,
    overrideAccess: false,
    data: { status: input.status },
  })

  return { ok: true, message: `Viewing marked as ${input.status}.` }
}

export async function sendMessageAction(input: {
  recipientId: string
  listingId?: string
  body: string
  messageType?: 'text' | 'payment_request'
  requestedAmount?: number
}): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user) return { ok: false, error: 'Please sign in to send messages.' }

  const cleanBody = input.body.trim()
  if (!cleanBody) return { ok: false, error: 'Message cannot be empty.' }

  const payload = await getPayloadClient()
  await payload.create({
    collection: 'messages',
    user,
    overrideAccess: false,
    data: {
      sender: user.id,
      recipient: input.recipientId,
      listing: input.listingId || undefined,
      body: cleanBody,
      messageType: input.messageType || 'text',
      requestedAmount: input.requestedAmount || undefined,
      read: false,
    },
  })

  return { ok: true, message: 'Message delivered.' }
}

export async function submitPaymentAction(input: {
  listingId: string
  payeeId: string
  paymentType: 'rent' | 'reservation' | 'security_deposit' | 'purchase'
  method: 'qrph' | 'gcash' | 'maya' | 'bank_transfer'
  periodLabel: string
  referenceSuffix?: string
  notes?: string
}): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user) return { ok: false, error: 'Please sign in to submit a payment.' }

  const payload = await getPayloadClient()
  // Compute price server-side from the listing document (matches Kasafide architecture rule!)
  const listing = await payload.findByID({
    collection: 'listings',
    id: input.listingId,
    user,
    overrideAccess: false,
    depth: 0,
  })
  if (!listing) return { ok: false, error: 'Listing not found.' }

  const basePrice = Number(listing.price) || 10000
  const computedAmount =
    input.paymentType === 'reservation'
      ? Math.min(5000, Math.round(basePrice * 0.25))
      : input.paymentType === 'security_deposit'
        ? basePrice * 2
        : basePrice

  const prefix = input.method.toUpperCase().slice(0, 2)
  const suffix =
    input.referenceSuffix?.replace(/[^A-Za-z0-9]/g, '').slice(-6).toUpperCase() ||
    String(Math.floor(100000 + Math.random() * 900000))

  await payload.create({
    collection: 'payments',
    user,
    overrideAccess: false,
    data: {
      referenceCode: `KF-${prefix}-${suffix}`,
      listing: listing.id,
      payer: user.id,
      payee: input.payeeId,
      paymentType: input.paymentType,
      method: input.method,
      amount: computedAmount,
      periodLabel: input.periodLabel.trim() || 'Current Period',
      status: input.method === 'qrph' ? 'confirmed' : 'pending_verification',
      notes: input.notes?.trim() || '',
    },
  })

  return {
    ok: true,
    message:
      input.method === 'qrph'
        ? 'QR Ph charge confirmed and recorded!'
        : 'Payment proof recorded! Waiting for landowner confirmation.',
  }
}

export async function decidePaymentAction(input: {
  paymentId: string
  decision: 'confirmed' | 'rejected' | 'refund_requested' | 'refunded'
}): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  const payload = await getPayloadClient()
  await payload.update({
    collection: 'payments',
    id: input.paymentId,
    user,
    overrideAccess: false,
    data: { status: input.decision },
  })

  return { ok: true, message: `Payment updated to ${input.decision.replace('_', ' ')}.` }
}

export async function createSellerListingAction(input: {
  title: string
  propertyType: 'house' | 'apartment' | 'condo' | 'commercial' | 'lot'
  listingType: 'rent' | 'sale'
  price: number
  barangayId: string
  address: string
  bedrooms: number
  bathrooms: number
  floorAreaSqm: number
  lotAreaSqm: number
  description: string
  amenities: string[]
  priceNegotiable: boolean
  hasMultipleUnits: boolean
  totalUnits: number
  ownershipDocType: 'tct' | 'deed_of_sale' | 'tax_declaration'
  /** Public URLs returned by /api/uploads (kind 'listing-photo'); the first one is the cover. */
  photoUrls: string[]
  /** Private path returned by /api/uploads (kind 'ownership-doc'). */
  ownershipDocPath: string
}): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user || (user.role !== 'seller' && !['admin', 'superadmin', 'super_duper_admin'].includes(user.role))) {
    return { ok: false, error: 'Only sellers can post property listings.' }
  }

  if (!input.title.trim() || !input.address.trim() || !input.barangayId || input.price <= 0) {
    return { ok: false, error: 'Please complete title, barangay, address, and a valid price.' }
  }

  const photoUrls = (Array.isArray(input.photoUrls) ? input.photoUrls : [])
    .filter((u) => ownsPublicUrl(String(user.id), 'listing-photo', u))
    .slice(0, 10)
  if (photoUrls.length === 0) {
    return { ok: false, error: 'Please attach at least one photo of the property.' }
  }
  if (!ownsPath(String(user.id), 'ownership-doc', input.ownershipDocPath)) {
    return {
      ok: false,
      error: 'Please attach your ownership document (title, deed of sale, or tax declaration).',
    }
  }

  const payload = await getPayloadClient()
  const mediaList = await payload.find({
    collection: 'media',
    user,
    overrideAccess: false,
    limit: 5,
  })
  const defaultCover = mediaList.docs[0]?.id
  if (!defaultCover) {
    return { ok: false, error: 'No media available for cover photo.' }
  }

  const slugBase = input.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const uniqueSlug = `${slugBase}-${Date.now().toString(36).slice(-4)}`

  const created = await payload.create({
    collection: 'listings',
    user,
    overrideAccess: false,
    context: { fromTransition: true },
    data: {
      title: input.title.trim(),
      slug: uniqueSlug,
      seller: user.id,
      status: 'pending',
      propertyType: input.propertyType,
      listingType: input.listingType,
      price: Number(input.price),
      barangay: input.barangayId,
      address: input.address.trim(),
      city: 'Sta. Maria',
      province: 'Bulacan',
      bedrooms: Number(input.bedrooms) || 0,
      bathrooms: Number(input.bathrooms) || 0,
      floorAreaSqm: Number(input.floorAreaSqm) || 0,
      lotAreaSqm: Number(input.lotAreaSqm) || 0,
      description: input.description.trim() || 'Property submitted for Kasafide verification.',
      coverImage: defaultCover,
      amenities: input.amenities.filter(Boolean).map((label) => ({ label })),
      priceNegotiable: Boolean(input.priceNegotiable),
      hasMultipleUnits: Boolean(input.hasMultipleUnits),
      totalUnits: Math.max(1, Number(input.totalUnits) || 1),
      availableUnits: Math.max(1, Number(input.totalUnits) || 1),
      ownershipDocType: input.ownershipDocType,
      ownershipDocPath: input.ownershipDocPath,
      photoUrls,
    },
  })

  return {
    ok: true,
    slug: created.slug || String(created.id),
    message: 'Listing submitted for Admin title & photo verification!',
  }
}

export async function sellerUpdateListingAvailabilityAction(input: {
  listingId: string
  availableUnits?: number
  closeListing?: boolean
}): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  const payload = await getPayloadClient()
  await payload.update({
    collection: 'listings',
    id: input.listingId,
    user,
    overrideAccess: false,
    context: { fromTransition: true },
    data: {
      ...(typeof input.availableUnits === 'number' ? { availableUnits: input.availableUnits } : {}),
      ...(input.closeListing ? { status: 'closed' } : {}),
    },
  })

  return {
    ok: true,
    message: input.closeListing ? 'Listing marked as closed.' : 'Unit availability updated.',
  }
}

export async function signSellerMoaAction(signatureName: string): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user) return { ok: false, error: 'Unauthorized' }
  const clean = signatureName.trim()
  if (clean.length < 3) return { ok: false, error: 'Please type your full legal name to sign.' }

  const payload = await getPayloadClient()
  await payload.update({
    collection: 'users',
    id: user.id,
    user,
    overrideAccess: false,
    data: {
      moaSignatureName: clean,
      moaSignedAt: new Date().toISOString(),
    },
  })
  return { ok: true, message: 'Memorandum of Agreement digitally signed and recorded.' }
}

export async function submitIdentityVerificationAction(input: {
  idType: 'drivers_license' | 'passport' | 'philid' | 'umid' | 'postal_id'
  idNumberLast4: string
  /** Private paths returned by /api/uploads (kinds 'id-photo' and 'selfie'). */
  idImagePath: string
  selfieImagePath: string
}): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user) return { ok: false, error: 'Please sign in first.' }

  const last4 = String(input.idNumberLast4 || '').replace(/\D/g, '')
  if (last4.length !== 4) {
    return { ok: false, error: 'Enter the last 4 digits of your ID number.' }
  }
  if (!ownsPath(String(user.id), 'id-photo', input.idImagePath)) {
    return { ok: false, error: 'Please upload a photo of your ID.' }
  }
  if (!ownsPath(String(user.id), 'selfie', input.selfieImagePath)) {
    return { ok: false, error: 'Please take a live selfie with the camera.' }
  }

  const payload = await getPayloadClient()
  await payload.create({
    collection: 'verification-submissions',
    user,
    overrideAccess: false,
    data: {
      user: user.id,
      idType: input.idType,
      idNumberLast4: last4,
      selfieCaptured: true,
      idImagePath: input.idImagePath,
      selfieImagePath: input.selfieImagePath,
      status: 'pending',
    },
  })

  return { ok: true, message: 'Government ID and live selfie submitted for Admin review!' }
}

export async function submitReviewAction(input: {
  listingId: string
  sellerId: string
  rating: number
  comment: string
}): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user) return { ok: false, error: 'Please sign in to leave a review.' }
  if (!input.comment.trim()) return { ok: false, error: 'Please write a short review.' }

  const payload = await getPayloadClient()
  await payload.create({
    collection: 'reviews',
    user,
    overrideAccess: false,
    context: { fromTransition: true },
    data: {
      listing: input.listingId,
      reviewer: user.id,
      seller: input.sellerId,
      rating: Math.min(5, Math.max(1, Math.round(input.rating))),
      comment: input.comment.trim(),
    },
  })
  return { ok: true, message: 'Thank you! Your verified review is now live.' }
}

export async function submitListingReportAction(input: {
  listingId: string
  reason: 'fake_listing' | 'misleading_photos' | 'wrong_price' | 'scam_behavior' | 'duplicate'
  details: string
}): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user) return { ok: false, error: 'Please sign in to report a listing.' }
  if (!input.details.trim()) return { ok: false, error: 'Please describe the issue.' }

  const payload = await getPayloadClient()
  await payload.create({
    collection: 'listing-reports',
    user,
    overrideAccess: false,
    data: {
      listing: input.listingId,
      reporter: user.id,
      reason: input.reason,
      details: input.details.trim(),
      status: 'open',
    },
  })
  return { ok: true, message: 'Report submitted to Kasafide Trust & Safety.' }
}

export async function updateProfileSettingsAction(input: {
  firstName: string
  middleInitial?: string
  lastName: string
  phone?: string
  bio?: string
  gcashNumber?: string
  mayaNumber?: string
}): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  for (const [label, value] of [
    ['Phone number', input.phone],
    ['GCash number', input.gcashNumber],
    ['Maya number', input.mayaNumber],
  ] as const) {
    const v = value?.trim() || ''
    if (v && !isPhMobile(v)) {
      return {
        ok: false,
        error: `${label} must be a PH mobile number, e.g. 09171234567 or +639171234567.`,
      }
    }
  }

  const payload = await getPayloadClient()
  await payload.update({
    collection: 'users',
    id: user.id,
    user,
    overrideAccess: false,
    data: {
      firstName: input.firstName.trim() || user.firstName,
      middleInitial: input.middleInitial?.trim() || '',
      lastName: input.lastName.trim() || user.lastName,
      phone: input.phone?.trim() || '',
      bio: input.bio?.trim() || '',
      gcashNumber: input.gcashNumber?.trim() || '',
      mayaNumber: input.mayaNumber?.trim() || '',
    },
  })
  return { ok: true, message: 'Profile and payment details saved!' }
}

/** 09XXXXXXXXX or +639XXXXXXXXX (spaces and dashes ignored). */
function isPhMobile(value: string): boolean {
  return /^(09\d{9}|\+639\d{9})$/.test(value.replace(/[\s-]/g, ''))
}

export async function updateAvatarAction(avatarUrl: string | null): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user) return { ok: false, error: 'Please sign in first.' }
  if (avatarUrl !== null && !ownsPublicUrl(String(user.id), 'avatar', avatarUrl)) {
    return { ok: false, error: 'That photo could not be verified. Please upload it again.' }
  }
  const payload = await getPayloadClient()
  await payload.update({
    collection: 'users',
    id: user.id,
    user,
    overrideAccess: false,
    data: { avatarUrl: avatarUrl || '' },
  })
  return { ok: true, message: avatarUrl ? 'Profile photo updated.' : 'Profile photo removed.' }
}

const MIN_PASSWORD_LENGTH = 8

export async function changePasswordAction(input: {
  currentPassword: string
  newPassword: string
}): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user) return { ok: false, error: 'Please sign in again.' }

  if (user.authProvider === 'google') {
    return {
      ok: false,
      error: 'You sign in with Google, so there is no Kasafide password to change.',
    }
  }

  const currentPassword = String(input.currentPassword ?? '')
  const newPassword = String(input.newPassword ?? '')
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: `Use at least ${MIN_PASSWORD_LENGTH} characters for the new password.` }
  }
  if (newPassword.length > 256) {
    return { ok: false, error: 'That password is too long.' }
  }
  if (newPassword === currentPassword) {
    return { ok: false, error: 'The new password must be different from the current one.' }
  }

  const payload = await getPayloadClient()

  // Prove the person at the keyboard knows the current password before replacing it.
  try {
    await payload.login({
      collection: 'users',
      data: { email: user.email, password: currentPassword },
    })
  } catch {
    return { ok: false, error: 'Your current password is incorrect.' }
  }

  await payload.update({
    collection: 'users',
    id: user.id,
    user,
    overrideAccess: false,
    data: { password: newPassword },
  })

  // Re-issue the session cookie with the new credentials so this tab stays signed in.
  await appAuth.loginWithEmailPassword(user.email, newPassword).catch(() => null)

  return { ok: true, message: 'Password updated. Use your new password next time you sign in.' }
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  const payload = await getPayloadClient()
  const unread = await payload.find({
    collection: 'notifications',
    user,
    overrideAccess: false,
    where: {
      and: [{ recipient: { equals: user.id } }, { unread: { equals: true } }],
    },
    limit: 50,
  })
  for (const n of unread.docs) {
    await payload.update({
      collection: 'notifications',
      id: n.id,
      user,
      overrideAccess: false,
      data: { unread: false },
    })
  }
  return { ok: true, message: 'All notifications marked as read.' }
}

// ── Admin & Super Admin Actions ─────────────────────────────────────────────

export async function adminModerateListingAction(input: {
  listingId: string
  status: 'approved' | 'rejected' | 'closed'
  titleVerified?: boolean
  rejectionReason?: string
}): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user || !['admin', 'superadmin', 'super_duper_admin'].includes(user.role)) {
    return { ok: false, error: 'Admin privileges required.' }
  }

  const payload = await getPayloadClient()
  const updated = await payload.update({
    collection: 'listings',
    id: input.listingId,
    user,
    overrideAccess: false,
    context: { fromTransition: true },
    data: {
      status: input.status,
      titleVerified: input.status === 'approved' ? true : Boolean(input.titleVerified),
      rejectionReason: input.rejectionReason?.trim() || '',
    },
  })

  await payload.create({
    collection: 'audit-logs',
    user,
    overrideAccess: false,
    data: {
      actorName: user.fullName,
      actorEmail: user.email,
      actorRole: user.role === 'admin' ? 'admin' : 'superadmin',
      action: `${input.status === 'approved' ? 'Approved' : 'Updated'} Listing: ${updated.title}`,
      status: input.status === 'rejected' ? 'warning' : 'success',
      details: input.rejectionReason || `Status set to ${input.status}`,
    },
  })

  return { ok: true, message: `Listing marked as ${input.status}.` }
}

export async function adminModerateUserAction(input: {
  targetUserId: string
  accountStatus: 'verified' | 'rejected' | 'suspended' | 'unverified'
  /** Shown to the user on their verification submission; required when rejecting from the detail page. */
  reason?: string
}): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user || !['admin', 'superadmin', 'super_duper_admin'].includes(user.role)) {
    return { ok: false, error: 'Admin privileges required.' }
  }

  const reason = input.reason?.trim().slice(0, 1000) || ''
  if (input.accountStatus === 'rejected' && input.reason !== undefined && !reason) {
    return { ok: false, error: 'Please select or write a rejection reason.' }
  }

  const payload = await getPayloadClient()

  // Record the decision on the user's most recent pending ID submission, so the reason
  // travels with the documents it is about.
  if (input.accountStatus === 'verified' || input.accountStatus === 'rejected') {
    const latest = await payload
      .find({
        collection: 'verification-submissions',
        user,
        overrideAccess: false,
        where: {
          and: [{ user: { equals: input.targetUserId } }, { status: { equals: 'pending' } }],
        },
        sort: '-createdAt',
        limit: 1,
        depth: 0,
      })
      .catch(() => ({ docs: [] }))
    const submission = latest.docs[0]
    if (submission) {
      await payload.update({
        collection: 'verification-submissions',
        id: submission.id,
        user,
        overrideAccess: false,
        data: {
          status: input.accountStatus === 'verified' ? 'approved' : 'rejected',
          ...(reason ? { reviewerNotes: reason } : {}),
        },
      })
    }
  }

  const target = await payload.update({
    collection: 'users',
    id: input.targetUserId,
    user,
    overrideAccess: false,
    context: { skipRevalidate: false },
    data: {
      accountStatus: input.accountStatus,
      ...(input.accountStatus === 'verified'
        ? {
            verifiedAt: new Date().toISOString(),
            verificationExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          }
        : {}),
    },
  })

  await payload.create({
    collection: 'audit-logs',
    user,
    overrideAccess: false,
    data: {
      actorName: user.fullName,
      actorEmail: user.email,
      actorRole: user.role === 'admin' ? 'admin' : 'superadmin',
      action: `Updated User Status (${target.fullName} -> ${input.accountStatus})`,
      status: input.accountStatus === 'suspended' || input.accountStatus === 'rejected' ? 'warning' : 'success',
      details: reason || `Account verification status changed to ${input.accountStatus}.`,
    },
  })

  return { ok: true, message: `User updated to ${input.accountStatus}.` }
}

export async function adminResolveReportAction(input: {
  reportId: string
  status: 'investigating' | 'resolved' | 'dismissed'
  resolutionNotes?: string
}): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user || !['admin', 'superadmin', 'super_duper_admin'].includes(user.role)) {
    return { ok: false, error: 'Admin privileges required.' }
  }

  const payload = await getPayloadClient()
  await payload.update({
    collection: 'listing-reports',
    id: input.reportId,
    user,
    overrideAccess: false,
    data: {
      status: input.status,
      resolutionNotes: input.resolutionNotes?.trim() || '',
    },
  })
  return { ok: true, message: `Report marked as ${input.status}.` }
}

export async function superAdminCreateAdminAction(input: {
  firstName: string
  lastName: string
  email: string
  password: string
}): Promise<ActionResult> {
  const user = await appAuth.getCurrentUser()
  if (!user || !['superadmin', 'super_duper_admin'].includes(user.role)) {
    return { ok: false, error: 'Super Admin privileges required.' }
  }

  if (!input.firstName.trim() || !input.lastName.trim() || !input.email.includes('@') || input.password.length < 8) {
    return {
      ok: false,
      error: 'Provide first name, last name, valid email, and password (8+ chars).',
    }
  }

  const payload = await getPayloadClient()
  const created = await payload.create({
    collection: 'users',
    user,
    overrideAccess: false,
    data: {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      fullName: `${input.firstName.trim()} ${input.lastName.trim()}`,
      email: input.email.trim().toLowerCase(),
      password: input.password,
      role: 'admin',
      accountStatus: 'verified',
      verifiedAt: new Date().toISOString(),
      authProvider: 'local',
    },
  })

  await payload.create({
    collection: 'audit-logs',
    user,
    overrideAccess: false,
    data: {
      actorName: user.fullName,
      actorEmail: user.email,
      actorRole: 'superadmin',
      action: `Created Admin Account (${created.email})`,
      status: 'success',
      details: `Provisioned moderator account for ${created.fullName}.`,
    },
  })

  return { ok: true, message: `Admin ${created.fullName} created!` }
}
