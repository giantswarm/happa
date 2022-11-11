import {
  computeAppCatalogUITitle,
  isAppCatalogVisibleToUsers,
} from 'MAPI/apps/utils';
import { AppsRoutes } from 'model/constants/routes';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import CatalogLabel from 'UI/Display/Apps/AppList/CatalogLabel';
import ClusterDetailAppListWidget from 'UI/Display/MAPI/apps/ClusterDetailAppListWidget';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import { toTitleCase } from 'utils/helpers';

import { usePermissionsForCatalogs } from './permissions/usePermissionsForCatalogs';

function formatAppCatalogTitle(title: string): string {
  return toTitleCase(title.replaceAll('-', ' '));
}

interface IClusterDetailAppListWidgetCatalogProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailAppListWidget>,
    'title'
  > {
  app?: applicationv1alpha1.IApp;
  catalog?: applicationv1alpha1.ICatalog;
}

const ClusterDetailAppListWidgetCatalog: React.FC<
  React.PropsWithChildren<IClusterDetailAppListWidgetCatalogProps>
> = ({ app, catalog, ...props }) => {
  const provider = window.config.info.general.provider;

  const { canList: canListCatalogs } = usePermissionsForCatalogs(
    provider,
    catalog?.metadata.namespace ?? ''
  );

  const catalogTitle = useMemo(() => {
    if (!canListCatalogs)
      return app ? formatAppCatalogTitle(app.spec.catalog) : '';
    if (!catalog) return undefined;

    return computeAppCatalogUITitle(catalog);
  }, [app, catalog, canListCatalogs]);

  const isManaged = catalog ? isAppCatalogVisibleToUsers(catalog) : false;

  return (
    <ClusterDetailAppListWidget title='Catalog' titleColor='text' {...props}>
      <OptionalValue value={catalogTitle} loaderWidth={150}>
        {(value) => (
          <CatalogLabel
            catalogName={
              canListCatalogs ? (
                <Link
                  to={{
                    pathname: AppsRoutes.Home,
                    state: { selectedCatalog: catalog?.metadata.name },
                  }}
                >
                  {value}
                </Link>
              ) : (
                value
              )
            }
            isManaged={isManaged}
            aria-label={`App catalog: ${value}`}
          />
        )}
      </OptionalValue>
    </ClusterDetailAppListWidget>
  );
};

export default ClusterDetailAppListWidgetCatalog;
