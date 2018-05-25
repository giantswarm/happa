'use strict';

import React from 'react';
import { organizationsLoad, organizationDelete, organizationCreate, organizationSelect } from '../../actions/organizationActions';
import { connect } from 'react-redux';
import OrganizationRow from './organizationRow';
import Button from 'react-bootstrap/lib/Button';
import _ from 'underscore';
import DocumentTitle from 'react-document-title';
import {clustersForOrg} from '../../lib/helpers';
import PropTypes from 'prop-types';

class Organizations extends React.Component {
  componentDidMount() {
    this.props.dispatch(organizationsLoad());
  }

  viewOrganization(orgId) {
    this.selectOrganization(orgId);
    this.context.router.push('/organizations/' + orgId);
  }

  deleteOrganization(orgId) {
    this.props.dispatch(organizationDelete(orgId));
  }

  createOrganization() {
    this.props.dispatch(organizationCreate());
  }

  selectOrganization(orgId) {
    this.props.dispatch(organizationSelect(orgId));
  }

  render() {
    return (
      <DocumentTitle title='Organizations | Giant Swarm'>
        <div>
          <h1>Organizations</h1>
          <br/>
          {(() => {
            if (this.props.organizations.isFetching && Object.keys(this.props.organizations.items).length === 0) {
              return <img className='loader' src='/images/loader_oval_light.svg' width='20px' height='20px' />;
            } else if (Object.keys(this.props.organizations.items).length === 0) {
              return <div>
                <p>No organizations, create one using the button below:</p>
                <Button bsStyle='default' onClick={this.createOrganization.bind(this)} >Create New Organization</Button>
                </div>;
            } else {
              return <div>
                <table className={this.props.organizations.isFetching ? 'fetching' : ''}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th className='centered'>Clusters</th>
                      <th className='centered'>Members</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      _.map(_.sortBy(this.props.organizations.items, 'id'), (organization) => {
                          return <OrganizationRow organization={organization}
                                                clusters={clustersForOrg(organization.id, this.props.clusters)}
                                                key={organization.id}
                                                onClick={this.viewOrganization.bind(this, organization.id)}
                                                onDelete={this.deleteOrganization.bind(this, organization.id)}
                                 />;
                        }
                      )
                    }
                  </tbody>
                </table>
                <Button bsStyle='default' onClick={this.createOrganization.bind(this)} >Create New Organization</Button>
              </div>;
            }
          })()}

        </div>
      </DocumentTitle>
    );
  }
}

Organizations.contextTypes = {
  router: PropTypes.object
};

Organizations.propTypes = {
  dispatch: PropTypes.func,
  organizations: PropTypes.object,
  clusters: PropTypes.object
};

function mapStateToProps(state) {
  return {
    organizations: state.entities.organizations,
    clusters: state.entities.clusters.items
  };
}

export default connect(mapStateToProps)(Organizations);
