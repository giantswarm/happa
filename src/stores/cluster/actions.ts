import GiantSwarm from 'giantswarm';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import moment from 'moment';
import { ThunkAction } from 'redux-thunk';
import { Providers, StatusCodes } from 'shared/constants';
import { IKeyPair, PropertiesOf } from 'shared/types';
import {
  CLUSTER_CREATE_ERROR,
  CLUSTER_CREATE_KEY_PAIR_ERROR,
  CLUSTER_CREATE_KEY_PAIR_REQUEST,
  CLUSTER_CREATE_KEY_PAIR_SUCCESS,
  CLUSTER_CREATE_REQUEST,
  CLUSTER_CREATE_SUCCESS,
  CLUSTER_DELETE_CONFIRMED,
  CLUSTER_DELETE_ERROR,
  CLUSTER_DELETE_REQUEST,
  CLUSTER_DELETE_SUCCESS,
  CLUSTER_LOAD_DETAILS_ERROR,
  CLUSTER_LOAD_DETAILS_REQUEST,
  CLUSTER_LOAD_DETAILS_SUCCESS,
  CLUSTER_LOAD_KEY_PAIRS_ERROR,
  CLUSTER_LOAD_KEY_PAIRS_REQUEST,
  CLUSTER_LOAD_KEY_PAIRS_SUCCESS,
  CLUSTER_LOAD_STATUS_ERROR,
  CLUSTER_LOAD_STATUS_NOT_FOUND,
  CLUSTER_LOAD_STATUS_REQUEST,
  CLUSTER_LOAD_STATUS_SUCCESS,
  CLUSTER_PATCH,
  CLUSTER_PATCH_ERROR,
  CLUSTER_REMOVE_FROM_STORE,
  CLUSTERS_DETAILS_FINISHED,
  CLUSTERS_DETAILS_REQUEST,
  CLUSTERS_LIST_ERROR,
  CLUSTERS_LIST_REFRESH_ERROR,
  CLUSTERS_LIST_REFRESH_REQUEST,
  CLUSTERS_LIST_REFRESH_SUCCESS,
  CLUSTERS_LIST_REQUEST,
  CLUSTERS_LIST_SUCCESS,
  V5_CLUSTER_CREATE_SUCCESS,
} from 'stores/cluster/constants';
import {
  ClusterActions,
  IClusterCreateActionResponse,
} from 'stores/cluster/types';
import { computeCapabilities, filterLabels } from 'stores/cluster/utils';
import { IState } from 'stores/state';

export function clusterDelete(cluster: Cluster): ClusterActions {
  return {
    type: CLUSTER_DELETE_REQUEST,
    cluster,
  };
}

export function clustersList(opts: {
  withLoadingFlags?: boolean;
}): ThunkAction<Promise<void>, IState, void, ClusterActions> {
  return async (dispatch, getState) => {
    try {
      if (opts.withLoadingFlags) dispatch({ type: CLUSTERS_LIST_REQUEST });

      const provider = getState().main.info.general.provider;
      const makeCapabilities = computeCapabilities(getState());
      const clustersApi = new GiantSwarm.ClustersApi();
      const response = await clustersApi.getClusters();
      const clusters = reduceClustersIntoMap(
        (response as unknown) as Cluster[],
        provider,
        makeCapabilities
      );

      const v5ClusterIds = response
        .filter((cluster) => cluster.path.startsWith('/v5'))
        .map((cluster) => cluster.id);

      dispatch({
        type: CLUSTERS_LIST_SUCCESS,
        clusters,
        v5ClusterIds,
      });
    } catch (err) {
      dispatch({
        type: CLUSTERS_LIST_ERROR,
        error: err.message,
      });
    }
  };
}

export function refreshClustersList(): ThunkAction<
  Promise<void>,
  IState,
  void,
  ClusterActions
> {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: CLUSTERS_LIST_REFRESH_REQUEST });

      const provider = getState().main.info.general.provider;
      const clusterStoredIds = Object.keys(getState().entities.clusters.items);
      const makeCapabilities = computeCapabilities(getState());
      const clustersApi = new GiantSwarm.ClustersApi();
      const response = await clustersApi.getClusters();

      const newClusters = response.filter(
        (cluster) => !clusterStoredIds.includes(cluster.id)
      );
      const clusters = reduceClustersIntoMap(
        (newClusters as unknown) as Cluster[],
        provider,
        makeCapabilities
      );

      const v5ClusterIds = newClusters
        .filter((cluster) => cluster.path.startsWith('/v5'))
        .map((cluster) => cluster.id);

      dispatch({
        type: CLUSTERS_LIST_REFRESH_SUCCESS,
        clusters,
        v5ClusterIds,
      });
    } catch (err) {
      dispatch({
        type: CLUSTERS_LIST_REFRESH_ERROR,
        error: err.message,
      });
    }
  };
}

export function clustersDetails(opts: {
  filterBySelectedOrganization?: boolean;
  withLoadingFlags?: boolean;
  initializeNodePools?: boolean;
}): ThunkAction<Promise<void>, IState, void, ClusterActions> {
  return async (dispatch, getState) => {
    if (opts.withLoadingFlags) {
      dispatch({ type: CLUSTERS_DETAILS_REQUEST });
    }

    const selectedOrganization = getState().main.selectedOrganization;
    const allClusters = getState().entities.clusters.items;

    // Remove deleted clusters from clusters array
    const allActiveClustersIds = Object.keys(allClusters).filter(
      (id) => !allClusters[id].delete_date
    );

    const clustersIds = opts.filterBySelectedOrganization
      ? allActiveClustersIds.filter(
          (id) => allClusters[id].owner === selectedOrganization
        )
      : allActiveClustersIds;

    await Promise.all(
      clustersIds.map((id) =>
        dispatch(
          clusterLoadDetails(id, {
            withLoadingFlags: opts.withLoadingFlags,
            initializeNodePools: opts.initializeNodePools,
          })
        )
      )
    );

    dispatch({ type: CLUSTERS_DETAILS_FINISHED });
  };
}

export function clusterLoadDetails(
  clusterId: string,
  opts: { withLoadingFlags?: boolean; initializeNodePools?: boolean }
): ThunkAction<Promise<Cluster>, IState, void, ClusterActions> {
  return async (dispatch, getState) => {
    const v5Clusters = getState().entities.clusters.v5Clusters;
    const isV5Cluster = v5Clusters.includes(clusterId);

    try {
      if (opts.withLoadingFlags) {
        dispatch({
          type: CLUSTER_LOAD_DETAILS_REQUEST,
          id: clusterId,
        });
      }

      const clustersApi = new GiantSwarm.ClustersApi();
      const getClusterDetails = isV5Cluster
        ? clustersApi.getClusterV5.bind(clustersApi)
        : clustersApi.getCluster.bind(clustersApi);
      const cluster = ((await getClusterDetails(
        clusterId
      )) as unknown) as Cluster;

      // We don't want this action to overwrite nodepools except on initialization.
      if (isV5Cluster && opts.initializeNodePools)
        (cluster as V5.ICluster).nodePools = [];

      const provider = getState().main.info.general.provider;
      cluster.capabilities = computeCapabilities(getState())(
        cluster.release_version ?? '',
        provider
      );

      if (!isV5Cluster) {
        /**
         * Since the API omits the 'aws' key from workers on kvm installations, I will
         * add it back here with dummy values if it is not present.
         */
        if (!(cluster as V4.ICluster).workers) {
          (cluster as V4.ICluster).workers = [];
        }
        (cluster as V4.ICluster).workers = ((cluster as V4.ICluster)
          .workers as V4.IClusterWorker[]).map((worker) => {
          if (!worker.aws) worker.aws = { instance_type: '' };

          return worker;
        });

        (cluster as V4.ICluster).status = await dispatch(
          clusterLoadStatus(clusterId, {
            withLoadingFlags: opts.withLoadingFlags,
          })
        );
      }

      if ((cluster as V5.ICluster).labels) {
        (cluster as V5.ICluster).labels = filterLabels(
          (cluster as V5.ICluster).labels
        );
      }

      dispatch({
        type: CLUSTER_LOAD_DETAILS_SUCCESS,
        cluster,
        id: clusterId,
      });

      return (cluster as unknown) as Cluster;
    } catch (error) {
      if (error.response?.status === StatusCodes.NotFound) {
        // Delete the cluster in the store.
        dispatch({
          type: CLUSTER_REMOVE_FROM_STORE,
          clusterId,
          isV5Cluster,
        });

        return Promise.resolve({} as Cluster);
      }

      dispatch({
        type: CLUSTER_LOAD_DETAILS_ERROR,
        id: clusterId,
        error,
      });

      let errorMessage = `Something went wrong while trying to load cluster details for <code>${clusterId}</code>.`;
      if (error.response?.message || error.message) {
        errorMessage = `There was a problem loading the cluster details: ${
          error.response?.message ?? error.message
        }`;
      }

      new FlashMessage(
        errorMessage,
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again later or contact support: support@giantswarm.io'
      );

      return Promise.resolve({} as Cluster);
    }
  };
}

function clusterLoadStatus(
  clusterId: string,
  opts: { withLoadingFlags?: boolean }
): ThunkAction<Promise<V4.IClusterStatus>, IState, void, ClusterActions> {
  return async (dispatch) => {
    try {
      if (opts.withLoadingFlags) {
        dispatch({ type: CLUSTER_LOAD_STATUS_REQUEST, clusterId });
      }

      const clustersApi = new GiantSwarm.ClustersApi();
      const response = await clustersApi.getClusterStatusWithHttpInfo(
        clusterId
      );
      dispatch({ type: CLUSTER_LOAD_STATUS_SUCCESS, clusterId });

      // FIXME(axbarsan): Find the real types of the API response.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return JSON.parse((response as any).response.text);
    } catch (err) {
      if (err.status === StatusCodes.NotFound) {
        dispatch({ type: CLUSTER_LOAD_STATUS_NOT_FOUND, clusterId });
      } else {
        dispatch({ type: CLUSTER_LOAD_STATUS_ERROR, error: err });

        let errorMessage =
          'Something went wrong while trying to load the cluster status.';
        if (err.response?.message || err.message) {
          errorMessage = `There was a problem loading the cluster status: ${
            err.response?.message ?? err.message
          }`;
        }

        new FlashMessage(
          errorMessage,
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again later or contact support: support@giantswarm.io'
        );
      }

      return Promise.resolve();
    }
  };
}

export function clusterCreate(
  cluster: Cluster,
  isV5Cluster: boolean
): ThunkAction<
  Promise<IClusterCreateActionResponse | null>,
  IState,
  void,
  ClusterActions
> {
  return async (dispatch) => {
    try {
      dispatch({ type: CLUSTER_CREATE_REQUEST });

      const clustersApi = new GiantSwarm.ClustersApi();
      const createCluster = isV5Cluster
        ? clustersApi.addClusterV5WithHttpInfo.bind(clustersApi)
        : clustersApi.addClusterWithHttpInfo.bind(clustersApi);
      const response = await createCluster(cluster as never);
      // FIXME(axbarsan): Find the real types of the API response.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const location = (response as any).response.headers.location;
      if (typeof location === 'undefined') {
        throw new Error('Did not get a location header back.');
      }

      const clusterIdURLParamIndex = 3;
      const clusterId = location.split('/')[clusterIdURLParamIndex];
      if (typeof clusterId === 'undefined') {
        throw new Error('Did not get a valid cluster ID.');
      }

      if (isV5Cluster) {
        dispatch({
          type: V5_CLUSTER_CREATE_SUCCESS,
          clusterId,
        });
      } else {
        dispatch({
          type: CLUSTER_CREATE_SUCCESS,
          clusterId,
        });
      }

      return { clusterId, owner: cluster.owner };
    } catch (error) {
      dispatch({ type: CLUSTER_CREATE_ERROR, error: error.message });

      new FlashMessage(
        'An error occurred when trying to create the cluster.',
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again later or contact support: support@giantswarm.io'
      );
    }

    return null;
  };
}

export function clusterDeleteConfirmed(
  cluster: Cluster
): ThunkAction<Promise<void>, IState, void, ClusterActions> {
  return async (dispatch) => {
    try {
      dispatch({
        type: CLUSTER_DELETE_CONFIRMED,
        cluster,
      });

      const clustersApi = new GiantSwarm.ClustersApi();
      await clustersApi.deleteCluster(cluster.id);

      dispatch({
        type: CLUSTER_DELETE_SUCCESS,
        clusterId: cluster.id,
        timestamp: new Date().toISOString(),
      });

      new FlashMessage(
        `Cluster <code>${cluster.id}</code> will be deleted`,
        messageType.INFO,
        messageTTL.SHORT
      );
    } catch (err) {
      new FlashMessage(
        `An error occurred when trying to delete cluster <code>${cluster.id}</code>.`,
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again later or contact support: support@giantswarm.io'
      );

      dispatch({
        type: CLUSTER_DELETE_ERROR,
        clusterId: cluster.id,
        error: err,
      });
    }
  };
}

export function clusterPatch(
  cluster: Cluster,
  payload: Partial<Cluster>,
  reloadCluster = false
): ThunkAction<Promise<void>, IState, void, ClusterActions> {
  return async (dispatch, getState) => {
    try {
      const v5Clusters = getState().entities.clusters.v5Clusters;
      const isV5Cluster = v5Clusters.includes(cluster.id);

      // Optimistic update.
      dispatch({
        type: CLUSTER_PATCH,
        cluster,
        payload,
      });

      const clustersApi = new GiantSwarm.ClustersApi();
      const modifyCluster = isV5Cluster
        ? clustersApi.modifyClusterV5.bind(clustersApi)
        : clustersApi.modifyCluster.bind(clustersApi);

      await modifyCluster(cluster.id, payload as never);

      if (reloadCluster) {
        await dispatch(
          clusterLoadDetails(cluster.id, {
            withLoadingFlags: false,
            initializeNodePools: false,
          })
        );
      }

      return Promise.resolve();
    } catch (error) {
      // Undo update to store if the API call fails.
      dispatch({
        type: CLUSTER_PATCH_ERROR,
        error,
        cluster,
      });

      new FlashMessage(
        'Something went wrong while trying to update the cluster',
        messageType.ERROR,
        messageTTL.MEDIUM,
        'Please try again later or contact support: support@giantswarm.io'
      );

      return Promise.reject(error);
    }
  };
}

export function clusterLoadKeyPairs(
  clusterId: string
): ThunkAction<Promise<void>, IState, void, ClusterActions> {
  return async (dispatch) => {
    try {
      dispatch({ type: CLUSTER_LOAD_KEY_PAIRS_REQUEST });

      const keypairsApi = new GiantSwarm.KeyPairsApi();
      const response = await keypairsApi.getKeyPairs(clusterId);
      const keyPairs = Object.values(response).map((keyPair) => {
        keyPair.expire_date = moment(keyPair.create_date)
          .utc()
          .add(keyPair.ttl_hours, 'hours');

        return keyPair;
      });

      dispatch({
        type: CLUSTER_LOAD_KEY_PAIRS_SUCCESS,
        clusterId,
        keyPairs,
      });
    } catch {
      dispatch({
        type: CLUSTER_LOAD_KEY_PAIRS_ERROR,
        clusterId,
      });
    }
  };
}

export function clusterCreateKeyPair(
  clusterId: string,
  payload: IKeyPair
): ThunkAction<Promise<IKeyPair>, IState, void, ClusterActions> {
  return async (dispatch) => {
    try {
      dispatch({
        type: CLUSTER_CREATE_KEY_PAIR_REQUEST,
        keypair: payload,
      });

      const keypairsApi = new GiantSwarm.KeyPairsApi();
      const keypair = ((await keypairsApi.addKeyPair(
        clusterId,
        payload
      )) as unknown) as IKeyPair;
      dispatch({
        type: CLUSTER_CREATE_KEY_PAIR_SUCCESS,
        keypair,
      });

      return keypair;
    } catch (err) {
      dispatch({
        type: CLUSTER_CREATE_KEY_PAIR_ERROR,
        error: err,
      });

      return Promise.reject(err);
    }
  };
}

function reduceClustersIntoMap(
  clusters: Array<Cluster>,
  provider: PropertiesOf<typeof Providers>,
  makeCapabilities: (
    releaseVersion: string,
    provider: PropertiesOf<typeof Providers>
  ) => IClusterCapabilities
): IClusterMap {
  return clusters.reduce((agg: IClusterMap, curr: Cluster) => {
    const newCluster = {
      ...curr,
      lastUpdated: Date.now(),
      keyPairs: curr.keyPairs || [],
      capabilities: makeCapabilities(curr.release_version ?? '', provider),
    };

    if ((curr as V5.ICluster).labels) {
      (curr as V5.ICluster).labels = filterLabels((curr as V5.ICluster).labels);
    }

    agg[newCluster.id] = newCluster;

    return agg;
  }, {});
}
