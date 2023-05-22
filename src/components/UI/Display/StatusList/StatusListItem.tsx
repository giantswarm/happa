import { Box, Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import React from 'react';
import styled from 'styled-components';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

const Line = styled.div`
  position: relative;
  flex: 1;

  &::before {
    content: '';
    position: absolute;
    left: 6px;
    right: 12px;
    bottom: 4px;
    height: 1px;
    background-color: ${({ theme }) => normalizeColor('border-xweak', theme)};
  }
`;

const Icon = styled(Text)`
  font-size: 18px;
  line-height: 20px;
`;

interface IStatusListItemProps {
  status: React.ReactNode;
  info?: string;
}

const StatusListItem: React.FC<
  React.PropsWithChildren<IStatusListItemProps>
> = ({ status, info, children }) => {
  return (
    <Box direction='row'>
      <Text>{children}</Text>
      {info ? (
        <TooltipContainer
          content={
            <Tooltip>
              <Text
                size='xsmall'
                color='text-strong'
                textAlign='center'
                wordBreak='break-word'
              >
                {info}
              </Text>
            </Tooltip>
          }
        >
          <Icon
            className='fa fa-info'
            aria-label='info'
            margin={{ left: '5px' }}
          />
        </TooltipContainer>
      ) : null}
      <Line />
      {status}
    </Box>
  );
};

export default StatusListItem;
