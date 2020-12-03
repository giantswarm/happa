import { Constants } from 'shared/constants';
import { IState } from 'stores/state';

export function selectIngressCatalog(state: IState): IAppCatalog | undefined {
  return state.entities.catalogs.items[
    Constants.INSTALL_INGRESS_TAB_APP_CATALOG_NAME
  ];
}

export function selectIngressAppToInstall(
  state: IState
): IAppCatalogApp | undefined {
  const ingressCatalog = selectIngressCatalog(state);

  return ingressCatalog?.apps?.[Constants.INSTALL_INGRESS_TAB_APP_NAME]?.[0];
}

export function selectIngressAppFromCluster(cluster: Cluster) {
  const apps = cluster.apps || [];

  const ingressApp = apps.find((app) => {
    return app.spec.name === Constants.INSTALL_INGRESS_TAB_APP_NAME;
  });

  return ingressApp;
}

export function selectReadmeURL(
  appVersion: IAppCatalogApp
): string | undefined {
  return (
    appVersion.annotations?.['application.giantswarm.io/readme'] ||
    appVersion.sources?.find((url) => url.endsWith(Constants.README_FILE))
  );
}
