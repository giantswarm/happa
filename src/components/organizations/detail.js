'use strict';

import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import {Link}  from 'react-router-dom';
import { connect } from 'react-redux';
import * as OrganizationActions from '../../actions/organizationActions';
import { bindActionCreators } from 'redux';
import { relativeDate } from '../../lib/helpers.js';
import DocumentTitle from 'react-document-title';
import _ from 'underscore';
import ClusterIDLabel from '../shared/cluster_id_label';
import PropTypes from 'prop-types';
import { push } from 'connected-react-router';
import { Breadcrumb } from 'react-breadcrumbs';
import BootstrapTable from 'react-bootstrap-table-next';

class OrganizationDetail extends React.Component {
  constructor(props) {
    super(props);
  }

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

  // Provides the configuraiton for the clusters table
  getClusterTableColumnsConfig = () => {
    return [{
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
      formatter: relativeDate
    }, {
      dataField: 'actionsDummy',
      isDummyField: true,
      text: '',
      align: 'right',
      formatter: clusterActionsCellFormatter.bind(this)
    }];
  }
  
  // Provides the configuraiton for the org members table
  getMemberTableColumnsConfig = () => {
    return [{
      dataField: 'email',
      text: 'Email',
      sort: true
    }, {
      dataField: 'email',
      text: 'Email Domain',
      sort: true,
      formatter: function(cell){
        return cell.split('@')[1];
      },
      sortFunc: (a, b, order) => {
        if (order === 'asc') {
          return b.split('@')[1] > a.split('@')[1];
        }
        return b.split('@')[1] < a.split('@')[1];
      }
    }, {
      dataField: 'actionsDummy',
      isDummyField: true,
      text: '',
      align: 'right',
      formatter: memberActionsCellFormatter.bind(this)
    }];
  }



  render() {
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
                        columns={ this.getClusterTableColumnsConfig() } bordered={ false }
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
                      <p>This organization has no members, which shouldn&apos;t really be possible</p>
                      :
                      <BootstrapTable keyField='email' data={ this.props.organization.members }
                        columns={ this.getMemberTableColumnsConfig() } bordered={ false }
                        defaultSorted={ memberTableDefaultSorting }
                        defaultSortDirection='asc' />
                    }
                    <Button onClick={this.addMember} bsStyle='default'>Add Member</Button>
                  </div>
                </div>
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
  organization: PropTypes.object,
  dispatch: PropTypes.func,
  match: PropTypes.object
};

const clusterTableDefaultSorting = [{
  dataField: 'id',
  order: 'asc'
}];

const memberTableDefaultSorting = [{
  dataField: 'email',
  order: 'asc'
}];

function clusterIDCellFormatter(cell) {
  return (
    <ClusterIDLabel clusterID={cell} copyEnabled/>
  );
}

function clusterActionsCellFormatter(cell, row) {
  return (
    <Button bsStyle='default' type='button' onClick={this.openClusterDetails.bind(this, row.id)}>Details</Button>
  );
}

function memberActionsCellFormatter(cell, row) {
  return (
    <Button type='button' onClick={this.removeMember.bind(this, row.email)}>Remove</Button>
  );
}

function mapStateToProps(state, ownProps) {
  var allClusters = state.entities.clusters.items;
  var clusters = [];

  clusters = _.filter(allClusters, (cluster) => {
    return cluster.owner === ownProps.match.params.orgId;
  });

  return {
    organization: state.entities.organizations.items[ownProps.match.params.orgId],
    clusters: clusters
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(OrganizationActions, dispatch),
    dispatch: dispatch
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(OrganizationDetail);
