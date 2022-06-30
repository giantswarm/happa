import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { DeepPartial } from 'utils/helpers';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { patchResource } from '../generic/patchResource';
import { IApp } from './types';

export function patchApp(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string,
  data: DeepPartial<IApp>
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: 'apps',
    namespace,
    name,
  } as k8sUrl.IK8sPatchOptions);

  return patchResource<IApp>(client, auth, url.toString(), data);
}
