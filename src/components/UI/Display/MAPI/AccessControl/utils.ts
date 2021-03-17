import { IAccessControlRoleItem } from './types';

export function filterRoles(
  roles: IAccessControlRoleItem[],
  query: string
): IAccessControlRoleItem[] {
  return roles.filter((role) => {
    const searchQuery = query.trim().toLowerCase();
    if (!searchQuery) return true;

    const value = role.name.toLowerCase();

    return value.includes(searchQuery);
  });
}
