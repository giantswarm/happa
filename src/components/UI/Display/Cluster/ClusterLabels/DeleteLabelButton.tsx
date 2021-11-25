import { Anchor } from 'grommet';
import React, { FC } from 'react';
import styled from 'styled-components';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

interface IButtonProps {}

const StyledAnchor = styled(Anchor)`
  color: ${({ theme }) => theme.colors.darkBlueLighter4};

  :focus {
    outline: 0;
  }

  :focus:not(:focus-visible) {
    box-shadow: none;
  }

  i:focus {
    outline: 0;
  }

  :hover {
    color: ${({ theme }) => theme.colors.darkBlueDarker2};
  }
`;

const StyledTooltip = styled(Tooltip)`
  z-index: 1069 !important;
`;

const DeleteLabelButton: FC<IButtonProps> = (props) => (
  <TooltipContainer content={<StyledTooltip>Delete this label</StyledTooltip>}>
    <StyledAnchor size='large' tabIndex={0} {...props}>
      <i className='fa fa-close' role='presentation' title='Delete' />
    </StyledAnchor>
  </TooltipContainer>
);

export default DeleteLabelButton;
