import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import * as React from 'react';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const ElementWrapper = styled.div`
  display: flex;
  flex: 1 1 80%;
`;

const TypeWrapper = styled.div`
  flex: 1 0 0;
  text-align: right;
`;

const Type = styled.span`
  background-color: ${({ theme }) => theme.colors.darkBlueDarker6};
  font-family: ${({ theme }) => theme.fontFamilies.console};
  padding: ${({ theme }) => theme.spacingPx}px;
  border-radius: ${({ theme }) => theme.border_radius};
`;

interface IRendererWrapperProps extends React.ComponentPropsWithoutRef<'div'> {
  type: string;
}

const RendererWrapper: React.FC<IRendererWrapperProps> = ({
  type,
  children,
  ...rest
}) => {
  return (
    <Wrapper {...rest}>
      <ElementWrapper>{children}</ElementWrapper>
      <TypeWrapper>
        <Type>{type}</Type>
      </TypeWrapper>
    </Wrapper>
  );
};

RendererWrapper.propTypes = {
  type: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default RendererWrapper;
