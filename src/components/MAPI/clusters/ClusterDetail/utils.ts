import produce from 'immer';
import { Cluster, ControlPlaneNode, ProviderCluster } from 'MAPI/types';
import {
  fetchCluster,
  fetchControlPlaneNodesForCluster,
  fetchControlPlaneNodesForClusterKey,
  fetchProviderClusterForCluster,
  fetchProviderClusterForClusterKey,
  getClusterDescription,
} from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { IHttpClient } from 'model/clients/HttpClient';
import { Constants, Providers } from 'model/constants';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as capzv1beta1 from 'model/services/mapi/capzv1beta1';
import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';
import * as legacyCredentials from 'model/services/mapi/legacy/credentials';
import * as metav1 from 'model/services/mapi/metav1';
import { supportsHACPNodes } from 'model/stores/nodepool/utils';
import { mutate } from 'swr';
import { HttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import {
  hasRestrictedSubstring,
  isLabelKeyAllowed,
  isLabelKeyRestricted,
} from 'utils/labelUtils';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';
import { compare } from 'utils/semver';

import { getClusterConditions } from '../utils';

export async function updateClusterDescription(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  provider: PropertiesOf<typeof Providers>,
  namespace: string,
  name: string,
  newDescription: string
) {
  const cluster = await fetchCluster(
    httpClientFactory,
    auth,
    provider,
    namespace,
    name
  );

  // eslint-disable-next-line @typescript-eslint/init-declarations
  let providerCluster: ProviderCluster;

  if (provider === Providers.AWS) {
    providerCluster = await fetchProviderClusterForCluster(
      httpClientFactory,
      auth,
      cluster
    );
  }

  const description = getClusterDescription(cluster, providerCluster);
  if (description === newDescription) {
    return cluster;
  }

  if (
    providerCluster?.kind === infrav1alpha3.AWSCluster &&
    typeof providerCluster.spec !== 'undefined'
  ) {
    providerCluster.spec.cluster.description = newDescription;

    const updatedProviderCluster = await infrav1alpha3.updateAWSCluster(
      httpClientFactory(),
      auth,
      providerCluster as infrav1alpha3.IAWSCluster
    );

    mutate(
      infrav1alpha3.getAWSClusterKey(
        cluster.metadata.namespace!,
        cluster.metadata.name
      ),
      updatedProviderCluster,
      false
    );
  }

  cluster.metadata.annotations ??= {};
  cluster.metadata.annotations[capiv1beta1.annotationClusterDescription] =
    newDescription;

  return capiv1beta1.updateCluster(httpClientFactory(), auth, cluster);
}

export async function deleteCluster(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cluster: Cluster
) {
  if (cluster.kind === capiv1beta1.Cluster) {
    const client = httpClientFactory();

    const updatedCluster = await capiv1beta1.getCluster(
      client,
      auth,
      cluster.metadata.namespace!,
      cluster.metadata.name
    );

    await capiv1beta1.deleteCluster(client, auth, updatedCluster);

    updatedCluster.metadata.deletionTimestamp = new Date().toISOString();

    mutate(
      capiv1beta1.getClusterKey(
        cluster.metadata.namespace!,
        cluster.metadata.name
      ),
      updatedCluster,
      false
    );

    mutate(
      capiv1beta1.getClusterListKey({
        namespace: cluster.metadata.namespace!,
      }),
      produce((draft?: capiv1beta1.IClusterList) => {
        if (!draft) return;

        for (let i = 0; i < draft.items.length; i++) {
          if (draft.items[i].metadata.name === updatedCluster.metadata.name) {
            draft.items[i] = updatedCluster;
          }
        }
      }),
      false
    );

    return updatedCluster;
  }

  return Promise.reject(new Error('Unsupported provider.'));
}

export async function deleteProviderClusterForCluster(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cluster: Cluster
) {
  const providerCluster = await fetchProviderClusterForCluster(
    httpClientFactory,
    auth,
    cluster
  );

  switch (providerCluster?.kind) {
    case infrav1alpha3.AWSCluster: {
      const client = httpClientFactory();

      await infrav1alpha3.deleteAWSCluster(
        client,
        auth,
        providerCluster as infrav1alpha3.IAWSCluster
      );

      providerCluster.metadata.deletionTimestamp = new Date().toISOString();

      mutate(
        fetchProviderClusterForClusterKey(cluster),
        providerCluster,
        false
      );

      return providerCluster;
    }

    default:
      return Promise.reject(new Error('Unsupported provider.'));
  }
}

export async function deleteControlPlaneNodesForCluster(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cluster: Cluster
) {
  const controlPlaneNodes = await fetchControlPlaneNodesForCluster(
    httpClientFactory,
    auth,
    cluster
  );

  const requests = controlPlaneNodes.map(async (controlPlaneNode) => {
    switch (controlPlaneNode.kind) {
      case infrav1alpha3.AWSControlPlane: {
        const client = httpClientFactory();

        await infrav1alpha3.deleteAWSControlPlane(
          client,
          auth,
          controlPlaneNode as infrav1alpha3.IAWSControlPlane
        );

        controlPlaneNode.metadata.deletionTimestamp = new Date().toISOString();

        return controlPlaneNode;
      }

      case infrav1alpha3.G8sControlPlane: {
        const client = httpClientFactory();

        await infrav1alpha3.deleteG8sControlPlane(
          client,
          auth,
          controlPlaneNode as infrav1alpha3.IG8sControlPlane
        );

        controlPlaneNode.metadata.deletionTimestamp = new Date().toISOString();

        return controlPlaneNode;
      }

      default:
        return Promise.reject(new Error('Unsupported provider.'));
    }
  });

  const updatedControlPlaneNodes = await Promise.all(requests);

  mutate(
    fetchControlPlaneNodesForClusterKey(cluster),
    updatedControlPlaneNodes,
    false
  );
}

export async function deleteClusterResources(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cluster: Cluster
) {
  try {
    await deleteCluster(httpClientFactory, auth, cluster);

    const kind = cluster.spec?.infrastructureRef?.kind;
    if (kind === infrav1alpha3.AWSCluster) {
      await deleteProviderClusterForCluster(httpClientFactory, auth, cluster);
      await deleteControlPlaneNodesForCluster(httpClientFactory, auth, cluster);
    }
  } catch (err) {
    if (
      !metav1.isStatusError(
        (err as GenericResponseError).data,
        metav1.K8sStatusErrorReasons.NotFound
      )
    ) {
      return Promise.reject(err);
    }
  }

  return Promise.resolve();
}

export async function updateClusterLabels(
  httpClient: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string,
  patch: ILabelChange
) {
  const cluster = await capiv1beta1.getCluster(
    httpClient,
    auth,
    namespace,
    name
  );

  cluster.metadata.labels ??= {};

  if (patch.replaceLabelWithKey) {
    delete cluster.metadata.labels[patch.replaceLabelWithKey];
  }

  if (patch.value === null) {
    delete cluster.metadata.labels[patch.key];
  } else {
    cluster.metadata.labels[patch.key] = patch.value;
  }

  return capiv1beta1.updateCluster(httpClient, auth, cluster);
}

function getMainCredential(credentials: legacyCredentials.ICredential[]) {
  return credentials.find((credential, _, collection) => {
    // If only the default credential is present, display it.
    if (collection.length === 1) return true;

    // If there are custom credentials, display the first one.
    return credential.name !== legacyCredentials.defaultCredentialName;
  });
}

export function getCredentialsAccountID(
  credentials?: legacyCredentials.ICredential[]
) {
  if (!credentials) return undefined;
  if (credentials.length < 1) return '';

  const mainCredential = getMainCredential(credentials);
  if (!mainCredential) return '';

  switch (true) {
    case mainCredential.hasOwnProperty('azureSubscriptionID'):
      return mainCredential.azureSubscriptionID;
    case mainCredential.hasOwnProperty('awsOperatorRole'):
      return mainCredential.awsOperatorRole;
    default:
      return '';
  }
}

export function getCredentialsAzureTenantID(
  credentials?: legacyCredentials.ICredential[]
) {
  if (!credentials) return undefined;
  if (credentials.length < 1) return '';

  const mainCredential = getMainCredential(credentials);
  if (!mainCredential) return '';

  return mainCredential.azureTenantID || '';
}

export interface IControlPlaneNodesStats {
  totalCount: number;
  readyCount: number;
  availabilityZones: string[];
}

export function computeControlPlaneNodesStats(
  nodes: ControlPlaneNode[]
): IControlPlaneNodesStats {
  const stats: IControlPlaneNodesStats = {
    totalCount: 0,
    readyCount: 0,
    availabilityZones: [],
  };

  for (const node of nodes) {
    switch (node.kind) {
      case capzv1beta1.AzureMachine:
        stats.totalCount++;

        if (capiv1beta1.isConditionTrue(node, capiv1beta1.conditionTypeReady)) {
          stats.readyCount++;
        }

        if (node.spec?.failureDomain) {
          stats.availabilityZones.push(node.spec.failureDomain);
        }

        break;

      case infrav1alpha3.AWSControlPlane:
        if (node.spec.availabilityZones) {
          stats.availabilityZones.push(...node.spec.availabilityZones);
        }

        break;

      case infrav1alpha3.G8sControlPlane:
        stats.totalCount = node.spec.replicas ?? 0;
        stats.readyCount = node.status?.readyReplicas ?? 0;

        break;
    }
  }

  return stats;
}

export async function updateClusterReleaseVersion(
  httpClient: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string,
  newVersion: string
) {
  const cluster = await capiv1beta1.getCluster(
    httpClient,
    auth,
    namespace,
    name
  );
  const releaseVersion = capiv1beta1.getReleaseVersion(cluster);
  if (releaseVersion === newVersion) {
    return cluster;
  }

  // If an upgrade has been scheduled, we remove the annotations if
  // the current version we're upgrading to is newer or equal to the
  // schedule release version. Otherwise the update request will be denied.
  const scheduleReleaseVersion =
    capiv1beta1.getClusterUpdateScheduleTargetRelease(cluster);
  if (
    scheduleReleaseVersion &&
    compare(scheduleReleaseVersion, newVersion) <= 0
  ) {
    delete cluster.metadata.annotations?.[
      capiv1beta1.annotationUpdateScheduleTargetRelease
    ];
    delete cluster.metadata.annotations?.[
      capiv1beta1.annotationUpdateScheduleTargetTime
    ];
  }

  cluster.metadata.labels ??= {};
  cluster.metadata.labels[capiv1beta1.labelReleaseVersion] = newVersion;

  return capiv1beta1.updateCluster(httpClient, auth, cluster);
}

export function canSwitchClusterToHACPNodes(
  provider: PropertiesOf<typeof Providers>,
  cluster: Cluster,
  providerCluster: ProviderCluster,
  controlPlaneNodes: ControlPlaneNode[]
): boolean {
  const releaseVersion = capiv1beta1.getReleaseVersion(cluster);
  if (!releaseVersion) return false;

  if (!supportsHACPNodes(provider, releaseVersion)) return false;

  const { isConditionUnknown, isCreating, isUpgrading, isDeleting } =
    getClusterConditions(cluster, providerCluster);
  if (isConditionUnknown || isCreating || isUpgrading || isDeleting) {
    return false;
  }

  for (const controlPlaneNode of controlPlaneNodes) {
    if (controlPlaneNode.kind === infrav1alpha3.G8sControlPlane) {
      const replicas = controlPlaneNode.spec.replicas;

      return !replicas || replicas === 1;
    }
  }

  return false;
}

export async function switchClusterToHACPNodes(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cluster: Cluster
) {
  const controlPlaneNodes = await fetchControlPlaneNodesForCluster(
    httpClientFactory,
    auth,
    cluster
  );

  const requests: Promise<ControlPlaneNode>[] = [];
  for (const controlPlaneNode of controlPlaneNodes) {
    if (controlPlaneNode.kind === infrav1alpha3.G8sControlPlane) {
      const client = httpClientFactory();

      controlPlaneNode.spec.replicas = Constants.AWS_HA_MASTERS_MAX_NODES;

      requests.push(
        infrav1alpha3.updateG8sControlPlane(
          client,
          auth,
          controlPlaneNode as infrav1alpha3.IG8sControlPlane
        )
      );
    }
  }

  if (requests.length < 1) return;

  const updatedControlPlaneNodes = await Promise.all(requests);

  mutate(
    fetchControlPlaneNodesForClusterKey(cluster),
    updatedControlPlaneNodes,
    false
  );
}

export function canClusterLabelBeDeleted(key: string) {
  if (isLabelKeyRestricted(key) || hasRestrictedSubstring(key)) {
    return false;
  }

  return true;
}

export function canClusterLabelBeEdited(key: string) {
  if (
    isLabelKeyRestricted(key) ||
    (!isLabelKeyAllowed(key) && hasRestrictedSubstring(key))
  ) {
    return false;
  }

  return true;
}

export function canClusterLabelKeyBeEdited(key: string) {
  if (isLabelKeyRestricted(key) || hasRestrictedSubstring(key)) {
    return false;
  }

  return true;
}
