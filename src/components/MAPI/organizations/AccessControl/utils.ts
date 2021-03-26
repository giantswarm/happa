import * as ui from 'UI/Display/MAPI/AccessControl/types';

/**
 * Filter roles based on a search query.
 * @param roles
 * @param query
 */
export function filterRoles(
  roles: ui.IAccessControlRoleItem[],
  query: string
): ui.IAccessControlRoleItem[] {
  const searchQuery = query.trim().toLowerCase();
  if (!searchQuery) return roles;

  return roles.filter((role) => {
    const value = role.name.toLowerCase();

    return value.includes(searchQuery);
  });
}
