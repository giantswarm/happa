import { Cluster, ControlPlaneNode, ProviderCluster } from 'MAPI/types';

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
  cluster: Cluster;
  providerCluster: ProviderCluster;
  controlPlaneNode: ControlPlaneNode;
  onChange: (value: IClusterPropertyValue) => void;
  disabled?: boolean;
  readOnly?: boolean;
}
