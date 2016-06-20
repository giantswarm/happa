"use strict";

var React           = require('react');
var ComponentSlider = require('../component_slider');

var Page0_Overview         = require('./0_overview.js');
var Page1_DownloadKubeCTL  = require('./1_download_kubectl.js');
var Page2_ConfigureKubeCTL = require('./2_configure_kubectl.js');
var Page3_SimpleExample    = require('./3_simple_example.js');

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
      <Page0_Overview         key="overview"  onPrevious={this.onPrevious} onContinue={this.onContinue}/>,
      <Page1_DownloadKubeCTL  key="download"  onPrevious={this.onPrevious} onContinue={this.onContinue}/>,
      <Page2_ConfigureKubeCTL key="configure" onPrevious={this.onPrevious} onContinue={this.onContinue}/>,
      <Page3_SimpleExample    key="example"   onPrevious={this.onPrevious} onContinue={this.onContinue}/>
    ]);
  },

  render: function() {
    return <ComponentSlider ref="componentSlider" currentSlide={0} slides={this.slides()}/>;
  }
});