'use strict';

import React from 'react';
import ComponentSlider from '../component_slider';
import _ from 'underscore';
import DocumentTitle from 'react-document-title';

import Page0_Overview from './0_overview.js';
import Page1_DownloadKubeCTL from './1_download_kubectl.js';
import Page2_ConfigureKubeCTL from './2_configure_kubectl.js';
import Page3_SimpleExample from './3_simple_example.js';
import Page4_NextSteps from './4_next_steps.js';



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

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.params.pageId && nextProps.params.pageId !== this.props.params.pageId) {
      this.goToSlide(nextProps.params.pageId);
    } else if (! nextProps.params.pageId) {
      this.goToSlide('overview');
    }
  },

  goToSlide(slideId) {
    if (window.location.pathname !== '/getting-started/' + slideId) {
      this.context.router.push('/getting-started/' + slideId);
    }

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

  classes() {
    if (this.state.currentSlide === 0) {
      return 'col-12';
    } else {
      return 'col-10';
    }
  },

  slides() {
    return ([
      <Page0_Overview         key='overview'  goToSlide={this.goToSlide}/>,
      <Page1_DownloadKubeCTL  key='download'  goToSlide={this.goToSlide}/>,
      <Page2_ConfigureKubeCTL key='configure' goToSlide={this.goToSlide}/>,
      <Page3_SimpleExample    key='example'   goToSlide={this.goToSlide}/>,
      <Page4_NextSteps        key='next-steps'   goToSlide={this.goToSlide}/>
    ]);
  },

  render: function() {
    return (
      <DocumentTitle title={'Getting Started | Giant Swarm'}>
        <div className={'centered ' + this.classes()}>
          <ComponentSlider ref='componentSlider' currentSlide={this.state.currentSlide} slides={this.slides()}/>
        </div>
      </DocumentTitle>
    );
  }
});