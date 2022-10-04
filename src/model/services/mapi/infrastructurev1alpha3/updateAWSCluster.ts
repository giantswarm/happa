import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { updateResource } from '../generic/updateResource';
import { ApiVersion, IAWSCluster } from './';

export function updateAWSCluster(
  client: IHttpClient,
  auth: IOAuth2Provider,
  awsCluster: IAWSCluster
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: ApiVersion,
    kind: 'awsclusters',
    namespace: awsCluster.metadata.namespace!,
    name: awsCluster.metadata.name,
  } as k8sUrl.IK8sUpdateOptions);

  return updateResource<IAWSCluster>(client, auth, url.toString(), awsCluster);
}
