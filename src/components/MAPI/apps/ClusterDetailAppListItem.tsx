import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { AccordionPanel, Box, Text } from 'grommet';
import { extractErrorMessage, isResourceManagedByGitOps } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import { isAppManagedByFlux } from 'model/services/mapi/applicationv1alpha1';
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import useSWR, { useSWRConfig } from 'swr';
import Date from 'UI/Display/Date';
import ClusterDetailAppListItemSummary from 'UI/Display/MAPI/apps/ClusterDetailAppListItemSummary';
import CLIGuidesList from 'UI/Display/MAPI/CLIGuide/CLIGuidesList';
import GitOpsManagedNote from 'UI/Display/MAPI/GitOpsManaged/GitOpsManagedNote';
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
  normalizeAppVersion,
} from './utils';

const Icon = styled(Text)<{ isActive?: boolean }>`
  transform: rotate(${({ isActive }) => (isActive ? '180deg' : '0deg')});
  transform-origin: center center;
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
  canBeModified?: boolean;
  minHeight?: number;
  isClusterApp?: boolean;
  onAppUninstalled?: () => void;
}

const ClusterDetailAppListItem: React.FC<
  React.PropsWithChildren<IClusterDetailAppListItemProps>
  // eslint-disable-next-line complexity
> = ({
  app,
  appsPermissions,
  isActive,
  canBeModified = true,
  minHeight,
  isClusterApp,
  onAppUninstalled,
}) => {
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

  const isManagedByGitOps = app ? isResourceManagedByGitOps(app) : false;

  return (
    <Box
      background={isDeleted ? 'background-back' : 'background-front'}
      round='xsmall'
    >
      <AccordionPanel
        ref={accordionRef}
        header={
          <Header
            height={{ min: `${minHeight}px` }}
            pad={{ vertical: 'xsmall', horizontal: 'medium' }}
            direction='row'
            align='center'
            onClick={handleHeaderClick}
            tabIndex={-1}
            aria-disabled={isDisabled}
          >
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
              flex='grow'
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
            <Icon
              className='fa fa-chevron-down'
              isActive={isActive}
              role='presentation'
              aria-hidden='true'
              size='28px'
              color={isDisabled ? 'text-xweak' : 'text'}
            />
          </Header>
        }
      >
        <Box fill='horizontal' pad={{ horizontal: 'small' }}>
          <ClusterDetailAppListItemSummary
            wrap={true}
            direction='row'
            pad={{ vertical: 'small' }}
            border={{ side: 'top', color: 'border-xweak' }}
          >
            <ClusterDetailAppListWidgetName
              app={app}
              flex={{ grow: 1, shrink: 1 }}
              pad='xsmall'
              direction='row'
              align='center'
            />
            <ClusterDetailAppListWidgetCatalog
              app={app}
              canReadCatalogs={canReadCatalogs}
              flex={{ grow: 1, shrink: 1 }}
              pad='xsmall'
              direction='row'
              align='center'
            />
            <ClusterDetailAppListWidgetVersion
              app={app}
              catalogNamespace={catalogNamespace}
              canListAppCatalogEntries={canListAppCatalogEntries}
              flex={{ grow: 1, shrink: 1 }}
              pad='xsmall'
              direction='row'
              align='center'
              displayUpgradableStatus={canBeModified}
            />
            <ClusterDetailAppListWidgetInstalledAs
              app={app}
              flex={{ grow: 1, shrink: 1 }}
              pad='xsmall'
              direction='row'
              align='center'
            />
            <ClusterDetailAppListWidgetNamespace
              app={app}
              flex={{ grow: 1, shrink: 1 }}
              pad='xsmall'
              direction='row'
              align='center'
            />
            <ClusterDetailAppListWidgetVersion
              app={app}
              catalogNamespace={catalogNamespace}
              canListAppCatalogEntries={canListAppCatalogEntries}
              flex={{ grow: 1, shrink: 1 }}
              pad='xsmall'
              direction='row'
              align='center'
              displayUpstreamVersion={true}
              displayUpgradableStatus={canBeModified}
            />
            <ClusterDetailAppListWidgetStatus
              app={app}
              flex={{ grow: 1, shrink: 1 }}
              pad='xsmall'
              direction='row'
              align='center'
            />
          </ClusterDetailAppListItemSummary>
          {canBeModified && !isManagedByGitOps && (
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
                isClusterApp={isClusterApp}
                basis='100%'
                margin={{ top: 'xsmall' }}
              />
              <ClusterDetailAppListWidgetConfiguration
                app={app}
                appsPermissions={appsPermissions}
                isClusterApp={isClusterApp}
                basis='100%'
                margin={{ top: 'medium' }}
              />
              <ClusterDetailAppListWidgetUninstall
                app={app}
                appsPermissions={appsPermissions}
                isClusterApp={isClusterApp}
                onAppUninstalled={onAppUninstalled}
                basis='100%'
                margin={{ top: 'medium' }}
              />
            </Box>
          )}
          {canBeModified && !isManagedByGitOps && app && catalogNamespace && (
            <CLIGuidesList
              margin={{ vertical: 'medium', horizontal: 'xsmall' }}
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
          {isManagedByGitOps && (
            <Box
              pad={{ vertical: 'medium', horizontal: 'small' }}
              border={{ side: 'top', color: 'border-xweak' }}
            >
              <GitOpsManagedNote />
            </Box>
          )}
        </Box>
      </AccordionPanel>
    </Box>
  );
};

export default ClusterDetailAppListItem;
