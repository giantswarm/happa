import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { VersionImpl } from 'lib/Version';
import { Constants } from 'model/constants';
import React from 'react';

export function formatVersion(version: string): string {
  if (version.length < 1) return 'VERSION';

  try {
    const semverVersion = new VersionImpl(version);

    if (semverVersion.getPreRelease().length > 0) {
      return [
        semverVersion.getMajor(),
        '.',
        semverVersion.getMinor(),
        '.',
        semverVersion.getPatch(),
        '-',
        semverVersion.getPreRelease().slice(0, 5),
      ].join('');
    }
  } catch (err) {
    ErrorReporter.getInstance().notify(err as Error);
  }

  return version;
}

export function getReleaseURL(version: string): string {
  try {
    const semverVersion = new VersionImpl(version);

    if (semverVersion.getPreRelease().length > 0) {
      return `https://github.com/giantswarm/happa/commit/${semverVersion.getPreRelease()}`;
    }

    return `https://docs.giantswarm.io/changes/web-ui/happa/v${version}/`;
  } catch (err) {
    ErrorReporter.getInstance().notify(err as Error);

    return 'https://github.com/giantswarm/happa';
  }
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
    `There's a new version of the web interface available.`,
    messageType.INFO,
    messageTTL.FOREVER,
    (
      <>
        Please press the <code>{Constants.METADATA_UPDATE_LABEL}</code> button
        in the footer of the page to use the latest version (it only takes a
        couple of seconds).
      </>
    ),
    callback
  );
}
