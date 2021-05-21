export function normalizeAppCatalogIndexURL(url: string): string {
  let indexURL = `${url}index.yaml`;

  // If we are trying to reach the Helm Stable catalog at it's old location,
  // route the request through a proxy in Happa's container which adds necessary
  // CORS headers.
  if (url === 'https://kubernetes-charts.storage.googleapis.com/') {
    indexURL = `/catalogs?url=${indexURL}`;
  }

  // If we are trying to reach the Helm Stable catalog at it's new location,
  // it's url structure is a bit different.
  // We need to remove /packages/ from the URL before adding /index.yaml.
  if (url === 'https://charts.helm.sh/stable/packages/') {
    indexURL = 'https://charts.helm.sh/stable/index.yaml';
  }

  return indexURL;
}
