import styled from '@emotion/styled';
import { relativeDate } from 'lib/helpers';
import PropTypes from 'prop-types';
import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import Button from 'UI/Button';

import UsersLoader from './UsersLoader';
import UsersPlaceholder from './UsersPlaceholder';
import { formatStatus, isExpiringSoon, NEVER_EXPIRES } from './UsersUtils';

const TableWrapper = styled.div`
  .react-bootstrap-table table {
    table-layout: auto;
  }

  .status {
    width: 90px;
  }

  .actions {
    width: 100px;
  }
`;

const tableDefaultSorting = [
  {
    dataField: 'email',
    order: 'asc',
  },
];

const getStatusCellFormatter = (status, row) => {
  const { invited_by: invitedBy } = row;
  const subText = invitedBy ? `Invited by ${invitedBy}` : null;

  return (
    <>
      <small>{formatStatus(status)}</small>
      <small>{subText}</small>
    </>
  );
};

// eslint-disable-next-line react/no-multi-comp
const getExpiryCellFormatter = (cell, row, removeExpiration) => {
  if (cell === NEVER_EXPIRES) {
    return '';
  }

  const expiryClass = isExpiringSoon(cell) ? 'expiring' : null;
  const onRemoveExpiration = () => removeExpiration(row.email);

  return (
    <span className={expiryClass}>
      {relativeDate(cell)} &nbsp;
      <i
        className='fa fa-close clickable'
        onClick={onRemoveExpiration}
        title='Remove expiration'
      />
    </span>
  );
};

// eslint-disable-next-line react/no-multi-comp
const getActionsCellFormatter = (_cell, row, deleteUser) => {
  if (row.invited_by) {
    return '';
  }

  const onDelete = () => deleteUser(row.email);

  return (
    <Button bsStyle='default' onClick={onDelete} type='button'>
      Delete
    </Button>
  );
};

// Provides the configuraiton for the clusters table
const getTableColumnsConfig = (onRemoveExpiration, onDelete) => {
  return [
    {
      classes: 'email',
      dataField: 'email',
      text: 'Email',
      sort: true,
    },
    {
      classes: 'emaildomain',
      dataField: 'emaildomain',
      text: 'Email Domain',
      sort: true,
    },
    {
      classes: 'created',
      dataField: 'created',
      text: 'Created',
      sort: true,
      formatter: relativeDate,
    },
    {
      classes: 'expiry',
      dataField: 'expiry',
      text: 'Expiry',
      sort: true,
      formatter: (cell, row) =>
        getExpiryCellFormatter(cell, row, onRemoveExpiration),
    },
    {
      classes: 'status',
      dataField: 'status',
      text: 'STATUS',
      sort: true,
      formatter: getStatusCellFormatter,
    },
    {
      classes: 'actions',
      dataField: 'actionsDummy',
      isDummyField: true,
      text: '',
      align: 'right',
      formatter: (cell, row) => getActionsCellFormatter(cell, row, onDelete),
    },
  ];
};

// eslint-disable-next-line react/no-multi-comp
const UsersTable = ({
  onRemoveExpiration,
  onDelete,
  invitationsAndUsers,
  users,
  invitations,
}) => {
  const invitesAndUsers = Object.values(invitationsAndUsers);
  const hasUsers = users && Object.values(users.items).length;
  const hasInvitations = Object.values(invitations).length;

  if (!users || (users.isFetching && !hasUsers)) {
    return <UsersLoader />;
  } else if (!hasUsers && !hasInvitations) {
    return <UsersPlaceholder />;
  }

  return (
    <TableWrapper>
      <BootstrapTable
        bordered={false}
        columns={getTableColumnsConfig(onRemoveExpiration, onDelete)}
        data={invitesAndUsers}
        defaultSortDirection='asc'
        defaultSorted={tableDefaultSorting}
        keyField='email'
      />
    </TableWrapper>
  );
};

UsersTable.defaultProps = {
  users: {},
  invitationsAndUsers: {},
  invitations: {},
  // eslint-disable-next-line no-empty-function
  onRemoveExpiration: () => {},
  // eslint-disable-next-line no-empty-function
  onDelete: () => {},
};

UsersTable.propTypes = {
  users: PropTypes.object,
  invitationsAndUsers: PropTypes.array,
  invitations: PropTypes.object,
  onRemoveExpiration: PropTypes.func,
  onDelete: PropTypes.func,
};

export default UsersTable;
