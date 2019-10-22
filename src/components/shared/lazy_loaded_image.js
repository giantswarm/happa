import PropTypes from 'prop-types';
import React from 'react';

class LazyLoadedImage extends React.PureComponent {
  imageRef = React.createRef();

  componentDidMount() {
    const { current } = this.imageRef;
    const { src } = this.props;

    if (current && src) {
      current.src = src;
    }
  }

  render() {
    return <img {...this.props} src={null} ref={this.imageRef} />;
  }
}

LazyLoadedImage.propTypes = {
  src: PropTypes.string.isRequired,
};

export default LazyLoadedImage;
