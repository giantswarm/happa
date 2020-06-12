export function getAuthorityURLFromGSApiURL(apiURL: string): string {
  const newUrl = apiURL.replace('api', 'dex');

  return newUrl;
}
