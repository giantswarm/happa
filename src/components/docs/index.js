"use strict";

var React           = require('react');
var ComponentSlider = require('../component_slider');
var _               = require("underscore");

var Page0_Overview         = require('./0_overview.js');
var Page1_DownloadKubeCTL  = require('./1_download_kubectl.js');
var Page2_ConfigureKubeCTL = require('./2_configure_kubectl.js');
var Page3_SimpleExample    = require('./3_simple_example.js');
var Page4_Inspecting       = require('./4_inspecting.js');

module.exports = React.createClass({
  contextTypes: {
    router: React.PropTypes.object
  },

  getInitialState() {
    return {
      currentSlide: 0
    };
  },

  componentDidMount() {
    if (this.props.params.pageId) {
      this.goToSlide(this.props.params.pageId);
    }
  },

  goToSlide(slideId) {
    this.context.router.push('/docs/' + slideId);

    var slideIndex = _.findIndex(this.slides(), slide => {
      return (slide.key === slideId);
    });

    this.setState({
      currentSlide: slideIndex
    });
  },

  onPrevious() {
    this.refs.componentSlider.previous();
  },

  slides() {
    return ([
      <Page0_Overview         key="overview"  goToSlide={this.goToSlide}/>,
      <Page1_DownloadKubeCTL  key="download"  goToSlide={this.goToSlide}/>,
      <Page2_ConfigureKubeCTL key="configure" goToSlide={this.goToSlide}/>,
      <Page3_SimpleExample    key="example"   goToSlide={this.goToSlide}/>,
      <Page4_Inspecting    key="inspecting"   goToSlide={this.goToSlide}/>
    ]);
  },

  render: function() {
    return <ComponentSlider ref="componentSlider" currentSlide={this.state.currentSlide} slides={this.slides()}/>;
  }
});