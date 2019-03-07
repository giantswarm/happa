'use strict';

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ClusterDetailIndex from './detail/';
import NewCluster from './new/';
import { Route, Redirect, Switch } from 'react-router-dom';

class Cluster extends React.Component {
  render() {
    return (
      <Switch>
        <Route
          exact
          path={`${this.props.match.path}/new`}
          component={NewCluster}
        />
        <Route
          path={`${this.props.match.path}/:clusterId`}
          component={ClusterDetailIndex}
        />
        <Redirect
          path={`${this.props.match.path}/*`}
          to={`${this.props.match.url}`}
        />
      </Switch>
    );
  }
}

Cluster.propTypes = {
  dispatch: PropTypes.func,
  match: PropTypes.object,
};

export default connect()(Cluster);
