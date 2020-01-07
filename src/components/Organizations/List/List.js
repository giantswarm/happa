import {
  organizationCreate,
  organizationDelete,
} from 'actions/organizationActions';
import Button from 'react-bootstrap/lib/Button';
import DocumentTitle from 'components/shared/DocumentTitle';
import EmptyStateDisplay from 'UI/EmptyStateDisplay';
import OrganizationList from 'UI/OrganizationList/OrganizationList';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

class OrganizationListWrapper extends React.Component {
  getOrganizationURL = id => {
    return `/organizations/${id}`;
  };

  deleteOrganization = e => {
    const orgID = e.currentTarget.getAttribute('data-orgID');
    this.props.dispatch(organizationDelete(orgID));
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
              <div>
                <p>No organizations, create one using the button below:</p>
              </div>
            }
          >
            <OrganizationList
              provider={this.props.provider}
              clusters={this.props.clusters}
              getViewURL={this.getOrganizationURL}
              deleteOrganization={this.deleteOrganization}
              organizations={this.props.organizations}
            />
          </EmptyStateDisplay>
          <Button bsStyle='default' onClick={this.createOrganization}>
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
  provider: PropTypes.string,
};

function mapStateToProps(state) {
  const sortedOrganizations = Object.values(
    state.entities.organizations.items
  ).sort((a, b) => a.id.localeCompare(b.id));

  return {
    organizations: sortedOrganizations,
    clusters: state.entities.clusters.items,
    provider: state.app.info.general.provider,
  };
}

export default connect(mapStateToProps)(OrganizationListWrapper);
