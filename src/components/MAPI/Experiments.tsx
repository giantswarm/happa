import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import DocumentTitle from 'components/shared/DocumentTitle';
import { Box, Heading, Text } from 'grommet';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import React, { useEffect, useState } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { AccountSettingsRoutes } from 'shared/constants/routes';
import * as featureFlags from 'shared/featureFlags';
import Button from 'UI/Controls/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from 'UI/Display/Table';
import CheckBoxInput from 'UI/Inputs/CheckBoxInput';
import TextInput from 'UI/Inputs/TextInput';

interface IExperimentsProps {}

const Experiments: React.FC<IExperimentsProps> = () => {
  const visibleExperiments = Object.entries(featureFlags.flags).filter(
    ([, flag]) => flag.experimentName !== 'undefined'
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const featureName = e.target.name as featureFlags.Feature;

    if (featureFlags.flags.hasOwnProperty(featureName)) {
      featureFlags.flags[featureName].enabled = e.target.checked;
    }
  };

  const auth = useAuthProvider();
  const [impersonationUser, setImpersonationUser] = useState<string>('');
  const [impersonationGroup, setImpersonationGroup] = useState<string>('');

  useEffect(() => {
    (async () => {
      const metadata = await auth.getImpersonationMetadata();

      setImpersonationUser(metadata?.user ?? '');
      setImpersonationGroup(metadata?.groups?.[0] ?? '');
    })();
  }, [auth]);

  const handleSetImpersonation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    auth.setImpersonationMetadata({
      user: impersonationUser,
      groups: impersonationGroup ? [impersonationGroup] : undefined,
    });

    new FlashMessage(
      'Impersonation configured successfully.',
      messageType.SUCCESS,
      messageTTL.MEDIUM
    );
  };

  const handleClearImpersonation = () => {
    auth.setImpersonationMetadata(null);

    new FlashMessage(
      'Impersonation removed successfully.',
      messageType.SUCCESS,
      messageTTL.MEDIUM
    );
  };

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
              {visibleExperiments.map(([name, experiment]) => (
                <TableRow key={experiment.experimentName}>
                  <TableCell>{experiment.experimentName!}</TableCell>
                  <TableCell align='center' justify='center'>
                    <CheckBoxInput
                      toggle={true}
                      margin='none'
                      defaultChecked={experiment.enabled}
                      name={name}
                      onChange={handleChange}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Box
          margin={{ top: 'large' }}
          background='background-back'
          pad='large'
          round='xsmall'
          justify='start'
          direction='row'
        >
          <Box
            flex={{ grow: 0, shrink: 1 }}
            basis='medium'
            pad={{ horizontal: 'small' }}
          >
            <Heading level={2} margin='none'>
              Impersonation
            </Heading>
            <Text margin={{ top: 'small' }} color='text-weak'>
              You can set up impersonation to act as another user. This is
              useful for debugging permissions.
            </Text>
          </Box>
          <Box
            flex={{ grow: 1, shrink: 1 }}
            basis='medium'
            width={{ max: 'large' }}
            gap='small'
          >
            <form onSubmit={handleSetImpersonation}>
              <TextInput
                label='Username'
                id='username'
                name='username'
                help='The user defined in the RoleBinding.'
                required={true}
                value={impersonationUser}
                onChange={(e) => setImpersonationUser(e.target.value)}
              />
              <TextInput
                label='Group'
                id='group'
                name='group'
                help='Impersonate a specific group that the user is a part of.'
                placeholder='Optional'
                value={impersonationGroup}
                onChange={(e) => setImpersonationGroup(e.target.value)}
              />
              <Box direction='row' margin={{ top: 'medium' }} gap='small'>
                <Button primary={true} type='submit'>
                  Set
                </Button>
                <Button onClick={handleClearImpersonation}>Clear</Button>
              </Box>
            </form>
          </Box>
        </Box>
      </DocumentTitle>
    </Breadcrumb>
  );
};

export default Experiments;
