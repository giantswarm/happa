import { Box, BoxProps, Text } from 'grommet';
import { ReleaseState } from 'model/services/mapi/releasev1alpha1';
import React from 'react';
import styled from 'styled-components';

const StyledText = styled(Text)`
  text-transform: uppercase;
`;

function mapStateToBackgroundColor(state: ReleaseState) {
  switch (state) {
    case 'active':
      return '#8dc163';
    case 'wip':
      return '#e49090';
    case 'preview':
      return '#ddb03a';
    case 'deprecated':
    default:
      return '#193545';
  }
}

interface IReleaseStateLabelProps extends BoxProps {
  state: ReleaseState;
}

const ReleaseStateLabel: React.FC<IReleaseStateLabelProps> = ({ state }) => {
  const background = mapStateToBackgroundColor(state);

  return (
    <Box
      pad={{ horizontal: 'xsmall', vertical: 'xxsmall' }}
      round='xxsmall'
      background={background}
    >
      <StyledText
        size='small'
        color={state === 'deprecated' ? '#768e9d' : 'background'}
      >
        {state}
      </StyledText>
    </Box>
  );
};

export default ReleaseStateLabel;
