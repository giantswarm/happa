'use strict';

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ClusterDetailView from './detail/view';
import { Route, Switch } from 'react-router-dom';

class ClusterDetailIndex extends React.Component {
  render() {
    return (
      <Switch>
        <Route
          exact
          path={`${this.props.match.path}`}
          component={ClusterDetailView}
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
