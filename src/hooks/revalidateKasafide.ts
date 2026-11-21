import { revalidatePath, revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

function safeRevalidateTag(tag: string) {
  try {
    revalidateTag(tag, { expire: 0 })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('static generation store missing') || message.includes('Invariant')) {
      return
    }
    throw err
  }
}

function safeRevalidatePath(routePath: string, type?: 'page' | 'layout') {
  try {
    if (type) {
      revalidatePath(routePath, type)
    } else {
      revalidatePath(routePath)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('static generation store missing') || message.includes('Invariant')) {
      return
    }
    throw err
  }
}

export function invalidateListingCaches(
  slugs: Array<string | null | undefined> = [],
  skipPaths = false,
) {
  safeRevalidateTag('listings')
  safeRevalidateTag('public-stats')
  for (const slug of slugs) {
    if (slug) {
      safeRevalidateTag(`listing:${slug}`)
      if (!skipPaths) {
        safeRevalidatePath(`/listings/${slug}`)
      }
    }
  }
  if (!skipPaths) {
    safeRevalidatePath('/')
    safeRevalidatePath('/browse')
  }
}

export const revalidateListingAfterChange: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  context,
}) => {
  if (context?.skipRevalidate) return doc
  const currentSlug = (doc as { slug?: string | null })?.slug
  const previousSlug = (previousDoc as { slug?: string | null } | undefined)?.slug
  invalidateListingCaches([currentSlug, previousSlug], Boolean(context?.fromTransition))
  return doc
}

export const revalidateListingAfterDelete: CollectionAfterDeleteHook = ({ doc, context }) => {
  if (context?.skipRevalidate) return doc
  const deletedSlug = (doc as { slug?: string | null })?.slug
  invalidateListingCaches([deletedSlug], Boolean(context?.fromTransition))
  return doc
}

export const revalidateBarangayAfterChange: CollectionAfterChangeHook = ({ doc, context }) => {
  if (context?.skipRevalidate) return doc
  safeRevalidateTag('barangays')
  invalidateListingCaches([])
  return doc
}

export const revalidateBarangayAfterDelete: CollectionAfterDeleteHook = ({ doc, context }) => {
  if (context?.skipRevalidate) return doc
  safeRevalidateTag('barangays')
  invalidateListingCaches([])
  return doc
}

export const revalidateMediaAfterChange: CollectionAfterChangeHook = ({ doc, context }) => {
  if (context?.skipRevalidate) return doc
  safeRevalidateTag('media')
  invalidateListingCaches([])
  return doc
}

export const revalidateMediaAfterDelete: CollectionAfterDeleteHook = ({ doc, context }) => {
  if (context?.skipRevalidate) return doc
  safeRevalidateTag('media')
  invalidateListingCaches([])
  return doc
}

export const revalidateReviewAfterChange: CollectionAfterChangeHook = ({ doc, context }) => {
  if (context?.skipRevalidate) return doc
  safeRevalidateTag('reviews')
  invalidateListingCaches([])
  return doc
}

export const revalidateReviewAfterDelete: CollectionAfterDeleteHook = ({ doc, context }) => {
  if (context?.skipRevalidate) return doc
  safeRevalidateTag('reviews')
  invalidateListingCaches([])
  return doc
}
