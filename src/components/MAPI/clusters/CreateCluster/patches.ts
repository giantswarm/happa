import { Cluster, ControlPlaneNode, ProviderCluster } from 'MAPI/types';
import { determineRandomAZs, getSupportedAvailabilityZones } from 'MAPI/utils';
import { Constants } from 'model/constants';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as capzv1beta1 from 'model/services/mapi/capzv1beta1';
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
  releaseComponents: IReleaseComponent[],
  orgNamespace: string
): ClusterPatch {
  const clusterOperatorVersion = releaseComponents.find(
    (component) => component.name === 'cluster-operator'
  )?.version;
  const azureOperatorVersion = releaseComponents.find(
    (component) => component.name === 'azure-operator'
  )?.version;

  // eslint-disable-next-line complexity
  return (cluster, providerCluster, controlPlaneNodes) => {
    const hasNonNamespacedResources =
      providerCluster?.kind === infrav1alpha3.AWSCluster &&
      compare(newVersion, Constants.AWS_NAMESPACED_CLUSTERS_VERSION) < 0;
    const defaultNamespace = 'default';

    cluster.metadata.labels ??= {};
    cluster.metadata.labels[capiv1beta1.labelReleaseVersion] = newVersion;
    cluster.metadata.labels[capiv1beta1.labelClusterOperator] =
      clusterOperatorVersion ?? '';

    if (providerCluster && providerCluster.kind === capzv1beta1.AzureCluster) {
      cluster.metadata.labels[capiv1beta1.labelAzureOperator] =
        azureOperatorVersion ?? '';
    }

    cluster.metadata.namespace = hasNonNamespacedResources
      ? defaultNamespace
      : orgNamespace;

    if (providerCluster) {
      providerCluster.metadata.labels ??= {};
      providerCluster.metadata.labels[capiv1beta1.labelReleaseVersion] =
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
      controlPlaneNode.metadata.labels[capiv1beta1.labelReleaseVersion] =
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

      if (
        providerCluster &&
        controlPlaneNode.kind === capzv1beta1.AzureMachine
      ) {
        controlPlaneNode.metadata.labels[capiv1beta1.labelAzureOperator] =
          azureOperatorVersion ?? '';
      }
    }
  };
}

export function withClusterDescription(newDescription: string): ClusterPatch {
  return (cluster, providerCluster) => {
    cluster.metadata.annotations ??= {};
    cluster.metadata.annotations[capiv1beta1.annotationClusterDescription] =
      newDescription;

    if (
      providerCluster?.kind === infrav1alpha3.AWSCluster &&
      providerCluster.spec
    ) {
      providerCluster.spec.cluster.description = newDescription;
    }
  };
}

export function withClusterControlPlaneNodeAZs(zones?: string[]): ClusterPatch {
  return (_, _p, controlPlaneNodes) => {
    for (const controlPlaneNode of controlPlaneNodes) {
      if (controlPlaneNode.kind === capzv1beta1.AzureMachine) {
        controlPlaneNode.spec!.failureDomain = zones?.[0];
      }
    }
  };
}

export function withClusterControlPlaneNodesCount(count: number): ClusterPatch {
  return (_, _p, controlPlaneNodes) => {
    const supportedAZs = getSupportedAvailabilityZones().all;

    for (const controlPlaneNode of controlPlaneNodes) {
      if (
        controlPlaneNode.apiVersion !==
          'infrastructure.giantswarm.io/v1alpha2' &&
        controlPlaneNode.apiVersion !== 'infrastructure.giantswarm.io/v1alpha3'
      ) {
        continue;
      }

      switch (controlPlaneNode.kind) {
        case infrav1alpha3.G8sControlPlane:
          controlPlaneNode.spec.replicas = count;
          break;
        case infrav1alpha3.AWSControlPlane: {
          if (count === 1) {
            controlPlaneNode.spec.availabilityZones = determineRandomAZs(
              count,
              supportedAZs
            );
          } else {
            delete controlPlaneNode.spec.availabilityZones;
          }
          break;
        }
      }
    }
  };
}
