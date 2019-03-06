'use strict';

import { Breadcrumb } from 'react-breadcrumbs';
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ClusterDetailIndex from './detail/';
import NewCluster from './new/';
import { Route, Redirect, Switch } from 'react-router-dom';

class Cluster extends React.Component {
  render() {
    return (
      <Breadcrumb
        data={{
          title: this.props.match.params.clusterId,
          pathname: this.props.match.url,
        }}
      >
        <Switch>
          <Route
            exact
            path={`${this.props.match.path}/new`}
            render={() => <NewCluster {...this.props} />}
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
      </Breadcrumb>
    );
  }
}

Cluster.propTypes = {
  dispatch: PropTypes.func,
  match: PropTypes.object,
};

export default connect()(Cluster);
