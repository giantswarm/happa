import * as types from 'actions/actionTypes';
import Cluster from 'Cluster/Cluster';
import { push } from 'connected-react-router';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { OrganizationsRoutes } from 'shared/constants/routes';

import DetailView from './View';

class DetailIndex extends React.Component {
  componentDidMount() {
    if (!this.props.organization) {
      const { dispatch, match } = this.props;
      const { orgId } = match.params;

      new FlashMessage(
        `Organization <code>${orgId}</code> not found`,
        messageType.ERROR,
        messageTTL.FOREVER,
        'Please make sure the Organization ID is correct and that you have access to it.'
      );

      dispatch(push(OrganizationsRoutes.Home));

      return;
    }

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
    const { organization, match } = this.props;
    if (!organization) {
      return null;
    }

    return (
      <Breadcrumb
        data={{
          title: organization.id.toUpperCase(),
          pathname: match.url,
        }}
      >
        <Switch>
          <Route
            exact
            path={`${match.path}`}
            render={() => <DetailView {...this.props} />}
          />
          <Route component={Cluster} path={`${match.path}/clusters`} />
          <Redirect path={`${match.path}/*`} to={`${match.url}`} />
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

  const clusters = Object.values(allClusters).filter(
    cluster => cluster.owner === ownProps.match.params.orgId
  );

  const organization =
    state.entities.organizations.items[ownProps.match.params.orgId];
  const membersForTable = organization?.members.map(member => {
    return Object.assign({}, member, {
      emailDomain: member.email.split('@')[1],
    });
  });

  return {
    organization,
    membersForTable,
    app: state.main,
    clusters,
  };
}

export default connect(mapStateToProps)(DetailIndex);
