import Cluster from 'Cluster/Cluster';
import { push } from 'connected-react-router';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Redirect, Switch } from 'react-router-dom';
import Route from 'Route';
import { OrganizationsRoutes } from 'shared/constants/routes';
import { selectLoadingFlagByAction } from 'stores/loading/selectors';
import { ORGANIZATION_CREDENTIALS_LOAD_REQUEST } from 'stores/organization/constants';
import { selectOrganizationByID } from 'stores/organization/selectors';
import { supportsMultiAccount } from 'stores/organization/utils';

import DetailView from './View';

class DetailIndex extends React.Component {
  componentDidMount() {
    const { dispatch, match } = this.props;
    const { orgId } = match.params;

    if (!this.props.organization) {
      new FlashMessage(
        (
          <>
            Organization <code>{orgId}</code> not found
          </>
        ),
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

  const { provider } = window.config.info.general;
  const providerSupportsMultiAccount = supportsMultiAccount(provider);

  return {
    organization,
    membersForTable,
    clusters,
    credentials: state.entities.organizations.credentials.items,
    loadingCredentials: selectLoadingFlagByAction(
      state,
      ORGANIZATION_CREDENTIALS_LOAD_REQUEST
    ),
    showCredentialsForm: state.entities.organizations.credentials.showForm,
    provider,
    supportsMultiAccount: providerSupportsMultiAccount,
  };
}

export default connect(mapStateToProps)(DetailIndex);
