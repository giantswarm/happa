import { css } from '@emotion/core';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React, { ReactNode } from 'react';

const radius = '5px';

const defaultThemeColor = 'shade5';

const Wrapper = styled.div`
  display: inline-block;
  margin-bottom: 8px;
  margin-right: 5px;
  white-space: nowrap;
`;

const CommonCSS = css`
  padding: 5px 8px;
  font-size: 14px;
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

interface IValueLabelProps {
  label: ReactNode;
  value: ReactNode;

  className?: string;
  color?: string;
  onClick?(): void;
}

const ValueLabel = ({
  label,
  value,
  className,
  color,
  onClick,
}: IValueLabelProps) => {
  return (
    <Wrapper className={className} onClick={onClick}>
      <LabelWrapper color={color}>{label}</LabelWrapper>
      <ValueWrapper color={color}>{value}</ValueWrapper>
    </Wrapper>
  );
};

ValueLabel.propTypes = {
  label: PropTypes.node.isRequired,
  value: PropTypes.node,

  className: PropTypes.string,
  color: PropTypes.string,
  onClick: PropTypes.func,
};

ValueLabel.defaultProps = {
  value: '',
  onClick: () => {},
};

export default ValueLabel;
