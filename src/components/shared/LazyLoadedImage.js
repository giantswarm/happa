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

export default LazyLoadedImage;
