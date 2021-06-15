import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { ControlPlaneNode } from 'MAPI/types';
import { IHttpClient } from 'model/clients/HttpClient';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as capzv1alpha3 from 'model/services/mapi/capzv1alpha3';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import { filterLabels } from 'stores/cluster/utils';
import * as ui from 'UI/Display/MAPI/clusters/types';
import * as releasesUI from 'UI/Display/MAPI/releases/types';

export async function updateClusterDescription(
  httpClient: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string,
  newDescription: string
) {
  const cluster = await capiv1alpha3.getCluster(
    httpClient,
    auth,
    namespace,
    name
  );
  const description = capiv1alpha3.getClusterDescription(cluster);
  if (description === newDescription) {
    return cluster;
  }

  cluster.metadata.annotations ??= {};
  cluster.metadata.annotations[
    capiv1alpha3.annotationClusterDescription
  ] = newDescription;

  return capiv1alpha3.updateCluster(httpClient, auth, cluster);
}

export async function deleteCluster(
  httpClient: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string
) {
  const cluster = await capiv1alpha3.getCluster(
    httpClient,
    auth,
    namespace,
    name
  );

  return capiv1alpha3.deleteCluster(httpClient, auth, cluster);
}

export function mapControlPlaneNodeToUIControlPlaneNode(
  node: ControlPlaneNode
): ui.IControlPlaneNodeItem {
  switch (node.kind) {
    case capzv1alpha3.AzureMachine:
      return {
        isReady: capiv1alpha3.isConditionTrue(
          node,
          capiv1alpha3.conditionTypeReady
        ),
        availabilityZone: node.spec?.failureDomain ?? '',
      };

    default:
      return {
        isReady: false,
        availabilityZone: '',
      };
  }
}

export function getVisibleLabels(cluster?: capiv1alpha3.ICluster) {
  if (!cluster) return undefined;

  const existingLabels = capiv1alpha3.getClusterLabels(cluster);

  return filterLabels(existingLabels);
}

export async function updateClusterLabels(
  httpClient: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string,
  patch: ILabelChange
) {
  const cluster = await capiv1alpha3.getCluster(
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

  return capiv1alpha3.updateCluster(httpClient, auth, cluster);
}

export function mapReleasesToUIReleases(
  releases?: releasev1alpha1.IRelease[]
): Record<string, releasesUI.IRelease> {
  if (!releases) return {};

  return releases.reduce(
    (
      acc: Record<string, releasesUI.IRelease>,
      currItem: releasev1alpha1.IRelease
    ) => {
      // Remove the `v` prefix.
      const normalizedVersion =
        currItem.metadata.name[0] === 'v'
          ? currItem.metadata.name.slice(1)
          : currItem.metadata.name;

      acc[normalizedVersion] = {
        version: normalizedVersion,
        k8sVersion: releasev1alpha1.getK8sVersion(currItem),
      };

      return acc;
    },
    {}
  );
}
