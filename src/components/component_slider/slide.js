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
  children: React.PropTypes.node
};

export default Slide;