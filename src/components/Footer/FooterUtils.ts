import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { Constants } from 'shared/constants';

export function isCommitHash(version: string): boolean {
  // eslint-disable-next-line no-magic-numbers
  return version.length > 30;
}

export function formatVersion(version: string): string {
  if (isCommitHash(version)) {
    // eslint-disable-next-line no-magic-numbers
    return version.substring(0, 5);
  }

  return version;
}

export function getReleaseURL(version: string): string {
  let URL = '';
  const isHash = isCommitHash(version);

  if (isHash) {
    URL = `https://github.com/giantswarm/happa/commit/${version}`;
  } else {
    URL = `https://docs.giantswarm.io/changes/web-ui/happa/${version}/`;
  }

  return URL;
}

export function getVersionTooltipMessage(
  isUpdateReady: boolean,
  isUpdating: boolean
): string {
  let updateMessage: string = 'Using latest version.';

  if (isUpdateReady) {
    updateMessage = 'Update available!';
  }

  if (isUpdating) {
    updateMessage = 'Update in progress...';
  }

  return updateMessage;
}

export function getUpdateButtonMessage(
  hasUpdate: boolean,
  isUpdating: boolean
): string {
  let updateMessage: string = 'Release notes';

  if (hasUpdate) {
    updateMessage = Constants.METADATA_UPDATE_LABEL;
  }

  if (isUpdating) {
    updateMessage = 'Updating...';
  }

  return updateMessage;
}

export function hasUpdateReady(
  currentVersion: string,
  newVersion: string | null,
  isLoggedIn: boolean
): boolean {
  if (!isLoggedIn) return false;

  return newVersion !== null && currentVersion !== newVersion;
}

export function showUpdateToast(callback?: () => void) {
  new FlashMessage(
    `There's a new version of happa available!`,
    messageType.INFO,
    messageTTL.FOREVER,
    `Please press the <code>${Constants.METADATA_UPDATE_LABEL}</code> button in the footer of the page to use the latest version (it only takes a couple of seconds).`,
    callback
  );
}
