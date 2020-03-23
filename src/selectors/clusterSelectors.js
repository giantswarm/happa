import cmp from 'semver-compare';
import {
  canClusterUpgrade,
  getCpusTotal,
  getCpusTotalNodePools,
  getMemoryTotal,
  getMemoryTotalNodePools,
  getNumberOfNodePoolsNodes,
  getNumberOfNodes,
  getStorageTotal,
} from 'utils/clusterUtils';

import { createDeepEqualSelector, typeWithoutSuffix } from './selectorUtils';

// Regular selectors
const selectClusterById = (state, props) => {
  return state.entities.clusters.items[props.cluster.id];
};

const selectNodePools = state => state.entities.nodePools.items;

const selectClusterNodePoolsIds = (state, props) => {
  return state.entities.clusters.items[props.cluster.id].nodePools;
};

export const selectClusterNodePools = (state, clusterId) => {
  const clusterNodePoolsIds =
    state.entities.clusters.items[clusterId]?.nodePools ?? [];

  // Return an empty array for v4 clusters
  if (!clusterNodePoolsIds) return [];

  const nodePools = state.entities.nodePools.items;

  return clusterNodePoolsIds.map(nodePoolId => nodePools[nodePoolId]) || [];
};

export const selectErrorByIdAndAction = (state, id, actionType) => {
  return state.errorsByEntity[id]?.[typeWithoutSuffix(actionType)] ?? null;
};

export const selectLoadingFlagByIdAndAction = (state, id, actionType) => {
  return (
    state.loadingFlagsByEntity[id]?.[typeWithoutSuffix(actionType)] ?? null
  );
};

export const selectLoadingFlagByAction = (state, actionType) => {
  return state.loadingFlags[typeWithoutSuffix(actionType)] ?? null;
};

export const selectErrorByAction = (state, actionType) => {
  return state.errors[typeWithoutSuffix(actionType)] ?? null;
};

export const selectErrorMessageByIdAndAction = (state, id, actionType) => {
  return (
    state.errorsByEntity[id]?.[typeWithoutSuffix(actionType)].message ?? null
  );
};

export const selectErrorMessageByAction = (state, actionType) => {
  return state.errors[typeWithoutSuffix(actionType)].message ?? null;
};

// Memoized Reselect selectors
// https://github.com/reduxjs/reselect#createselectorinputselectors--inputselectors-resultfunc
// Using factory functions because they create new references each time that are called,
// so each cluster can have its dedicated function. More info:
// https://github.com/reduxjs/reselect#sharing-selectors-with-props-across-multiple-component-instances

export const selectResourcesV4 = () =>
  createDeepEqualSelector(selectClusterById, cluster => {
    // In case status call fails.
    if (
      !cluster ||
      !cluster.status ||
      !cluster.status.cluster.nodes ||
      cluster.status.cluster.nodes.length === 0
    ) {
      return { numberOfNodes: 0, memory: 0, cores: 0, storage: 0 };
    }

    const numberOfNodes = getNumberOfNodes(cluster);
    const memory = getMemoryTotal(
      numberOfNodes,
      cluster.workers[0].memory.size_gb // workers are not stored yet
    );
    const cores = getCpusTotal(numberOfNodes, cluster.workers);
    // Filter for just KVM in components
    const storage = getStorageTotal(cluster);

    return { numberOfNodes, memory, cores, storage };
  });

export const selectResourcesV5 = () =>
  createDeepEqualSelector(
    [selectNodePools, selectClusterNodePoolsIds],
    (nodePools, clusterNodePoolsIds) => {
      // TODO This is not being memoized correctly, investigate further
      const clusterNodePools =
        // nodePools &&
        Object.entries(nodePools).length !== 0 && clusterNodePoolsIds
          ? clusterNodePoolsIds.map(np => nodePools[np])
          : [];

      const numberOfNodes = getNumberOfNodePoolsNodes(clusterNodePools);
      const memory = getMemoryTotalNodePools(clusterNodePools);
      const cores = getCpusTotalNodePools(clusterNodePools);

      return { numberOfNodes, memory, cores };
    }
  );

export const selectAndProduceAZGridTemplateAreas = () =>
  createDeepEqualSelector(selectClusterNodePools, nodePools => {
    const allZones = nodePools
      ? nodePools
          .reduce((accumulator, current) => {
            return [...accumulator, ...current.availability_zones];
          }, [])
          .map(zone => zone.slice(-1))
      : [];

    // This array stores available zones that are in at least one node pool.
    // We only want unique values because this is used fot building the grid.
    const availableZonesGridTemplateAreas = [...new Set(allZones)]
      .sort()
      .join(' ');

    return `"${availableZonesGridTemplateAreas}"`;
  });

export const selectTargetRelease = (state, cluster) => {
  if (!cluster || Object.keys(state.entities.releases.items).length === 0)
    return null;

  const releases = state.entities.releases.items;
  const availableVersions = Object.keys(releases)
    .filter(release => releases[release].active)
    .sort(cmp);

  // Guard against the release version of this cluster not being in the /v4/releases/
  // response.
  // This will ensure that Happa can calculate the target version for upgrade
  // correctly.
  if (!availableVersions.includes(cluster.release_version)) {
    availableVersions.push(cluster.release_version);
    availableVersions.sort(cmp);
  }

  const indexCurrentVersion = availableVersions.indexOf(
    cluster.release_version
  );

  if (availableVersions.length > indexCurrentVersion) {
    return availableVersions[indexCurrentVersion + 1];
  }

  return null;
};

export const selectCanClusterUpgrade = (state, clusterID) => {
  const cluster = state.entities.clusters.items[clusterID];

  if (!cluster) return false;

  const targetVersion = selectTargetRelease(state, cluster);

  // eslint-disable-next-line consistent-return
  return canClusterUpgrade(
    cluster.release_version,
    targetVersion,
    state.main.info.general.provider
  );
};
