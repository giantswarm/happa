import { relativeDate } from 'lib/helpers';
import PropTypes from 'prop-types';
import React from 'react';
import Button from 'UI/Controls/Button';
import DataTable from 'UI/DataTable';

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
      {relativeDate(data.expiry)} &nbsp;
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
      render: (data) => relativeDate(data.created),
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
  const hasUsers = users && Object.values(users.items).length;

  if (!users || (users.isFetching && !hasUsers)) {
    return <UsersLoader />;
  } else if (!hasUsers) {
    return <UsersPlaceholder />;
  }

  return (
    <div>
      <DataTable
        columns={getTableColumnsConfig(onRemoveExpiration, onDelete)}
        data={Object.values(users.items)}
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

UsersTable.propTypes = {
  users: PropTypes.object,
  onRemoveExpiration: PropTypes.func,
  onDelete: PropTypes.func,
};

export default UsersTable;
