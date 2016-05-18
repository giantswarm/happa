'use strict';
var React = require('react');

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
          <div className="component_slider--step">
            <h1>Analyzing images</h1>
            <button className="primary" onClick={this.validate}>Continue</button><br/>
            <button onClick={this.props.onPrevious}>Previous</button>
          </div>
        );
    }
});