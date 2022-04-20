import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import {
  computeAppCatalogUITitle,
  getCatalogNamespace,
  getCatalogNamespaceKey,
  isAppCatalogVisibleToUsers,
} from 'MAPI/apps/utils';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React, { useEffect, useMemo, useRef } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import CatalogLabel from 'UI/Display/Apps/AppList/CatalogLabel';
import ClusterDetailAppListWidget from 'UI/Display/MAPI/apps/ClusterDetailAppListWidget';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

interface IClusterDetailAppListWidgetCatalogProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailAppListWidget>,
    'title'
  > {
  app?: applicationv1alpha1.IApp;
  canReadCatalogs?: boolean;
}

const ClusterDetailAppListWidgetCatalog: React.FC<
  React.PropsWithChildren<IClusterDetailAppListWidgetCatalogProps>
> = ({ app, canReadCatalogs, ...props }) => {
  const auth = useAuthProvider();
  const clientFactory = useHttpClientFactory();
  const { cache } = useSWRConfig();

  const catalogNamespaceKey =
    canReadCatalogs && app ? getCatalogNamespaceKey(app) : null;

  const { data: catalogNamespace, error: catalogNamespaceError } = useSWR<
    string | null,
    GenericResponseError
  >(catalogNamespaceKey, () =>
    getCatalogNamespace(clientFactory, auth, cache, app!)
  );

  useEffect(() => {
    if (catalogNamespaceError) {
      ErrorReporter.getInstance().notify(catalogNamespaceError);
    }
  }, [catalogNamespaceError]);

  const catalogClient = useRef(clientFactory());
  const catalogKey = catalogNamespace
    ? applicationv1alpha1.getCatalogKey(catalogNamespace, app!.spec.catalog)
    : null;

  const { data: catalog, error: catalogError } = useSWR<
    applicationv1alpha1.ICatalog,
    GenericResponseError
  >(catalogKey, () =>
    applicationv1alpha1.getCatalog(
      catalogClient.current,
      auth,
      catalogNamespace!,
      app!.spec.catalog
    )
  );

  useEffect(() => {
    if (catalogError) {
      const errorMessage = extractErrorMessage(catalogError);

      new FlashMessage(
        `There was a problem loading the app's catalog.`,
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );

      ErrorReporter.getInstance().notify(catalogError);
    }
  }, [catalogError]);

  const catalogTitle = useMemo(() => {
    if (catalogNamespace === null) return '';
    if (!catalog) return undefined;

    return computeAppCatalogUITitle(catalog);
  }, [catalog, catalogNamespace]);
  const isManaged = catalog ? isAppCatalogVisibleToUsers(catalog) : false;

  return (
    <ClusterDetailAppListWidget title='Catalog' {...props}>
      <OptionalValue value={catalogTitle} loaderWidth={150}>
        {(value) => (
          <CatalogLabel
            catalogName={value}
            isManaged={isManaged}
            aria-label={`App catalog: ${value}`}
          />
        )}
      </OptionalValue>
    </ClusterDetailAppListWidget>
  );
};

export default ClusterDetailAppListWidgetCatalog;
