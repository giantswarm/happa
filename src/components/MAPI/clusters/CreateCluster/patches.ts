import { Cluster, ControlPlaneNode, ProviderCluster } from 'MAPI/types';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';

export type ClusterPatch = (
  cluster: Cluster,
  providerCluster: ProviderCluster,
  controlPlaneNode: ControlPlaneNode
) => void;

export interface IClusterPropertyValue {
  patch: ClusterPatch;
  isValid: boolean;
}

export interface IClusterPropertyProps {
  id: string;
  cluster: Cluster;
  providerCluster: ProviderCluster;
  controlPlaneNode: ControlPlaneNode;
  onChange: (value: IClusterPropertyValue) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export function withClusterReleaseVersion(newVersion: string): ClusterPatch {
  return (nodePool, providerCluster, controlPlaneNode) => {
    nodePool.metadata.labels ??= {};
    nodePool.metadata.labels[capiv1alpha3.labelReleaseVersion] = newVersion;

    providerCluster.metadata.labels ??= {};
    providerCluster.metadata.labels[
      capiv1alpha3.labelReleaseVersion
    ] = newVersion;

    controlPlaneNode.metadata.labels ??= {};
    controlPlaneNode.metadata.labels[
      capiv1alpha3.labelReleaseVersion
    ] = newVersion;
  };
}

export function withClusterDescription(newDescription: string): ClusterPatch {
  return (cluster) => {
    cluster.metadata.annotations ??= {};
    cluster.metadata.annotations[
      capiv1alpha3.annotationClusterDescription
    ] = newDescription;
  };
}
