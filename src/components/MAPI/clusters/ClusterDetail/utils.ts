import produce from 'immer';
import {
  Cluster,
  ControlPlaneNode,
  ProviderCluster,
  ProviderCredential,
} from 'MAPI/types';
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
import * as capav1beta1 from 'model/services/mapi/capav1beta1';
import * as capav1beta2 from 'model/services/mapi/capav1beta2';
import * as capgv1beta1 from 'model/services/mapi/capgv1beta1';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as capzv1beta1 from 'model/services/mapi/capzv1beta1';
import { getResourceByRefKey } from 'model/services/mapi/generic/getResourceByRef';
import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';
import * as legacyCredentials from 'model/services/mapi/legacy/credentials';
import { extractIDFromARN } from 'model/services/mapi/legacy/credentials';
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

import { getClusterConditions, hasClusterAppLabel } from '../utils';

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

  const infrastructureRef = cluster.spec?.infrastructureRef;
  if (!infrastructureRef) {
    return Promise.reject(
      new Error('There is no infrastructure reference defined.')
    );
  }

  const { kind, apiVersion } = infrastructureRef;

  if (
    kind === infrav1alpha3.AWSCluster &&
    apiVersion === infrav1alpha3.AWSClusterApiVersion
  ) {
    const providerCluster = (await fetchProviderClusterForCluster(
      httpClientFactory,
      auth,
      cluster
    )) as infrav1alpha3.IAWSCluster;

    if (
      typeof providerCluster === 'undefined' ||
      typeof providerCluster.spec === 'undefined'
    ) {
      return cluster;
    }

    const description = getClusterDescription(cluster, null);
    if (description === newDescription) {
      return cluster;
    }

    providerCluster.spec.cluster.description = newDescription;

    const updatedProviderCluster = await infrav1alpha3.updateAWSCluster(
      httpClientFactory(),
      auth,
      providerCluster
    );

    mutate(
      getResourceByRefKey(infrastructureRef),
      updatedProviderCluster,
      false
    );

    return cluster;
  }

  const description = getClusterDescription(cluster, null);
  if (description === newDescription) {
    return cluster;
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

  if (typeof providerCluster === 'undefined') {
    return Promise.reject(new Error('Unsupported provider.'));
  }

  const { kind, apiVersion } = providerCluster;

  switch (true) {
    case kind === infrav1alpha3.AWSCluster &&
      apiVersion === infrav1alpha3.AWSClusterApiVersion: {
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
          controlPlaneNode
        );

        controlPlaneNode.metadata.deletionTimestamp = new Date().toISOString();

        return controlPlaneNode;
      }

      case infrav1alpha3.G8sControlPlane: {
        const client = httpClientFactory();

        await infrav1alpha3.deleteG8sControlPlane(
          client,
          auth,
          controlPlaneNode
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
    const apiVersion = cluster.spec?.infrastructureRef?.apiVersion;

    if (
      kind === infrav1alpha3.AWSCluster &&
      apiVersion === infrav1alpha3.AWSClusterApiVersion
    ) {
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

export async function fetchProviderCredential(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cluster: Cluster,
  providerCluster: ProviderCluster,
  controlPlaneNodes: ControlPlaneNode[],
  organizationName: string
): Promise<ProviderCredential> {
  try {
    const infrastructureRef = cluster.spec?.infrastructureRef;
    if (!infrastructureRef) {
      throw new Error('Unsupported provider.');
    }
    const { kind, apiVersion } = infrastructureRef;

    switch (true) {
      case kind === capav1beta1.AWSCluster &&
        apiVersion === capav1beta1.AWSClusterApiVersion: {
        const identityRef = (providerCluster as capav1beta1.IAWSCluster).spec
          ?.identityRef;

        if (identityRef?.kind !== 'AWSClusterRoleIdentity') {
          throw new Error('Unsupported AWS cluster role identity reference.');
        }

        return capav1beta1.getAWSClusterRoleIdentity(
          httpClientFactory(),
          auth,
          identityRef.name
        );
      }

      case kind === capav1beta2.AWSManagedCluster &&
        apiVersion === capav1beta2.AWSManagedClusterApiVersion: {
        const identityRef = (
          controlPlaneNodes?.[0] as capav1beta2.IAWSManagedControlPlane
        ).spec?.identityRef;

        if (identityRef?.kind !== 'AWSClusterRoleIdentity') {
          throw new Error('Unsupported AWS cluster role identity reference.');
        }

        return capav1beta2.getAWSClusterRoleIdentity(
          httpClientFactory(),
          auth,
          identityRef.name
        );
      }

      case kind === capgv1beta1.GCPCluster:
        return undefined;

      case kind === capzv1beta1.AzureCluster && hasClusterAppLabel(cluster): {
        const identityRef = (providerCluster as capzv1beta1.IAzureCluster).spec
          ?.identityRef;
        const { namespace, name } = identityRef ?? {};

        if (!namespace || !name) {
          throw new Error('No Azure cluster identity reference found.');
        }

        return capzv1beta1.getAzureClusterIdentity(
          httpClientFactory(),
          auth,
          namespace,
          name
        );
      }

      case kind === capzv1beta1.AzureCluster:
      case kind === infrav1alpha3.AWSCluster &&
        apiVersion === infrav1alpha3.AWSClusterApiVersion: {
        const credentials = await legacyCredentials.getCredentialList(
          httpClientFactory(),
          auth,
          organizationName
        );

        return getMainCredential(credentials.items);
      }

      default:
        throw new Error('Unsupported provider.');
    }
  } catch (err) {
    return Promise.reject(err);
  }
}

// eslint-disable-next-line complexity
export function fetchProviderCredentialKey(
  cluster?: Cluster,
  providerCluster?: ProviderCluster,
  controlPlaneNodes?: ControlPlaneNode[],
  organizationName?: string
): string | null {
  if (!cluster || !providerCluster || !organizationName || !controlPlaneNodes) {
    return null;
  }

  const infrastructureRef = cluster.spec?.infrastructureRef;
  if (!infrastructureRef) {
    return null;
  }

  const { kind, apiVersion } = infrastructureRef;

  switch (true) {
    case kind === capav1beta1.AWSCluster &&
      apiVersion === capav1beta1.AWSClusterApiVersion: {
      const identityRef = (providerCluster as capav1beta1.IAWSCluster).spec
        ?.identityRef;

      if (identityRef?.kind !== 'AWSClusterRoleIdentity') {
        return null;
      }

      return capav1beta1.getAWSClusterRoleIdentityKey(identityRef.name);
    }

    case kind === capav1beta2.AWSManagedCluster &&
      apiVersion === capav1beta2.AWSManagedClusterApiVersion: {
      const identityRef = (
        controlPlaneNodes?.[0] as capav1beta2.IAWSManagedControlPlane
      ).spec?.identityRef;

      if (identityRef?.kind !== 'AWSClusterRoleIdentity') {
        return null;
      }

      return capav1beta2.getAWSClusterRoleIdentityKey(cluster.metadata.name);
    }

    case kind === capgv1beta1.GCPCluster:
      return 'fetchProviderCredentialForGCP';

    case kind === capzv1beta1.AzureCluster && hasClusterAppLabel(cluster): {
      const identityRef = (providerCluster as capzv1beta1.IAzureCluster).spec
        ?.identityRef;
      const { namespace, name } = identityRef ?? {};

      if (!namespace || !name) {
        return null;
      }

      return capzv1beta1.getAzureClusterIdentityKey(namespace, name);
    }

    case kind === capzv1beta1.AzureCluster:
    case kind === infrav1alpha3.AWSCluster &&
      apiVersion === infrav1alpha3.AWSClusterApiVersion: {
      return `${legacyCredentials.getCredentialListKey(
        organizationName
      )}/mainCredential`;
    }

    default:
      return null;
  }
}

function getMainCredential(credentials: legacyCredentials.ICredential[]) {
  return credentials.find((credential, _, collection) => {
    // If only the default credential is present, display it.
    if (collection.length === 1) return true;

    // If there are custom credentials, display the first one.
    return credential.name !== legacyCredentials.defaultCredentialName;
  });
}

export function getAWSCredentialAccountID(
  credential?:
    | legacyCredentials.ICredential
    | capav1beta1.IAWSClusterRoleIdentity
    | capav1beta2.IAWSClusterRoleIdentity
) {
  if (!credential) return '';

  switch (true) {
    case credential.hasOwnProperty('kind') &&
      (credential as capav1beta1.IAWSClusterRoleIdentity).kind ===
        'AWSClusterRoleIdentity':
      return extractIDFromARN(
        (credential as capav1beta1.IAWSClusterRoleIdentity).spec?.roleARN
      );
    case credential.hasOwnProperty('awsOperatorRole'):
      return (credential as legacyCredentials.ICredential).awsOperatorRole;
    default:
      return '';
  }
}

interface IAzureCredentialDetails {
  tenantID: string | undefined;
  subscriptionID: string | undefined;
}

export function getAzureCredentialDetails(
  providerCluster: capzv1beta1.IAzureCluster,
  credential?: legacyCredentials.ICredential | capzv1beta1.IAzureClusterIdentity
): IAzureCredentialDetails {
  const details: IAzureCredentialDetails = {
    tenantID: '',
    subscriptionID: providerCluster.spec?.subscriptionID,
  };
  if (!credential) return details;

  switch (true) {
    case credential.hasOwnProperty('kind') &&
      (credential as capzv1beta1.IAzureClusterIdentity).kind ===
        'AzureClusterIdentity':
      details.tenantID =
        (credential as capzv1beta1.IAzureClusterIdentity).spec?.tenantID ?? '';
      break;

    case credential.hasOwnProperty('azureTenantID'):
      details.tenantID =
        (credential as legacyCredentials.ICredential).azureTenantID ?? '';
      details.subscriptionID =
        (credential as legacyCredentials.ICredential).azureSubscriptionID ?? '';
      break;
  }

  return details;
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
      case capav1beta2.AWSManagedControlPlane:
        stats.totalCount++;

        if (capiv1beta1.isConditionTrue(node, capiv1beta1.conditionTypeReady)) {
          stats.readyCount++;
        }

        if (node.status?.failureDomains) {
          for (const failureDomain in node.status.failureDomains) {
            if (node.status.failureDomains[failureDomain].controlPlane) {
              stats.availabilityZones.push(failureDomain);
            }
          }
        }

        break;

      case capiv1beta1.Machine:
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
        infrav1alpha3.updateG8sControlPlane(client, auth, controlPlaneNode)
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
