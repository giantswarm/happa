import { Anchor, Box, Heading, Paragraph, Text } from 'grommet';
import { usePermissionsKey } from 'MAPI/permissions/usePermissions';
import { extractErrorMessage } from 'MAPI/utils';
import { MainRoutes } from 'model/constants/routes';
import { IAsynchronousDispatch } from 'model/stores/asynchronousAction';
import { clearImpersonation as clearImpersonationAction } from 'model/stores/main/actions';
import { organizationsLoadMAPI } from 'model/stores/organization/actions';
import { IState } from 'model/stores/state';
import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { useSWRConfig } from 'swr';
import Button from 'UI/Controls/Button';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';

import { useAuthProvider } from './MapiAuthProvider';

const StyledBox = styled(Box)`
  position: relative;
`;

interface IMapiUnauthorizedProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  user: ILoggedInUser | null;
}

const MapiUnauthorized: React.FC<IMapiUnauthorizedProps> = ({
  user,
  ...props
}) => {
  const auth = useAuthProvider();

  const impersonationMetadata = useSelector(
    (state: IState) => state.main.impersonation
  );

  const groups = useMemo(() => {
    if (impersonationMetadata) {
      return impersonationMetadata.groups?.join(', ') || 'none';
    }

    return user?.groups?.join(', ') || 'none';
  }, [impersonationMetadata, user?.groups]);

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

  const clearImpersonation = async () => {
    await auth.setImpersonationMetadata(null);

    // TODO: Remove type casting when type inference bug is fixed upstream
    (cache as unknown as Map<unknown, unknown>).clear();
    mutate(usePermissionsKey, true);

    new FlashMessage(
      'Impersonation removed successfully.',
      messageType.SUCCESS,
      messageTTL.MEDIUM
    );

    dispatch(clearImpersonationAction());

    reloadOrganizations();
  };

  const email = user?.email ?? 'Not logged in';

  return (
    <StyledBox width='large' margin='auto' {...props}>
      <Heading level={1} margin={{ bottom: 'large' }}>
        <Text weight='bold' size='5xl'>
          Insufficient permissions
        </Text>
      </Heading>
      <Paragraph fill={true}>
        <Text weight='bold'>
          You don&apos;t have permission to access any resources via the Giant
          Swarm web interface or Management API.
        </Text>
      </Paragraph>
      <Paragraph fill={true}>
        Please reach out to the person who invited you to the Giant Swarm web
        interface to resolve the issue.
      </Paragraph>
      <Paragraph fill={true}>
        If you expected to use the web interface as an admin, please contact
        Giant Swarm&apos;s support team via your Slack channel or via{' '}
        <Anchor href='mailto:support@giantswarm.io'>
          support@giantswarm.io
        </Anchor>
        .
      </Paragraph>
      <Paragraph fill={true}>
        Please provide this additional information on request:
      </Paragraph>
      <Box direction='column' gap='xsmall' margin={{ top: 'small' }}>
        {impersonationMetadata ? (
          <Box direction='row' gap='xsmall'>
            <Text weight='bold'>User:</Text>
            <Text>
              {impersonationMetadata.user} (impersonated by {email})
            </Text>
          </Box>
        ) : (
          <Box direction='row' gap='xsmall'>
            <Text weight='bold'>Email:</Text>
            <Text>{email}</Text>
          </Box>
        )}
        <Box direction='row' gap='xsmall'>
          <Text weight='bold'>Groups:</Text>
          <Text>{groups}</Text>
        </Box>
      </Box>
      <Box
        direction='row'
        gap='small'
        align='center'
        margin={{ top: 'medium' }}
      >
        {impersonationMetadata && (
          <Button secondary={true} onClick={clearImpersonation}>
            Clear impersonation
          </Button>
        )}
        <NavLink href={MainRoutes.Logout} to={MainRoutes.Logout}>
          Try logging in again
        </NavLink>
      </Box>
    </StyledBox>
  );
};

export default MapiUnauthorized;
