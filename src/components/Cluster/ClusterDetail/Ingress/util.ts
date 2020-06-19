export function getBasePathFromK8sEndpoint(endpoint: string): string {
  const replacer = 'https://api';
  let result = '';

  if (endpoint.startsWith(replacer)) {
    result = endpoint.replace(replacer, '');
  }

  return result;
}
