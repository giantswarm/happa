import DocumentTitle from 'components/shared/DocumentTitle';
import { OrganizationsRoutes } from 'model/constants/routes';
import { organizationCreate } from 'model/stores/organization/actions';
import { supportsMultiAccount } from 'model/stores/organization/utils';
import React from 'react';
import { connect } from 'react-redux';
import Button from 'UI/Controls/Button';
import OrganizationList from 'UI/Display/OrganizationList/OrganizationList';
import EmptyStateDisplay from 'UI/Util/EmptyStateDisplay';
import RoutePath from 'utils/routePath';

class OrganizationListWrapper extends React.Component {
  // eslint-disable-next-line class-methods-use-this
  getOrganizationURL = (id) => {
    const organizationDetailPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Detail,
      { orgId: id }
    );

    return organizationDetailPath;
  };

  createOrganization = () => {
    this.props.dispatch(organizationCreate());
  };

  render() {
    return (
      <DocumentTitle title='Organizations'>
        <>
          <h1>Organizations</h1>
          <br />
          <EmptyStateDisplay
            displayEmptyState={this.props.organizations.length === 0}
            emptyState={
              <p>No organizations, create one using the button below:</p>
            }
          >
            <OrganizationList
              supportsMultiAccount={this.props.supportsMultiAccount}
              clusters={this.props.clusters}
              getViewURL={this.getOrganizationURL}
              organizations={this.props.organizations}
            />
          </EmptyStateDisplay>
          <Button
            onClick={this.createOrganization}
            icon={<i className='fa fa-add-circle' />}
          >
            Create new organization
          </Button>
        </>
      </DocumentTitle>
    );
  }
}

function mapStateToProps(state) {
  const sortedOrganizations = Object.values(
    state.entities.organizations.items
  ).sort((a, b) => a.id.localeCompare(b.id));

  const providerSupportsMultiAccount = supportsMultiAccount(
    window.config.info.general.provider
  );

  return {
    organizations: sortedOrganizations,
    clusters: state.entities.clusters.items,
    supportsMultiAccount: providerSupportsMultiAccount,
  };
}

export default connect(mapStateToProps)(OrganizationListWrapper);
