import DocumentTitle from 'components/shared/DocumentTitle';
import ClusterStatus from 'Home/ClusterStatus';
import RoutePath from 'lib/routePath';
import { OrganizationsRoutes } from 'model/constants/routes';
import * as organizationActions from 'model/stores/organization/actions';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import { Ellipsis } from 'styles';
import Button from 'UI/Controls/Button';
import DataTable from 'UI/DataTable';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';
import Date from 'UI/Display/Date';
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
        property: 'id',
        header: 'Cluster ID',
        render: clusterIDCellFormatter.bind(this),
        size: '110px',
      },
      {
        property: 'name',
        header: 'Name',
        render: (data) => formatClusterName(data, this.props.organization.id),
        size: 'medium',
      },
      {
        property: 'release_version',
        header: 'Release',
        size: 'small',
        sortable: false,
      },
      {
        property: 'create_date',
        header: 'Created',
        render: (data) => <Date relative={true} value={data.create_date} />,
        size: 'small',
      },
      {
        property: 'delete_date',
        header: 'Deleted',
        render: (data) => <Date relative={true} value={data.delete_date} />,
        size: 'small',
      },
      {
        property: 'dummy',
        align: 'end',
        render: clusterActionsCellFormatter.bind(this),
        size: 'xsmall',
      },
    ];
  };
  // Provides the configuraiton for the org members table
  getMemberTableColumnsConfig = () => {
    return [
      {
        property: 'email',
        header: 'Email',
        render: (data) => (
          <span
            data-testid='organization-member-email'
            className='member-email'
          >
            {data.email}
          </span>
        ),
      },
      {
        property: 'emailDomain',
        header: 'Email Domain',
      },
      {
        property: 'actionsDummy',
        isDummyField: true,
        align: 'end',
        render: memberActionsCellFormatter.bind(this),
        size: 'xsmall',
      },
    ];
  };

  supportsDeletion() {
    const { clusters, credentials, loadingCredentials, supportsMultiAccount } =
      this.props;

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
            <DataTable
              columns={this.getClusterTableColumnsConfig()}
              data={clusters}
              sort={{
                property: 'id',
                direction: 'asc',
              }}
              sortable={true}
              fill='horizontal'
              margin={{ bottom: 'medium' }}
            />
          )}
          <Link to={newClusterPath}>
            <Button icon={<i className='fa fa-add-circle' />}>
              Create cluster
            </Button>
          </Link>
        </Section>

        <Section title='Members'>
          <MembersTable>
            {!organization.members || organization.members.length === 0 ? (
              <p>This organization has no members</p>
            ) : (
              <DataTable
                columns={this.getMemberTableColumnsConfig()}
                data={this.props.membersForTable}
                sort={{
                  property: 'email',
                  direction: 'asc',
                }}
                sortable={true}
                fill='horizontal'
                margin={{ top: 'small', bottom: 'medium' }}
              />
            )}
            <Button
              onClick={this.addMember}
              icon={<i className='fa fa-add-circle' />}
            >
              Add member
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
            />
          </Section>
        )}

        <Section title='Delete this organization' flat>
          <Disclaimer>{supportsDeletion.message}</Disclaimer>
          <Button
            danger={true}
            onClick={this.deleteOrganization}
            disabled={!supportsDeletion.status}
            aria-label='Delete organization'
            icon={<i className='fa fa-delete' />}
          >
            Delete organization
          </Button>
        </Section>
      </DocumentTitle>
    );
  }
}

// eslint-disable-next-line react/no-multi-comp
function clusterIDCellFormatter(data) {
  return <ClusterIDLabel clusterID={data.id} copyEnabled />;
}

// eslint-disable-next-line react/no-multi-comp
function formatClusterName(data, orgId) {
  const clusterDetailPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail.Home,
    {
      orgId,
      clusterId: data.id,
    }
  );

  return (
    <span>
      {data.name}{' '}
      <Link to={clusterDetailPath}>
        <ClusterStatus clusterId={data.id} hideText={true} />
      </Link>
    </span>
  );
}

// eslint-disable-next-line react/no-multi-comp
function clusterActionsCellFormatter(data) {
  if (data.delete_date) {
    return <span />;
  }

  const clusterDetailPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail.Home,
    {
      // eslint-disable-next-line react/no-this-in-sfc
      orgId: this.props.organization.id,
      clusterId: data.id,
    }
  );

  return (
    <Link to={clusterDetailPath}>
      <Button size='small' type='button'>
        Details
      </Button>
    </Link>
  );
}

// eslint-disable-next-line react/no-multi-comp
function memberActionsCellFormatter(data) {
  return (
    <Button
      // eslint-disable-next-line react/no-this-in-sfc
      onClick={this.removeMember.bind(this, data.email)}
      type='button'
      size='small'
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

export default connect(undefined, mapDispatchToProps)(OrganizationDetail);
