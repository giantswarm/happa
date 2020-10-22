import Cluster from 'Cluster/Cluster';
import { push } from 'connected-react-router';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { OrganizationsRoutes } from 'shared/constants/routes';
import { selectOrganizationByID } from 'stores/organization/selectors';

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
    }
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
  const organizationParam = ownProps.match.params.orgId;
  const organizationID =
    selectOrganizationByID(organizationParam)(state)?.id ?? organizationParam;

  const clusters = Object.values(allClusters).filter(
    (cluster) => cluster.owner === organizationID
  );

  const organization = state.entities.organizations.items[organizationParam];
  const membersForTable = organization?.members.map((member) => {
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
