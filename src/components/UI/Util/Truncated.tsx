import React from 'react';
import styled from 'styled-components';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';
import { truncate } from 'utils/helpers';

interface ITruncatedProps
  extends React.ComponentPropsWithoutRef<React.ElementType> {
  children: string | number;
  as?: React.ElementType;
  labelProps?: React.ComponentPropsWithoutRef<'span'>;
  numEnd?: number;
  numStart?: number;
  replacer?: string;
  tooltipPlacement?: 'top' | 'bottom';
}

const Wrapper = styled.span``;
const Label = styled.span``;

/**
 * A component that truncates a string/number in a smart way
 */
const Truncated: React.FC<React.PropsWithChildren<ITruncatedProps>> = ({
  children,
  labelProps,
  numEnd,
  numStart,
  replacer,
  tooltipPlacement,
  ...rest
}) => {
  let str = String(children);

  // Safe because we're using defaultProps in case these aren't defined
  str = truncate(str, replacer as string, numStart as number, numEnd as number);

  // Skip the tooltip if the content was not truncated
  const skipTooltip = str === children;

  return (
    <Wrapper {...rest}>
      {skipTooltip ? (
        <Label {...labelProps}>{str}</Label>
      ) : (
        <TooltipContainer
          content={
            <Tooltip
              placement={tooltipPlacement ?? 'top'}
              width={{ max: 'none' }}
            >
              {String(children)}
            </Tooltip>
          }
        >
          <Label {...labelProps}>{str}</Label>
        </TooltipContainer>
      )}
    </Wrapper>
  );
};

Truncated.defaultProps = {
  as: 'span',
  numEnd: 5,
  numStart: 15,
  replacer: '…',
  tooltipPlacement: 'top',
};

export default Truncated;
