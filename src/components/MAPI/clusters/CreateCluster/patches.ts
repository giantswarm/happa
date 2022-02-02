import { Cluster, ControlPlaneNode, ProviderCluster } from 'MAPI/types';
import { Constants } from 'model/constants';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as capzv1alpha3 from 'model/services/mapi/capzv1alpha3';
import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';
import { compare } from 'utils/semver';

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
    const apiVersion = providerCluster?.apiVersion;
    const hasNonNamespacedResources =
      (apiVersion === 'infrastructure.giantswarm.io/v1alpha2' ||
        apiVersion === 'infrastructure.giantswarm.io/v1alpha3') &&
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
      if (cluster.spec?.infrastructureRef?.namespace) {
        cluster.spec.infrastructureRef.namespace =
          providerCluster.metadata.namespace;
      }
    }

    for (const controlPlaneNode of controlPlaneNodes) {
      controlPlaneNode.metadata.labels ??= {};
      controlPlaneNode.metadata.labels[capiv1alpha3.labelReleaseVersion] =
        newVersion;
      controlPlaneNode.metadata.namespace = hasNonNamespacedResources
        ? defaultNamespace
        : orgNamespace;
      if (
        providerCluster &&
        controlPlaneNode.kind === infrav1alpha3.G8sControlPlane
      ) {
        controlPlaneNode.spec.infrastructureRef.namespace =
          providerCluster.metadata.namespace;
      }
    }
  };
}

export function withClusterDescription(newDescription: string): ClusterPatch {
  return (cluster, providerCluster) => {
    cluster.metadata.annotations ??= {};
    cluster.metadata.annotations[capiv1alpha3.annotationClusterDescription] =
      newDescription;

    const apiVersion = providerCluster?.apiVersion;
    if (
      (apiVersion === 'infrastructure.giantswarm.io/v1alpha2' ||
        apiVersion === 'infrastructure.giantswarm.io/v1alpha3') &&
      providerCluster!.spec
    ) {
      providerCluster!.spec.cluster.description = newDescription;
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

export function withClusterControlPlaneNodesCount(count: number): ClusterPatch {
  return (_, _p, controlPlaneNodes) => {
    for (const controlPlaneNode of controlPlaneNodes) {
      if (
        controlPlaneNode.apiVersion !==
          'infrastructure.giantswarm.io/v1alpha2' &&
        controlPlaneNode.apiVersion !== 'infrastructure.giantswarm.io/v1alpha3'
      ) {
        continue;
      }
      if (controlPlaneNode.kind === infrav1alpha3.G8sControlPlane) {
        controlPlaneNode.spec.replicas = count;
      }
    }
  };
}
