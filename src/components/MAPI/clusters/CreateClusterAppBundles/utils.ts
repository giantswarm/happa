import { IHttpClient } from 'model/clients/HttpClient';
import { Constants, Providers } from 'model/constants';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

export async function fetchClusterAppACEList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  provider: PropertiesOf<typeof Providers>
): Promise<applicationv1alpha1.IAppCatalogEntryList> {
  const getOptions: applicationv1alpha1.IGetAppCatalogEntryListOptions = {
    labelSelector: {
      matchingLabels: {
        [applicationv1alpha1.labelAppName]:
          applicationv1alpha1.getClusterAppNameForProvider(provider),
        [applicationv1alpha1.labelAppCatalog]:
          Constants.CLUSTER_APPS_CATALOG_NAME,
      },
    },
    namespace: Constants.CLUSTER_APPS_CATALOG_NAMESPACE,
  };

  return applicationv1alpha1.getAppCatalogEntryList(client, auth, getOptions);
}

export function fetchClusterAppACEListKey() {
  return `fetchClusterAppACEList`;
}

export async function fetchClusterDefaultAppsACEList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  provider: PropertiesOf<typeof Providers>
): Promise<applicationv1alpha1.IAppCatalogEntryList> {
  const getOptions: applicationv1alpha1.IGetAppCatalogEntryListOptions = {
    labelSelector: {
      matchingLabels: {
        [applicationv1alpha1.labelAppName]:
          applicationv1alpha1.getDefaultAppNameForProvider(provider),
        [applicationv1alpha1.labelAppCatalog]:
          Constants.CLUSTER_APPS_CATALOG_NAME,
      },
    },
    namespace: Constants.CLUSTER_APPS_CATALOG_NAMESPACE,
  };

  return applicationv1alpha1.getAppCatalogEntryList(client, auth, getOptions);
}

export function fetchClusterDefaultAppsACEListKey() {
  return `fetchClusterDefaultAppsACEList`;
}
