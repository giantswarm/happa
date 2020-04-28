import styled from '@emotion/styled';
import * as OrganizationActions from 'actions/organizationActions';
import DocumentTitle from 'components/shared/DocumentTitle';
import UpgradeNotice from 'Home/UpgradeNotice';
import { relativeDate } from 'lib/helpers';
import RoutePath from 'lib/routePath';
import PropTypes from 'prop-types';
import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import Button from 'react-bootstrap/lib/Button';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import cmp from 'semver-compare';
import { Providers } from 'shared/constants';
import { OrganizationsRoutes } from 'shared/constants/routes';
import { Ellipsis } from 'styles';
import ClusterIDLabel from 'UI/ClusterIDLabel';

import Credentials from './Credentials';

const MembersTable = styled.div`
  .member-email {
    ${Ellipsis}
  }
`;

const UpgradeNoticeWrapperDiv = styled.div`
  cursor: pointer;
  width: 22px;
  span {
    display: none !important;
  }
`;

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

  removeMember = (email) => {
    this.props.actions.organizationRemoveMember(
      this.props.organization.id,
      email
    );
  };

  // determine whether the component should deal with BYOC credentials
  // (not relevant on KVM)
  canCredentials = (provider) => {
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
        formatter: clusterIDCellFormatter.bind(this),
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
        headerStyle: () => ({
          textAlign: 'right',
          paddingRight: 0,
          transform: 'translateX(15px)',
        }),
        align: 'right',
        style: { paddingRight: 0 },
      },
      // Using path just because if we use 'id', that is what we need, we will get
      // duplicated keys.
      {
        dataField: 'path',
        text: '',
        formatter: (cell, row) =>
          upgradeNoticeIcon(cell, row, this.props.organization.id),
        headerStyle: () => ({ width: '40px', paddingLeft: 0 }),
        style: { paddingLeft: 0 },
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
        attrs: {
          'data-testid': 'organization-member-email',
          className: 'member-email',
        },
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
    const newClusterPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.New,
      {
        orgId: this.props.organization.id,
      }
    );

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
                <Link to={newClusterPath}>
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
              <MembersTable className='col-9'>
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
              </MembersTable>
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
function upgradeNoticeIcon(_, cluster, orgId) {
  const clusterDetailPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail.Home,
    {
      orgId,
      clusterId: cluster.id,
    }
  );

  return (
    <Link to={clusterDetailPath}>
      <OverlayTrigger
        overlay={<Tooltip id='tooltip'>Upgrade Available</Tooltip>}
        placement='top'
      >
        <UpgradeNoticeWrapperDiv>
          <UpgradeNotice clusterId={cluster.id} />
        </UpgradeNoticeWrapperDiv>
      </OverlayTrigger>
    </Link>
  );
}

// eslint-disable-next-line react/no-multi-comp
function clusterActionsCellFormatter(_cell, row) {
  if (row.delete_date) {
    return <span />;
  }

  const clusterDetailPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail.Home,
    {
      // eslint-disable-next-line react/no-this-in-sfc
      orgId: this.props.organization.id,
      clusterId: row.id,
    }
  );

  return (
    <Link to={clusterDetailPath}>
      <Button bsStyle='default' type='button'>
        Details
      </Button>
    </Link>
  );
}

// eslint-disable-next-line react/no-multi-comp
function memberActionsCellFormatter(_cell, row) {
  return (
    <Button
      // eslint-disable-next-line react/no-this-in-sfc
      onClick={this.removeMember.bind(this, row.email)}
      type='button'
      data-testid='organization-member-remove'
    >
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
