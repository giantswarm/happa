"use strict";

var React           = require('react');
var ComponentSlider = require('../component_slider');

var Overview    = require('./1_overview.js');
var Download    = require('./2_download_kube.js');

module.exports = React.createClass({
  // TODO: Make this into actions that update this components currentSlide state
  onContinue() {
    this.refs.componentSlider.next();
  },

  onPrevious() {
    this.refs.componentSlider.previous();
  },

  slides() {
    return ([
      <Overview key="overview" onPrevious={this.onPrevious} onContinue={this.onContinue}/>,
      <Download key="download" onPrevious={this.onPrevious} onContinue={this.onContinue}/>
    ]);
  },

  render: function() {
    return <ComponentSlider ref="componentSlider" currentSlide={0} slides={this.slides()}/>;
  }
});