import PropTypes from 'prop-types';
import React from 'react';

class CertificateOrgsLabel extends React.Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
  };

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

export default CertificateOrgsLabel;