import React, { ReactNode } from 'react';
import { css } from 'styled-components';
import styled from 'styled-components';

const radius = '5px';

const defaultThemeColor = 'darkBlue';

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
`;

export const KeyWrapper = styled.span<{ outline: boolean; rounded: boolean }>`
  ${CommonCSS};
  background-color: ${({ color, theme }) =>
    color ?? theme.colors[defaultThemeColor]};

  ${({ rounded }) =>
    rounded &&
    css`
      border-top-left-radius: ${radius};
      border-bottom-left-radius: ${radius};
    `}

  ${({ outline, color }) =>
    outline &&
    css`
      border: 1px solid
        ${({ theme }) => color ?? theme.colors[defaultThemeColor]};
      border-right: none;
    `}
`;

export const ValueWrapper = styled.span<{
  outline: boolean;
  rounded: boolean;
  textColor?: string;
  backgroundColor?: string;
}>`
  ${CommonCSS};
  color: ${({ textColor }) => textColor ?? 'inherit'};
  background-color: ${({ backgroundColor }) =>
    backgroundColor ?? 'transparent'};

  ${({ rounded }) =>
    rounded &&
    css`
      border-top-right-radius: ${radius};
      border-bottom-right-radius: ${radius};
    `}

  ${({ outline, color }) =>
    outline &&
    css`
      border: 1px solid
        ${({ theme }) => color ?? theme.colors[defaultThemeColor]};
      border-left: none;
    `}
`;

interface IValueLabelProps extends React.ComponentPropsWithRef<'div'> {
  label: ReactNode;
  value: ReactNode;

  color?: string;
  valueBackgroundColor?: string;
  valueTextColor?: string;
  outline?: boolean;
  rounded?: boolean;
}

const ValueLabel = React.forwardRef(
  (
    {
      label,
      value,
      color,
      valueBackgroundColor,
      valueTextColor,
      outline,
      rounded = true,
      ...props
    }: IValueLabelProps,
    _
  ) => {
    return (
      <Wrapper {...props}>
        <KeyWrapper
          color={color}
          outline={Boolean(outline)}
          rounded={Boolean(rounded)}
        >
          {label}
        </KeyWrapper>
        <ValueWrapper
          color={color}
          textColor={valueTextColor}
          backgroundColor={valueBackgroundColor}
          outline={Boolean(outline)}
          rounded={Boolean(rounded)}
        >
          {value}
        </ValueWrapper>
      </Wrapper>
    );
  }
);

ValueLabel.defaultProps = {
  value: '',
  onClick: () => {},
  outline: true,
};

export default ValueLabel;
