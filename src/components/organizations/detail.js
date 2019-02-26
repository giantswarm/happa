'use strict';

import * as OrganizationActions from '../../actions/organizationActions';
import Button from 'react-bootstrap/lib/Button';
import { relativeDate } from '../../lib/helpers.js';
import DocumentTitle from 'react-document-title';
import ClusterIDLabel from '../shared/cluster_id_label';
import Credentials from './credentials.js';
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'underscore';
import { Breadcrumb } from 'react-breadcrumbs';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import BootstrapTable from 'react-bootstrap-table-next';
import cmp from 'semver-compare';

class OrganizationDetail extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.actions.organizationsLoad();
  }

  addMember = () => {
    this.props.actions.organizationAddMember(this.props.organization.id);
  };

  removeMember = email => {
    this.props.actions.organizationRemoveMember(
      this.props.organization.id,
      email
    );
  };

  // determine whether the component should deal with BYOC credentials
  // (not relevant on KVM)
  canCredentials = provider => {
    if (provider === 'aws' || provider === 'azure') {
      return true;
    }
    return false;
  };

  // Provides the configuraiton for the clusters table
  getClusterTableColumnsConfig = () => {
    return [
      {
        dataField: 'id',
        text: 'Cluster ID',
        sort: true,
        formatter: clusterIDCellFormatter,
      },
      {
        dataField: 'name',
        text: 'Name',
        sort: true,
      },
      {
        dataField: 'create_date',
        text: 'Created',
        sort: true,
        formatter: relativeDate,
      },
      {
        dataField: 'release_version',
        text: 'Release',
        sort: true,
        sortFunc: (a, b, order) => {
          if (order === 'desc') {
            return cmp(a, b) * -1;
          }
          return cmp(a, b);
        },
      },
      {
        dataField: 'actionsDummy',
        isDummyField: true,
        text: '',
        align: 'right',
        formatter: clusterActionsCellFormatter.bind(this),
      },
    ];
  };
  // Provides the configuraiton for the org members table
  getMemberTableColumnsConfig = () => {
    return [
      {
        dataField: 'email',
        text: 'Email',
        sort: true,
      },
      {
        dataField: 'emailDomain',
        text: 'Email Domain',
        sort: true,
      },
      {
        dataField: 'actionsDummy',
        isDummyField: true,
        text: '',
        align: 'right',
        formatter: memberActionsCellFormatter.bind(this),
      },
    ];
  };

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
        <Breadcrumb
          data={{
            title: this.props.organization.id.toUpperCase(),
            pathname: '/organizations/' + this.props.organization.id,
          }}
        >
          <Breadcrumb
            data={{ title: 'ORGANIZATIONS', pathname: '/organizations/' }}
          >
            <DocumentTitle
              title={
                'Organization Details | ' +
                this.props.organization.id +
                ' | Giant Swarm'
              }
            >
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
                    {this.props.clusters.length === 0 ? (
                      <p>This organization doesn&apos;t have any clusters.</p>
                    ) : (
                      <BootstrapTable
                        keyField='id'
                        data={this.props.clusters}
                        columns={this.getClusterTableColumnsConfig()}
                        bordered={false}
                        defaultSorted={clusterTableDefaultSorting}
                        defaultSortDirection='asc'
                      />
                    )}
                    <Link to='/new-cluster'>
                      <Button bsStyle='default'>
                        <i className='fa fa-add-circle' /> Create Cluster
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className='row section'>
                  <div className='col-3'>
                    <h3 className='table-label'>Members</h3>
                  </div>
                  <div className='col-9'>
                    {this.props.organization.members.length === 0 ? (
                      <p>This organization has no members</p>
                    ) : (
                      <BootstrapTable
                        keyField='email'
                        data={this.props.membersForTable}
                        columns={this.getMemberTableColumnsConfig()}
                        bordered={false}
                        defaultSorted={memberTableDefaultSorting}
                        defaultSortDirection='asc'
                      />
                    )}
                    <Button onClick={this.addMember} bsStyle='default'>
                      <i className='fa fa-add-circle' /> Add Member
                    </Button>
                  </div>
                </div>

                {credentialsSection}
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
  router: PropTypes.object,
};

OrganizationDetail.propTypes = {
  actions: PropTypes.object,
  clusters: PropTypes.array,
  organization: PropTypes.object,
  dispatch: PropTypes.func,
  match: PropTypes.object,
  app: PropTypes.object,
  membersForTable: PropTypes.array,
};

const clusterTableDefaultSorting = [
  {
    dataField: 'id',
    order: 'asc',
  },
];

const memberTableDefaultSorting = [
  {
    dataField: 'email',
    order: 'asc',
  },
];

function clusterIDCellFormatter(cell) {
  return <ClusterIDLabel clusterID={cell} copyEnabled />;
}

function clusterActionsCellFormatter(cell, row) {
  return (
    <Link
      to={
        '/organizations/' + this.props.organization.id + '/clusters/' + row.id
      }
    >
      <Button bsStyle='default' type='button'>
        Details
      </Button>
    </Link>
  );
}

function memberActionsCellFormatter(cell, row) {
  return (
    <Button type='button' onClick={this.removeMember.bind(this, row.email)}>
      Remove
    </Button>
  );
}

function mapStateToProps(state, ownProps) {
  var allClusters = state.entities.clusters.items;
  var clusters = [];

  clusters = _.filter(allClusters, cluster => {
    return cluster.owner === ownProps.match.params.orgId;
  });

  var membersForTable = state.entities.organizations.items[
    ownProps.match.params.orgId
  ].members.map(member => {
    return Object.assign({}, member, {
      emailDomain: member.email.split('@')[1],
    });
  });

  return {
    organization:
      state.entities.organizations.items[ownProps.match.params.orgId],
    membersForTable: membersForTable,
    app: state.app,
    clusters: clusters,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(OrganizationActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OrganizationDetail);
