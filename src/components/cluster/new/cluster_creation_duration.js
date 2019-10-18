import PropTypes from 'prop-types';
import React from 'react';

class ClusterCreationDuration extends React.Component {
  render() {
    let minutes = 0;

    if (this.props.stats.p75) {
      minutes = Math.round(this.props.stats.p75 / 60.0);
    }

    if (minutes > 0) {
      return (
        <p style={{ marginTop: '23px' }}>
          Most clusters are up within {minutes} minutes once this form has been
          submitted.
        </p>
      );
    }

    return (
      <p style={{ marginTop: '23px' }}>
        Clusters usually take between 10 and 30 minutes to come up.
      </p>
    );
  }
}

ClusterCreationDuration.propTypes = {
  stats: PropTypes.object,
};

export default ClusterCreationDuration;
