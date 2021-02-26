import { relativeDate } from 'lib/helpers';
import PropTypes from 'prop-types';
import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';

import UsersLoader from './UsersLoader';
import UsersPlaceholder from './UsersPlaceholder';
import { isExpiringSoon, NEVER_EXPIRES } from './UsersUtils';

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

// eslint-disable-next-line react/no-multi-comp
const getExpiryCellFormatter = (cell, row, removeExpiration) => {
  if (cell === NEVER_EXPIRES) {
    return <span>never</span>;
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
    <Button bsStyle='default' bsSize='sm' onClick={onDelete} type='button'>
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
      text: 'Expires',
      sort: true,
      formatter: (cell, row) =>
        getExpiryCellFormatter(cell, row, onRemoveExpiration),
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
const UsersTable = ({ onRemoveExpiration, onDelete, users }) => {
  const hasUsers = users && Object.values(users.items).length;

  if (!users || (users.isFetching && !hasUsers)) {
    return <UsersLoader />;
  } else if (!hasUsers) {
    return <UsersPlaceholder />;
  }

  return (
    <TableWrapper>
      <BootstrapTable
        bordered={false}
        columns={getTableColumnsConfig(onRemoveExpiration, onDelete)}
        data={Object.values(users.items)}
        defaultSortDirection='asc'
        defaultSorted={tableDefaultSorting}
        keyField='email'
      />
    </TableWrapper>
  );
};

UsersTable.defaultProps = {
  users: {},
  // eslint-disable-next-line no-empty-function
  onRemoveExpiration: () => {},
  // eslint-disable-next-line no-empty-function
  onDelete: () => {},
};

UsersTable.propTypes = {
  users: PropTypes.object,
  onRemoveExpiration: PropTypes.func,
  onDelete: PropTypes.func,
};

export default UsersTable;
