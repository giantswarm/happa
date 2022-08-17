import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { AccordionPanel, Box, ResponsiveContext, Text } from 'grommet';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import { isAppManagedByFlux } from 'model/services/mapi/applicationv1alpha1';
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import useSWR, { useSWRConfig } from 'swr';
import Date from 'UI/Display/Date';
import CLIGuidesList from 'UI/Display/MAPI/CLIGuide/CLIGuidesList';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import Truncated from 'UI/Util/Truncated';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import ClusterDetailAppListItemStatus from './ClusterDetailAppListItemStatus';
import ClusterDetailAppListWidgetCatalog from './ClusterDetailAppListWidgetCatalog';
import ClusterDetailAppListWidgetConfiguration from './ClusterDetailAppListWidgetConfiguration';
import ClusterDetailAppListWidgetInstalledAs from './ClusterDetailAppListWidgetInstalledAs';
import ClusterDetailAppListWidgetName from './ClusterDetailAppListWidgetName';
import ClusterDetailAppListWidgetNamespace from './ClusterDetailAppListWidgetNamespace';
import ClusterDetailAppListWidgetStatus from './ClusterDetailAppListWidgetStatus';
import ClusterDetailAppListWidgetUninstall from './ClusterDetailAppListWidgetUninstall';
import ClusterDetailAppListWidgetVersion from './ClusterDetailAppListWidgetVersion';
import ClusterDetailAppListWidgetVersionInspector from './ClusterDetailAppListWidgetVersionInspector';
import ConfigureAppGuide from './guides/ConfigureAppGuide';
import InspectInstalledAppGuide from './guides/InspectInstalledApp';
import UninstallAppGuide from './guides/UninstallAppGuide';
import UpdateAppGuide from './guides/UpdateAppGuide';
import { IAppsPermissions } from './permissions/types';
import { usePermissionsForAppCatalogEntries } from './permissions/usePermissionsForAppCatalogEntries';
import { usePermissionsForCatalogs } from './permissions/usePermissionsForCatalogs';
import {
  getCatalogNamespace,
  getCatalogNamespaceKey,
  isUserInstalledApp,
  normalizeAppVersion,
} from './utils';

const Icon = styled(Text)<{ isActive?: boolean }>`
  transform: rotate(${({ isActive }) => (isActive ? '0deg' : '-90deg')});
  transform-origin: center center;
  transition: 0.15s ease-out;
`;

const StyledBox = styled(Box)`
  gap: ${({ theme }) => theme.global.edgeSize.small};
`;

const Header = styled(Box)`
  &[aria-disabled='true'] {
    cursor: default;
  }
`;

interface IClusterDetailAppListItemProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  app?: applicationv1alpha1.IApp;
  appsPermissions?: IAppsPermissions;
  isActive?: boolean;
  onAppUninstalled?: () => void;
}

const ClusterDetailAppListItem: React.FC<
  React.PropsWithChildren<IClusterDetailAppListItemProps>
  // eslint-disable-next-line complexity
> = ({ app, appsPermissions, isActive, onAppUninstalled }) => {
  const canBeModified = app ? isUserInstalledApp(app) : false;

  const currentVersion = useMemo(() => {
    if (!app) return undefined;
    const appVersion = applicationv1alpha1.getAppCurrentVersion(app);

    return isAppManagedByFlux(app)
      ? normalizeAppVersion(appVersion)
      : appVersion;
  }, [app]);

  const [currentSelectedVersion, setCurrentSelectedVersion] = useState<
    string | undefined
  >(undefined);

  const isDeleted = typeof app?.metadata?.deletionTimestamp !== 'undefined';
  const isDisabled = typeof app === 'undefined' || isDeleted;

  const accordionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!accordionRef) return;

    const accordionButton = accordionRef.current?.querySelector('button');
    if (!accordionButton) return;

    accordionButton.disabled = isDisabled;
  }, [isDisabled]);

  const handleHeaderClick = (e: React.MouseEvent<HTMLElement>) => {
    setCurrentSelectedVersion(undefined);

    if (isDisabled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const provider = window.config.info.general.provider;

  const auth = useAuthProvider();
  const clientFactory = useHttpClientFactory();
  const { cache } = useSWRConfig();

  const catalogPermissions = usePermissionsForCatalogs(provider, 'default');

  const canReadCatalogs =
    catalogPermissions.canList && catalogPermissions.canGet;

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
      const errorMessage = extractErrorMessage(catalogNamespaceError);

      new FlashMessage(
        `There was a problem loading the app's catalog.`,
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );

      ErrorReporter.getInstance().notify(catalogNamespaceError);
    }
  }, [catalogNamespaceError]);

  const { canList: canListAppCatalogEntries } =
    usePermissionsForAppCatalogEntries(provider, catalogNamespace ?? '');

  const screenSize = useContext(ResponsiveContext);

  return (
    <Box
      background={isDeleted ? 'background-back' : 'background-front'}
      round='xsmall'
    >
      <AccordionPanel
        ref={accordionRef}
        header={
          <Header
            pad={{ vertical: 'xsmall', horizontal: 'small' }}
            direction='row'
            align='center'
            onClick={handleHeaderClick}
            tabIndex={-1}
            aria-disabled={isDisabled}
          >
            <Box margin={{ right: 'xsmall' }}>
              <Icon
                className='fa fa-chevron-down'
                isActive={isActive}
                role='presentation'
                aria-hidden='true'
                size='28px'
                color={isDisabled ? 'text-xweak' : 'text'}
              />
            </Box>
            <OptionalValue value={app?.spec.name} loaderWidth={100}>
              {(value) => (
                <Text weight='bold' aria-label={`App name: ${value}`}>
                  {value}
                </Text>
              )}
            </OptionalValue>

            <Box
              animation={{
                type: isActive ? 'fadeOut' : 'fadeIn',
                duration: 150,
              }}
              margin={{ left: 'small' }}
            >
              {isDeleted ? (
                <Text size='small' color='text-weak'>
                  Deleted{' '}
                  <Date
                    relative={true}
                    value={app.metadata.deletionTimestamp}
                  />
                </Text>
              ) : (
                <Box direction='row' wrap={true} gap='small' align='center'>
                  <OptionalValue value={currentVersion} loaderWidth={100}>
                    {(value) => (
                      <Truncated
                        as={Text}
                        aria-label={`App version: ${value}`}
                        numStart={10}
                        color='text-weak'
                      >
                        {value}
                      </Truncated>
                    )}
                  </OptionalValue>

                  {app?.spec.name !== app?.metadata.name && (
                    <OptionalValue value={app?.metadata.name} loaderWidth={100}>
                      {(value) => (
                        <Text aria-label={`App installed as: ${value}`}>
                          {value}
                        </Text>
                      )}
                    </OptionalValue>
                  )}

                  {app && (
                    <ClusterDetailAppListItemStatus
                      app={app}
                      catalogNamespace={catalogNamespace}
                      canListAppCatalogEntries={canListAppCatalogEntries}
                      displayUpgradableStatus={canBeModified}
                    />
                  )}
                </Box>
              )}
            </Box>
          </Header>
        }
      >
        <Box fill='horizontal' pad={{ horizontal: 'small' }}>
          <StyledBox
            wrap={true}
            direction='row'
            pad={{ vertical: 'medium' }}
            border={{ side: 'top', color: 'border-xweak' }}
          >
            <ClusterDetailAppListWidgetCatalog
              app={app}
              canReadCatalogs={canReadCatalogs}
              basis='300px'
              flex={{ grow: 1, shrink: 1 }}
              direction='row'
              align='center'
              titleWidth={screenSize === 'large' ? '65px' : 'auto'}
            />
            <ClusterDetailAppListWidgetVersion
              app={app}
              catalogNamespace={catalogNamespace}
              canListAppCatalogEntries={canListAppCatalogEntries}
              basis='300px'
              flex={{ grow: 1, shrink: 1 }}
              direction='row'
              align='center'
              titleWidth={screenSize === 'large' ? '54px' : 'auto'}
              displayUpgradableStatus={canBeModified}
            />
            <ClusterDetailAppListWidgetInstalledAs
              app={app}
              basis='300px'
              flex={{ grow: 1, shrink: 1 }}
              direction='row'
              align='center'
              titleWidth={screenSize === 'large' ? '127px' : 'auto'}
            />
            <ClusterDetailAppListWidgetName
              app={app}
              basis='300px'
              flex={{ grow: 1, shrink: 1 }}
              direction='row'
              align='center'
              titleWidth={screenSize === 'large' ? '65px' : 'auto'}
            />
            <ClusterDetailAppListWidgetStatus
              app={app}
              basis='300px'
              flex={{ grow: 1, shrink: 1 }}
              direction='row'
              align='center'
              titleWidth={screenSize === 'large' ? '54px' : 'auto'}
            />
            <ClusterDetailAppListWidgetNamespace
              app={app}
              basis='300px'
              flex={{ grow: 1, shrink: 1 }}
              direction='row'
              align='center'
              titleWidth={screenSize === 'large' ? '127px' : 'auto'}
            />
          </StyledBox>
          {canBeModified && (
            <Box
              pad={{ vertical: 'medium' }}
              border={{ side: 'top', color: 'border-xweak' }}
            >
              <ClusterDetailAppListWidgetVersionInspector
                app={app}
                appsPermissions={appsPermissions}
                currentVersion={currentVersion}
                currentSelectedVersion={currentSelectedVersion}
                onSelectVersion={setCurrentSelectedVersion}
                catalogNamespace={catalogNamespace}
                canListAppCatalogEntries={canListAppCatalogEntries}
                basis='100%'
                margin={{ top: 'xsmall' }}
              />
              <ClusterDetailAppListWidgetConfiguration
                app={app}
                appsPermissions={appsPermissions}
                basis='100%'
                margin={{ top: 'medium' }}
              />
              <ClusterDetailAppListWidgetUninstall
                app={app}
                appsPermissions={appsPermissions}
                onAppUninstalled={onAppUninstalled}
                basis='100%'
                margin={{ top: 'medium' }}
              />
            </Box>
          )}
          {canBeModified && app && catalogNamespace && (
            <CLIGuidesList
              margin={{ top: 'medium', horizontal: 'xsmall', bottom: 'xsmall' }}
            >
              <InspectInstalledAppGuide
                appName={app.metadata.name}
                namespace={app.metadata.namespace!}
              />
              <UpdateAppGuide
                appName={app.metadata.name}
                namespace={app.metadata.namespace!}
                newVersion={currentSelectedVersion ?? currentVersion!}
                appCatalogEntryName={app.spec.name}
                catalogName={app.spec.catalog}
                catalogNamespace={catalogNamespace}
                canUpdateApps={appsPermissions?.canUpdate}
              />
              <ConfigureAppGuide
                appName={app.metadata.name}
                namespace={app.metadata.namespace!}
                canConfigureApps={appsPermissions?.canConfigure}
              />
              <UninstallAppGuide
                appName={app.metadata.name}
                namespace={app.metadata.namespace!}
                canUninstallApps={appsPermissions?.canDelete}
              />
            </CLIGuidesList>
          )}
        </Box>
      </AccordionPanel>
    </Box>
  );
};

export default ClusterDetailAppListItem;
