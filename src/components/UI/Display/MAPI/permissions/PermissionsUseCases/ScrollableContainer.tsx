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
    width: 20px;
    height: 100%;
  }

  &::before {
    left: 0;
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.darkBlue},
      transparent
    );
  }

  &::after {
    right: 0;
    background: linear-gradient(
      90deg,
      transparent,
      ${({ theme }) => theme.colors.darkBlue}
    );
  }
`;

const ContainerInner = styled.div`
  overflow-x: auto;
  width: 100%;
  padding: 0 20px 10px;
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
