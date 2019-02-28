'use strict';

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ClusterDetailView from './view';
import GettingStarted from '../../getting-started';
import { Route, Redirect, Switch } from 'react-router-dom';

class ClusterDetailIndex extends React.Component {
  render() {
    return (
      <Switch>
        <Route
          exact
          path={`${this.props.match.path}`}
          render={() => <ClusterDetailView {...this.props} />}
        />

        <Route
          path={`${this.props.match.path}/getting-started/`}
          render={() => <GettingStarted {...this.props} />}
        />

        <Redirect
          path={`${this.props.match.path}/*`}
          to={`${this.props.match.url}`}
        />
      </Switch>
    );
  }
}

ClusterDetailIndex.propTypes = {
  dispatch: PropTypes.func,
  match: PropTypes.object,
};

export default connect()(ClusterDetailIndex);
