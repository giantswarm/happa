

import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import ClusterDetail from './detail/';
import NewCluster from './new/';
import PropTypes from 'prop-types';
import React from 'react';

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
          component={ClusterDetail}
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
