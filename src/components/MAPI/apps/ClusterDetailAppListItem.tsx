import { AccordionPanel, Box, Text } from 'grommet';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React from 'react';
import styled from 'styled-components';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';

const Icon = styled(Text)<{ isActive?: boolean }>`
  transform: rotate(${({ isActive }) => (isActive ? '0deg' : '-90deg')});
  transform-origin: center center;
  transition: 0.15s ease-out;
`;

interface IClusterDetailAppListItemProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  app?: applicationv1alpha1.IApp;
  isActive?: boolean;
}

const ClusterDetailAppListItem: React.FC<IClusterDetailAppListItemProps> = ({
  app,
  isActive,
}) => {
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
            {(value) => <Text weight='bold'>{value}</Text>}
          </OptionalValue>

          <Box
            animation={{ type: isActive ? 'fadeOut' : 'fadeIn', duration: 150 }}
            margin={{ left: 'small' }}
          >
            <OptionalValue value={app?.spec.version} loaderWidth={100}>
              {(value) => <Text color='text-weak'>{value}</Text>}
            </OptionalValue>
          </Box>
        </Box>
      }
    >
      <Box
        round={{ corner: 'bottom', size: 'xsmall' }}
        background='background-front'
        fill='horizontal'
        pad='medium'
      >
        hi friends
      </Box>
    </AccordionPanel>
  );
};

export default ClusterDetailAppListItem;
