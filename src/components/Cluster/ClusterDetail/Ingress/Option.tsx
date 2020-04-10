import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React, { ComponentPropsWithoutRef, ReactNode } from 'react';

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
  flex-wrap: nowrap;
`;

const Column = styled.div`
  & + & {
    margin-left: 1.5rem;
  }

  ${Text} {
    margin-bottom: 8px;
  }
`;

interface IOptionProps extends ComponentPropsWithoutRef<typeof Info> {
  id?: string;
  footer?: ReactNode;
}

const Option: React.FC<IOptionProps> = ({ id, footer, children, ...rest }) => {
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

Option.propTypes = {
  id: PropTypes.string,
  footer: PropTypes.node,
  children: PropTypes.node,
};

Option.defaultProps = {
  id: '',
};

export default Option;
