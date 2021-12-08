import { Text, TextProps } from 'grommet';
import { ReleaseState } from 'model/services/mapi/releasev1alpha1';
import React from 'react';
import styled from 'styled-components';

const StyledText = styled(Text)<{ state: ReleaseState }>`
  text-transform: uppercase;
  background: ${({ state }) => mapStateToBackgroundColor(state)};
  padding: 1px ${({ theme }) => theme.spacingPx}px;
  border-radius: 3px;
  font-weight: 400;
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

interface IReleaseStateLabelProps extends TextProps {
  state: ReleaseState;
}

const ReleaseStateLabel: React.FC<IReleaseStateLabelProps> = ({
  state,
  ...props
}) => {
  return (
    <StyledText
      color={state === 'deprecated' ? '#768e9d' : 'background'}
      state={state}
      {...props}
    >
      {state}
    </StyledText>
  );
};

export default ReleaseStateLabel;
