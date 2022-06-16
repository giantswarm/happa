import { normalizeColor } from 'grommet/utils';
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;

  &::before,
  &::after {
    content: ' ';
    position: absolute;
    z-index: 2;
    top: 0;
    bottom: 30px;
    width: 20px;
  }

  &::before {
    left: 0;
    background: linear-gradient(
      90deg,
      ${({ theme }) => normalizeColor('background', theme)},
      transparent
    );
  }

  &::after {
    right: 0;
    background: linear-gradient(
      90deg,
      transparent,
      ${({ theme }) => normalizeColor('background', theme)}
    );
  }
`;

const ContainerInner = styled.div`
  overflow-x: auto;
  width: 100%;
  padding: 0 20px 30px;
`;

const ScrollableContainer: React.FC<React.PropsWithChildren<{}>> = ({
  children,
  ...props
}) => (
  <Container {...props}>
    <ContainerInner>{children}</ContainerInner>
  </Container>
);

export default ScrollableContainer;
