import { Story } from '@storybook/react';
import React, { ComponentPropsWithoutRef } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
} from '..';

export const Simple: Story<ComponentPropsWithoutRef<typeof Table>> = (args) => {
  return (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Location</TableCell>
          <TableCell>Amount</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Food</TableCell>
          <TableCell>Amazon</TableCell>
          <TableCell>$25,36</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Laptop</TableCell>
          <TableCell>Apple</TableCell>
          <TableCell>$1683,00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Phone</TableCell>
          <TableCell>Apple</TableCell>
          <TableCell>$1037,73</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell />
          <TableCell />
          <TableCell>$2746,09</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

Simple.args = {
  caption: 'Expenses',
};

Simple.argTypes = {};
