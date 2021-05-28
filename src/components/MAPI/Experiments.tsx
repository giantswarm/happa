import DocumentTitle from 'components/shared/DocumentTitle';
import { Box, Heading, Text } from 'grommet';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { AccountSettingsRoutes } from 'shared/constants/routes';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from 'UI/Display/Table';
import CheckBoxInput from 'UI/Inputs/CheckBoxInput';

interface IExperimentsProps {}

const Experiments: React.FC<IExperimentsProps> = () => {
  return (
    <Breadcrumb
      data={{
        title: 'EXPERIMENTS',
        pathname: AccountSettingsRoutes.Experiments,
      }}
    >
      <DocumentTitle title='Experiments'>
        <Box margin={{ bottom: 'large' }} gap='small' direction='column'>
          <Heading level={1} margin='none'>
            Experiments
          </Heading>
          <Text>
            Because you&apos;re an admin, you can try out some of the features
            that are currently a work in progress.
          </Text>
          <Text color='status-warning' size='xsmall'>
            <i
              className='fa fa-warning'
              role='presentation'
              aria-hidden='true'
            />{' '}
            Note: You can only enable an experiment on the current installation,
            and only for yourself.
          </Text>
        </Box>
        <Box margin={{ top: 'medium' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Feature name</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Customer SSO</TableCell>
                <TableCell>
                  <CheckBoxInput toggle={true} />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </DocumentTitle>
    </Breadcrumb>
  );
};

Experiments.propTypes = {};

export default Experiments;
