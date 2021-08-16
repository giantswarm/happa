import { Story } from '@storybook/react';
import { DataTableProps, Text } from 'grommet';
import React from 'react';

import DataTable from '../';

interface IData {
  name: string;
  location: string;
  amount: number;
}

export const Simple: Story<DataTableProps> = (args) => {
  return <DataTable<IData> {...args} />;
};

Simple.args = {
  columns: [
    {
      property: 'name',
      header: 'Name',
      primary: true,
    },
    {
      property: 'location',
      header: 'Location',
      sortable: false,
    },
    {
      property: 'amount',
      header: 'Amount',
      render: (data) => <Text>${data.amount}</Text>,
    },
  ],
  data: [
    {
      name: 'Food',
      location: 'Amazon',
      amount: 25.36,
    },
    {
      name: 'Laptop',
      location: 'Apple',
      amount: 1683.0,
    },
    {
      name: 'Phone',
      location: 'Apple',
      amount: 1037.73,
    },
  ],
  sortable: true,
};

Simple.argTypes = {};
