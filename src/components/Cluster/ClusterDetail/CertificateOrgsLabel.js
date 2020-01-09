import ColorHash from 'color-hash';
import PropTypes from 'prop-types';
import React from 'react';

const certificateOrgsColorHashCache = {};

class CertificateOrgsLabel extends React.Component {
  static calculateColour(str) {
    if (!certificateOrgsColorHashCache[str]) {
      const col = new ColorHash({ lightness: 0.25, saturation: 0.6 }).hex(str);
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
            if (element !== '') {
              return (
                <span
                  className='orglabel'
                  data-testid={`orglabel-${index}`}
                  key={element}
                  style={{
                    backgroundColor: CertificateOrgsLabel.calculateColour(
                      element
                    ),
                  }}
                >
                  {element}
                </span>
              );
            }

            return null;
          })}
      </div>
    );
  }
}

CertificateOrgsLabel.propTypes = {
  value: PropTypes.string,
};

export default CertificateOrgsLabel;
