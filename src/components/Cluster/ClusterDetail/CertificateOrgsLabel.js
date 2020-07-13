import PropTypes from 'prop-types';
import React from 'react';
import CachingColorHash from 'utils/cachingColorHash';

const colorHash = new CachingColorHash({ lightness: 0.25, saturation: 0.6 });

class CertificateOrgsLabel extends React.Component {
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
                    backgroundColor: colorHash.calculateColor(element),
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
