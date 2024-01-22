import { IHttpClient } from 'model/clients/HttpClient';
import { getResource } from 'model/services/mapi/generic/getResource';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { IKubeadmControlPlane } from '.';

export function getKubeadmControlPlane(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'controlplane.cluster.x-k8s.io/v1beta1',
    kind: 'kubeadmcontrolplanes',
    namespace,
    name,
  });

  return getResource<IKubeadmControlPlane>(client, auth, url.toString());
}

export function getKubeadmControlPlaneKey(namespace: string, name: string) {
  return `getKubeadmControlPlane/${namespace}/${name}`;
}
