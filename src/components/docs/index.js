'use strict';

import React from 'react';
import ComponentSlider from '../component_slider';
import _ from 'underscore';

import Page0_Overview from './0_overview.js';
import Page1_DownloadKubeCTL from './1_download_kubectl.js';
import Page2_ConfigureKubeCTL from './2_configure_kubectl.js';
import Page3_SimpleExample from './3_simple_example.js';
import Page4_Inspecting from './4_inspecting.js';

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
    this.goToSlide(this.props.params.pageId);
  },

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.params.pageId && nextProps.params.pageId !== this.props.params.pageId) {
      this.goToSlide(nextProps.params.pageId);
    } else if (! nextProps.params.pageId) {
      this.goToSlide('overview');
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
      <Page0_Overview         key='overview'  goToSlide={this.goToSlide}/>,
      <Page1_DownloadKubeCTL  key='download'  goToSlide={this.goToSlide}/>,
      <Page2_ConfigureKubeCTL key='configure' goToSlide={this.goToSlide}/>,
      <Page3_SimpleExample    key='example'   goToSlide={this.goToSlide}/>,
      <Page4_Inspecting    key='inspecting'   goToSlide={this.goToSlide}/>
    ]);
  },

  render: function() {
    return <ComponentSlider ref='componentSlider' currentSlide={this.state.currentSlide} slides={this.slides()}/>;
  }
});