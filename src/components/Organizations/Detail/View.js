import DocumentTitle from 'components/shared/DocumentTitle';
import ClusterStatus from 'Home/ClusterStatus';
import { relativeDate } from 'lib/helpers';
import RoutePath from 'lib/routePath';
import { compare } from 'lib/semver';
import PropTypes from 'prop-types';
import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { Providers } from 'shared/constants';
import { OrganizationsRoutes } from 'shared/constants/routes';
import { getUserIsAdmin } from 'stores/main/selectors';
import * as organizationActions from 'stores/organization/actions';
import styled from 'styled-components';
import { Ellipsis } from 'styles';
import Button from 'UI/Controls/Button';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';
import Section from 'UI/Layout/Section';

import Credentials from './Credentials';

const MembersTable = styled.div`
  .member-email {
    ${Ellipsis}
  }
`;

const Disclaimer = styled.p`
  margin: 0 0 20px;
  line-height: 1.2;
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
  componentDidMount() {
    if (!this.props.organization) return;

    this.props.actions.organizationCredentialsLoad(this.props.organization.id);
  }

  addMember = () => {
    this.props.actions.organizationAddMember(this.props.organization.id);
  };

  removeMember = (email) => {
    this.props.actions.organizationRemoveMember(
      this.props.organization.id,
      email
    );
  };

  deleteOrganization = () => {
    this.props.actions.organizationDelete(this.props.organization.id);
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
        formatter: (cell, row) =>
          formatClusterName(cell, row, this.props.organization.id),
      },
      {
        dataField: 'release_version',
        text: 'Release',
        sort: true,
        sortFunc: (a, b, order) => {
          if (order === 'desc') {
            return compare(a, b) * -1;
          }

          return compare(a, b);
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

  supportsDeletion() {
    const {
      clusters,
      credentials,
      loadingCredentials,
      supportsMultiAccount,
    } = this.props;

    const result = {
      status: true,
      message:
        'All information related to this organization will be deleted. There is no way to undo this action.',
    };
    switch (true) {
      case clusters.length > 0:
        result.status = false;
        result.message =
          'This organization cannot be deleted because it contains clusters. Please delete all clusters in order to be able to delete the organization.';
        break;

      case loadingCredentials:
        result.status = false;
        break;

      case supportsMultiAccount && credentials.length > 0:
        result.status = false;
        result.message =
          'This organization cannot be deleted because it has provider credentials. Please remove them in order to be able to delete the organization.';
        break;
    }

    return result;
  }

  render() {
    const {
      clusters,
      organization,
      credentials,
      showCredentialsForm,
      loadingCredentials,
      supportsMultiAccount,
      provider,
      isAdmin,
    } = this.props;
    if (!organization) return null;

    const supportsDeletion = this.supportsDeletion();

    const newClusterPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.New,
      { orgId: organization.id }
    );

    return (
      <DocumentTitle title={`Organization Details | ${organization.id}`}>
        <h1>Organization: {organization.id}</h1>
        <Section title='Clusters'>
          {clusters.length === 0 ? (
            <p>This organization doesn&apos;t have any clusters.</p>
          ) : (
            <BootstrapTable
              bordered={false}
              columns={this.getClusterTableColumnsConfig()}
              data={clusters}
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
        </Section>

        <Section title='Members'>
          <MembersTable>
            {!organization.members || organization.members.length === 0 ? (
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
        </Section>

        {supportsMultiAccount && (
          <Section title='Provider credentials'>
            <Credentials
              provider={provider}
              organizationName={organization.id}
              credentials={credentials}
              showCredentialsForm={showCredentialsForm}
              loadingCredentials={loadingCredentials}
              isAdmin={isAdmin}
            />
          </Section>
        )}

        <Section title='Delete this organization' flat>
          <Disclaimer>{supportsDeletion.message}</Disclaimer>
          <Button
            bsStyle='danger'
            onClick={this.deleteOrganization}
            disabled={!supportsDeletion.status}
            aria-label='Delete organization'
          >
            <i className='fa fa-delete' /> Delete Organization
          </Button>
        </Section>
      </DocumentTitle>
    );
  }
}

OrganizationDetail.propTypes = {
  actions: PropTypes.object,
  clusters: PropTypes.array,
  organization: PropTypes.object,
  credentials: PropTypes.array,
  loadingCredentials: PropTypes.bool,
  showCredentialsForm: PropTypes.bool,
  membersForTable: PropTypes.array,
  provider: PropTypes.oneOf(Object.values(Providers)),
  supportsMultiAccount: PropTypes.bool,
  isAdmin: PropTypes.bool,
};

// eslint-disable-next-line react/no-multi-comp
function clusterIDCellFormatter(cell) {
  return <ClusterIDLabel clusterID={cell} copyEnabled />;
}

// eslint-disable-next-line react/no-multi-comp
function formatClusterName(_, cluster, orgId) {
  const clusterDetailPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail.Home,
    {
      orgId,
      clusterId: cluster.id,
    }
  );

  return (
    <>
      {cluster.name}{' '}
      <Link to={clusterDetailPath}>
        <ClusterStatus clusterId={cluster.id} hideText={true} />
      </Link>
    </>
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
      <Button bsStyle='default' bsSize='sm' type='button'>
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
      bsStyle='default'
      bsSize='sm'
      data-testid='organization-member-remove'
    >
      Remove
    </Button>
  );
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(organizationActions, dispatch),
  };
}

function mapStateToProps(state) {
  return {
    isAdmin: getUserIsAdmin(state),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OrganizationDetail);
