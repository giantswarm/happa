import PropTypes from 'prop-types';
import React from 'react';

const ClusterCreationDuration = props => {
  // eslint-disable-next-line no-magic-numbers
  const minutes = props.stats.p75 ? Math.round(props.stats.p75 / 60.0) : 0;

  const message =
    minutes > 0
      ? `Most clusters are up within ${minutes} minutes once this form has been
    submitted.`
      : `Clusters usually take between 10 and 30 minutes to come up.`;

  return <p style={{ marginTop: '23px' }}>{message}</p>;
};

ClusterCreationDuration.propTypes = {
  stats: PropTypes.object,
};

export default ClusterCreationDuration;
