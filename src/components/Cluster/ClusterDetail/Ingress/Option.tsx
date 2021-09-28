import React, { ComponentPropsWithoutRef, ReactNode } from 'react';
import styled from 'styled-components';

import { Info, InfoRow, Text } from './Components';

const Identifier = styled.div`
  text-transform: uppercase;
  border-radius: 100%;
  background-color: ${({ theme }) => theme.colors.darkBlueDarker2};
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;
`;

const StyledInfoRow = styled(InfoRow)`
  flex-wrap: wrap;
`;

const Column = styled.div`
  max-width: 100%;

  ${Text} {
    margin-bottom: 8px;
  }

  &:nth-of-type(2) {
    padding: 6px 12px 0;
    flex: 1 0 calc(100% - 32px);
  }
`;

type OptionProps = ComponentPropsWithoutRef<typeof Info> & {
  id?: string;
  footer?: ReactNode;
};

const Option: React.FC<OptionProps> = ({ id, footer, children, ...rest }) => {
  return (
    <Info {...rest}>
      <StyledInfoRow>
        <Column>
          <Identifier>{id}</Identifier>
        </Column>
        <Column>
          {children}
          {footer}
        </Column>
      </StyledInfoRow>
    </Info>
  );
};

Option.defaultProps = {
  id: '',
};

export default Option;
