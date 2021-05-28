import DocumentTitle from 'components/shared/DocumentTitle';
import { Box, Heading, Text } from 'grommet';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { AccountSettingsRoutes } from 'shared/constants/routes';
import featureFlags from 'shared/featureFlags';
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
  const visibleExperiments = featureFlags.all.filter(
    (flag) => flag.experimentName !== 'undefined'
  );

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
                <TableCell align='center'>Status</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleExperiments.map((experiment) => (
                <TableRow key={experiment.experimentName}>
                  <TableCell>{experiment.experimentName!}</TableCell>
                  <TableCell align='center' justify='center'>
                    <CheckBoxInput
                      toggle={true}
                      margin='none'
                      defaultChecked={experiment.enabled}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </DocumentTitle>
    </Breadcrumb>
  );
};

Experiments.propTypes = {};

export default Experiments;
