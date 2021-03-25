export enum OrganizationNameStatusMessage {
  TooShort = 'Must be at least 4 characters long',
  StartAndEndWithAlphaNumeric = 'Must start and end with an alphanumeric character (a-z, 0-9)',
  CharacterSet = 'Must contain only a-z, 0-9, and hyphens and underscores',
  TooLong = 'Must not be longer than 249 characters',
  Ok = '',
}

export function validateOrganizationName(
  orgName: string
): {
  valid: boolean;
  statusMessage: OrganizationNameStatusMessage;
} {
  const minLength = 4;
  const maxLength = 249;

  let valid = false;
  let statusMessage: OrganizationNameStatusMessage =
    OrganizationNameStatusMessage.Ok;

  if (orgName.length < minLength) {
    statusMessage = OrganizationNameStatusMessage.TooShort;
  } else if (!/^[a-z0-9].*[a-z0-9]$/.test(orgName)) {
    statusMessage = OrganizationNameStatusMessage.StartAndEndWithAlphaNumeric;
  } else if (!/^[a-z0-9\-\_]+$/.test(orgName)) {
    statusMessage = OrganizationNameStatusMessage.CharacterSet;
  } else if (orgName.length > maxLength) {
    statusMessage = OrganizationNameStatusMessage.TooLong;
  } else {
    valid = true;
  }

  return { valid, statusMessage };
}
