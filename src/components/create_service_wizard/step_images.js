'use strict';
var React = require('react');
var Slide = require('../component_slider/slide');
var actions = require('../reflux_actions/new_service_actions');
var store = require('../reflux_stores/new_service_store');
var Reflux = require('reflux');

module.exports = React.createClass ({
    mixins: [Reflux.connect(store,'newService')],

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
            <h1>Analyzing images for {this.state.newService.serviceName}</h1>
            <button className="primary" onClick={this.validate}>Continue</button><br/>
            <button onClick={this.props.onPrevious}>Previous</button>
          </Slide>
        );
    }
});