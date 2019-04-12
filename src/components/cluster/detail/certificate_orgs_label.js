'use strict';

import PropTypes from 'prop-types';
import React from 'react';

class CertificateOrgsLabel extends React.Component {
  render() {
    var orgs = this.props.value.split(',');
    orgs.sort();
    var orgLabels = [];
    orgs.forEach(element => {
      var classNames = 'orglabel';
      if (element === 'system:masters') {
        classNames += ' isadmin';
      }
      orgLabels.push(
        <span className={classNames}>
          <code>{element}</code>
        </span>
      );
    });
    return orgLabels;
  }
}

CertificateOrgsLabel.propTypes = {
  value: PropTypes.string,
};

export default CertificateOrgsLabel;
