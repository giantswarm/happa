import { decode } from 'js-base64';

export const credentialsNamespace = 'giantswarm';

export const defaultCredentialName = 'credential-default';

export function decodeCredential(value?: string) {
  if (!value) return undefined;

  return decode(value);
}

export function extractIDFromARN(arn?: string) {
  if (!arn) return undefined;

  const parts = arn.split(':');
  if (parts.length < 4) return '';

  return parts[4];
}
