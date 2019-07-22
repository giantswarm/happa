import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

/**
 * This component displays availability zone labels
 * for the zones used by a cluster or node pool.
 *
 * Each zone gets a unique color for visual distinction.
 */

const Wrapper = styled.abbr`
  border-radius: 2em;
  color: #333;
  padding: 2px;
  display: inline-block;
  width: 1.6em;
  text-align: center;
  margin-left: 4px;
  margin-right: 4px;
  line-height: 1.4em;
  text-decoration: none;
  &.a {
    background-color: #66c2a5;
  }
  &.b {
    background-color: #fc8d62;
  }
  &.c {
    background-color: #8da0cb;
  }
  &.d {
    background-color: #e78ac3;
  }
  &.e {
    background-color: #a6d854;
  }
  &.f {
    background-color: #ffd92f;
  }
  &.g {
    background-color: #e5c494;
  }
  &[title] {
    text-decoration: none;
  }
`;

const AvailabilityZonesLabel = ({ zones, style }) => {
  if (typeof zones === 'undefined' || zones.length == 0) {
    return <abbr title='No information available'>n/a</abbr>;
  }

  let azs = zones.map(az => {
    // we use the letter that is the last character as the label
    let letter = az.slice(-1);
    let label = letter.toUpperCase();
    return (
      <Wrapper className={letter} key={az} style={style} title={az}>
        {label}
      </Wrapper>
    );
  });

  return <div>{azs}</div>;
};

AvailabilityZonesLabel.propTypes = {
  zones: PropTypes.arrayOf(PropTypes.string),
  style: PropTypes.object,
};

export default AvailabilityZonesLabel;
