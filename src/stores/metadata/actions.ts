import ErrorReporter from 'lib/errors/ErrorReporter';
import { SelfClient } from 'model/clients/SelfClient';
import { getConfiguration } from 'model/services/metadata/configuration';
import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { Constants } from 'shared/constants';
import { createAsynchronousAction } from 'stores/asynchronousAction';
import {
  METADATA_UPDATE_CHECK,
  METADATA_UPDATE_EXECUTE,
  METADATA_UPDATE_SCHEDULE,
  METADATA_UPDATE_SET_TIMER,
  METADATA_UPDATE_SET_VERSION,
  METADATA_UPDATE_START_CHECK,
} from 'stores/metadata/constants';
import {
  getMetadataCurrentVersion,
  getMetadataNewVersion,
  getMetadataUpdateTimer,
} from 'stores/metadata/selectors';
import { MetadataAction } from 'stores/metadata/types';
import { IState } from 'stores/state';

export const setInitialVersion = createAsynchronousAction<
  undefined,
  IState,
  string
>({
  actionTypePrefix: METADATA_UPDATE_SET_VERSION,
  perform: async (_, _d): Promise<string> => {
    const httpClient = new SelfClient();
    const configurationRes = await getConfiguration(httpClient);

    return configurationRes.data.version;
  },
  shouldPerform: () => true,
  throwOnError: false,
});

/**
 * Check if there's a new version of the app available.
 * @param callback - Callback to execute after the check has been made.
 */
const checkForUpdates = createAsynchronousAction<() => void, IState, void>({
  actionTypePrefix: METADATA_UPDATE_START_CHECK,
  perform: async (state, dispatch, callback): Promise<void> => {
    dispatch({
      type: METADATA_UPDATE_CHECK,
      timestamp: Date.now(),
    });

    try {
      const currentVersion: string = getMetadataCurrentVersion(state);
      const scheduledVersion: string | null = getMetadataNewVersion(state);

      const httpClient = new SelfClient();
      const configurationRes = await getConfiguration(httpClient);
      const newVersion = configurationRes.data.version;

      if (newVersion !== scheduledVersion && newVersion !== currentVersion) {
        dispatch({
          type: METADATA_UPDATE_SCHEDULE,
          version: newVersion,
        });
      }
    } catch (err) {
      ErrorReporter.getInstance().notify(err as Error);
    } finally {
      callback?.();
    }
  },
  shouldPerform: () => true,
  throwOnError: false,
});

/**
 * Register a checker that will permanently check if the app has been updated.
 * @param timeout - Time to wait in between checks.
 */
export const registerUpdateChecker = (
  timeout: number = Constants.DEFAULT_METADATA_CHECK_PERIOD
): ThunkAction<void, IState, void, MetadataAction> => {
  return (dispatch: Dispatch<MetadataAction>, getState: () => IState): void => {
    const existingTimeout: number = getMetadataUpdateTimer(getState());
    window.clearTimeout(existingTimeout);

    const callback = () => {
      dispatch({
        type: METADATA_UPDATE_SET_TIMER,
        timer: window.setTimeout(dispatch, timeout, checkForUpdates(callback)),
      });
    };

    callback();
  };
};

/**
 * Schedule an app update.
 * Give a few seconds of breathing room, to be able to display
 * that there is an update in progress in the UI.
 * @param timeout - The timeout between the update gets executed.
 */
export const executeUpdate = createAsynchronousAction<number, IState, void>({
  actionTypePrefix: METADATA_UPDATE_EXECUTE,
  perform: (
    _,
    _d,
    timeout: number = Constants.DEFAULT_METADATA_UPDATE_TIMEOUT
  ): Promise<void> => {
    return new Promise((resolve: () => void) => {
      window.setTimeout(() => {
        resolve();

        window.location.reload();
      }, timeout);
    });
  },
  shouldPerform: () => true,
  throwOnError: false,
});
