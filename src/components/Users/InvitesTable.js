import React from 'react';
import DataTable from 'UI/DataTable';
import Date from 'UI/Display/Date';

// Provides the configuraiton for the clusters table
const getTableColumnsConfig = () => {
  return [
    {
      property: 'email',
      header: 'Email',
      primary: true,
    },
    {
      property: 'created',
      header: 'Invited',
      render: (data) => <Date relative={true} value={data.created} />,
      size: 'small',
    },
    {
      property: 'invited_by',
      header: 'Invited by',
    },
    {
      property: 'expiry',
      header: 'Expires',
      render: (data) => <Date relative={true} value={data.expiry} />,
      size: 'small',
    },
  ];
};

// eslint-disable-next-line react/no-multi-comp
const InvitesTable = ({ invitations }) => {
  const hasInvitations = Object.values(invitations.items).length;

  if (!hasInvitations) {
    return <p>No open invites</p>;
  }

  return (
    <div>
      <DataTable
        columns={getTableColumnsConfig()}
        data={Object.values(invitations.items)}
        sort={{
          property: 'email',
          direction: 'asc',
        }}
        sortable={true}
        fill='horizontal'
        margin={{ bottom: 'medium' }}
      />
    </div>
  );
};

InvitesTable.defaultProps = {
  invitations: {},
};

export default InvitesTable;
