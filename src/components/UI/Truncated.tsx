import styled from '@emotion/styled';
import { truncate } from 'lib/helpers';
import PropTypes from 'prop-types';
import React from 'react';

interface ITruncatedProps {
  children: string | number;
  replacer?: string;
  as?: React.ElementType;
  numStart?: number;
  numEnd?: number;
}

const StyledWrapper = styled.span``;

const Truncated: React.FC<ITruncatedProps> = ({
  children,
  replacer,
  numStart,
  numEnd,
  ...rest
}) => {
  let str = String(children);

  // Safe because we're using defaultProps in case these aren't defined
  str = truncate(str, replacer as string, numStart as number, numEnd as number);

  return <StyledWrapper {...rest}>{str}</StyledWrapper>;
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
};

Truncated.defaultProps = {
  replacer: '...',
  as: 'span',
  numStart: 15,
  numEnd: 5,
};
