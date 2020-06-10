import {
  ApplicationGiantswarmIoV1alpha1Api,
  ComGithubGiantswarmApiextensionsPkgApisApplicationV1alpha1AppCatalog,
} from 'giantswarm-cp-client';
import { HttpClient } from 'model/clients';
import {
  IAppCatalog,
  IMetaData,
  ISpec,
  IStorage,
} from 'model/services/controlplane/appcatalogs/types';
import { getBaseConfiguration } from 'model/services/controlplane/base';

/**
 * Get the all the app catalogs in the installation.
 * @param client - The HTTP client.
 */
export async function getAppCatalogs(
  client: HttpClient
): Promise<IAppCatalog[]> {
  const baseConfig = getBaseConfiguration(client);
  const appsAPI = new ApplicationGiantswarmIoV1alpha1Api(baseConfig);

  try {
    const catalogs = await appsAPI.listApplicationGiantswarmIoV1alpha1AppCatalog(
      {}
    );
    const result = catalogs.items.map(convertAppCatalogCRToCatalog);

    return Promise.resolve(result);
  } catch (err) {
    return Promise.reject(err);
  }
}

function convertAppCatalogCRToCatalog(
  catalog: ComGithubGiantswarmApiextensionsPkgApisApplicationV1alpha1AppCatalog
): IAppCatalog {
  const metadata: IMetaData = {
    name: catalog.metadata.name ?? '',
    labels: catalog.metadata.labels ?? {},
  };

  const storage: IStorage = {
    type: catalog.spec.storage.type,
    URL: catalog.spec.storage.uRL,
  };

  const spec: ISpec = {
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
