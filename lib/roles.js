export const ROLES = {
  SUPER_ADMIN: "super-admin",
  ADMIN: "admin",
  STAFF: "staff",
};

export function isSuperAdmin(role) {
  return role === ROLES.SUPER_ADMIN;
}

/** Admin or super-admin — full portal management access. */
export function isAdminLevel(role) {
  return role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;
}

export function roleLabel(role) {
  if (role === ROLES.SUPER_ADMIN) return "Super admin";
  if (role === ROLES.ADMIN) return "Admin";
  return "Staff";
}

/** Roles the signed-in user may assign when creating an employee. */
export function assignableRoles(actorRole) {
  if (!isAdminLevel(actorRole)) return [];
  return [ROLES.STAFF, ROLES.ADMIN];
}

export function sanitizeAssignableRole(role, actorRole) {
  if (!isAdminLevel(actorRole)) return ROLES.STAFF;
  if (role === ROLES.ADMIN) return ROLES.ADMIN;
  return ROLES.STAFF;
}
