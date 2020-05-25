import styled from '@emotion/styled';
import React, { FC } from 'react';
import BsButton, { ButtonProps } from 'react-bootstrap/lib/Button';

const StyledButton = styled(BsButton)<{ ref?: string }>`
  margin: 0;
  padding: 0;
`;

const DeleteLabelButton: FC<ButtonProps> = (props) => (
  // @ts-ignore
  <StyledButton bsStyle='link' {...props} />
);

export default DeleteLabelButton;
