import { compare } from 'lib/semver';
import { Cluster, ControlPlaneNode, ProviderCluster } from 'MAPI/types';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as capzv1alpha3 from 'model/services/mapi/capzv1alpha3';
import { Constants } from 'shared/constants';

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

export function withClusterReleaseVersion(
  newVersion: string,
  orgNamespace: string
): ClusterPatch {
  return (cluster, providerCluster, controlPlaneNodes) => {
    const hasNonNamespacedResources =
      providerCluster?.apiVersion === 'infrastructure.giantswarm.io/v1alpha3' &&
      compare(newVersion, Constants.AWS_NAMESPACED_CLUSTERS_VERSION) < 0;
    const defaultNamespace = 'default';

    cluster.metadata.labels ??= {};
    cluster.metadata.labels[capiv1alpha3.labelReleaseVersion] = newVersion;
    cluster.metadata.namespace = hasNonNamespacedResources
      ? defaultNamespace
      : orgNamespace;

    if (providerCluster) {
      providerCluster.metadata.labels ??= {};
      providerCluster.metadata.labels[capiv1alpha3.labelReleaseVersion] =
        newVersion;
      providerCluster.metadata.namespace = hasNonNamespacedResources
        ? defaultNamespace
        : orgNamespace;
    }

    for (const controlPlaneNode of controlPlaneNodes) {
      controlPlaneNode.metadata.labels ??= {};
      controlPlaneNode.metadata.labels[capiv1alpha3.labelReleaseVersion] =
        newVersion;
      controlPlaneNode.metadata.namespace = hasNonNamespacedResources
        ? defaultNamespace
        : orgNamespace;
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
