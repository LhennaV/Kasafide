import type { Access, FieldAccess } from 'payload'

type MaybeUser = {
  id?: string | number
  collection?: string
  role?: string
} | null

const STAFF_ROLES = new Set(['admin', 'superadmin', 'super_duper_admin'])
const SUPER_ROLES = new Set(['superadmin', 'super_duper_admin'])

export function getReqUser(req: { user?: unknown }): MaybeUser {
  return (req.user as MaybeUser) ?? null
}

export function hasStaffReq(req: { user?: unknown }): boolean {
  const user = getReqUser(req)
  if (!user) return false
  if (user.collection === 'admins') return true
  return Boolean(user.role && STAFF_ROLES.has(user.role))
}

export const isCmsAdmin: Access = ({ req }) => {
  const user = getReqUser(req)
  return user?.collection === 'admins'
}

export const isAppUser: Access = ({ req }) => {
  const user = getReqUser(req)
  return Boolean(user?.id)
}

export const isAppStaff: Access = ({ req }) => {
  return hasStaffReq(req)
}

export const isAppSuperAdmin: Access = ({ req }) => {
  const user = getReqUser(req)
  if (!user) return false
  if (user.collection === 'admins') return true
  return Boolean(user.role && SUPER_ROLES.has(user.role))
}

export const isAppStaffField: FieldAccess = ({ req }) => {
  const user = getReqUser(req)
  if (!user) return false
  if (user.collection === 'admins') return true
  return Boolean(user.role && STAFF_ROLES.has(user.role))
}

export const isSelfOrStaffField: FieldAccess = ({ req, doc }) => {
  const user = getReqUser(req)
  if (!user) return false
  if (user.collection === 'admins') return true
  if (user.role && STAFF_ROLES.has(user.role)) return true
  if (doc && String((doc as { id?: unknown }).id) === String(user.id)) {
    return true
  }
  return false
}
