import * as ui from 'UI/Display/MAPI/AccessControl/types';

const subjectDelimiterRegexp = /\s*(?:[,\s;])\s*/;

/**
 * Parse subjects from a serialized value (e.g. an user input).
 * @param from
 */
export function parseSubjects(from: string): string[] {
  const trimmed = from.trim();
  if (trimmed.length < 1) return [];

  return trimmed.split(subjectDelimiterRegexp);
}

/**
 * Get the username and domain out of a subject username.
 * @param user
 */
export function getUserNameParts(
  user: string
): [userName: string, domain?: string] {
  const userParts = user.split('@');

  return userParts.slice(0, 2) as [string, string];
}

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
