import { Constants } from 'shared/constants';

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

/**
 * Looks at a readme URL and attempts to correct URLs
 * which are known not to work. Test apps have a version which is not yet
 * tagged in the git repo, but the path includes the commit sha, so we can
 * still get to the file at that commit.
 * @param readmeURL - A URL that may or may not point to a README of a test app.
 */
export function fixTestAppReadmeURLs(readmeURL: string): string {
  /**
   * Test app urls will have a semver version followed by a hyphen followed by
   * a long commit sha. We need to remove the version part. If the regex
   * doesn't match, then the string is returned as is.
   * https://regex101.com/r/K2dxdN/1
   */

  const escapedReadmeFile = Constants.README_FILE.replace('.', '\\.');
  const regexMatcher = new RegExp(
    `^(.*)\/v?[0-9]+\.[0-9]+\.[0-9]+-(.*)\/${escapedReadmeFile}$`
  );
  const fixedReadmeURL = readmeURL.replace(
    regexMatcher,
    `$1/$2/${Constants.README_FILE}`
  );

  return fixedReadmeURL;
}
