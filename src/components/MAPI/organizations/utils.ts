import { Cluster, ClusterList } from 'MAPI/types';
import { fetchClusterList, fetchClusterListKey } from 'MAPI/utils';
import { GenericResponse } from 'model/clients/GenericResponse';
import { Providers } from 'model/constants';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as metav1 from 'model/services/mapi/metav1';
import { Cache } from 'swr';
import { HttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

export enum OrganizationNameStatusMessage {
  TooShort = `Must be at least 4 characters long`,
  StartAndEndWithAlphaNumeric = 'Must start and end with an alphanumeric character (a-z, 0-9)',
  CharacterSet = 'Must contain only a-z, 0-9, and hyphens and underscores',
  TooLong = 'Must not be longer than 249 characters',
  Ok = '',
}

const minLength = 4;
const maxLength = 249;

const startAndEndWithAlphanumericRegExp = /^[a-z0-9].*[a-z0-9]$/;
const characterSetRegExp = /^[a-z0-9\-\_]+$/;

export function validateOrganizationName(orgName: string): {
  valid: boolean;
  statusMessage: OrganizationNameStatusMessage;
} {
  switch (true) {
    case orgName.length < minLength:
      return {
        valid: false,
        statusMessage: OrganizationNameStatusMessage.TooShort,
      };

    case orgName.length > maxLength:
      return {
        valid: false,
        statusMessage: OrganizationNameStatusMessage.TooLong,
      };

    case !startAndEndWithAlphanumericRegExp.test(orgName):
      return {
        valid: false,
        statusMessage:
          OrganizationNameStatusMessage.StartAndEndWithAlphaNumeric,
      };

    case !characterSetRegExp.test(orgName):
      return {
        valid: false,
        statusMessage: OrganizationNameStatusMessage.CharacterSet,
      };

    default:
      return {
        valid: true,
        statusMessage: OrganizationNameStatusMessage.Ok,
      };
  }
}

export function computeClusterCountersForOrganizations(clusters?: Cluster[]) {
  return clusters?.reduce((acc: Record<string, number>, cluster: Cluster) => {
    const clusterOrg = capiv1alpha3.getClusterOrganization(cluster);
    if (!clusterOrg) return acc;

    acc[clusterOrg] ??= 0;
    acc[clusterOrg]++;

    return acc;
  }, {});
}

export async function fetchClusterListForOrganizations(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cache: Cache,
  provider: PropertiesOf<typeof Providers>,
  organizations: Record<string, IOrganization>
): Promise<ClusterList> {
  const clusterList: capiv1alpha3.IClusterList = {
    apiVersion: 'cluster.x-k8s.io/v1alpha3',
    kind: capiv1alpha3.ClusterList,
    metadata: {},
    items: [],
  };

  for (const [organizationName, organizationEntry] of Object.entries(
    organizations
  )) {
    const clusterListKey = fetchClusterListKey(
      provider,
      organizationEntry.namespace,
      organizationName
    );
    const cachedClusterList: capiv1alpha3.IClusterList | undefined =
      cache.get(clusterListKey);

    if (cachedClusterList) {
      clusterList.items.push(...cachedClusterList.items);
    } else {
      try {
        const clusters = await fetchClusterList(
          httpClientFactory,
          auth,
          provider,
          organizationEntry.namespace,
          organizationName
        );

        clusterList.items.push(...clusters.items);
        cache.set(clusterListKey, clusters);
      } catch (err) {
        if (
          !metav1.isStatusError(
            (err as GenericResponse).data,
            metav1.K8sStatusErrorReasons.Forbidden
          )
        ) {
          return Promise.reject(err);
        }
        continue;
      }
    }
  }

  return clusterList;
}

export function fetchClusterListForOrganizationsKey(
  organizations: Record<string, IOrganization>
): string {
  return `fetchClusterListForOrgs/${Object.keys(organizations).join('/')}`;
}
