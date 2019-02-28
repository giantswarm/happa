'use strict';

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ClusterDetailIndex from './detail/';
import { Route, Redirect, Switch } from 'react-router-dom';

class Clusters extends React.Component {
  render() {
    return (
      <Switch>
        <Route
          exact
          path={`${this.props.match.path}`}
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

Clusters.propTypes = {
  dispatch: PropTypes.func,
  match: PropTypes.object,
};

export default connect()(Clusters);
