import DocumentTitle from 'components/shared/DocumentTitle';
import RoutePath from 'lib/routePath';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { OrganizationsRoutes } from 'shared/constants/routes';
import { organizationCreate } from 'stores/organization/actions';
import { supportsMultiAccount } from 'stores/organization/utils';
import Button from 'UI/Button';
import EmptyStateDisplay from 'UI/EmptyStateDisplay';
import OrganizationList from 'UI/OrganizationList/OrganizationList';

class OrganizationListWrapper extends React.Component {
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
          <Button bsStyle='outline' onClick={this.createOrganization}>
            <i className='fa fa-add-circle' /> Create New Organization
          </Button>
        </>
      </DocumentTitle>
    );
  }
}

OrganizationListWrapper.propTypes = {
  dispatch: PropTypes.func,
  organizations: PropTypes.array,
  clusters: PropTypes.object,
  supportsMultiAccount: PropTypes.bool,
};

function mapStateToProps(state) {
  const sortedOrganizations = Object.values(
    state.entities.organizations.items
  ).sort((a, b) => a.id.localeCompare(b.id));

  const providerSupportsMultiAccount = supportsMultiAccount(
    state.main.info.general.provider
  );

  return {
    organizations: sortedOrganizations,
    clusters: state.entities.clusters.items,
    supportsMultiAccount: providerSupportsMultiAccount,
  };
}

export default connect(mapStateToProps)(OrganizationListWrapper);
