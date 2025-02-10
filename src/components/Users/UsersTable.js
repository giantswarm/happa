import React from 'react';
import Button from 'UI/Controls/Button';
import DataTable from 'UI/DataTable';
import Date from 'UI/Display/Date';

import UsersLoader from './UsersLoader';
import UsersPlaceholder from './UsersPlaceholder';
import { isExpiringSoon, NEVER_EXPIRES } from './UsersUtils';

// eslint-disable-next-line react/no-multi-comp
const getExpiryCellFormatter = (data, removeExpiration) => {
  if (data.expiry === NEVER_EXPIRES) {
    return <span>never</span>;
  }

  const expiryClass = isExpiringSoon(data.expiry) ? 'expiring' : null;
  const onRemoveExpiration = () => removeExpiration(data.email);

  return (
    <span className={expiryClass}>
      <Date relative={true} value={data.expiry} /> &nbsp;
      <i
        className='fa fa-close clickable'
        onClick={onRemoveExpiration}
        title='Remove expiration'
      />
    </span>
  );
};

// eslint-disable-next-line react/no-multi-comp
const getActionsCellFormatter = (data, deleteUser) => {
  if (data.invited_by) {
    return '';
  }

  const onDelete = () => deleteUser(data.email);

  return (
    <Button size='small' onClick={onDelete} type='button'>
      Delete
    </Button>
  );
};

// Provides the configuraiton for the clusters table
const getTableColumnsConfig = (onRemoveExpiration, onDelete) => {
  return [
    {
      property: 'email',
      header: 'Email',
      primary: true,
    },
    {
      property: 'emaildomain',
      header: 'Email Domain',
    },
    {
      property: 'created',
      header: 'Created',
      render: (data) => <Date relative={true} value={data.created} />,
      size: 'small',
    },
    {
      property: 'expiry',
      header: 'Expires',
      render: (data) => getExpiryCellFormatter(data, onRemoveExpiration),
      size: 'small',
    },
    {
      property: 'dummy',
      align: 'end',
      render: (data) => getActionsCellFormatter(data, onDelete),
      size: 'xsmall',
    },
  ];
};

// eslint-disable-next-line react/no-multi-comp
const UsersTable = ({ onRemoveExpiration, onDelete, users }) => {
  const items = users?.items || [];
  const hasUsers = Array.isArray(items) ? items.length > 0 : Object.keys(items).length > 0;

  if (!users || (users.isFetching && !hasUsers)) {
    return <UsersLoader />;
  } else if (!hasUsers) {
    return <UsersPlaceholder />;
  }

  const data = Array.isArray(items) ? items : Object.values(items);

  return (
    <div>
      <DataTable
        columns={getTableColumnsConfig(onRemoveExpiration, onDelete)}
        data={data}
        sort={{
          property: 'email',
          direction: 'asc',
        }}
        sortable={true}
        fill='horizontal'
      />
    </div>
  );
};

UsersTable.defaultProps = {
  users: {},
  // eslint-disable-next-line no-empty-function
  onRemoveExpiration: () => {},
  // eslint-disable-next-line no-empty-function
  onDelete: () => {},
};

export default UsersTable;
