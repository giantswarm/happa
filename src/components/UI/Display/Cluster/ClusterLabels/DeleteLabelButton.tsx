import { Anchor } from 'grommet';
import React from 'react';
import styled from 'styled-components';

interface IButtonProps {}

const StyledAnchor = styled(Anchor)`
  vertical-align: middle;
  color: ${({ color, theme }) => color ?? theme.colors.white3};

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
    color: ${({ color, theme }) => color ?? theme.colors.white3};
    opacity: 0.8;
  }
`;

const DeleteLabelButton = React.forwardRef<IButtonProps>((props, _) => (
  <StyledAnchor size='large' {...props}>
    <i className='fa fa-close' role='presentation' title='Delete' />
  </StyledAnchor>
));

export default DeleteLabelButton;
