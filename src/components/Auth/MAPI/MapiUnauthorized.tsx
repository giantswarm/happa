import { Anchor, Box, Heading, Paragraph, Text } from 'grommet';
import PropTypes from 'prop-types';
import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { MainRoutes } from 'shared/constants/routes';
import styled from 'styled-components';

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
  const email = user?.email ?? 'Not logged in';

  let groups = user?.groups?.join(', ');
  groups ||= 'none';

  return (
    <StyledBox width='large' margin='auto' {...props}>
      <Heading level={1} margin={{ bottom: 'large' }}>
        Insufficient permissions
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
        <Box direction='row' gap='xsmall'>
          <Text weight='bold'>Email:</Text>
          <Text>{email}</Text>
        </Box>
        <Box direction='row' gap='xsmall'>
          <Text weight='bold'>Groups:</Text>
          <Text>{groups}</Text>
        </Box>
      </Box>
      <Box direction='column' gap='xsmall' margin={{ top: 'medium' }}>
        <Paragraph fill={true}>
          <NavLink href={MainRoutes.Logout} to={MainRoutes.Logout}>
            Try logging in again
          </NavLink>
        </Paragraph>
      </Box>
    </StyledBox>
  );
};

MapiUnauthorized.propTypes = {
  // @ts-expect-error
  user: PropTypes.object,
};

export default MapiUnauthorized;
