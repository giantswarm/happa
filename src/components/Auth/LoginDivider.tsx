import styled from '@emotion/styled';
import React from 'react';

const Wrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  width: 100%;
`;

const Separator = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.colors.foreground};
  height: 1px;
`;

const Text = styled.div`
  padding: 0 16px;
  color ${({ theme }) => theme.colors.gray}
`;

interface ILoginDividerProps extends React.ComponentPropsWithoutRef<'div'> {}

const LoginDivider: React.FC<ILoginDividerProps> = ({ ...props }) => {
  return (
    <Wrapper {...props}>
      <Separator />
      <Text>or</Text>
      <Separator />
    </Wrapper>
  );
};

LoginDivider.propTypes = {};

export default LoginDivider;
