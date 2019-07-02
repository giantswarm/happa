import PropTypes from 'prop-types';
import React from 'react';

/**
 * This component displays availability zone labels
 * for the zones used by a cluster or node pool.
 */

const AvailabilityZonesLabel = props => {
  const { zones } = props;

  if (zones.length == 0) {
    return <abbr title='No information available'>n/a</abbr>;
  }

  let azs = zones.map(az => {
    // we use the letter that is the last character as the label
    let label = az.slice(-1).toUpperCase();
    return (
      <abbr
        key={az}
        // TODO: change to emotion/styled once
        // https://github.com/giantswarm/happa/pull/600 is merged
        style={{
          borderRadius: '2em',
          backgroundColor: '#fff',
          color: '#000',
          padding: '2px',
          display: 'inline-block',
          width: '1.7em',
          textAlign: 'center',
          marginLeft: '4px',
          marginRight: '4px',
          lineHeight: '1.4em',
          textDecorationLine: 'none',
        }}
        title={az}
      >
        {label}
      </abbr>
    );
  });

  return <div>{azs}</div>;
};

AvailabilityZonesLabel.propTypes = {
  zones: PropTypes.arrayOf(PropTypes.string),
};

export default AvailabilityZonesLabel;
