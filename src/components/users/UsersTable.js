import { relativeDate } from 'lib/helpers.js';
import BootstrapTable from 'react-bootstrap-table-next';
import Button from 'UI/button';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import UsersLoader from './UsersLoader';
import UsersPlaceholder from './UsersPlaceholder';

const tableDefaultSorting = [
  {
    dataField: 'email',
    order: 'asc',
  },
];

const NEVER_EXPIRES = '0001-01-01T00:00:00Z';

const isExpired = timestamp => {
  const expirySeconds =
    moment(timestamp)
      .utc()
      .diff(moment().utc()) / 1000;

  if (timestamp === NEVER_EXPIRES) {
    return false;
  }

  return expirySeconds < 0;
};

const isExpiringSoon = timestamp => {
  const expirySeconds =
    moment(timestamp)
      .utc()
      .diff(moment().utc()) / 1000;

  return expirySeconds > 0 && expirySeconds < 60 * 60 * 24;
};

const formatStatus = user => {
  if (user.invited_by) {
    return 'PENDING';
  }

  if (isExpired(user.expiry)) {
    return 'EXPIRED';
  }

  if (isExpiringSoon(user.expiry)) {
    return 'EXPIRING SOON';
  }

  return 'ACTIVE';
};

const getStatusCellFormatter = (status, row) => {
  const { invited_by: invitedBy } = row;
  const subText = invitedBy ? `Invited by ${invitedBy}` : null;

  return (
    <div>
      <small>{formatStatus(status)}</small>
      <small>{subText}</small>
    </div>
  );
};

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

function getActionsCellFormatter(_cell, row, deleteUser) {
  if (row.invited_by) {
    return '';
  }

  const onDelete = () => deleteUser(row.email);

  return (
    <Button bsStyle='default' onClick={onDelete} type='button'>
      Delete
    </Button>
  );
}

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
  } else {
    return (
      <div className='users-table'>
        <BootstrapTable
          bordered={false}
          columns={getTableColumnsConfig(onRemoveExpiration, onDelete)}
          data={invitesAndUsers}
          defaultSortDirection='asc'
          defaultSorted={tableDefaultSorting}
          keyField='email'
        />
      </div>
    );
  }
};

UsersTable.defaultProps = {
  users: {},
  invitationsAndUsers: {},
  invitations: {},
  onRemoveExpiration: () => {},
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
