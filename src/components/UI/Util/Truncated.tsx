import { truncate } from 'lib/helpers';
import PropTypes from 'prop-types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import styled from 'styled-components';

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
const Truncated: React.FC<ITruncatedProps> = ({
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
        <OverlayTrigger
          overlay={<Tooltip id='tooltip'>{children}</Tooltip>}
          placement={tooltipPlacement ?? 'top'}
        >
          <Label {...labelProps}>{str}</Label>
        </OverlayTrigger>
      )}
    </Wrapper>
  );
};

Truncated.propTypes = {
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  // Suppressing because there is no prop-type for HTML tag names
  // @ts-ignore
  as: PropTypes.string,
  labelProps: PropTypes.object,
  numEnd: PropTypes.number,
  numStart: PropTypes.number,
  replacer: PropTypes.string,
  tooltipPlacement: PropTypes.oneOf(['top', 'bottom']),
};

Truncated.defaultProps = {
  as: 'span',
  numEnd: 5,
  numStart: 15,
  replacer: '…',
  tooltipPlacement: 'top',
};

export default Truncated;
