import styled from '@emotion/styled';
import React, { ComponentPropsWithRef, FC } from 'react';
import BsButton from 'react-bootstrap/lib/Button';

interface IButtonProps extends ComponentPropsWithRef<'button'> {}

const StyledButton = styled(BsButton)<{ ref?: string }>`
  margin: 0;
  padding: 0;
`;

const DeleteLabelButton: FC<IButtonProps> = (props) => (
  // @ts-ignore
  <StyledButton bsStyle='link' {...props} />
);

export default DeleteLabelButton;
