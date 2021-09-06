import { AccordionPanel, Box, Text } from 'grommet';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React from 'react';
import styled from 'styled-components';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';

import ClusterDetailAppListWidgetCatalog from './ClusterDetailAppListWidgetCatalog';
import ClusterDetailAppListWidgetConfiguration from './ClusterDetailAppListWidgetConfiguration';
import ClusterDetailAppListWidgetNamespace from './ClusterDetailAppListWidgetNamespace';
import ClusterDetailAppListWidgetStatus from './ClusterDetailAppListWidgetStatus';
import ClusterDetailAppListWidgetUninstall from './ClusterDetailAppListWidgetUninstall';
import ClusterDetailAppListWidgetVersion from './ClusterDetailAppListWidgetVersion';
import ClusterDetailAppListWidgetVersionInspector from './ClusterDetailAppListWidgetVersionInspector';

const Icon = styled(Text)<{ isActive?: boolean }>`
  transform: rotate(${({ isActive }) => (isActive ? '0deg' : '-90deg')});
  transform-origin: center center;
  transition: 0.15s ease-out;
`;

const StyledBox = styled(Box)`
  gap: ${({ theme }) => theme.global.edgeSize.small};
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

  return (
    <AccordionPanel
      header={
        <Box
          background='background-front'
          round={isActive ? { corner: 'top', size: 'xsmall' } : 'xsmall'}
          pad={{ vertical: 'xsmall', horizontal: 'small' }}
          direction='row'
          align='center'
        >
          <Box margin={{ right: 'xsmall' }}>
            <Icon
              className='fa fa-chevron-down'
              isActive={isActive}
              role='presentation'
              aria-hidden='true'
              size='28px'
              color={!app ? 'text-xweak' : 'text'}
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
            animation={{ type: isActive ? 'fadeOut' : 'fadeIn', duration: 150 }}
            margin={{ left: 'small' }}
          >
            <OptionalValue value={currentVersion} loaderWidth={100}>
              {(value) => (
                <Text color='text-weak' aria-label={`App version: ${value}`}>
                  {value}
                </Text>
              )}
            </OptionalValue>
          </Box>
        </Box>
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
      </Box>
    </AccordionPanel>
  );
};

export default ClusterDetailAppListItem;
