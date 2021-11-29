import React, { ReactNode } from 'react';
import { css } from 'styled-components';
import styled from 'styled-components';

const radius = '5px';

const defaultThemeColor = 'shade5';

const Wrapper = styled.div`
  display: inline-flex;
  align-items: stretch;
  margin-bottom: 5px;
  white-space: nowrap;
  line-height: 30px;
  height: 30px;
`;

const CommonCSS = css`
  display: flex;
  align-items: center;
  padding: 5px 8px;
  font-weight: 300;
`;

const LabelWrapper = styled.span<{ outline: boolean }>`
  ${CommonCSS};
  background-color: ${({ color, theme }) =>
    color ?? theme.colors[defaultThemeColor]};
  border-top-left-radius: ${radius};
  border-bottom-left-radius: ${radius};

  ${({ outline, color }) =>
    outline &&
    css`
      border: 1px solid
        ${({ theme }) => color ?? theme.colors[defaultThemeColor]};
      border-right: none;
    `}
`;

const ValueWrapper = styled.span<{ outline: boolean }>`
  ${CommonCSS};
  border-top-right-radius: ${radius};
  border-bottom-right-radius: ${radius};

  color: #eee;

  ${({ outline, color }) =>
    outline &&
    css`
      border: 1px solid
        ${({ theme }) => color ?? theme.colors[defaultThemeColor]};
      border-left: none;
    `}
`;

interface IValueLabelProps extends React.ComponentPropsWithoutRef<'div'> {
  label: ReactNode;
  value: ReactNode;

  color?: string;
  outline?: boolean;
}

const ValueLabel = ({
  label,
  value,
  color,
  outline,
  ...props
}: IValueLabelProps) => {
  return (
    <Wrapper {...props}>
      <LabelWrapper color={color} outline={Boolean(outline)}>
        {label}
      </LabelWrapper>
      <ValueWrapper color={color} outline={Boolean(outline)}>
        {value}
      </ValueWrapper>
    </Wrapper>
  );
};

ValueLabel.defaultProps = {
  value: '',
  onClick: () => {},
  outline: true,
};

export default ValueLabel;
