import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClient } from 'lib/hooks/useHttpClient';
import {
  computeAppCatalogUITitle,
  isAppCatalogVisibleToUsers,
} from 'MAPI/apps/utils';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React, { useEffect } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import ClusterDetailAppListWidget from 'UI/Display/MAPI/apps/ClusterDetailAppListWidget';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';

const CatalogType = styled(Text)`
  text-transform: uppercase;
`;

interface IClusterDetailAppListWidgetCatalogProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailAppListWidget>,
    'title'
  > {
  app?: applicationv1alpha1.IApp;
}

const ClusterDetailAppListWidgetCatalog: React.FC<IClusterDetailAppListWidgetCatalogProps> = ({
  app,
  ...props
}) => {
  const auth = useAuthProvider();
  const appCatalogClient = useHttpClient();

  const appCatalogKey = app
    ? applicationv1alpha1.getAppCatalogKey('', app.spec.catalog)
    : null;

  const { data: appCatalog, error: appCatalogError } = useSWR<
    applicationv1alpha1.IAppCatalog,
    GenericResponseError
  >(appCatalogKey, () =>
    applicationv1alpha1.getAppCatalog(
      appCatalogClient,
      auth,
      '',
      app!.spec.catalog
    )
  );

  useEffect(() => {
    if (appCatalogError) {
      const errorMessage = extractErrorMessage(appCatalogError);

      new FlashMessage(
        `There was a problem loading the app's catalog.`,
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );

      ErrorReporter.getInstance().notify(appCatalogError);
    }
  }, [appCatalogError]);

  const appCatalogTitle = appCatalog
    ? computeAppCatalogUITitle(appCatalog)
    : undefined;
  const isManaged = appCatalog ? isAppCatalogVisibleToUsers(appCatalog) : false;

  return (
    <ClusterDetailAppListWidget
      title='Catalog'
      contentProps={{
        direction: 'row',
        gap: 'small',
        wrap: true,
        align: 'baseline',
      }}
      {...props}
    >
      <OptionalValue value={appCatalogTitle} loaderWidth={150}>
        {(value) => <Text aria-label={`App catalog: ${value}`}>{value}</Text>}
      </OptionalValue>

      {isManaged && (
        <Box
          pad={{ horizontal: 'xsmall', vertical: 'none' }}
          round='xxsmall'
          background='#8dc163'
        >
          <CatalogType size='xsmall' color='background' weight='bold'>
            managed
          </CatalogType>
        </Box>
      )}
    </ClusterDetailAppListWidget>
  );
};

export default ClusterDetailAppListWidgetCatalog;
