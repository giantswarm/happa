import ErrorReporter from 'lib/errors/ErrorReporter';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { compare } from 'lib/semver';
import { VersionImpl } from 'lib/Version';
import * as releasesUtils from 'MAPI/releases/utils';
import {
  Cluster,
  ControlPlaneNode,
  NodePool,
  ProviderCluster,
  ProviderNodePool,
} from 'MAPI/types';
import {
  fetchMasterListForClusterKey,
  fetchProviderClusterForClusterKey,
  IMachineType,
} from 'MAPI/utils';
import { IHttpClient } from 'model/clients/HttpClient';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as capzv1alpha3 from 'model/services/mapi/capzv1alpha3';
import * as corev1 from 'model/services/mapi/corev1';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import { Constants, Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import { mutate } from 'swr';

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
  nodePools?: NodePool[],
  providerNodePools?: ProviderNodePool[],
  machineTypes?: Record<string, IMachineType>
) {
  if (!nodePools || !providerNodePools || !machineTypes) return undefined;

  let count = 0;

  for (let i = 0; i < providerNodePools.length; i++) {
    const providerNp = providerNodePools[i];

    switch (providerNp?.apiVersion) {
      case 'exp.infrastructure.cluster.x-k8s.io/v1alpha3':
      case 'infrastructure.cluster.x-k8s.io/v1alpha4':
        {
          const vmSize = providerNp.spec?.template.vmSize;
          const readyReplicas = nodePools[i].status?.readyReplicas;

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

      case 'infrastructure.giantswarm.io/v1alpha3':
        count = -1;
    }
  }

  return count;
}

export function getWorkerNodesMemory(
  nodePools?: NodePool[],
  providerNodePools?: ProviderNodePool[],
  machineTypes?: Record<string, IMachineType>
) {
  if (!nodePools || !providerNodePools || !machineTypes) return undefined;

  let count = 0;

  for (let i = 0; i < providerNodePools.length; i++) {
    const providerNp = providerNodePools[i];

    switch (providerNp?.apiVersion) {
      case 'exp.infrastructure.cluster.x-k8s.io/v1alpha3':
      case 'infrastructure.cluster.x-k8s.io/v1alpha4':
        {
          const vmSize = providerNp.spec?.template.vmSize;
          const readyReplicas = nodePools[i].status?.readyReplicas;

          if (!vmSize) return -1;

          if (typeof readyReplicas !== 'undefined') {
            const machineTypeProperties = machineTypes[vmSize];
            if (!machineTypeProperties) {
              return -1;
            }

            count += machineTypeProperties.memory * readyReplicas;
          }
        }

        break;

      case 'infrastructure.giantswarm.io/v1alpha3':
        count = -1;
    }
  }

  return count;
}

export function compareClusters(
  a: capiv1alpha3.ICluster,
  b: capiv1alpha3.ICluster
) {
  // Move clusters that are currently deleting to the end of the list.
  const aIsDeleting = typeof a.metadata.deletionTimestamp !== 'undefined';
  const bIsDeleting = typeof b.metadata.deletionTimestamp !== 'undefined';

  if (aIsDeleting && !bIsDeleting) {
    return 1;
  } else if (!aIsDeleting && bIsDeleting) {
    return -1;
  }

  // Sort by description.
  const descriptionComparison = capiv1alpha3
    .getClusterDescription(a)
    .localeCompare(capiv1alpha3.getClusterDescription(b));
  if (descriptionComparison !== 0) {
    return descriptionComparison;
  }

  // If descriptions are the same, sort by resource name.
  return a.metadata.name.localeCompare(b.metadata.name);
}

export function isClusterUpgradable(
  cluster: capiv1alpha3.ICluster,
  provider: PropertiesOf<typeof Providers>,
  isAdmin: boolean,
  releases?: releasev1alpha1.IRelease[]
): boolean {
  if (!releases) return false;

  const releaseVersion = capiv1alpha3.getReleaseVersion(cluster);
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

export function isClusterUpgrading(cluster: capiv1alpha3.ICluster): boolean {
  return (
    capiv1alpha3.isConditionTrue(
      cluster,
      capiv1alpha3.conditionTypeUpgrading,
      capiv1alpha3.withReasonUpgradePending()
    ) &&
    capiv1alpha3.isConditionFalse(
      cluster,
      capiv1alpha3.conditionTypeUpgrading,
      capiv1alpha3.withReasonUpgradeNotStarted(),
      capiv1alpha3.withReasonUpgradeCompleted()
    )
  );
}

export function isClusterCreating(cluster: capiv1alpha3.ICluster): boolean {
  return (
    capiv1alpha3.isConditionTrue(cluster, capiv1alpha3.conditionTypeCreating) &&
    capiv1alpha3.isConditionFalse(
      cluster,
      capiv1alpha3.conditionTypeCreating,
      capiv1alpha3.withReasonCreationCompleted(),
      capiv1alpha3.withReasonExistingObject()
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
  if (provider === Providers.AZURE) {
    return createDefaultAzureCluster(config);
  }

  throw new Error('Unsupported provider.');
}

function createDefaultAzureCluster(config: {
  namespace: string;
  name: string;
  organization: string;
  releaseVersion: string;
}): capzv1alpha3.IAzureCluster {
  return {
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha3',
    kind: capzv1alpha3.AzureCluster,
    metadata: {
      namespace: config.namespace,
      name: config.name,
      labels: {
        [capiv1alpha3.labelCluster]: config.name,
        [capiv1alpha3.labelClusterName]: config.name,
        [capiv1alpha3.labelOrganization]: config.organization,
        [capiv1alpha3.labelReleaseVersion]: config.releaseVersion,
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

export function createDefaultCluster(config: {
  providerCluster: ProviderCluster;
}) {
  if (config.providerCluster?.kind === capzv1alpha3.AzureCluster) {
    return createDefaultV1Alpha3Cluster(config);
  }

  throw new Error('Unsupported provider.');
}

function createDefaultV1Alpha3Cluster(config: {
  providerCluster: ProviderCluster;
}): capiv1alpha3.ICluster {
  const namespace = config.providerCluster!.metadata.namespace;
  const name = config.providerCluster!.metadata.name;
  const organization =
    config.providerCluster!.metadata.labels![capiv1alpha3.labelOrganization];
  const releaseVersion =
    config.providerCluster!.metadata.labels![capiv1alpha3.labelReleaseVersion];

  return {
    apiVersion: 'cluster.x-k8s.io/v1alpha3',
    kind: capiv1alpha3.Cluster,
    metadata: {
      name,
      namespace,
      labels: {
        [capiv1alpha3.labelCluster]: name,
        [capiv1alpha3.labelClusterName]: name,
        [capiv1alpha3.labelOrganization]: organization,
        [capiv1alpha3.labelReleaseVersion]: releaseVersion,
      },
      annotations: {
        [capiv1alpha3.annotationClusterDescription]:
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
  if (config.providerCluster?.kind === capzv1alpha3.AzureCluster) {
    return [createDefaultAzureMachine(config)];
  }

  throw new Error('Unsupported provider.');
}

function createDefaultAzureMachine(config: {
  providerCluster: ProviderCluster;
}): capzv1alpha3.IAzureMachine {
  const namespace = config.providerCluster!.metadata.namespace;
  const name = config.providerCluster!.metadata.name;
  const organization =
    config.providerCluster!.metadata.labels![capiv1alpha3.labelOrganization];
  const releaseVersion =
    config.providerCluster!.metadata.labels![capiv1alpha3.labelReleaseVersion];

  return {
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha3',
    kind: capzv1alpha3.AzureMachine,
    metadata: {
      namespace: namespace,
      name: `${name}-master-0`,
      labels: {
        [capiv1alpha3.labelCluster]: name,
        [capiv1alpha3.labelClusterName]: name,
        [capiv1alpha3.labelMachineControlPlane]: 'true',
        [capiv1alpha3.labelOrganization]: organization,
        [capiv1alpha3.labelReleaseVersion]: releaseVersion,
      },
    },
    spec: {
      vmSize: Constants.AZURE_CONTROL_PLANE_DEFAULT_VM_SIZE,
      failureDomain: '',
      location: '',
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

export async function createCluster(
  httpClient: IHttpClient,
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
  if (config.providerCluster!.kind === capzv1alpha3.AzureCluster) {
    const providerCluster = await capzv1alpha3.createAzureCluster(
      httpClient,
      auth,
      config.providerCluster as capzv1alpha3.IAzureCluster
    );

    mutate(
      fetchProviderClusterForClusterKey(config.cluster),
      providerCluster,
      false
    );

    const controlPlaneNodes = await Promise.all(
      config.controlPlaneNodes.map((n) =>
        capzv1alpha3.createAzureMachine(httpClient, auth, n)
      )
    );

    const controlPlaneNodesList: capzv1alpha3.IAzureMachineList = {
      apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha3',
      kind: capzv1alpha3.AzureMachineList,
      metadata: {},
      items: controlPlaneNodes,
    };

    mutate(
      fetchMasterListForClusterKey(config.cluster),
      controlPlaneNodesList,
      false
    );

    const cluster = await capiv1alpha3.createCluster(
      httpClient,
      auth,
      config.cluster
    );

    mutate(
      capiv1alpha3.getClusterKey(
        cluster.metadata.namespace!,
        cluster.metadata.name
      ),
      cluster,
      false
    );

    // Add the created cluster to the existing list.
    mutate(
      capiv1alpha3.getClusterListKey({
        namespace: cluster.metadata.namespace!,
      }),
      (draft?: capiv1alpha3.IClusterList) => {
        draft?.items.push(cluster);
      },
      false
    );

    return { cluster, providerCluster, controlPlaneNodes };
  }

  return Promise.reject(new Error('Unsupported provider.'));
}

export function findLatestReleaseVersion(
  releases: releasev1alpha1.IRelease[]
): string | undefined {
  const versions: string[] = [];
  for (const release of releases) {
    if (release.spec.state !== 'active') continue;

    try {
      const version = new VersionImpl(release.metadata.name.slice(1));
      if (version.getPreRelease().length > 1) continue;

      versions.push(version.toString());
    } catch (err) {
      ErrorReporter.getInstance().notify(err as Error);

      continue;
    }
  }

  // Sort versions in a descending order, taking into account the SemVer formatting.
  const sortedVersions = versions.sort((a, b) => compare(b, a));

  return sortedVersions[0];
}
