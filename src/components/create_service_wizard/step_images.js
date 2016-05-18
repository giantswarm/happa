'use strict';
var React = require('react');
var Slide = require('../component_slider/slide');

module.exports = React.createClass ({
    getInitialState() {
      return {};
    },

    validate(){
      // Do some validation
      console.log("validating");
      console.log("valid");

      // Signal continue
      this.props.onContinue();
    },

    render() {
        return (
          <Slide>
            <h1>Analyzing images</h1>
            <button className="primary" onClick={this.validate}>Continue</button><br/>
            <button onClick={this.props.onPrevious}>Previous</button>
          </Slide>
        );
    }
});