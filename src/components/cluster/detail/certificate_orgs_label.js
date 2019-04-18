import PropTypes from 'prop-types';
import React from 'react';

class CertificateOrgsLabel extends React.Component {
  render() {
    return this.props.value
      .split(',')
      .sort()
      .map(element => (
        <span
          className={
            'orglabel ' + (element === 'system:masters' ? 'isadmin' : null)
          }
          key={element}
        >
          {element}
        </span>
      ));
  }
}

CertificateOrgsLabel.propTypes = {
  value: PropTypes.string,
};

export default CertificateOrgsLabel;
