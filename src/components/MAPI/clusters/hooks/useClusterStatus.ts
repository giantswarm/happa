import { ProviderCluster } from 'MAPI/types';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import {
  getIsImpersonatingNonAdmin,
  getUserIsAdmin,
} from 'model/stores/main/selectors';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import {
  ClusterStatus,
  getClusterConditions,
  getClusterUpdateSchedule,
  IClusterUpdateSchedule,
  isClusterUpgradable,
} from '../utils';

export function useClusterStatus(
  cluster?: capiv1beta1.ICluster,
  providerCluster?: ProviderCluster,
  releases?: releasev1alpha1.IRelease[]
): { status?: ClusterStatus; clusterUpdateSchedule?: IClusterUpdateSchedule } {
  const isAdmin = useSelector(getUserIsAdmin);
  const isImpersonatingNonAdmin = useSelector(getIsImpersonatingNonAdmin);
  const provider = window.config.info.general.provider;
  const { isConditionUnknown, isCreating, isUpgrading, isDeleting } =
    getClusterConditions(cluster, providerCluster);

  const isUpgradable = useMemo(
    () =>
      cluster &&
      isClusterUpgradable(
        cluster,
        provider,
        isAdmin && !isImpersonatingNonAdmin,
        releases
      ),
    [cluster, provider, isAdmin, isImpersonatingNonAdmin, releases]
  );

  const clusterUpdateSchedule = getClusterUpdateSchedule(cluster);

  if (typeof cluster === 'undefined') {
    return { status: undefined };
  }

  switch (true) {
    case isDeleting:
      return { status: ClusterStatus.DeletionInProgress };

    case isConditionUnknown:
    case isCreating:
      return { status: ClusterStatus.CreationInProgress };

    case isUpgrading:
      return { status: ClusterStatus.UpgradeInProgress };

    case typeof clusterUpdateSchedule !== 'undefined':
      return { status: ClusterStatus.UpgradeScheduled, clusterUpdateSchedule };

    case isUpgradable:
      return { status: ClusterStatus.UpgradeAvailable };

    default:
      return { status: ClusterStatus.Idle };
  }
}
