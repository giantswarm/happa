import { decode } from 'js-base64';

export const credentialsNamespace = 'giantswarm';

export const defaultCredentialName = 'credential-default';

export function decodeCredential(value?: string) {
  if (!value) return undefined;

  return decode(value);
}
