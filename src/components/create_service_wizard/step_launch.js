'use strict';
var React = require('react');
var Slide = require('../component_slider/slide');

module.exports = React.createClass ({
    getInitialState() {
      return {};
    },

    validate(){
      // Do some validation

      // Signal continue
      this.props.onContinue();
    },

    render() {
      return (
        <Slide>
          <h1>Launch</h1>
          <button className="primary" onClick={this.validate} disabled>Continue</button><br/>
          <button onClick={this.props.onPrevious}>Previous</button>
        </Slide>
      );
    }
});