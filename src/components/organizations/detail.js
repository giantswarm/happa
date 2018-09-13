'use strict';

import * as OrganizationActions from '../../actions/organizationActions';
import Button from 'react-bootstrap/lib/Button';
import ClusterIDLabel from '../shared/cluster_id_label';
import Credentials from './credentials.js';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'underscore';
import { Breadcrumb } from 'react-breadcrumbs';
import { Link }  from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { formatDate } from '../../lib/helpers.js';
import { push } from 'connected-react-router';
import BootstrapTable from 'react-bootstrap-table-next';

class OrganizationDetail extends React.Component {
  componentDidMount() {
    this.props.actions.organizationsLoad();
  }

  addMember = () => {
    this.props.actions.organizationAddMember(this.props.organization.id);
  }

  removeMember = (email) => {
    this.props.actions.organizationRemoveMember(this.props.organization.id, email);
  }

  openClusterDetails = (cluster) => {
    this.props.dispatch(push('/organizations/' + this.props.organization.id + '/clusters/' + cluster));
  }

  // determine whether the component should deal with BYOC credentials
  // (not relevant on KVM)
  canCredentials = (provider) => {
    if (provider === 'aws' || provider === 'azure') {
      return true;
    }
    return false;
  }

  render() {
    var credentialsSection;
    if (this.canCredentials(this.props.app.info.general.provider)) {
      credentialsSection = (
        <div className='row section' id='credentials-section'>
          <div className='col-3'>
            <h3 className='table-label'>Provider credentials</h3>
          </div>
          <div className='col-9'>
            <Credentials organizationName={this.props.match.params.orgId} />
          </div>
        </div>
      );
    }

    if (this.props.organization) {
      return (
        <Breadcrumb data={{title: this.props.organization.id.toUpperCase(), pathname: '/organizations/' + this.props.organization.id}}>
          <Breadcrumb data={{title: 'ORGANIZATIONS', pathname: '/organizations/'}}>
            <DocumentTitle title={'Organization Details | ' + this.props.organization.id +  ' | Giant Swarm'}>
              <div>
                <div className='row'>
                  <div className='col-12'>
                    <h1>Organization: {this.props.match.params.orgId}</h1>
                  </div>
                </div>

                <div className='row section'>
                  <div className='col-3'>
                    <h3 className='table-label'>Clusters</h3>
                  </div>
                  <div className='col-9'>
                    {
                      this.props.clusters.length === 0 ?
                      <p>No clusters here yet, <Link to='/new-cluster'>create your first!</Link></p>
                      :
                      <BootstrapTable keyField='id' data={ this.props.clusters }
                        columns={ this.props.columns } bordered={ false }
                        defaultSorted={ clusterTableDefaultSorting }
                        defaultSortDirection='asc' />
                    }

                  </div>
                </div>

                <div className='row section'>
                  <div className='col-3'>
                    <h3 className='table-label'>Members</h3>
                  </div>
                  <div className='col-9'>
                    {
                      this.props.organization.members.length === 0 ?
                      <p>This organization has no members</p>
                      :
                      <table>
                        <thead>
                          <tr>
                            <th>Email</th>
                            <th>Email Domain</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            _.sortBy(this.props.organization.members, 'email').map((member) => {
                              return (
                                <tr key={member.email}>
                                  <td>{ member.email }</td>
                                  <td>{ member.email.split('@')[1] }</td>
                                  <td>
                                    <div className='contextual'>
                                      <i className='fa fa-times clickable'
                                         title='Remove this member'
                                         onClick={this.removeMember.bind(this, member.email)} />
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          }
                        </tbody>
                      </table>
                    }
                    <Button onClick={this.addMember} bsStyle='default'>Add Member</Button>
                  </div>
                </div>

                { credentialsSection }

              </div>
            </DocumentTitle>
          </Breadcrumb>
        </Breadcrumb>
      );
    } else {
      // 404 or fetching
      return <h1>404 or fetching</h1>;
    }
  }
}

OrganizationDetail.contextTypes = {
  router: PropTypes.object
};

OrganizationDetail.propTypes = {
  actions: PropTypes.object,
  clusters: PropTypes.array,
  columns: PropTypes.array,
  organization: PropTypes.object,
  dispatch: PropTypes.func,
  match: PropTypes.object,
  app: PropTypes.object,
};

const clusterTableDefaultSorting = [{
  dataField: 'id',
  order: 'asc'
}];

function clusterIDCellFormatter(cell) {
  return (
    <ClusterIDLabel clusterID={cell} copyEnabled/>
  );
}

function mapStateToProps(state, ownProps) {
  var allClusters = state.entities.clusters.items;
  var clusters = [];
  var columns = [{
    dataField: 'id',
    text: 'Cluster ID',
    sort: true,
    formatter: clusterIDCellFormatter
  }, {
    dataField: 'name',
    text: 'Name',
    sort: true
  }, {
    dataField: 'create_date',
    text: 'Created',
    sort: true,
    formatter: function(cell) {
      return formatDate(cell);
    }
  }];

  clusters = _.filter(allClusters, (cluster) => {
    return cluster.owner === ownProps.match.params.orgId;
  });

  return {
    organization: state.entities.organizations.items[ownProps.match.params.orgId],
    clusters: clusters,
    app: state.app,
    columns: columns
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(OrganizationActions, dispatch),
    dispatch: dispatch
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(OrganizationDetail);
