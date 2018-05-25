'use strict';

// Component Slider
// Takes an array of components (slides), and lets you transition between them
//
// <ComponentSlider currentSlide=0 slides={[component1, component2, component3]}/>;
//
// props:
//
// @currentSlide - Number - The index of the current slide. Default 0
// @slides       - Array  - An array of components

import React from 'react';
import PropTypes from 'prop-types';

class ComponentSlider extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentSlide: this.props.currentSlide || 0,
      currentSlideAsArray: [this.props.slides[this.props.currentSlide || 0]],  // We store the current slide in an array
                                                    // So we can push in the new slide
                                                    // and pop the old slide
                                                    // so that Reactcsstransitiongroup will
                                                    // apply its transitions correctly
      direction: 'left'
    };

    this.hidden = {
      display: 'none'
    };
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setSlide(nextProps.currentSlide);
  }

  setSlide(slideNumber) {
    window.scrollTo(0, 0);
    var direction;

    if (slideNumber >= 0 && slideNumber < this.props.slides.length) {
      if (slideNumber > this.state.currentSlide) {
        direction = 'left';
      } else {
        direction = 'right';
      }

      this.setState({
        currentSlide: slideNumber,
        currentSlideAsArray: [this.props.slides[slideNumber]],
        direction: direction
      });
    } else {
      // Tried to get to a slide that doesn't exist. Do nothing.
    }
  }

  next() {
    this.setSlide(this.state.currentSlide + 1);
  }

  previous() {
    this.setSlide(this.state.currentSlide - 1);
  }

  render() {
    return (
      <div className='component_slider--container'>
        {this.state.currentSlideAsArray}
      </div>
    );
  }
}

ComponentSlider.propTypes = {
  currentSlide: PropTypes.number,
  slides: PropTypes.array
};

export default ComponentSlider;
