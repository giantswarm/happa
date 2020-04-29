import GiantSwarm from 'giantswarm';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { Dispatch } from 'redux';

import {
  CLUSTER_LABEL_UPDATE_ERROR,
  CLUSTER_LABEL_UPDATE_REQUEST,
  CLUSTER_LABEL_UPDATE_SUCCESS,
} from './actionTypes';

// API instantiations.
const clusterLabelsApi = new GiantSwarm.ClusterLabelsApi();

/**
 * Takes cluster id and tries to update its labels.
 * Dispatches NODEPOOL_PATCH on patch and NODEPOOL_PATCH_ERROR
 * on error.
 *
 * @param {String} clusterId
 * @param {Object} labels Modification object
 */
export function clusterLabelsPatch(
  clusterId: string,
  labels: GiantSwarm.V5ClusterLabels
) {
  return function (dispatch: Dispatch) {
    dispatch({
      type: CLUSTER_LABEL_UPDATE_REQUEST,
      labels,
    });

    const payload: GiantSwarm.V5ClusterLabelsResponse = { labels };

    return clusterLabelsApi
      .setClusterLabels(clusterId, payload)
      .then((response: GiantSwarm.V5ClusterLabelsResponse) => {
        dispatch({
          type: CLUSTER_LABEL_UPDATE_SUCCESS,
          clusterId,
          labels: response.labels,
        });

        new FlashMessage(
          `Labels of cluster <code>${clusterId}</code> have been updated`,
          messageType.INFO,
          messageTTL.SHORT
        );
      })
      .catch((error) => {
        // Undo update to store if the API call fails.
        dispatch({
          type: CLUSTER_LABEL_UPDATE_ERROR,
          error,
          clusterId,
        });

        new FlashMessage(
          'Something went wrong while trying to update cluster labels',
          messageType.ERROR,
          messageTTL.MEDIUM,
          'Please try again later or contact support: support@giantswarm.io'
        );

        // eslint-disable-next-line no-console
        console.error(error);

        throw error;
      });
  };
}
