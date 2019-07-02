import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

/**
 * This component displays availability zone labels
 * for the zones used by a cluster or node pool.
 */

const Wrapper = styled.abbr`
  border-radius: 2em;
  background-color: #fff;
  color: #000;
  padding: 2px;
  display: inline-block;
  width: 1.7em;
  text-align: center;
  margin-left: 4px;
  margin-right: 4px;
  line-height: 1.4em;
  text-decoration-line: none;
`;

const AvailabilityZonesLabel = props => {
  const { zones } = props;

  if (zones.length == 0) {
    return <abbr title='No information available'>n/a</abbr>;
  }

  let azs = zones.map(az => {
    // we use the letter that is the last character as the label
    let label = az.slice(-1).toUpperCase();
    return (
      <Wrapper key={az} title={az}>
        {label}
      </Wrapper>
    );
  });

  return <div>{azs}</div>;
};

AvailabilityZonesLabel.propTypes = {
  zones: PropTypes.arrayOf(PropTypes.string),
};

export default AvailabilityZonesLabel;
