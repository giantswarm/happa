'use strict';

import React from 'react';
import DocumentTitle from 'react-document-title';
import {Route, Switch, Redirect}  from 'react-router-dom';

import Page0_Overview from './0_overview.js';
import Page1_DownloadKubeCTL from './1_download_kubectl.js';
import Page2_ConfigureKubeCTL from './2_configure_kubectl.js';
import Page3_SimpleExample from './3_simple_example.js';
import Page4_NextSteps from './4_next_steps.js';

class GettingStarted extends React.Component {

  render() {
    return (
      <DocumentTitle title={'Getting Started | Giant Swarm'}>
        <div>
          <Switch>
            <Route exact path="/getting-started/" component={Page0_Overview} />
            <Route exact path="/getting-started/download/" component={Page1_DownloadKubeCTL} />
            <Route exact path="/getting-started/configure/" component={Page2_ConfigureKubeCTL} />
            <Route exact path="/getting-started/example/" component={Page3_SimpleExample} />
            <Route exact path="/getting-started/next-steps/" component={Page4_NextSteps} />
            <Redirect path="*" to="/getting-started/" />
          </Switch>
        </div>
      </DocumentTitle>
    );
  }
}

export default GettingStarted;
