"use strict";

import React from 'react';
import FlashMessage from '../flash_messages/flash_message';
import {organizationsLoad, organizationDelete, organizationCreate} from '../../actions/organizationActions';
import {connect} from 'react-redux';
import OrganizationRow from './organizationRow';
import Button from 'react-bootstrap/lib/Button';
import _ from 'underscore';

class Organizations extends React.Component {
  componentDidMount() {
    this.props.dispatch(organizationsLoad());
  }

  viewOrganization(orgId) {
    this.context.router.push('/organizations/' + orgId);
  }

  deleteOrganization(orgId) {
    this.props.dispatch(organizationDelete(orgId));
  }

  createOrganization() {
    this.props.dispatch(organizationCreate());
  }

  selectOrganization(orgId) {
    console.log("select", orgId);
  }

  render() {
    return (
      <div>
        <FlashMessage class="info">
          Organizations help you to organize project teams and invoicing.
          Each organization can have clusters and will receive an invoice.
          Add users to your organization to give them access to clusters.
        </FlashMessage>

        <h1>Organizations</h1>
        <br/>
        {
          this.props.organizations.items.length === 0 ?
          <p>No organizations, create one using the button below:</p>
          :
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Clusters</th>
                <th>Members</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {
                _.map(this.props.organizations.items, (organization) => {
                    return <OrganizationRow organization={organization}
                                          key={organization.id}
                                          onClick={this.viewOrganization.bind(this, organization.id)}
                                          onDelete={this.deleteOrganization.bind(this, organization.id)}
                                          onSelect={this.selectOrganization.bind(this, organization.id)}
                           />;
                  }
                )
              }
            </tbody>
          </table>
        }
        <Button bsStyle="primary" onClick={this.createOrganization.bind(this)} >Create New Organization</Button>
      </div>
    );
  }
}

Organizations.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state, ownProps) {
  return {
    organizations: state.entities.organizations
  };
}

export default connect(mapStateToProps)(Organizations);