import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { organizationSelect } from 'actions/organizationActions';
import { Redirect, Route, Switch } from 'react-router-dom';
import _ from 'underscore';
import Cluster from 'Cluster/Cluster';
import DetailView from './View';
import PropTypes from 'prop-types';
import React from 'react';

class DetailIndex extends React.Component {
  componentDidMount() {
    const { id: orgID } = this.props.organization;
    this.props.dispatch(organizationSelect(orgID));
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

  clusters = _.filter(allClusters, cluster => {
    return cluster.owner === ownProps.match.params.orgId;
  });

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
    app: state.app,
    clusters: clusters,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailIndex);
