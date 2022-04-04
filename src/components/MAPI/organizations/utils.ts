import { Cluster, ClusterList } from 'MAPI/types';
import { fetchClusterList, fetchClusterListKey } from 'MAPI/utils';
import { GenericResponse } from 'model/clients/GenericResponse';
import { Providers } from 'model/constants';
import * as authorizationv1 from 'model/services/mapi/authorizationv1';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
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
    const clusterOrg = capiv1beta1.getClusterOrganization(cluster);
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
  const request: authorizationv1.ISelfSubjectAccessReviewSpec = {
    resourceAttributes: {
      namespace: '',
      verb: 'list',
      group: 'cluster.x-k8s.io',
      resource: 'clusters',
    },
  };

  const accessReviewResponse =
    await authorizationv1.createSelfSubjectAccessReview(
      httpClientFactory(),
      auth,
      request
    );

  if (accessReviewResponse.status?.allowed) {
    // If the user has access to list clusters at the cluster scope,
    // return the function to list clusters at the cluster scope
    return fetchClusterList(httpClientFactory, auth, provider, '');
  }

  const clusterList: capiv1beta1.IClusterList = {
    apiVersion: 'cluster.x-k8s.io/v1beta1',
    kind: capiv1beta1.ClusterList,
    metadata: {},
    items: [],
  };

  const requests = Object.entries(organizations).map(
    async ([organizationName, organizationEntry]) => {
      const clusterListKey = fetchClusterListKey(
        provider,
        organizationEntry.namespace,
        organizationName
      );
      const cachedClusterList: capiv1beta1.IClusterList | undefined =
        cache.get(clusterListKey);

      if (cachedClusterList) {
        return cachedClusterList.items;
      }
      try {
        const clusters = await fetchClusterList(
          httpClientFactory,
          auth,
          provider,
          organizationEntry.namespace,
          organizationName
        );

        cache.set(clusterListKey, clusters);

        return clusters.items;
      } catch (err) {
        if (
          !metav1.isStatusError(
            (err as GenericResponse).data,
            metav1.K8sStatusErrorReasons.Forbidden
          )
        ) {
          // If the request failed due to non-permission-related reasons (non-403),
          // return the error
          return Promise.reject(err);
        }

        return [];
      }
    }
  );

  const responses = await Promise.all(requests);
  for (const response of responses) {
    if (response.length > 0) {
      clusterList.items.push(...response);
    }
  }

  return clusterList;
}

export function fetchClusterListForOrganizationsKey(
  organizations: Record<string, IOrganization>
): string {
  return `fetchClusterListForOrgs/${Object.keys(organizations).join('/')}`;
}
