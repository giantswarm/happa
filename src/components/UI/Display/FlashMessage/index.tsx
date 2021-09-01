// FlashMessage
//
// A flash message, can dismiss itself or call a function passed in through
// props on dismiss.
//

import React, { FC } from 'react';
import styled from 'styled-components';
import { FlashMessageType } from 'styles';

const FlashMessageOuter = styled.div<{ type: FlashMessageType }>`
  background-color: ${({ theme, type }) =>
    theme.colors.flashMessages[type].background};
  border: 1px solid
    ${({ theme, type }) => theme.colors.flashMessages[type].border};
  border-radius: ${({ theme }) => theme.border_radius};
  color: ${({ theme, type }) => theme.colors.flashMessages[type].text};
  position: relative;
  padding: ${({ theme }) => theme.spacingPx * 2}px
    ${({ theme }) => theme.spacingPx * 5}px
    ${({ theme }) => theme.spacingPx * 2}px
    ${({ theme }) => theme.spacingPx * 3}px;
  margin-bottom: ${({ theme }) => theme.spacingPx * 3}px;
  font-size: 14px;
  line-height: 2em;

  a {
    color: ${({ theme, type }) => theme.colors.flashMessages[type].text};
    font-weight: bold;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

interface IFlashMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  type: FlashMessageType;
}

const FlashMessage: FC<IFlashMessageProps> = ({
  type,
  className,
  children,
  ...rest
}) => {
  if (!children) {
    return null;
  }

  return (
    <FlashMessageOuter {...rest} type={type} className={className}>
      {children}
    </FlashMessageOuter>
  );
};

export default FlashMessage;
