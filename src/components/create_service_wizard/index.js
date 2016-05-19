"use strict";

// Create Service Wizard
// Sets up a ComponentSlider with the steps to create a service
//
// Steps know how to validate themselves and let the wizard know
// when to continue or go back through onContinue and onPrevious
//
// Interacts with NewServiceStore, which is what holds the NewService
// as it is being built.

var React           = require('react');
var ComponentSlider = require('../component_slider');

var StepDefine    = require('./step_define.js');
var StepImages    = require('./step_images.js');
var StepConfigure = require('./step_configure.js');
var StepLaunch    = require('./step_launch.js');

module.exports = React.createClass({
  onContinue() {
    this.refs.componentSlider.next();
  },

  onPrevious() {
    this.refs.componentSlider.previous();
  },

  slides() {
    return ([
      <StepDefine    key="step-define"    onPrevious={this.onPrevious} onContinue={this.onContinue}/>,
      <StepImages    key="step-images"    onPrevious={this.onPrevious} onContinue={this.onContinue}/>,
      <StepConfigure key="step-configure" onPrevious={this.onPrevious} onContinue={this.onContinue}/>,
      <StepLaunch    key="step-launch"    onPrevious={this.onPrevious} onContinue={this.onContinue}/>
    ]);
  },

  render: function() {
    return <ComponentSlider ref="componentSlider" currentSlide={0} slides={this.slides()}/>;
  }
});