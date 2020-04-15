import { SelfClient } from 'model/clients/SelfClient';
import {
  getConfiguration,
  IMetadataConfiguration,
} from 'model/services/metadata';
import { IState } from 'reducers/types';
import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { Constants } from 'shared/constants';

import * as actionTypes from './actionTypes';

interface IMetadataSetVersionAction {
  type: typeof actionTypes.METADATA_UPDATE_SET_VERSION;
  version: string;
}

interface IMetadataCheckForUpdatesAction {
  type: typeof actionTypes.METADATA_UPDATE_CHECK;
  timestamp: number;
}

interface IMetadataScheduleUpdateAction {
  type: typeof actionTypes.METADATA_UPDATE_SCHEDULE;
  version: string;
}

interface IMetadataExecuteUpdateAction {
  type: typeof actionTypes.METADATA_UPDATE_EXECUTE;
}

type MetadataActions =
  | IMetadataSetVersionAction
  | IMetadataCheckForUpdatesAction
  | IMetadataScheduleUpdateAction
  | IMetadataExecuteUpdateAction;

export const setInitialVersion = (): ThunkAction<
  Promise<void>,
  IState,
  void,
  MetadataActions
> => {
  return async (dispatch: Dispatch<MetadataActions>): Promise<void> => {
    let version: string = 'VERSION';

    try {
      const httpClient = new SelfClient();
      const configurationRes = await getConfiguration(httpClient);
      // Casting as correct type until the model layer is rewritten in TypeScript
      version = ((configurationRes.data as unknown) as IMetadataConfiguration)
        .version;
    } catch {
      // Do nothing
    } finally {
      dispatch({
        type: actionTypes.METADATA_UPDATE_SET_VERSION,
        version,
      });
    }
  };
};

/**
 * Check if there's a new version of the app available
 * @param callback - Callback to execute after the check has been made
 */
export const checkForUpdates = (
  callback?: () => void
): ThunkAction<Promise<void>, IState, void, MetadataActions> => {
  return async (
    dispatch: Dispatch<MetadataActions>,
    getState: () => IState
  ): Promise<void> => {
    dispatch({
      type: actionTypes.METADATA_UPDATE_CHECK,
      timestamp: Date.now(),
    });

    try {
      const currentVersion: string = getState().main.metadata.version.current;
      const scheduledVersion: string | null = getState().main.metadata.version
        .new;
      const httpClient = new SelfClient();
      const configurationRes = await getConfiguration(httpClient);

      // Casting as correct type until the model layer is rewritten in TypeScript
      const newVersion = ((configurationRes.data as unknown) as IMetadataConfiguration)
        .version;

      if (newVersion !== scheduledVersion && newVersion !== currentVersion) {
        dispatch({
          type: actionTypes.METADATA_UPDATE_SCHEDULE,
          version: newVersion,
        });
      }
    } catch {
      // Do nothing
    } finally {
      // eslint-disable-next-line no-unused-expressions
      callback?.();
    }
  };
};

/**
 * Register a checker that will permanently check if the app has been updated
 * @param dispatch - Redux `dispatch` function
 * @param timeout - Time to wait in between checks
 */
export const registerUpdateChecker = (
  dispatch: Dispatch,
  timeout: number = Constants.DEFAULT_METADATA_CHECK_PERIOD
) => {
  const callback = () => {
    window.setTimeout(dispatch, timeout, checkForUpdates(callback));
  };

  callback();
};

/**
 * Schedule an app update
 * Give a few seconds of breathing room, to be able to display
 * that there is an update in progress in the UI
 * @param timeout - The timeout between the update gets executed
 */
export const executeUpdate = (
  timeout: number = Constants.DEFAULT_METADATA_UPDATE_TIMEOUT
): ThunkAction<Promise<void>, IState, void, MetadataActions> => {
  return async (dispatch: Dispatch<MetadataActions>): Promise<void> => {
    dispatch({
      type: actionTypes.METADATA_UPDATE_EXECUTE,
    });

    return new Promise((resolve: () => void) => {
      window.setTimeout(() => {
        resolve();

        window.location.reload();
      }, timeout);
    });
  };
};
