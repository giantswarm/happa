import { IHttpClient } from 'model/clients/HttpClient';
import { getBaseConfiguration } from 'model/services/controlplane/base';

/**
 * Get the all the app catalogs in the installation.
 * @param client - The HTTP client.
 */
export async function getAppCatalogs(
  client: IHttpClient
): Promise<IAppCatalog[]> {
  const { ApplicationGiantswarmIoV1alpha1Api } = await import(
    'giantswarm-cp-client'
  );
  const baseConfig = await getBaseConfiguration(client);
  const appsAPI = new ApplicationGiantswarmIoV1alpha1Api(baseConfig);

  const catalogs = await appsAPI.listApplicationGiantswarmIoV1alpha1AppCatalog(
    {}
  );
  const result = catalogs.items.map(convertAppCatalogCRToCatalog);

  return result;
}

function convertAppCatalogCRToCatalog(
  catalog: import('giantswarm-cp-client').ComGithubGiantswarmApiextensionsPkgApisApplicationV1alpha1AppCatalog
): IAppCatalog {
  const metadata: IAppCatalogMetaData = {
    name: catalog.metadata.name ?? '',
    labels: catalog.metadata.labels ?? {},
  };

  const storage: IAppCatalogStorage = {
    type: catalog.spec.storage.type,
    URL: catalog.spec.storage.uRL,
  };

  const spec: IAppCatalogSpec = {
    title: catalog.spec.title,
    description: catalog.spec.description,
    logoURL: catalog.spec.logoURL,
    storage: storage,
  };

  const newCatalog: IAppCatalog = {
    metadata: metadata,
    spec: spec,
  };

  return newCatalog;
}
