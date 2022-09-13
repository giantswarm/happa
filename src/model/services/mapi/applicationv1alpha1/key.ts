import { Providers } from 'model/constants';

import { ICatalog } from './';
import { IApp, IAppCatalogEntry } from './types';

export const labelAppOperator = 'app-operator.giantswarm.io/version';
export const labelAppName = 'app.kubernetes.io/name';
export const labelAppVersion = 'app.kubernetes.io/version';
export const labelAppCatalog = 'application.giantswarm.io/catalog';
export const labelManagedBy = 'giantswarm.io/managed-by';
export const labelLatest = 'latest';
export const labelCatalogVisibility =
  'application.giantswarm.io/catalog-visibility';
export const labelCatalogType = 'application.giantswarm.io/catalog-type';
export const labelCluster = 'giantswarm.io/cluster';

export const statusUnknown = 'unknown';
export const statusDeployed = 'deployed';
export const statusUninstalled = 'uninstalled';
export const statusSuperseded = 'superseded';
export const statusFailed = 'failed';
export const statusUninstalling = 'uninstalling';
export const statusPendingInstall = 'pending-install';
export const statusPendingUpgrade = 'pending-upgrade';
export const statusPendingRollback = 'pending-rollback';

export const annotationReadme = 'application.giantswarm.io/readme';
export const annotationLogo = 'ui.giantswarm.io/logo';

export function isAppCatalogPublic(catalog: ICatalog): boolean {
  const visibility = catalog.metadata.labels?.[labelCatalogVisibility];

  return visibility === 'public';
}

export function isAppCatalogStable(catalog: ICatalog): boolean {
  const type = catalog.metadata.labels?.[labelCatalogType];

  return type === 'stable';
}

export function getAppCatalogEntryReadmeURL(
  appCatalogEntry: IAppCatalogEntry
): string | undefined {
  return appCatalogEntry.metadata.annotations?.[annotationReadme];
}

export function getAppCurrentVersion(app: IApp): string {
  if (!app.status || !app.status.version) return app.spec.version;

  return app.status.version;
}

export function getAppUpstreamVersion(app: IApp) {
  if (!app.status || !app.status.appVersion) return '';

  return app.status.appVersion;
}

export function getAppStatus(app: IApp): string {
  return app.status?.release?.status || '';
}

export function isAppManagedByFlux(app: IApp): boolean {
  return app.metadata.labels?.[labelManagedBy] === 'flux';
}

export function getDefaultAppNameForProvider(
  provider: PropertiesOf<typeof Providers>
) {
  switch (provider) {
    case Providers.GCP:
      return 'default-apps-gcp';
    default:
      return undefined;
  }
}

export function getDefaultAppName(
  apps: IApp[],
  provider: PropertiesOf<typeof Providers>
) {
  const providerDefaultAppName = getDefaultAppNameForProvider(provider);

  if (typeof providerDefaultAppName === 'undefined') {
    return undefined;
  }

  const anyPreinstalledApp = apps.find(
    (item) => item.metadata?.labels?.[labelAppName] === providerDefaultAppName
  );

  return anyPreinstalledApp?.metadata.labels?.[labelManagedBy];
}
