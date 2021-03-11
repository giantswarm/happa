import { relativeDate } from 'lib/helpers';
import PropTypes from 'prop-types';
import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import styled from 'styled-components';

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

// Provides the configuraiton for the clusters table
const getTableColumnsConfig = () => {
  return [
    {
      classes: 'email',
      dataField: 'email',
      text: 'Email',
      sort: true,
    },
    {
      classes: 'created',
      dataField: 'created',
      text: 'Invited',
      sort: true,
      formatter: relativeDate,
    },
    {
      classes: 'invited_by',
      dataField: 'invited_by',
      text: 'Invited by',
      sort: true,
    },
    {
      classes: 'expiry',
      dataField: 'expiry',
      text: 'Expires',
      sort: true,
      formatter: relativeDate,
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
    <TableWrapper>
      <BootstrapTable
        bordered={false}
        columns={getTableColumnsConfig()}
        data={Object.values(invitations.items)}
        defaultSortDirection='asc'
        defaultSorted={tableDefaultSorting}
        keyField='email'
      />
    </TableWrapper>
  );
};

InvitesTable.defaultProps = {
  invitations: {},
};

InvitesTable.propTypes = {
  invitations: PropTypes.object,
};

export default InvitesTable;
