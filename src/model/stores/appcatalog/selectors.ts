import { IState } from 'model/stores/state';
import { createSelector } from 'reselect';
import { Constants } from 'shared/constants';

import { IAppCatalogsState } from './types';

export function selectIngressCatalog(state: IState): IAppCatalog | undefined {
  return state.entities.catalogs.items[
    Constants.INSTALL_INGRESS_TAB_APP_CATALOG_NAME
  ];
}

export function selectCatalogs(state: IState): IAppCatalogsState {
  return state.entities.catalogs;
}

export function selectSelectedCatalogs(state: IState): string[] {
  return Object.entries(state.entities.catalogs.ui.selectedCatalogs)
    .filter(([_, enabled]) => enabled)
    .map(([catalogName]) => catalogName);
}

export const selectApps = createSelector(
  [selectSelectedCatalogs, selectCatalogs],
  (selectedCatalogs, catalogs): IAppCatalogApp[] => {
    const allApps: IAppCatalogApp[] = [];

    for (let x = 0; x < selectedCatalogs.length; x++) {
      const catalog = catalogs.items[selectedCatalogs[x]];

      if (catalog && catalog.apps) {
        allApps.push(
          ...Object.entries(catalog.apps).map(([appName, appVersions]) => ({
            name: appName,
            appIconURL: appVersions[0].icon,
            catalogTitle: catalog.spec.title,
            catalogName: catalog.metadata.name,
            catalogIconURL: catalog.spec.logoURL,
            versions: appVersions,
          }))
        );
      }
    }

    return allApps;
  }
);

export const selectApp =
  (catalogName: string, appName: string, version: string) =>
  (
    state: IState
  ): [
    IAppCatalogAppVersion | null,
    IAppCatalog | null,
    IAppCatalogAppVersion[]
  ] => {
    const catalog = state.entities.catalogs.items[catalogName];

    if (!catalog.apps) {
      return [null, catalog, []];
    }

    const appVersions = catalog.apps[appName];

    const app =
      appVersions.find((appVersion) => {
        return appVersion.version === version;
      }) || null;

    return [app, catalog, appVersions];
  };

export function selectIngressAppToInstall(
  state: IState
): IAppCatalogAppVersion | undefined {
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
  appVersion: IAppCatalogAppVersion
): string | undefined {
  return (
    appVersion.annotations?.['application.giantswarm.io/readme'] ||
    appVersion.sources?.find((url) => url.endsWith(Constants.README_FILE))
  );
}

export function selectAppSearchQuery(state: IState): string {
  return state.entities.catalogs.ui.searchQuery;
}

export function selectAppSortOrder(state: IState): string {
  return state.entities.catalogs.ui.sortOrder;
}

export function selectAppsLastUpdated(state: IState): number {
  return state.entities.catalogs.lastUpdated;
}
