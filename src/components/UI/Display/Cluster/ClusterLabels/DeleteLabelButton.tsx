import React, { ComponentPropsWithRef, FC } from 'react';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';

interface IButtonProps extends ComponentPropsWithRef<typeof Button> {}

const StyledButton = styled(Button)`
  margin: 0;
  padding: 0;
  font-size: 1rem;

  &.btn.btn-sm {
    margin-left: 0;
  }
`;

const DeleteLabelButton: FC<IButtonProps> = (props) => (
  <StyledButton bsSize='sm' bsStyle='link' {...props} />
);

export default DeleteLabelButton;
