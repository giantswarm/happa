import styled from '@emotion/styled';
import { truncate } from 'lib/helpers';
import PropTypes from 'prop-types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';

interface ITruncatedProps
  extends React.ComponentPropsWithoutRef<React.ElementType> {
  children: string | number;
  replacer?: string;
  as?: React.ElementType;
  numStart?: number;
  numEnd?: number;
  labelProps?: React.ComponentPropsWithoutRef<'span'>;
}

const Wrapper = styled.span``;
const Label = styled.span``;

/**
 * A component that truncates a string/number in a smart way
 */
const Truncated: React.FC<ITruncatedProps> = ({
  children,
  replacer,
  numStart,
  numEnd,
  labelProps,
  ...rest
}) => {
  let str = String(children);

  // Safe because we're using defaultProps in case these aren't defined
  str = truncate(str, replacer as string, numStart as number, numEnd as number);

  // Skip the tooltip if the content was not truncated
  let skipTooltip = false;
  if (str === children) skipTooltip = true;

  return (
    <Wrapper {...rest}>
      {skipTooltip ? (
        <Label {...labelProps}>{str}</Label>
      ) : (
        <OverlayTrigger
          overlay={<Tooltip id='tooltip'>{children}</Tooltip>}
          placement='top'
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
  replacer: PropTypes.string,
  // Suppressing because there is no prop-type for HTML tag names
  // @ts-ignore
  as: PropTypes.string,
  numStart: PropTypes.number,
  numEnd: PropTypes.number,
  labelProps: PropTypes.object,
};

Truncated.defaultProps = {
  replacer: '...',
  as: 'span',
  numStart: 15,
  numEnd: 5,
};

export default Truncated;
