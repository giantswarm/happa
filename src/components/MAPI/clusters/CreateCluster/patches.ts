import { Cluster, ControlPlaneNode, ProviderCluster } from 'MAPI/types';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as capzv1alpha3 from 'model/services/mapi/capzv1alpha3';

export type ClusterPatch = (
  cluster: Cluster,
  providerCluster: ProviderCluster,
  controlPlaneNodes: ControlPlaneNode[]
) => void;

export interface IClusterPropertyValue {
  patch: ClusterPatch;
  isValid: boolean;
}

export interface IClusterPropertyProps {
  id: string;
  cluster: Cluster;
  providerCluster: ProviderCluster;
  controlPlaneNodes: ControlPlaneNode[];
  onChange: (value: IClusterPropertyValue) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export function withClusterReleaseVersion(newVersion: string): ClusterPatch {
  return (cluster, providerCluster, controlPlaneNodes) => {
    cluster.metadata.labels ??= {};
    cluster.metadata.labels[capiv1alpha3.labelReleaseVersion] = newVersion;

    if (providerCluster) {
      providerCluster.metadata.labels ??= {};
      providerCluster.metadata.labels[capiv1alpha3.labelReleaseVersion] =
        newVersion;
    }

    for (const controlPlaneNode of controlPlaneNodes) {
      controlPlaneNode.metadata.labels ??= {};
      controlPlaneNode.metadata.labels[capiv1alpha3.labelReleaseVersion] =
        newVersion;
    }
  };
}

export function withClusterDescription(newDescription: string): ClusterPatch {
  return (cluster, providerCluster) => {
    cluster.metadata.annotations ??= {};
    cluster.metadata.annotations[capiv1alpha3.annotationClusterDescription] =
      newDescription;

    if (
      providerCluster?.apiVersion === 'infrastructure.giantswarm.io/v1alpha3' &&
      providerCluster.spec
    ) {
      providerCluster.spec.cluster.description = newDescription;
    }
  };
}

export function withClusterControlPlaneNodeAZs(zones?: string[]): ClusterPatch {
  return (_, _p, controlPlaneNodes) => {
    for (const controlPlaneNode of controlPlaneNodes) {
      if (controlPlaneNode.kind === capzv1alpha3.AzureMachine) {
        controlPlaneNode.spec!.failureDomain = zones?.[0];
      }
    }
  };
}
