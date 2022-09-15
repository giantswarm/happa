import { Providers } from 'model/constants';

import { IAppsPermissions } from '../types';
import { usePermissionsForAppsInClusterNamespace } from './usePermissionsForAppsInClusterNamespace';
import { usePermissionsForAppsInOrgNamespace } from './usePermissionsForAppsInOrgNamespace';

export function usePermissionsForApps(
  provider: PropertiesOf<typeof Providers>,
  namespace: string,
  inOrgNamespace: boolean = true
): IAppsPermissions {
  return (
    inOrgNamespace
      ? usePermissionsForAppsInOrgNamespace
      : usePermissionsForAppsInClusterNamespace
  )(provider, namespace);
}
