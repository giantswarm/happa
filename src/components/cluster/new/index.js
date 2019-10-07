import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import CreateCluster from './view';
import PropTypes from 'prop-types';
import React from 'react';

class Cluster extends React.Component {
  render() {
    return (
      <Switch>
        <Route
          component={CreateCluster}
          exact
          path={`${this.props.match.path}`}
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
