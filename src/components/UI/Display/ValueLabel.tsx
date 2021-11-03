import React, { ReactNode } from 'react';
import { css } from 'styled-components';
import styled from 'styled-components';

const radius = '5px';

const defaultThemeColor = 'shade5';

const Wrapper = styled.div`
  display: inline-block;
  margin-bottom: 5px;
  white-space: nowrap;
  line-height: 30px;
`;

const CommonCSS = css`
  padding: 5px 8px;
  font-weight: 300;
`;

const LabelWrapper = styled.span`
  ${CommonCSS};
  border: 1px solid
    ${({ color, theme }) => color ?? theme.colors[defaultThemeColor]};
  background-color: ${({ color, theme }) =>
    color ?? theme.colors[defaultThemeColor]};
  border-top-left-radius: ${radius};
  border-bottom-left-radius: ${radius};
  border-right: none;
`;

const ValueWrapper = styled.span`
  ${CommonCSS};
  border: 1px solid
    ${({ color, theme }) => color ?? theme.colors[defaultThemeColor]};
  border-top-right-radius: ${radius};
  border-bottom-right-radius: ${radius};
  border-left: none;
  color: #eee;
`;

interface IValueLabelProps extends React.ComponentPropsWithoutRef<'div'> {
  label: ReactNode;
  value: ReactNode;

  color?: string;
}

const ValueLabel = ({ label, value, color, ...props }: IValueLabelProps) => {
  return (
    <Wrapper {...props}>
      <LabelWrapper color={color}>{label}</LabelWrapper>
      <ValueWrapper color={color}>{value}</ValueWrapper>
    </Wrapper>
  );
};

ValueLabel.defaultProps = {
  value: '',
  onClick: () => {},
};

export default ValueLabel;
