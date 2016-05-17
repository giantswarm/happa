"use strict";

var React   = require('react');
var MultiStep = require('../multistep');

var StepDefine = require('./step_define.js');
var StepImages = require('./step_images.js');
var StepConfigure = require('./step_configure.js');
var StepLaunch = require('./step_launch.js');

module.exports = React.createClass({
  onContinue() {
    this.refs.wizard.next();
  },

  onPrevious() {
    this.refs.wizard.previous();
  },

  steps() {
    return ([
      <StepDefine key="step-define" onPrevious={this.onPrevious} onContinue={this.onContinue}/>,
      <StepImages key="step-images" onPrevious={this.onPrevious} onContinue={this.onContinue}/>,
      <StepConfigure key="step-configure" onPrevious={this.onPrevious} onContinue={this.onContinue}/>,
      <StepLaunch key="step-launch" onPrevious={this.onPrevious} onContinue={this.onContinue}/>
    ]);
  },

  render: function() {
    return <MultiStep ref="wizard" steps={this.steps()}/>;
  }
});