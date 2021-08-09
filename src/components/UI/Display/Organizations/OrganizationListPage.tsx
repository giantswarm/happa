import { Box, Heading, Keyboard, Text } from 'grommet';
import * as docs from 'lib/docs';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from 'UI/Display/Table';

const StyledTableRow = styled(TableRow)`
  :hover,
  :focus-visible {
    background: ${({ theme }) => theme.global.colors.border.dark};
  }
`;

export interface IOrganization {
  name: string;
  clusterCount?: number;
}

interface IOrganizationIndexPageProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  organizations: IOrganization[];
  onClickRow: (name: string) => void;
}

const OrganizationListPage: React.FC<IOrganizationIndexPageProps> = ({
  organizations,
  onClickRow,
  ...props
}) => {
  const handleRowKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    e.preventDefault();

    (e.target as HTMLElement).click();
  };

  return (
    <Box direction='column' gap='medium' {...props}>
      <Box direction='column' gap='medium' margin={{ bottom: 'medium' }}>
        <Heading margin='none'>Your Organizations</Heading>
        <Text>
          Organizations help you manage clusters and apps for different
          purposes, projects, or teams. Learn more in our{' '}
          <a
            href={docs.organizationsExplainedURL}
            rel='noopener noreferrer'
            target='_blank'
          >
            documentation{' '}
            <i
              className='fa fa-open-in-new'
              aria-hidden={true}
              role='presentation'
              aria-label='Opens in a new tab'
            />
          </a>
          .
        </Text>
      </Box>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell size='small' align='center'>
              Clusters
            </TableCell>
          </TableRow>
        </TableHeader>
        <Keyboard onSpace={handleRowKeyDown} onEnter={handleRowKeyDown}>
          <TableBody>
            {organizations?.map((org) => (
              <StyledTableRow
                key={org.name}
                role='button'
                tabIndex={0}
                onClick={() => onClickRow(org.name)}
              >
                <TableCell>{org.name}</TableCell>
                <TableCell size='small' align='center' justify='center'>
                  <OptionalValue value={org.clusterCount} loaderWidth={18}>
                    {(value) => <Text>{value}</Text>}
                  </OptionalValue>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Keyboard>
      </Table>
    </Box>
  );
};

OrganizationListPage.propTypes = {
  organizations: PropTypes.array.isRequired,
  onClickRow: PropTypes.func.isRequired,
};

export default OrganizationListPage;
