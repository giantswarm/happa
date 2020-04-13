export function isCommitHash(version: string): boolean {
  // eslint-disable-next-line no-magic-numbers
  return version.length > 30;
}

export function getReleaseURL(version: string): string {
  let URL = '';
  const isHash = isCommitHash(version);

  if (isHash) {
    URL = `https://github.com/giantswarm/happa/commit/${version}`;
  } else {
    URL = `https://github.com/giantswarm/happa/releases/tag/${version}`;
  }

  return URL;
}

export function getVersionTooltipMessage(
  currentVersion: string,
  newVersion: string | null,
  isUpdating: boolean
): string {
  let updateMessage: string = 'Using latest version.';

  if (isUpdating) {
    updateMessage = 'Update in progress...';
  }

  if (hasUpdateReady(currentVersion, newVersion)) {
    updateMessage = 'Update available!';
  }

  return updateMessage;
}

export function getUpdateButtonMessage(
  hasUpdate: boolean,
  isUpdating: boolean
): string {
  let updateMessage: string = 'Release notes';

  if (hasUpdate) {
    updateMessage = 'Update now!';
  }

  if (isUpdating) {
    updateMessage = 'Updating...';
  }

  return updateMessage;
}

export function hasUpdateReady(
  currentVersion: string,
  newVersion: string | null
): boolean {
  return newVersion !== null && currentVersion !== newVersion;
}
