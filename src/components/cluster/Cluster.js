import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import ClusterDetail from './detail/ClusterDetail';
import NewCluster from './new/NewCluster';
import PropTypes from 'prop-types';
import React from 'react';

class Cluster extends React.Component {
  render() {
    return (
      <Switch>
        <Route
          component={NewCluster}
          exact
          path={`${this.props.match.path}/new`}
        />
        <Route
          component={ClusterDetail}
          path={`${this.props.match.path}/:clusterId`}
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
