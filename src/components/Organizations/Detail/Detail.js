import * as types from 'actions/actionTypes';
import Cluster from 'Cluster/Cluster';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';

import DetailView from './View';

class DetailIndex extends React.Component {
  componentDidMount() {
    // Reset loading flag to true just in case we are accessing cluster details of a
    // cluster owned by a non selected organization. In those cases we want nothing
    // to be rendered until cluster details are fetched
    // If we don't set this here, and do this in batchedActions, there's a fraction
    // of a second during which the flag is false, and therefore errors are triggered
    this.props.dispatch({
      type: types.CLUSTER_LOAD_DETAILS_REQUEST,
    });
  }

  componentWillUnmount() {
    // Set loading flag to false.
    this.props.dispatch({
      type: types.CLUSTER_LOAD_DETAILS_FINISHED,
    });
  }

  render() {
    return (
      <Breadcrumb
        data={{
          title: this.props.organization.id.toUpperCase(),
          pathname: this.props.match.url,
        }}
      >
        <Switch>
          <Route
            exact
            path={`${this.props.match.path}`}
            render={() => <DetailView {...this.props} />}
          />
          <Route
            component={Cluster}
            path={`${this.props.match.path}/clusters`}
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

DetailIndex.propTypes = {
  dispatch: PropTypes.func,
  match: PropTypes.object,
  organization: PropTypes.object,
  clusters: PropTypes.array,
  app: PropTypes.object,
  membersForTable: PropTypes.array,
};

function mapStateToProps(state, ownProps) {
  const allClusters = state.entities.clusters.items;
  let clusters = [];

  clusters = Object.values(allClusters).filter(
    cluster => cluster.owner === ownProps.match.params.orgId
  );

  const membersForTable = state.entities.organizations.items[
    ownProps.match.params.orgId
  ].members.map(member => {
    return Object.assign({}, member, {
      emailDomain: member.email.split('@')[1],
    });
  });

  return {
    organization:
      state.entities.organizations.items[ownProps.match.params.orgId],
    membersForTable: membersForTable,
    app: state.main,
    clusters: clusters,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailIndex);
