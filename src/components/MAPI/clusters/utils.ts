import * as releasesUtils from 'MAPI/releases/utils';
import {
  Cluster,
  ControlPlaneNode,
  NodePool,
  ProviderCluster,
} from 'MAPI/types';
import {
  fetchControlPlaneNodesForCluster,
  fetchControlPlaneNodesForClusterKey,
  fetchProviderClusterForClusterKey,
  generateUID,
  getClusterDescription,
  IMachineType,
  IProviderClusterForClusterName,
} from 'MAPI/utils';
import { IProviderNodePoolForNodePool } from 'MAPI/workernodes/utils';
import { GenericResponse } from 'model/clients/GenericResponse';
import { Constants, Providers } from 'model/constants';
import * as capgv1beta1 from 'model/services/mapi/capgv1beta1';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';
import * as capzv1beta1 from 'model/services/mapi/capzv1beta1';
import * as corev1 from 'model/services/mapi/corev1';
import * as infrav1alpha2 from 'model/services/mapi/infrastructurev1alpha2';
import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';
import * as metav1 from 'model/services/mapi/metav1';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import { filterLabels } from 'model/stores/cluster/utils';
import { mutate } from 'swr';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { parseRFC822DateFormat } from 'utils/helpers';
import { HttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';
import { compare } from 'utils/semver';
import { VersionImpl } from 'utils/Version';

export function getWorkerNodesCount(nodePools?: NodePool[]) {
  if (!nodePools) return undefined;

  let count = 0;
  for (const nodePool of nodePools) {
    if (typeof nodePool.status?.readyReplicas !== 'undefined') {
      count += nodePool.status.readyReplicas;
    }
  }

  return count;
}

export function getWorkerNodesCPU(
  nodePoolsWithProviderNodePools?: IProviderNodePoolForNodePool[],
  machineTypes?: Record<string, IMachineType>
) {
  if (!nodePoolsWithProviderNodePools || !machineTypes) return undefined;

  let count = 0;

  for (const { nodePool, providerNodePool } of nodePoolsWithProviderNodePools) {
    const readyReplicas = nodePool.status?.readyReplicas;
    if (!readyReplicas) continue;

    // eslint-disable-next-line @typescript-eslint/init-declarations
    let instanceType: string | undefined;

    switch (providerNodePool?.kind) {
      case capgv1beta1.GCPMachineTemplate:
        instanceType = providerNodePool.spec?.template.spec?.instanceType;
        break;

      case capzexpv1alpha3.AzureMachinePool:
      case capzv1beta1.AzureMachinePool:
        instanceType = providerNodePool.spec?.template.vmSize;
        break;

      case infrav1alpha3.AWSMachineDeployment:
        instanceType = providerNodePool.spec.provider.worker.instanceType;
        break;

      default:
        return -1;
    }

    if (!instanceType) return -1;

    const machineTypeProperties = machineTypes[instanceType];
    if (!machineTypeProperties) return -1;

    count += machineTypeProperties.cpu * readyReplicas;
  }

  return count;
}

export function getWorkerNodesMemory(
  nodePoolsWithProviderNodePools?: IProviderNodePoolForNodePool[],
  machineTypes?: Record<string, IMachineType>
) {
  if (!nodePoolsWithProviderNodePools || !machineTypes) return undefined;

  let count = 0;

  for (const { nodePool, providerNodePool } of nodePoolsWithProviderNodePools) {
    const readyReplicas = nodePool.status?.readyReplicas;
    if (!readyReplicas) continue;

    // eslint-disable-next-line @typescript-eslint/init-declarations
    let instanceType: string | undefined;

    switch (providerNodePool?.kind) {
      case capzexpv1alpha3.AzureMachinePool:
      case capzv1beta1.AzureMachinePool: {
        instanceType = providerNodePool.spec?.template.vmSize;
        break;
      }

      case infrav1alpha3.AWSMachineDeployment: {
        instanceType = providerNodePool.spec.provider.worker.instanceType;
        break;
      }

      case capgv1beta1.GCPMachineTemplate: {
        instanceType = providerNodePool.spec?.template.spec?.instanceType;
        break;
      }

      default:
        return -1;
    }

    if (!instanceType) return -1;

    const machineTypeProperties = machineTypes[instanceType];
    if (!machineTypeProperties) return -1;

    count += machineTypeProperties.memory * readyReplicas;
  }

  return count;
}

export function compareClusters(
  a: IProviderClusterForCluster,
  b: IProviderClusterForCluster
) {
  // Move clusters that are currently deleting to the end of the list.
  const aIsDeleting =
    typeof a.cluster.metadata.deletionTimestamp !== 'undefined';
  const bIsDeleting =
    typeof b.cluster.metadata.deletionTimestamp !== 'undefined';

  if (aIsDeleting && !bIsDeleting) {
    return 1;
  } else if (!aIsDeleting && bIsDeleting) {
    return -1;
  }

  // Sort by description.
  const aDescription = getClusterDescription(a.cluster, a.providerCluster, '');
  const bDescription = getClusterDescription(b.cluster, b.providerCluster, '');
  if (aDescription === '' && bDescription !== '') return 1;
  if (bDescription === '' && aDescription !== '') return -1;

  const descriptionComparison = aDescription.localeCompare(bDescription);
  if (descriptionComparison !== 0) {
    return descriptionComparison;
  }

  // If descriptions are the same, sort by resource name.
  return a.cluster.metadata.name.localeCompare(b.cluster.metadata.name);
}

export function isClusterUpgradable(
  cluster: capiv1beta1.ICluster,
  provider: PropertiesOf<typeof Providers>,
  isAdmin: boolean,
  releases?: releasev1alpha1.IRelease[]
): boolean {
  if (!releases) return false;

  const releaseVersion = capiv1beta1.getReleaseVersion(cluster);
  if (!releaseVersion) return false;

  try {
    const releaseHelper = releasesUtils.getReleaseHelper(
      releaseVersion,
      provider,
      isAdmin,
      releases
    );

    return releaseHelper.getNextVersion() !== null;
  } catch (err) {
    ErrorReporter.getInstance().notify(err as Error);

    return false;
  }
}

export function isClusterUpgrading(cluster: capiv1beta1.ICluster): boolean {
  return (
    capiv1beta1.isConditionTrue(
      cluster,
      capiv1beta1.conditionTypeUpgrading,
      capiv1beta1.withReasonUpgradePending()
    ) &&
    capiv1beta1.isConditionFalse(
      cluster,
      capiv1beta1.conditionTypeUpgrading,
      capiv1beta1.withReasonUpgradeNotStarted(),
      capiv1beta1.withReasonUpgradeCompleted()
    )
  );
}

export function isClusterCreating(cluster: capiv1beta1.ICluster): boolean {
  return (
    capiv1beta1.isConditionTrue(cluster, capiv1beta1.conditionTypeCreating) &&
    capiv1beta1.isConditionFalse(
      cluster,
      capiv1beta1.conditionTypeCreating,
      capiv1beta1.withReasonCreationCompleted(),
      capiv1beta1.withReasonExistingObject()
    )
  );
}

export function createDefaultProviderCluster(
  provider: PropertiesOf<typeof Providers>,
  config: {
    namespace: string;
    name: string;
    organization: string;
    releaseVersion: string;
  }
) {
  switch (provider) {
    case Providers.AZURE:
      return createDefaultAzureCluster(config);
    case Providers.AWS:
      return createDefaultAWSCluster(config);
  }

  throw new Error('Unsupported provider.');
}

function createDefaultAzureCluster(config: {
  namespace: string;
  name: string;
  organization: string;
  releaseVersion: string;
}): capzv1beta1.IAzureCluster {
  return {
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: capzv1beta1.AzureCluster,
    metadata: {
      namespace: config.namespace,
      name: config.name,
      labels: {
        [capiv1beta1.labelCluster]: config.name,
        [capiv1beta1.labelClusterName]: config.name,
        [capiv1beta1.labelOrganization]: config.organization,
        [capiv1beta1.labelReleaseVersion]: config.releaseVersion,
      },
    },
    spec: {
      location: '',
      resourceGroup: config.name,
      controlPlaneEndpoint: {
        host: '',
        port: 0,
      },
      networkSpec: {
        apiServerLB: {
          name: `${config.name}-API-PublicLoadBalancer`,
          sku: 'Standard',
          type: 'Public',
          frontendIPs: [
            {
              name: `${config.name}-API-PublicLoadBalancer-Frontend`,
            },
          ],
        },
      },
    },
  };
}

function createDefaultAWSCluster(config: {
  namespace: string;
  name: string;
  organization: string;
  releaseVersion: string;
}): infrav1alpha3.IAWSCluster {
  return {
    apiVersion: infrav1alpha3.ApiVersion,
    kind: infrav1alpha3.AWSCluster,
    metadata: {
      namespace: config.namespace,
      name: config.name,
      labels: {
        [infrav1alpha3.labelCluster]: config.name,
        [capiv1beta1.labelClusterName]: config.name,
        [infrav1alpha3.labelOrganization]: config.organization,
        [infrav1alpha3.labelReleaseVersion]: config.releaseVersion,
      },
    },
    spec: {
      cluster: {
        description: Constants.DEFAULT_CLUSTER_DESCRIPTION,
        dns: {
          domain: '',
        },
        oidc: {
          issuerURL: '',
          claims: {
            groups: '',
            username: '',
          },
          clientID: '',
        },
        kubeProxy: {
          conntrackMaxPerCore: 0,
        },
      },
      provider: {
        credentialSecret: {
          name: '',
          namespace: 'giantswarm',
        },
        master: {
          availabilityZone: '',
          instanceType: '',
        },
        region: window.config.info.general.dataCenter,
        nodes: {
          networkPool: '',
        },
        pods: {
          cidrBlock: '',
          externalSNAT: false,
        },
      },
    },
  };
}

export function createDefaultCluster(config: {
  providerCluster: ProviderCluster;
}) {
  if (typeof config.providerCluster === 'undefined') {
    throw new Error('Unsupported provider.');
  }

  const { kind, apiVersion } = config.providerCluster;
  switch (true) {
    case kind === capzv1beta1.AzureCluster:
    case kind === infrav1alpha2.AWSCluster &&
      apiVersion === infrav1alpha2.ApiVersion:
    case kind === infrav1alpha3.AWSCluster &&
      apiVersion === infrav1alpha3.ApiVersion:
      return createDefaultV1Alpha3Cluster(config);

    default:
      throw new Error('Unsupported provider.');
  }
}

function createDefaultV1Alpha3Cluster(config: {
  providerCluster: ProviderCluster;
}): capiv1beta1.ICluster {
  const namespace = config.providerCluster!.metadata.namespace;
  const name = config.providerCluster!.metadata.name;
  const organization =
    config.providerCluster!.metadata.labels![capiv1beta1.labelOrganization];
  const releaseVersion =
    config.providerCluster!.metadata.labels![capiv1beta1.labelReleaseVersion];

  return {
    apiVersion: 'cluster.x-k8s.io/v1beta1',
    kind: capiv1beta1.Cluster,
    metadata: {
      name,
      namespace,
      labels: {
        [capiv1beta1.labelCluster]: name,
        [capiv1beta1.labelClusterName]: name,
        [capiv1beta1.labelOrganization]: organization,
        [capiv1beta1.labelReleaseVersion]: releaseVersion,
        [capiv1beta1.labelServicePriority]:
          Constants.DEFAULT_CLUSTER_SERVICE_PRIORITY,
      },
      annotations: {
        [capiv1beta1.annotationClusterDescription]:
          Constants.DEFAULT_CLUSTER_DESCRIPTION,
      },
    },
    spec: {
      infrastructureRef: corev1.getObjectReference(config.providerCluster!),
      controlPlaneEndpoint: {
        host: '',
        port: 0,
      },
    },
  };
}

export function createDefaultControlPlaneNodes(config: {
  providerCluster: ProviderCluster;
}): ControlPlaneNode[] {
  if (typeof config.providerCluster === 'undefined') {
    throw new Error('Unsupported provider.');
  }

  const { kind, apiVersion } = config.providerCluster;
  switch (true) {
    case kind === capzv1beta1.AzureCluster:
      return [createDefaultAzureMachine(config)];
    case kind === infrav1alpha2.AWSCluster &&
      apiVersion === infrav1alpha2.ApiVersion:
    case kind === infrav1alpha3.AWSCluster &&
      apiVersion === infrav1alpha3.ApiVersion: {
      const name = generateUID(5);
      const awsCP = createDefaultAWSControlPlane({ ...config, name });
      const g8sCP = createDefaultG8sControlPlane({
        ...config,
        awsControlPlane: awsCP,
      });

      // g8sControlPlane should be applied before awsControlPlane
      return [g8sCP, awsCP];
    }
  }

  throw new Error('Unsupported provider.');
}

function createDefaultAzureMachine(config: {
  providerCluster: ProviderCluster;
}): capzv1beta1.IAzureMachine {
  const namespace = config.providerCluster!.metadata.namespace;
  const name = config.providerCluster!.metadata.name;
  const organization =
    config.providerCluster!.metadata.labels![capiv1beta1.labelOrganization];
  const releaseVersion =
    config.providerCluster!.metadata.labels![capiv1beta1.labelReleaseVersion];

  return {
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: capzv1beta1.AzureMachine,
    metadata: {
      namespace: namespace,
      name: `${name}-master-0`,
      labels: {
        [capiv1beta1.labelCluster]: name,
        [capiv1beta1.labelClusterName]: name,
        [capiv1beta1.labelMachineControlPlane]: 'true',
        [capiv1beta1.labelOrganization]: organization,
        [capiv1beta1.labelReleaseVersion]: releaseVersion,
      },
    },
    spec: {
      vmSize: Constants.AZURE_CONTROL_PLANE_DEFAULT_VM_SIZE,
      failureDomain: '',
      sshPublicKey: '',
      image: {
        marketplace: {
          publisher: 'kinvolk',
          offer: 'flatcar-container-linux-free',
          sku: 'stable',
          version: '2345.3.1',
          thirdPartyImage: false,
        },
      },
      osDisk: {
        osType: 'Linux',
        cachingType: 'ReadWrite',
        diskSizeGB: 50,
        managedDisk: {
          storageAccountType: 'Premium_LRS',
        },
      },
    },
  };
}

function createDefaultAWSControlPlane(config: {
  name: string;
  providerCluster: ProviderCluster;
}): infrav1alpha3.IAWSControlPlane {
  const namespace = config.providerCluster!.metadata.namespace;
  const clusterName = config.providerCluster!.metadata.name;
  const organization =
    config.providerCluster!.metadata.labels![infrav1alpha3.labelOrganization];
  const releaseVersion =
    config.providerCluster!.metadata.labels![infrav1alpha3.labelReleaseVersion];

  return {
    apiVersion: infrav1alpha3.ApiVersion,
    kind: infrav1alpha3.AWSControlPlane,
    metadata: {
      namespace,
      name: config.name,
      labels: {
        [infrav1alpha3.labelCluster]: clusterName,
        [infrav1alpha3.labelControlPlane]: config.name,
        [infrav1alpha3.labelOrganization]: organization,
        [infrav1alpha3.labelReleaseVersion]: releaseVersion,
      },
    },
    spec: {
      // availabilityZones is defaulted by aws-admission-controller
      instanceType: Constants.AWS_CONTROL_PLANE_DEFAULT_INSTANCE_TYPE,
    },
  };
}

function createDefaultG8sControlPlane(config: {
  providerCluster: ProviderCluster;
  awsControlPlane: infrav1alpha3.IAWSControlPlane;
}): infrav1alpha3.IG8sControlPlane {
  const namespace = config.providerCluster!.metadata.namespace;
  const clusterName = config.providerCluster!.metadata.name;
  const organization =
    config.providerCluster!.metadata.labels![capiv1beta1.labelOrganization];
  const releaseVersion =
    config.providerCluster!.metadata.labels![capiv1beta1.labelReleaseVersion];

  const name = config.awsControlPlane.metadata.name;

  return {
    apiVersion: infrav1alpha3.ApiVersion,
    kind: infrav1alpha3.G8sControlPlane,
    metadata: {
      namespace,
      name,
      labels: {
        [capiv1beta1.labelCluster]: clusterName,
        [infrav1alpha3.labelControlPlane]: name,
        [capiv1beta1.labelOrganization]: organization,
        [capiv1beta1.labelReleaseVersion]: releaseVersion,
      },
    },
    spec: {
      replicas: Constants.AWS_HA_MASTERS_MAX_NODES,
      infrastructureRef: corev1.getObjectReference(config.awsControlPlane),
    },
    status: {},
  };
}

// eslint-disable-next-line complexity
export async function createCluster(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  config: {
    cluster: Cluster;
    providerCluster: ProviderCluster;
    controlPlaneNodes: ControlPlaneNode[];
  },
  isRetrying: boolean
): Promise<{
  cluster: Cluster;
  providerCluster: ProviderCluster;
  controlPlaneNodes: ControlPlaneNode[];
}> {
  if (typeof config.providerCluster === 'undefined') {
    return Promise.reject(new Error('Unsupported provider.'));
  }

  // eslint-disable-next-line @typescript-eslint/init-declarations
  let cluster: Cluster;
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let providerCluster: ProviderCluster;
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let controlPlaneNodes: ControlPlaneNode[];

  const { kind, apiVersion } = config.providerCluster;
  switch (true) {
    case kind === capzv1beta1.AzureCluster: {
      // Azure cluster
      try {
        providerCluster = await capzv1beta1.createAzureCluster(
          httpClientFactory(),
          auth,
          config.providerCluster as capzv1beta1.IAzureCluster
        );
        mutate(
          fetchProviderClusterForClusterKey(config.cluster),
          providerCluster,
          false
        );
      } catch (err) {
        // if we are retrying, we ignore "already exists" errors
        // and get the resource
        if (
          !isRetrying ||
          !metav1.isStatusError(
            (err as GenericResponse).data,
            metav1.K8sStatusErrorReasons.AlreadyExists
          )
        ) {
          return Promise.reject(err);
        }
        providerCluster = await capzv1beta1.getAzureCluster(
          httpClientFactory(),
          auth,
          config.providerCluster.metadata.namespace!,
          config.providerCluster.metadata.name
        );
      }

      // Control plane nodes
      try {
        controlPlaneNodes = await Promise.all(
          config.controlPlaneNodes.map((n) =>
            capzv1beta1.createAzureMachine(
              httpClientFactory(),
              auth,
              n as capzv1beta1.IAzureMachine
            )
          )
        );
        mutate(
          fetchControlPlaneNodesForClusterKey(config.cluster),
          controlPlaneNodes,
          false
        );
      } catch (err) {
        if (
          !isRetrying ||
          !metav1.isStatusError(
            (err as GenericResponse).data,
            metav1.K8sStatusErrorReasons.AlreadyExists
          )
        ) {
          return Promise.reject(err);
        }
        const controlPlaneNodesResponse = await capzv1beta1.getAzureMachineList(
          httpClientFactory(),
          auth,
          {
            labelSelector: {
              matchingLabels: {
                [capiv1beta1.labelCluster]: config.cluster.metadata.name,
                [capzv1beta1.labelControlPlane]: 'true',
              },
            },
            namespace: config.cluster.metadata.namespace,
          }
        );
        controlPlaneNodes = controlPlaneNodesResponse.items;
      }

      // Cluster
      try {
        cluster = await capiv1beta1.createCluster(
          httpClientFactory(),
          auth,
          config.cluster
        );
        mutate(
          capiv1beta1.getClusterKey(
            cluster.metadata.namespace!,
            cluster.metadata.name
          ),
          cluster,
          false
        );
        // Add the created cluster to the existing list.
        mutate(
          capiv1beta1.getClusterListKey({
            namespace: cluster.metadata.namespace!,
          }),
          (draft?: capiv1beta1.IClusterList) => {
            draft?.items.push(cluster);
          },
          false
        );
      } catch (err) {
        if (
          !isRetrying ||
          !metav1.isStatusError(
            (err as GenericResponse).data,
            metav1.K8sStatusErrorReasons.AlreadyExists
          )
        ) {
          return Promise.reject(err);
        }
        cluster = await capiv1beta1.getCluster(
          httpClientFactory(),
          auth,
          config.cluster.metadata.namespace!,
          config.cluster.metadata.name
        );
      }

      break;
    }

    case kind === infrav1alpha2.AWSCluster &&
      apiVersion === infrav1alpha2.ApiVersion:
    case kind === infrav1alpha3.AWSCluster &&
      apiVersion === infrav1alpha3.ApiVersion: {
      // AWS cluster
      try {
        providerCluster = await infrav1alpha3.createAWSCluster(
          httpClientFactory(),
          auth,
          config.providerCluster as infrav1alpha3.IAWSCluster
        );
        mutate(
          fetchProviderClusterForClusterKey(config.cluster),
          providerCluster,
          false
        );
      } catch (err) {
        if (
          !isRetrying ||
          !metav1.isStatusError(
            (err as GenericResponse).data,
            metav1.K8sStatusErrorReasons.AlreadyExists
          )
        ) {
          return Promise.reject(err);
        }
        providerCluster = await infrav1alpha3.getAWSCluster(
          httpClientFactory(),
          auth,
          config.providerCluster.metadata.namespace!,
          config.providerCluster.metadata.name
        );
      }

      // Cluster
      try {
        cluster = await capiv1beta1.createCluster(
          httpClientFactory(),
          auth,
          config.cluster
        );
        mutate(
          capiv1beta1.getClusterKey(
            cluster.metadata.namespace!,
            cluster.metadata.name
          ),
          cluster,
          false
        );
        // Add the created cluster to the existing list.
        mutate(
          capiv1beta1.getClusterListKey({
            namespace: cluster.metadata.namespace!,
          }),
          (draft?: capiv1beta1.IClusterList) => {
            draft?.items.push(cluster);
          },
          false
        );
      } catch (err) {
        if (
          !isRetrying ||
          !metav1.isStatusError(
            (err as GenericResponse).data,
            metav1.K8sStatusErrorReasons.AlreadyExists
          )
        ) {
          return Promise.reject(err);
        }
        cluster = await capiv1beta1.getCluster(
          httpClientFactory(),
          auth,
          config.cluster.metadata.namespace!,
          config.cluster.metadata.name
        );
      }

      // Control plane nodes
      try {
        controlPlaneNodes = await Promise.all<ControlPlaneNode>(
          config.controlPlaneNodes.map((n) => {
            switch (n.kind) {
              case infrav1alpha3.AWSControlPlane:
                return infrav1alpha3.createAWSControlPlane(
                  httpClientFactory(),
                  auth,
                  n as infrav1alpha3.IAWSControlPlane
                );
              case infrav1alpha3.G8sControlPlane:
                return infrav1alpha3.createG8sControlPlane(
                  httpClientFactory(),
                  auth,
                  n as infrav1alpha3.IG8sControlPlane
                );
              default:
                return Promise.reject(
                  new Error('Unknown control plane node type.')
                );
            }
          })
        );
        mutate(
          fetchControlPlaneNodesForClusterKey(config.cluster),
          controlPlaneNodes,
          false
        );
      } catch (err) {
        if (
          !isRetrying ||
          !metav1.isStatusError(
            (err as GenericResponse).data,
            metav1.K8sStatusErrorReasons.AlreadyExists
          )
        ) {
          return Promise.reject(err);
        }
        const options = {
          labelSelector: {
            matchingLabels: {
              [capiv1beta1.labelCluster]: config.cluster.metadata.name,
            },
          },
          namespace: config.cluster.metadata.namespace,
        };
        const awsControlPlaneNodesResponse =
          await infrav1alpha3.getAWSControlPlaneList(
            httpClientFactory(),
            auth,
            options
          );
        const g8sControlPlaneNodesResponse =
          await infrav1alpha3.getG8sControlPlaneList(
            httpClientFactory(),
            auth,
            options
          );

        controlPlaneNodes = [
          ...awsControlPlaneNodesResponse.items,
          ...g8sControlPlaneNodesResponse.items,
        ];
      }

      break;
    }

    default:
      return Promise.reject(new Error('Unsupported provider.'));
  }

  return { cluster, providerCluster, controlPlaneNodes };
}

export function findLatestReleaseVersion(
  releases: releasev1alpha1.IRelease[]
): releasev1alpha1.IRelease | undefined {
  const versions: releasev1alpha1.IRelease[] = [];
  for (const release of releases) {
    if (release.spec.state !== 'active') continue;

    try {
      const version = new VersionImpl(release.metadata.name.slice(1));
      if (version.getPreRelease().length > 1) continue;

      versions.push(release);
    } catch (err) {
      ErrorReporter.getInstance().notify(err as Error);

      continue;
    }
  }

  // Sort versions in a descending order, taking into account the SemVer formatting.
  const sortedVersions = versions.sort((a, b) =>
    compare(b.metadata.name.slice(1), a.metadata.name.slice(1))
  );

  return sortedVersions[0];
}

export interface IProviderClusterForCluster {
  cluster: Cluster;
  providerCluster: ProviderCluster | null;
}

/**
 * Map clusters to provider clusters. If a provider cluster is undefined (i.e.
 * there was an error in fetching the provider cluster), 'null' is returned as
 * the provider cluster value.
 * @param clusters
 * @param providerClusters
 */
export function mapClustersToProviderClusters(
  clusters: Cluster[],
  providerClusterForClusterName: IProviderClusterForClusterName[]
): IProviderClusterForCluster[] {
  const clusterNamesToProviderCluster: Record<string, ProviderCluster | null> =
    {};

  for (const {
    clusterName,
    providerCluster,
  } of providerClusterForClusterName) {
    if (!providerCluster) {
      clusterNamesToProviderCluster[clusterName] = null;
      continue;
    }
    clusterNamesToProviderCluster[clusterName] = providerCluster;
  }

  const mappedClustersToProviderClusters: IProviderClusterForCluster[] =
    new Array(clusters.length);

  for (let i = 0; i < clusters.length; i++) {
    const clusterName = clusters[i].metadata.name;

    const providerCluster = clusterNamesToProviderCluster.hasOwnProperty(
      clusterName
    )
      ? clusterNamesToProviderCluster[clusterName]
      : undefined;

    mappedClustersToProviderClusters[i] = {
      cluster: clusters[i],
      providerCluster,
    };
  }

  return mappedClustersToProviderClusters;
}

export interface IClusterConditions {
  isConditionUnknown: boolean;
  isCreating: boolean;
  isUpgrading: boolean;
  isDeleting: boolean;
}

export function getClusterConditions(
  cluster: capiv1beta1.ICluster | undefined,
  providerCluster: ProviderCluster
): IClusterConditions {
  const statuses: IClusterConditions = {
    isConditionUnknown: true,
    isCreating: false,
    isUpgrading: false,
    isDeleting: false,
  };

  const infrastructureRef = cluster?.spec?.infrastructureRef;
  if (!cluster || !infrastructureRef) return statuses;

  if (typeof cluster.metadata.deletionTimestamp !== 'undefined') {
    statuses.isConditionUnknown = false;
    statuses.isDeleting = true;

    return statuses;
  }

  const { kind, apiVersion } = infrastructureRef;
  switch (true) {
    case kind === capzv1beta1.AzureCluster:
      statuses.isConditionUnknown =
        typeof cluster.status === 'undefined' ||
        typeof cluster.status.conditions === 'undefined';
      statuses.isCreating = isClusterCreating(cluster);
      statuses.isUpgrading = isClusterUpgrading(cluster);
      break;

    case kind === infrav1alpha2.AWSCluster &&
      apiVersion === infrav1alpha2.ApiVersion:
    case kind === infrav1alpha3.AWSCluster &&
      apiVersion === infrav1alpha3.ApiVersion: {
      if (!providerCluster) break;

      statuses.isConditionUnknown = infrav1alpha3.isConditionUnknown(
        providerCluster as infrav1alpha3.IAWSCluster
      );
      statuses.isCreating = infrav1alpha3.isConditionTrue(
        providerCluster as infrav1alpha3.IAWSCluster,
        infrav1alpha3.conditionTypeCreating
      );
      statuses.isUpgrading = infrav1alpha3.isConditionTrue(
        providerCluster as infrav1alpha3.IAWSCluster,
        infrav1alpha3.conditionTypeUpdating
      );
      break;
    }
    default:
      statuses.isConditionUnknown =
        typeof cluster.status === 'undefined' ||
        typeof cluster.status.conditions === 'undefined';
      statuses.isCreating = capiv1beta1.isConditionFalse(
        cluster,
        capiv1beta1.conditionTypeControlPlaneInitialized
      );
      break;
  }

  return statuses;
}

export interface IClusterUpdateSchedule {
  targetRelease: string;
  targetTime: Date;
}

export function getClusterUpdateSchedule(
  cluster: capiv1beta1.ICluster | undefined
): IClusterUpdateSchedule | undefined {
  if (!cluster) return undefined;

  const targetRelease =
    capiv1beta1.getClusterUpdateScheduleTargetRelease(cluster);
  const targetTime = capiv1beta1.getClusterUpdateScheduleTargetTime(cluster);
  if (!targetRelease || !targetTime) return undefined;

  return {
    targetRelease,
    targetTime: parseRFC822DateFormat(targetTime),
  };
}

export enum ClusterStatus {
  Idle = 'IDLE',
  DeletionInProgress = 'DELETION_IN_PROGRESS',
  CreationInProgress = 'CREATION_IN_PROGRESS',
  UpgradeInProgress = 'UPGRADE_IN_PROGRESS',
  UpgradeScheduled = 'UPGRADE_SCHEDULED',
  UpgradeAvailable = 'UPGRADE_AVAILABLE',
}

export function getClusterLabelsWithDisplayInfo(
  labels: IClusterLabelMap,
  filterHiddenLabels: boolean = true
): IClusterLabelWithDisplayInfo[] {
  const filteredLabels = filterHiddenLabels
    ? filterLabels(labels) ?? {}
    : labels;

  const labelsWithDisplayInfo = Object.entries(filteredLabels).map(
    ([key, value]) => {
      return {
        key,
        value,
        ...getClusterLabelKeyDisplayInfo(key),
        ...getClusterLabelValueDisplayInfo(key, value),
      };
    }
  );

  const sortedLabelsWithDisplayInfo = labelsWithDisplayInfo.sort((a, b) => {
    if (!filterHiddenLabels) {
      return a.key.localeCompare(b.key);
    }

    // Sort by special purpose first and then by displayKey

    const aIsImportant = isSpecialPurposeLabel(a.key);
    const bIsImportant = isSpecialPurposeLabel(b.key);

    return (
      Number(bIsImportant) - Number(aIsImportant) ||
      a.displayKey.localeCompare(b.displayKey)
    );
  });

  return sortedLabelsWithDisplayInfo;
}

function getClusterLabelKeyDisplayInfo(key: string) {
  switch (key) {
    case capiv1beta1.labelServicePriority:
      return { displayKey: 'Service priority' };

    default:
      return { displayKey: key };
  }
}

function getClusterLabelValueDisplayInfo(key: string, value: string) {
  switch (`${key}:${value}`) {
    case `${capiv1beta1.labelServicePriority}:highest`:
      return {
        displayValue: 'Highest',
        textColor: 'text-accent',
        backgroundColor: 'service-priority-highest',
      };
    case `${capiv1beta1.labelServicePriority}:medium`:
      return {
        displayValue: 'Medium',
        textColor: 'text-accent',
        backgroundColor: 'service-priority-medium',
      };
    case `${capiv1beta1.labelServicePriority}:lowest`:
      return {
        displayValue: 'Lowest',
        textColor: 'text',
        backgroundColor: 'service-priority-lowest',
      };

    default:
      return { displayValue: value };
  }
}

function isSpecialPurposeLabel(key: string) {
  switch (key) {
    case capiv1beta1.labelServicePriority:
      return true;
    default:
      return false;
  }
}

export function getClusterOrganization(
  cluster: capiv1beta1.ICluster,
  organizations: Record<string, IOrganization>
): IOrganization | undefined {
  const clusterOrganizationLabel =
    capiv1beta1.getClusterOrganizationLabel(cluster);

  const clusterNamespace = cluster.metadata.namespace;

  // old AWS clusters are in the default namespace
  if (clusterNamespace === 'default') {
    return Object.values(organizations).find(
      (o) =>
        o.name === clusterOrganizationLabel || o.id === clusterOrganizationLabel
    );
  }

  return Object.values(organizations).find(
    (o) => o.namespace === clusterNamespace
  );
}

/**
 * Determines whether the cluster has an `app` label that starts with the `cluster-` prefix.
 * @param cluster
 */
export function hasClusterAppLabel(cluster: capiv1beta1.ICluster): boolean {
  return Boolean(
    capiv1beta1
      .getClusterAppName(cluster)
      ?.startsWith(Constants.CLUSTER_APP_NAME_PREFIX)
  );
}

/**
 * Determine the Kubernetes versions specified on the Machines
 * that make up the control plane.
 * @param httpClientFactory
 * @param auth
 * @param cluster
 */
export async function fetchControlPlaneNodesK8sVersions(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cluster: capiv1beta1.ICluster
): Promise<string[]> {
  const versions: string[] = [];

  try {
    const cpNodes = await fetchControlPlaneNodesForCluster(
      httpClientFactory,
      auth,
      cluster
    );

    for (const node of cpNodes) {
      if (node.kind === capiv1beta1.Machine) {
        const version = capiv1beta1.getMachineK8sVersion(node);
        if (version) {
          versions.push(version);
        }
      }
    }
  } catch (err) {
    ErrorReporter.getInstance().notify(err as Error);
  }

  return versions;
}

export function fetchControlPlaneNodesK8sVersionsKey(
  cluster: capiv1beta1.ICluster
): string {
  return `fetchControlPlaneNodesK8sVersions/${cluster.metadata.namespace}/${cluster.metadata.name}`;
}
