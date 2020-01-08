import * as OrganizationActions from 'actions/organizationActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Providers } from 'shared/constants';
import { relativeDate } from 'lib/helpers.js';
import BootstrapTable from 'react-bootstrap-table-next';
import Button from 'react-bootstrap/lib/Button';
import ClusterIDLabel from 'UI/ClusterIDLabel';
import cmp from 'semver-compare';
import Credentials from './Credentials';
import DocumentTitle from 'components/shared/DocumentTitle';
import PropTypes from 'prop-types';
import React from 'react';

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

class OrganizationDetail extends React.Component {
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
    if (provider === Providers.AWS || provider === Providers.AZURE) {
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
        dataField: 'create_date',
        text: 'Created',
        sort: true,
        formatter: relativeDate,
      },
      {
        dataField: 'delete_date',
        text: 'Deleted',
        sort: true,
        formatter: relativeDate,
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
    let credentialsSection = null;

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
        <DocumentTitle
          title={`Organization Details | ${this.props.organization.id}`}
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
                    bordered={false}
                    columns={this.getClusterTableColumnsConfig()}
                    data={this.props.clusters}
                    defaultSortDirection='asc'
                    defaultSorted={clusterTableDefaultSorting}
                    keyField='id'
                  />
                )}
                <Link
                  to={`/organizations/${this.props.organization.id}/clusters/new/`}
                >
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
                    bordered={false}
                    columns={this.getMemberTableColumnsConfig()}
                    data={this.props.membersForTable}
                    defaultSortDirection='asc'
                    defaultSorted={memberTableDefaultSorting}
                    keyField='email'
                  />
                )}
                <Button bsStyle='default' onClick={this.addMember}>
                  <i className='fa fa-add-circle' /> Add Member
                </Button>
              </div>
            </div>

            {credentialsSection}
          </div>
        </DocumentTitle>
      );
    }

    // 404 or fetching
    return <h1>404 or fetching</h1>;
  }
}

OrganizationDetail.propTypes = {
  actions: PropTypes.object,
  clusters: PropTypes.array,
  organization: PropTypes.object,
  dispatch: PropTypes.func,
  match: PropTypes.object,
  app: PropTypes.object,
  membersForTable: PropTypes.array,
};

// eslint-disable-next-line react/no-multi-comp
function clusterIDCellFormatter(cell) {
  return <ClusterIDLabel clusterID={cell} copyEnabled />;
}

// eslint-disable-next-line react/no-multi-comp
function clusterActionsCellFormatter(_cell, row) {
  if (row.delete_date) {
    return <span />;
  }

  return (
    <Link
      // eslint-disable-next-line react/no-this-in-sfc
      to={`/organizations/${this.props.organization.id}/clusters/${row.id}`}
    >
      <Button bsStyle='default' type='button'>
        Details
      </Button>
    </Link>
  );
}

// eslint-disable-next-line react/no-multi-comp
function memberActionsCellFormatter(_cell, row) {
  return (
    // eslint-disable-next-line react/no-this-in-sfc
    <Button onClick={this.removeMember.bind(this, row.email)} type='button'>
      Remove
    </Button>
  );
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(OrganizationActions, dispatch),
  };
}

export default connect(undefined, mapDispatchToProps)(OrganizationDetail);
