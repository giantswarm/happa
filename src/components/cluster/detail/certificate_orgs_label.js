'use strict';

import PropTypes from 'prop-types';
import React from 'react';

class CertificateOrgsLabel extends React.Component {
  render() {
    if (this.props.value === '') {
      return <span />;
    }

    var orgs = this.props.value.split(',');
    orgs.sort();
    var orgLabels = [];
    orgs.forEach(element => {
      var classNames = 'orglabel';
      if (element === 'system:masters') {
        classNames += ' isadmin';
      }
      orgLabels.push(<span className={classNames}>{element}</span>);
    });
    return orgLabels;
  }
}

CertificateOrgsLabel.propTypes = {
  value: PropTypes.string,
};

export default CertificateOrgsLabel;
