import { Text } from 'grommet';
import { AppsRoutes } from 'model/constants/routes';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import { isAppManagedByFlux } from 'model/services/mapi/applicationv1alpha1';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ClusterDetailAppListWidget from 'UI/Display/MAPI/apps/ClusterDetailAppListWidget';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import RoutePath from 'utils/routePath';

import { normalizeAppVersion } from './utils';

interface IClusterDetailAppListWidgetNameProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailAppListWidget>,
    'title'
  > {
  app?: applicationv1alpha1.IApp;
  canListAppCatalogEntries?: boolean;
}

const ClusterDetailAppListWidgetName: React.FC<
  React.PropsWithChildren<IClusterDetailAppListWidgetNameProps>
> = ({ app, canListAppCatalogEntries, ...props }) => {
  const currentVersion = useMemo(() => {
    if (!app) return undefined;
    const appVersion = applicationv1alpha1.getAppCurrentVersion(app);

    return isAppManagedByFlux(app)
      ? normalizeAppVersion(appVersion)
      : appVersion;
  }, [app]);

  const appPath = useMemo(() => {
    if (!app || !currentVersion) return '';

    return RoutePath.createUsablePath(AppsRoutes.AppDetail, {
      catalogName: app.spec.catalog,
      app: app.spec.name,
      version: currentVersion,
    });
  }, [app, currentVersion]);

  return (
    <ClusterDetailAppListWidget title='App name' titleColor='text' {...props}>
      <OptionalValue value={app?.spec.name} loaderWidth={100}>
        {(value) =>
          canListAppCatalogEntries && appPath ? (
            <Link to={appPath}>
              <Text aria-label={`App name: ${value}`}>{value}</Text>
            </Link>
          ) : (
            <Text aria-label={`App name: ${value}`}>{value}</Text>
          )
        }
      </OptionalValue>
    </ClusterDetailAppListWidget>
  );
};

export default ClusterDetailAppListWidgetName;
