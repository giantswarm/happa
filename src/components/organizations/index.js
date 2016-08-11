"use strict";

import React from 'react';
import FlashMessage from '../flash_messages/flash_message';
import {loadOrganizations} from '../../actions/organizationActions';
import {connect} from 'react-redux';
import OrganizationRow from './organizationRow';

class Organizations extends React.Component {
  componentDidMount() {
    this.props.dispatch(loadOrganizations());
  }

  viewOrganization(orgId) {
    this.context.router.push('/organizations/' + orgId);
  }

  deleteOrganization(orgName) {
    console.log("delete?", orgName)
  }

  selectOrganization(orgName) {
    console.log("select", orgName)
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
              this.props.organizations.map(
                (orgName) => {
                  return <OrganizationRow organizationName={orgName}
                                        key={orgName}
                                        onClick={this.viewOrganization.bind(this, orgName)}
                                        onDelete={this.deleteOrganization.bind(this, orgName)}
                                        onSelect={this.selectOrganization.bind(this, orgName)}
                         />
                }
              )
            }
          </tbody>
        </table>
        <button className="small">Create New Organization</button>
      </div>
    );
  }
}

Organizations.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state, ownProps) {
  return {
    organizations: state.organizations
  };
}

export default connect(mapStateToProps)(Organizations);