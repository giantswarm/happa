import ColorHash from 'color-hash';
import PropTypes from 'prop-types';
import React from 'react';

var certificateOrgsColorHashCache = {};

class CertificateOrgsLabel extends React.Component {
  calculateColour(str) {
    if (!certificateOrgsColorHashCache[str]) {
      let col = new ColorHash({ lightness: 0.25, saturation: 0.6 }).hex(str);
      certificateOrgsColorHashCache[str] = col;
    }

    return certificateOrgsColorHashCache[str];
  }

  render() {
    return (
      <div className='certificate-orgs-label'>
        {this.props.value
          .split(',')
          .sort()
          .map((element, index) => {
            if (element != '') {
              return (
                <span
                  className={'orglabel'}
                  data-testid={`orglabel-${index}`}
                  key={element}
                  style={{ backgroundColor: this.calculateColour(element) }}
                >
                  {element}
                </span>
              );
            }
          })}
      </div>
    );
  }
}

CertificateOrgsLabel.propTypes = {
  value: PropTypes.string,
};

export default CertificateOrgsLabel;
