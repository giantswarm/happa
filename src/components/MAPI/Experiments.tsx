import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import DocumentTitle from 'components/shared/DocumentTitle';
import { Box, Heading, Text } from 'grommet';
import { AccountSettingsRoutes } from 'model/constants/routes';
import * as featureFlags from 'model/featureFlags';
import { IAsynchronousDispatch } from 'model/stores/asynchronousAction';
import {
  clearImpersonation,
  setImpersonation,
} from 'model/stores/main/actions';
import { organizationsLoadMAPI } from 'model/stores/organization/actions';
import { IState } from 'model/stores/state';
import React, { useState } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';
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
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';

import { usePermissionsKey } from './permissions/usePermissions';
import { extractErrorMessage } from './utils';

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

  const impersonationMetadata = useSelector(
    (state: IState) => state.main.impersonation
  );

  const [impersonationUser, setImpersonationUser] = useState<string>(
    impersonationMetadata?.user ?? ''
  );
  const [impersonationGroup, setImpersonationGroup] = useState<string>(
    impersonationMetadata?.groups?.[0] ?? ''
  );

  const dispatch = useDispatch<IAsynchronousDispatch<IState>>();
  const reloadOrganizations = async () => {
    try {
      await dispatch(organizationsLoadMAPI(auth));
    } catch (err) {
      const errorMessage = extractErrorMessage(err);

      new FlashMessage(
        `Could not reload organizations list.`,
        messageType.ERROR,
        messageTTL.LONG,
        errorMessage
      );
    }
  };

  const { cache, mutate } = useSWRConfig();

  const handleSetImpersonation = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const metadata = {
      user: impersonationUser,
      groups: impersonationGroup ? [impersonationGroup] : undefined,
    };

    await auth.setImpersonationMetadata(metadata);

    // TODO: Remove type casting when type inference bug is fixed upstream
    (cache as unknown as Map<unknown, unknown>).clear();
    mutate(usePermissionsKey);

    new FlashMessage(
      'Impersonation configured successfully.',
      messageType.SUCCESS,
      messageTTL.MEDIUM
    );

    dispatch(setImpersonation(metadata));

    reloadOrganizations();
  };

  const handleClearImpersonation = async () => {
    setImpersonationUser('');
    setImpersonationGroup('');

    await auth.setImpersonationMetadata(null);

    // TODO: Remove type casting when type inference bug is fixed upstream
    (cache as unknown as Map<unknown, unknown>).clear();
    mutate(usePermissionsKey);

    new FlashMessage(
      'Impersonation removed successfully.',
      messageType.SUCCESS,
      messageTTL.MEDIUM
    );

    dispatch(clearImpersonation());

    reloadOrganizations();
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
