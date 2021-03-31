import { compare } from 'lib/semver';
import {
  canClusterUpgrade,
  getCpusTotal,
  getMemoryTotal,
  getNumberOfNodes,
  getStorageTotal,
  isClusterCreating,
  isClusterUpdating,
} from 'stores/cluster/utils';
import { getUserIsAdmin } from 'stores/main/selectors';
import { selectOrganizationByID } from 'stores/organization/selectors';
import { isPreRelease } from 'stores/releases/utils';
import { IState } from 'stores/state';
import { createDeepEqualSelector } from 'stores/utils';

export const selectClusters = () => (
  state: IState
): Record<string, Cluster> | undefined => {
  return state.entities.clusters.items;
};

export function selectClusterById(
  state: IState,
  id: string
): Cluster | undefined {
  return state.entities.clusters.items[id];
}

function selectOrganizationClusterNames(state: IState): string[] {
  const clusters = state.entities.clusters.items;
  const clusterIds = Object.keys(clusters);
  const selectedOrganization =
    state.main.selectedOrganization?.toLowerCase() ?? '';
  const organizationID =
    selectOrganizationByID(selectedOrganization)(state)?.id ??
    selectedOrganization;

  return clusterIds
    .filter((id) => clusters[id].owner === organizationID)
    .sort((a, b) =>
      (clusters[a].name as string) > (clusters[b].name as string) ? 1 : -1
    );
}

/**
 * Using factory functions because they create new references each time that are called,
 * so each cluster can have its dedicated function. More info:
 * https://github.com/reduxjs/reselect#sharing-selectors-with-props-across-multiple-component-instances
 */
export function selectClustersList() {
  return createDeepEqualSelector(
    selectOrganizationClusterNames,
    (clusters) => clusters
  );
}

export function selectResourcesV4() {
  return createDeepEqualSelector(
    selectClusterById,
    (cluster: Cluster | undefined) => {
      if (
        ((cluster as V4.ICluster | undefined)?.status?.cluster?.nodes?.length ??
          0) > 0
      ) {
        const numberOfNodes = getNumberOfNodes(cluster as V4.ICluster);
        const memory = getMemoryTotal(cluster as V4.ICluster);
        const cores = getCpusTotal(cluster as V4.ICluster);
        const storage = getStorageTotal(cluster as V4.ICluster);

        return { numberOfNodes, memory, cores, storage };
      }

      return { numberOfNodes: 0, memory: 0, cores: 0, storage: 0 };
    }
  );
}

export function selectTargetRelease(state: IState, cluster?: Cluster | null) {
  if (!cluster || Object.keys(state.entities.releases.items).length === 0)
    return null;

  const releases = Object.assign({}, state.entities.releases.items);
  const clusterReleaseVersion = cluster.release_version ?? '';
  const isAdmin = getUserIsAdmin(state);

  if (!releases[clusterReleaseVersion]) {
    releases[clusterReleaseVersion] = {} as IRelease;
  }
  const availableVersions = Object.keys(releases).sort(compare);

  let nextVersion = null;
  let currVersionFound = false;
  for (let i = 0; i < availableVersions.length; i++) {
    if (availableVersions[i] === clusterReleaseVersion) {
      currVersionFound = true;

      continue;
    }
    if (!currVersionFound) continue;

    if (
      releases[availableVersions[i]].active &&
      !isPreRelease(availableVersions[i])
    ) {
      nextVersion = availableVersions[i];

      break;
    }

    if (isAdmin && !nextVersion) {
      nextVersion = availableVersions[i];
    }
  }

  return nextVersion;
}

export const selectIsClusterAwaitingUpgrade = (clusterID: string) => (
  state: IState
) => {
  return Boolean(state.entities.clusters.idsAwaitingUpgrade[clusterID]);
};

export const selectCanClusterUpgrade = (clusterID: string) => (
  state: IState
) => {
  const cluster = state.entities.clusters.items[clusterID];
  if (!cluster) return false;

  if (
    isClusterCreating(cluster) ||
    isClusterUpdating(cluster) ||
    selectIsClusterAwaitingUpgrade(clusterID)(state)
  ) {
    return false;
  }

  const targetVersion = selectTargetRelease(state, cluster);

  return canClusterUpgrade(
    cluster.release_version,
    targetVersion,
    state.main.info.general.provider
  );
};

export const selectIsClusterUpgrading = (clusterID: string) => (
  state: IState
) => {
  const cluster = state.entities.clusters.items[clusterID];
  if (!cluster) return false;

  return isClusterUpdating(cluster);
};
