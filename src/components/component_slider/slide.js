'use strict';

// Slide
//
// Wrap components in a Slide when using them in a ComponentSlider
//
// <Slide>
//  <h1>My slide</h1>
// </Slide>
//

import React from 'react';
import PropTypes from 'prop-types';

class Slide extends React.Component {
  render() {
    return (
      <div className='component_slider--step'>
        {this.props.children}
      </div>
    );
  }
}

Slide.propTypes = {
  children: PropTypes.node
};

export default Slide;
