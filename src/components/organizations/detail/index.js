import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { organizationSelect } from 'actions/organizationActions';
import { Redirect, Route, Switch } from 'react-router-dom';
import _ from 'underscore';
import ClusterDetailIndex from '../../cluster/';
import DetailView from './view';
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
            component={() => <DetailView {...this.props} />}
          />
          <Route
            component={ClusterDetailIndex}
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
  var allClusters = state.entities.clusters.items;
  var clusters = [];

  clusters = _.filter(allClusters, cluster => {
    return cluster.owner === ownProps.match.params.orgId;
  });

  var membersForTable = state.entities.organizations.items[
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailIndex);
