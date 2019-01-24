'use strict';

import * as types from './actionTypes';
import { modalHide } from './modalActions';
import { flashAdd } from './flashMessageActions';
import React from 'react';
import GiantSwarmV4 from 'giantswarm-v4';
import APIClusterStatusClient from '../lib/api_status_client';
import { push } from 'connected-react-router';

// clusterSelect
// =============================================================
// Sets which cluster is in "focus". For pages that reference a
// specific cluster, the "focused" cluster will be used.
//
// The only page that really cares about that right now is the
// configure page in the getting started guide.
//

export function clusterSelect(clusterId) {
  return function(dispatch) {
    return dispatch({
      type: types.CLUSTER_SELECT,
      clusterId,
    });
  };
}

// clusterLoadDetails
// =============================================================
// Takes a clusterId and loads details for that cluster

export function clusterLoadDetails(clusterId) {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({
      type: types.CLUSTER_LOAD_DETAILS,
      clusterId,
    });

    var cluster;
    var clustersApi = new GiantSwarmV4.ClustersApi();

    return clustersApi
      .getCluster(scheme + ' ' + token, clusterId)
      .then(c => {
        cluster = c;
        return dispatch(clusterLoadStatus(clusterId));
      })
      .then(() => {
        dispatch(clusterLoadDetailsSuccess(cluster));
        return cluster;
      })
      .catch(error => {
        console.error(error);
        dispatch(clusterLoadDetailsError(clusterId, error));
        dispatch(
          flashAdd({
            message:
              'Something went wrong while trying to load cluster details. Please try again later or contact support: support@giantswarm.io',
            key: 'clusterLoadDetailFailure',
            class: 'danger',
          })
        );
        throw error;
      });
  };
}

// clusterLoadStatus
// =============================================================
// Takes a clusterId and loads status for that cluster.

export function clusterLoadStatus(clusterId) {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({
      type: types.CLUSTER_LOAD_STATUS,
      clusterId,
    });

    var apiClusterStatus = new APIClusterStatusClient({
      endpoint: window.config.apiEndpoint,
    });

    return apiClusterStatus
      .getClusterStatus(scheme + ' ' + token, clusterId)
      .then(status => {
        dispatch(clusterLoadStatusSuccess(clusterId, status));
        return status;
      })
      .catch(error => {
        console.error(error);
        if (error.status === 404) {
          dispatch(clusterLoadStatusNotFound(clusterId));
        } else {
          dispatch(clusterLoadStatusError(clusterId, error));
          dispatch(
            flashAdd({
              message:
                'Something went wrong while trying to load the cluster status. Please try again later or contact support: support@giantswarm.io',
              key: 'clusterLoadStatusFailure',
              class: 'danger',
            })
          );
          throw error;
        }
      });
  };
}

// clusterCreate
// ==============================================================
// Takes a cluster object and tries to create it. Dispatches CLUSTER_CREATE_SUCCESS
// on success or CLUSTER_DELETE_ERROR on error.

export function clusterCreate(cluster) {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({
      type: types.CLUSTER_CREATE,
      cluster,
    });

    var clustersApi = new GiantSwarmV4.ClustersApi();

    return clustersApi
      .addClusterWithHttpInfo(scheme + ' ' + token, cluster)
      .then(data => {
        var location = data.response.headers.location;
        if (location === undefined) {
          throw 'Did not get a location header back.';
        }

        var clusterId = location.split('/')[3];
        if (clusterId === undefined) {
          throw 'Did not get a valid cluster id.';
        }

        dispatch(clusterCreateSuccess(clusterId));

        dispatch(
          flashAdd({
            message: (
              <div>
                &quot;{cluster.name}&quot; with ID: &quot;{clusterId}&quot; is
                being created!
              </div>
            ),
            class: 'success',
            ttl: 3000,
          })
        );

        return dispatch(clusterLoadDetails(clusterId));
      })
      .catch(error => {
        console.error(error);
        dispatch(clusterCreateError(cluster.id, error));
        throw error;
      });
  };
}

// clusterDeleteConfirmed
// ==============================================================
// Takes a cluster object and deletes that cluster. Dispatches CLUSTER_DELETE_SUCCESS
// on success or CLUSTER_DELETE_ERROR on error.
//
// required param:
//  cluster: {id: "string", owner: "string"}

export function clusterDeleteConfirmed(cluster) {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({
      type: types.CLUSTER_DELETE_CONFIRMED,
      cluster,
    });

    var clustersApi = new GiantSwarmV4.ClustersApi();

    return clustersApi
      .deleteCluster(scheme + ' ' + token, cluster.id)
      .then(() => {
        dispatch(push('/organizations/' + cluster.owner));
        dispatch(clusterDeleteSuccess(cluster.id));

        dispatch(modalHide());
        dispatch(
          flashAdd({
            message: (
              <div>Cluster &lsquo;{cluster.id}&lsquo; deleted succesfully</div>
            ),
            class: 'success',
            ttl: 3000,
          })
        );
      })
      .catch(error => {
        dispatch(modalHide());
        dispatch(
          flashAdd({
            message: (
              <div>
                Something went wrong while trying to delete cluster:{' '}
                {cluster.id}
                <br />
                {error.body
                  ? error.body.status_text
                  : 'Perhaps our servers are down, please try again later or contact support: support@giantswarm.io'}
              </div>
            ),
            class: 'danger',
            ttl: 3000,
          })
        );

        console.error(error);
        return dispatch(clusterDeleteError(cluster.id, error));
      });
  };
}

// clusterLoadKeyPairs
// ==============================================================
// Takes a clusterId and loads its key pairs.
// dispatches CLUSTER_LOAD_KEY_PAIRS_SUCCESS on success or CLUSTER_LOAD_KEY_PAIRS_ERROR
// on error.

export function clusterLoadKeyPairs(clusterId) {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;
    var keypairsApi = new GiantSwarmV4.KeyPairsApi();

    dispatch({
      type: types.CLUSTER_LOAD_KEY_PAIRS,
      clusterId,
    });

    return keypairsApi
      .getKeyPairs(scheme + ' ' + token, clusterId)
      .then(keyPairs => {
        dispatch({
          type: types.CLUSTER_LOAD_KEY_PAIRS_SUCCESS,
          clusterId,
          keyPairs: keyPairs,
        });
      })
      .catch(error => {
        dispatch({
          type: types.CLUSTER_LOAD_KEY_PAIRS_ERROR,
          clusterId,
        });

        console.error(error);
        throw error;
      });
  };
}

export function clusterLoadDetailsSuccess(cluster) {
  return {
    type: types.CLUSTER_LOAD_DETAILS_SUCCESS,
    cluster,
  };
}

export function clusterLoadDetailsError(error) {
  return {
    type: types.CLUSTER_LOAD_DETAILS_ERROR,
    error,
  };
}

export function clusterLoadStatusSuccess(clusterId, status) {
  return {
    type: types.CLUSTER_LOAD_STATUS_SUCCESS,
    clusterId,
    status,
  };
}

export function clusterLoadStatusNotFound(clusterId) {
  return {
    type: types.CLUSTER_LOAD_STATUS_NOT_FOUND,
    clusterId,
  };
}

export function clusterLoadStatusError(error) {
  return {
    type: types.CLUSTER_LOAD_STATUS_ERROR,
    error,
  };
}

export function clusterCreateSuccess(cluster) {
  return {
    type: types.CLUSTER_CREATE_SUCCESS,
    cluster,
  };
}

export function clusterCreateError(cluster) {
  return {
    type: types.CLUSTER_CREATE_ERROR,
    cluster,
  };
}

export function clusterDelete(cluster) {
  return {
    type: types.CLUSTER_DELETE,
    cluster,
  };
}

export function clusterDeleteSuccess(clusterId) {
  return {
    type: types.CLUSTER_DELETE_SUCCESS,
    clusterId,
  };
}

export function clusterDeleteError(clusterId, error) {
  return {
    type: types.CLUSTER_DELETE_ERROR,
    clusterId,
    error,
  };
}

export function clusterLoadSuccess(clusters) {
  return {
    type: types.CLUSTER_LOAD_SUCCESS,
    clusters: clusters,
  };
}

export function clusterLoadError(error) {
  return {
    type: types.CLUSTER_LOAD_ERROR,
    error: error,
  };
}

// clusterPatch
// ==============================================================
// Takes a cluster object and tries to patch it.
// dispatches CLUSTER_PATCH_SUCCESS on success or CLUSTER_PATCH_ERROR
// on error.

export function clusterPatch(cluster) {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({
      type: types.CLUSTER_PATCH,
      cluster,
    });

    var clusterId = cluster.id;
    delete cluster.id;

    var clustersApi = new GiantSwarmV4.ClustersApi();
    return clustersApi
      .modifyCluster(scheme + ' ' + token, cluster, clusterId)
      .then(cluster => {
        dispatch({
          type: types.CLUSTER_PATCH_SUCCESS,
          cluster,
        });

        return cluster;
      })
      .catch(error => {
        dispatch({
          type: types.CLUSTER_PATCH_ERROR,
          error,
        });

        console.error(error);
        throw error;
      });
  };
}

// clusterCreateKeyPair
// ==============================================================
// Creates a keypair for a cluster.
// dispatches CLUSTER_CREATE_KEYPAIR_SUCCESS on success or CLUSTER_CREATE_KEYPAIR_ERROR
// on error.

export function clusterCreateKeyPair(clusterId, keypair) {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({
      type: types.CLUSTER_CREATE_KEY_PAIR,
      keypair,
    });

    var keypairsApi = new GiantSwarmV4.KeyPairsApi();
    return keypairsApi
      .addKeyPair(scheme + ' ' + token, clusterId, keypair)
      .then(keypair => {
        dispatch({
          type: types.CLUSTER_CREATE_KEY_PAIR_SUCCESS,
          keypair,
        });

        return keypair;
      })
      .catch(error => {
        dispatch({
          type: types.CLUSTER_CREATE_KEY_PAIR_ERROR,
          error,
        });

        console.error(error);
        throw error;
      });
  };
}
