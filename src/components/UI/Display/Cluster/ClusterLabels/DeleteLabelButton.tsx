import { Anchor } from 'grommet';
import React, { FC } from 'react';
import styled from 'styled-components';

interface IButtonProps {}

const StyledAnchor = styled(Anchor)`
  vertical-align: middle;
  color: ${({ theme }) => theme.colors.white3};

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
    color: ${({ theme }) => theme.colors.white2};
  }
`;

const DeleteLabelButton: FC<IButtonProps> = (props) => (
  <StyledAnchor size='large' {...props}>
    <i className='fa fa-close' role='presentation' title='Delete' />
  </StyledAnchor>
);

export default DeleteLabelButton;
