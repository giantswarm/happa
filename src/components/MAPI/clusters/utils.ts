import * as releasesUtils from 'MAPI/releases/utils';
import {
  Cluster,
  ControlPlaneNode,
  NodePool,
  ProviderCluster,
} from 'MAPI/types';
import {
  fetchControlPlaneNodesForClusterKey,
  fetchProviderClusterForClusterKey,
  generateUID,
  getClusterDescription,
  IMachineType,
  IProviderClusterForClusterName,
} from 'MAPI/utils';
import { IProviderNodePoolForNodePool } from 'MAPI/workernodes/utils';
import { Constants, Providers } from 'model/constants';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';
import * as capzv1beta1 from 'model/services/mapi/capzv1beta1';
import * as corev1 from 'model/services/mapi/corev1';
import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import {
  getIsImpersonatingNonAdmin,
  getUserIsAdmin,
} from 'model/stores/main/selectors';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
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
    switch (providerNodePool?.kind) {
      case capzexpv1alpha3.AzureMachinePool:
      case capzv1beta1.AzureMachinePool:
        {
          const vmSize = providerNodePool.spec?.template.vmSize;
          const readyReplicas = nodePool.status?.readyReplicas;

          if (!vmSize) return -1;

          if (typeof readyReplicas !== 'undefined') {
            const machineTypeProperties = machineTypes[vmSize];
            if (!machineTypeProperties) {
              return -1;
            }

            count += machineTypeProperties.cpu * readyReplicas;
          }
        }

        break;

      case infrav1alpha3.AWSMachineDeployment: {
        const instanceType = providerNodePool.spec.provider.worker.instanceType;
        const readyReplicas = nodePool.status?.readyReplicas;

        if (typeof readyReplicas !== 'undefined') {
          const machineTypeProperties = machineTypes[instanceType];
          if (!machineTypeProperties) {
            return -1;
          }

          count += machineTypeProperties.cpu * readyReplicas;
        }

        break;
      }

      default:
        return -1;
    }
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
    switch (providerNodePool?.kind) {
      case capzexpv1alpha3.AzureMachinePool:
      case capzv1beta1.AzureMachinePool: {
        const vmSize = providerNodePool.spec?.template.vmSize;
        const readyReplicas = nodePool.status?.readyReplicas;

        if (!vmSize) return -1;

        if (typeof readyReplicas !== 'undefined') {
          const machineTypeProperties = machineTypes[vmSize];
          if (!machineTypeProperties) {
            return -1;
          }

          count += machineTypeProperties.memory * readyReplicas;
        }

        break;
      }

      case infrav1alpha3.AWSMachineDeployment: {
        const instanceType = providerNodePool.spec.provider.worker.instanceType;
        const readyReplicas = nodePool.status?.readyReplicas;

        if (typeof readyReplicas !== 'undefined') {
          const machineTypeProperties = machineTypes[instanceType];
          if (!machineTypeProperties) {
            return -1;
          }

          count += machineTypeProperties.memory * readyReplicas;
        }

        break;
      }

      default:
        return -1;
    }
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
    apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
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
  switch (config.providerCluster?.kind) {
    case capzv1beta1.AzureCluster:
    case infrav1alpha3.AWSCluster:
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
  switch (config.providerCluster?.kind) {
    case capzv1beta1.AzureCluster:
      return [createDefaultAzureMachine(config)];
    case infrav1alpha3.AWSCluster: {
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
    apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
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
    apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
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

export async function createCluster(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  config: {
    cluster: Cluster;
    providerCluster: ProviderCluster;
    controlPlaneNodes: ControlPlaneNode[];
  }
): Promise<{
  cluster: Cluster;
  providerCluster: ProviderCluster;
  controlPlaneNodes: ControlPlaneNode[];
}> {
  switch (config.providerCluster!.kind) {
    case capzv1beta1.AzureCluster: {
      const providerCluster = await capzv1beta1.createAzureCluster(
        httpClientFactory(),
        auth,
        config.providerCluster as capzv1beta1.IAzureCluster
      );

      mutate(
        fetchProviderClusterForClusterKey(config.cluster),
        providerCluster,
        false
      );

      const controlPlaneNodes = await Promise.all(
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

      const cluster = await capiv1beta1.createCluster(
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

      return { cluster, providerCluster, controlPlaneNodes };
    }

    case infrav1alpha3.AWSCluster: {
      const providerCluster = await infrav1alpha3.createAWSCluster(
        httpClientFactory(),
        auth,
        config.providerCluster as infrav1alpha3.IAWSCluster
      );

      mutate(
        fetchProviderClusterForClusterKey(config.cluster),
        providerCluster,
        false
      );

      const cluster = await capiv1beta1.createCluster(
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

      const controlPlaneNodes = await Promise.all<ControlPlaneNode>(
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

      return { cluster, providerCluster, controlPlaneNodes };
    }

    default:
      return Promise.reject(new Error('Unsupported provider.'));
  }
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

  switch (infrastructureRef.kind) {
    case capzv1beta1.AzureCluster:
      statuses.isConditionUnknown =
        typeof cluster.status === 'undefined' ||
        typeof cluster.status.conditions === 'undefined';
      statuses.isCreating = isClusterCreating(cluster);
      statuses.isUpgrading = isClusterUpgrading(cluster);
      break;

    case infrav1alpha3.AWSCluster: {
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
