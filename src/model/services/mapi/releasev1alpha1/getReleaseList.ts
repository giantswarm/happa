import { GenericResponseError } from 'model/clients/GenericResponseError';
import { IHttpClient } from 'model/clients/HttpClient';
import { StatusCodes } from 'model/constants';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getResource } from '../generic/getResource';
import { IReleaseList } from './types';

export function getReleaseList(client: IHttpClient, auth: IOAuth2Provider) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'release.giantswarm.io/v1alpha1',
    kind: 'releases',
  });

  return getResource<IReleaseList>(client, auth, url.toString()).then(
    (data) => {
      if (data.items === undefined) {
        const invalidResponseError = new GenericResponseError();
        invalidResponseError.status = StatusCodes.Ok;
        invalidResponseError.requestConfig = client.getRequestConfig();
        invalidResponseError.data = data;
        invalidResponseError.message =
          'Invalid response. Release list items are missing.';

        throw invalidResponseError;
      }

      return data;
    }
  );
}

export function getReleaseListKey() {
  return 'getReleaseList';
}
