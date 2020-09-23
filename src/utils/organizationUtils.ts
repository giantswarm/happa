export function determineSelectedOrganization(
  organizations: string[],
  selectedOrganization: string | null
): string | null {
  /**
   * The user didn't have an organization selected yet, or the one
   * they selected is gone. Switch to the first organization in the list.
   */
  const defaultOrganization = organizations[0] ?? null;

  if (!selectedOrganization) {
    return defaultOrganization;
  }

  if (organizations.includes(selectedOrganization)) {
    // The user had an organization selected, and it still exists.
    return selectedOrganization;
  }

  return defaultOrganization;
}
