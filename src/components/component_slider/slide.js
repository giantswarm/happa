"use strict";

// Slide
//
// Wrap components in a Slide when using them in a ComponentSlider
//
// <Slide>
//  <h1>My slide</h1>
// </Slide>
//

var React = require('react');

module.exports = React.createClass ({
  render() {
    return (
      <div className="component_slider--step">
        {this.props.children}
      </div>
    );
  }
});