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

export const annotationReadme = 'application.giantswarm.io/readme';

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

export function isAppManagedByFlux(app: IApp): boolean {
  return app.metadata.labels?.[labelManagedBy] === 'flux';
}
