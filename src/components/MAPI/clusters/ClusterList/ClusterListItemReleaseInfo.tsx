import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import React, { useEffect, useMemo } from 'react';
import ClusterListItemMainInfo, {
  ClusterListItemMainInfoVariant,
} from 'UI/Display/MAPI/clusters/ClusterList/ClusterListItemMainInfo';

interface IClusterListItemReleaseInfoProps {
  handleIsPreviewRelease?: (isPreviewRelease: boolean) => void;
  cluster?: capiv1beta1.ICluster;
  releases?: releasev1alpha1.IRelease[];
  canListReleases?: boolean;
}

const ClusterListItemReleaseInfo: React.FC<
  IClusterListItemReleaseInfoProps
> = ({ cluster, releases, canListReleases, handleIsPreviewRelease }) => {
  const releaseVersion = cluster
    ? capiv1beta1.getReleaseVersion(cluster)
    : undefined;

  const release = useMemo(() => {
    const formattedReleaseVersion = `v${releaseVersion}`;

    if (!releases) return undefined;

    return releases.find((r) => r.metadata.name === formattedReleaseVersion);
  }, [releases, releaseVersion]);

  const k8sVersion = useMemo(() => {
    // if releases and permissions are loading, show loading placeholder
    if (!releases && typeof canListReleases === 'undefined') return undefined;
    if (typeof release === 'undefined') return '';

    return releasev1alpha1.getK8sVersion(release) ?? '';
  }, [canListReleases, release, releases]);

  const isPreviewRelease = release?.spec.state === 'preview';

  useEffect(() => {
    if (isPreviewRelease && handleIsPreviewRelease) {
      handleIsPreviewRelease(isPreviewRelease);
    }
  }, [handleIsPreviewRelease, isPreviewRelease]);

  return (
    <ClusterListItemMainInfo
      releaseVersion={releaseVersion}
      isPreviewRelease={isPreviewRelease}
      k8sVersion={k8sVersion}
      variant={ClusterListItemMainInfoVariant.Release}
    />
  );
};

export default ClusterListItemReleaseInfo;
