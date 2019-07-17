import { connect } from 'react-redux';
import {
  organizationCreate,
  organizationDelete,
  organizationSelect,
} from '../../../actions/organizationActions';
import { push } from 'connected-react-router';
import Button from 'react-bootstrap/lib/Button';
import DocumentTitle from 'react-document-title';
import EmptyStateDisplay from '../../UI/empty_state_display';
import OrganizationList from '../../UI/organization_list';
import PropTypes from 'prop-types';
import React from 'react';

class List extends React.Component {
  viewOrganization = e => {
    let orgID = e.currentTarget.getAttribute('data-orgID');
    this.props.dispatch(organizationSelect(orgID));
    this.props.dispatch(push('/organizations/' + orgID));
  };

  deleteOrganization = e => {
    let orgID = e.currentTarget.getAttribute('data-orgID');
    this.props.dispatch(organizationDelete(orgID));
  };

  createOrganization = () => {
    this.props.dispatch(organizationCreate());
  };

  render() {
    return (
      <DocumentTitle title='Organizations | Giant Swarm'>
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
              clusters={this.props.clusters}
              deleteOrganization={this.deleteOrganization}
              organizations={this.props.organizations}
              viewOrganization={this.viewOrganization}
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

List.propTypes = {
  dispatch: PropTypes.func,
  organizations: PropTypes.array,
  clusters: PropTypes.object,
};

function mapStateToProps(state) {
  let sortedOrganizations = Object.values(
    state.entities.organizations.items
  ).sort((a, b) => a.id.localeCompare(b.id));

  return {
    organizations: sortedOrganizations,
    clusters: state.entities.clusters.items,
  };
}

export default connect(mapStateToProps)(List);
