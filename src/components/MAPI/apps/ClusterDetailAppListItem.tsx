import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { AccordionPanel, Box, Text } from 'grommet';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import useSWR, { useSWRConfig } from 'swr';
import Date from 'UI/Display/Date';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import Truncated from 'UI/Util/Truncated';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import ClusterDetailAppListItemStatus from './ClusterDetailAppListItemStatus';
import ClusterDetailAppListWidgetCatalog from './ClusterDetailAppListWidgetCatalog';
import ClusterDetailAppListWidgetConfiguration from './ClusterDetailAppListWidgetConfiguration';
import ClusterDetailAppListWidgetNamespace from './ClusterDetailAppListWidgetNamespace';
import ClusterDetailAppListWidgetStatus from './ClusterDetailAppListWidgetStatus';
import ClusterDetailAppListWidgetUninstall from './ClusterDetailAppListWidgetUninstall';
import ClusterDetailAppListWidgetVersion from './ClusterDetailAppListWidgetVersion';
import ClusterDetailAppListWidgetVersionInspector from './ClusterDetailAppListWidgetVersionInspector';
import ConfigureAppGuide from './guides/ConfigureAppGuide';
import InspectInstalledAppGuide from './guides/InspectInstalledApp';
import UninstallAppGuide from './guides/UninstallAppGuide';
import UpdateAppGuide from './guides/UpdateAppGuide';
import { getCatalogNamespace, getCatalogNamespaceKey } from './utils';

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
  isActive?: boolean;
  onAppUninstalled?: () => void;
}

const ClusterDetailAppListItem: React.FC<IClusterDetailAppListItemProps> = ({
  app,
  isActive,
  onAppUninstalled,
}) => {
  const currentVersion = app
    ? applicationv1alpha1.getAppCurrentVersion(app)
    : undefined;

  const [currentSelectedVersion, setCurrentSelectedVersion] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    if (
      typeof app !== 'undefined' &&
      typeof currentSelectedVersion === 'undefined'
    )
      setCurrentSelectedVersion(app.spec.version);
  }, [app, currentSelectedVersion]);

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

  const auth = useAuthProvider();
  const clientFactory = useHttpClientFactory();
  const { cache } = useSWRConfig();

  const catalogNamespaceKey = app ? getCatalogNamespaceKey(app) : null;

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

  return (
    <AccordionPanel
      ref={accordionRef}
      header={
        <Header
          background={isDeleted ? 'background-back' : 'background-front'}
          round={isActive ? { corner: 'top', size: 'xsmall' } : 'xsmall'}
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
          <OptionalValue value={app?.metadata.name} loaderWidth={100}>
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
                <Date relative={true} value={app.metadata.deletionTimestamp} />
              </Text>
            ) : (
              <Box direction='row' wrap={true} gap='xsmall' align='center'>
                <OptionalValue value={currentVersion} loaderWidth={100}>
                  {(value) => (
                    <Truncated
                      as={Text}
                      aria-label={`App version: ${value}`}
                      numStart={10}
                      color='text-weak'
                    >
                      {value as string}
                    </Truncated>
                  )}
                </OptionalValue>

                {app && <ClusterDetailAppListItemStatus app={app} />}
              </Box>
            )}
          </Box>
        </Header>
      }
    >
      <Box
        round={{ corner: 'bottom', size: 'xsmall' }}
        background='background-front'
        fill='horizontal'
        pad={{ horizontal: 'small', top: 'xsmall', bottom: 'small' }}
      >
        <StyledBox wrap={true} direction='row'>
          <ClusterDetailAppListWidgetVersion
            app={app}
            basis='250px'
            flex={{ grow: 1, shrink: 1 }}
          />
          <ClusterDetailAppListWidgetStatus
            app={app}
            basis='250px'
            flex={{ grow: 1, shrink: 1 }}
          />
          <ClusterDetailAppListWidgetCatalog
            app={app}
            basis='250px'
            flex={{ grow: 1, shrink: 1 }}
          />
          <ClusterDetailAppListWidgetNamespace
            app={app}
            basis='250px'
            flex={{ grow: 1, shrink: 1 }}
          />
          <ClusterDetailAppListWidgetVersionInspector
            app={app}
            currentSelectedVersion={currentSelectedVersion}
            onSelectVersion={setCurrentSelectedVersion}
            basis='100%'
            margin={{ top: 'small' }}
          />
          <ClusterDetailAppListWidgetConfiguration
            app={app}
            basis='100%'
            margin={{ top: 'small' }}
          />
          <ClusterDetailAppListWidgetUninstall
            app={app}
            onAppUninstalled={onAppUninstalled}
            basis='100%'
            margin={{ top: 'small' }}
          />
        </StyledBox>
        {app && catalogNamespace && (
          <Box
            margin={{ top: 'medium' }}
            direction='column'
            gap='small'
            pad='xsmall'
          >
            <InspectInstalledAppGuide
              appName={app.metadata.name}
              namespace={app.metadata.namespace!}
            />
            <UpdateAppGuide
              appName={app.metadata.name}
              namespace={app.metadata.namespace!}
              newVersion={currentSelectedVersion ?? app.spec.version}
              catalogName={app.spec.catalog}
              catalogNamespace={catalogNamespace}
            />
            <ConfigureAppGuide
              appName={app.metadata.name}
              namespace={app.metadata.namespace!}
            />
            <UninstallAppGuide
              appName={app.metadata.name}
              namespace={app.metadata.namespace!}
            />
          </Box>
        )}
      </Box>
    </AccordionPanel>
  );
};

export default ClusterDetailAppListItem;
