import { Anchor, Box, Heading, Paragraph, Text } from 'grommet';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { getLoggedInUser } from 'stores/main/selectors';
import styled from 'styled-components';
import SlideTransition from 'styles/transitions/SlideTransition';

const StyledBox = styled(Box)`
  position: relative;
`;

interface IMapiUnauthorizedProps {}

const MapiUnauthorized: React.FC<IMapiUnauthorizedProps> = () => {
  const user = useSelector(getLoggedInUser);
  const userID = user?.email ?? 'Not logged in';

  let groups = user?.groups?.join(', ');
  groups ||= 'none';

  return (
    <>
      <div className='login_form--mask' />

      <SlideTransition appear={true} in={true} direction='down'>
        <StyledBox width='large' margin='auto'>
          <Heading level={1} margin={{ bottom: 'large' }}>
            There is a problem
          </Heading>
          <Paragraph fill={true}>
            <Text weight='bold'>
              You don&apos;t have permission to access any resources via the
              Giant Swarm web interface or Management API.
            </Text>
          </Paragraph>
          <Paragraph fill={true}>
            Please reach out to the person who invited you to the Giant Swarm
            web interface to resolve the issue.
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
              <Text weight='bold'>User ID:</Text>
              <Text>{userID}</Text>
            </Box>
            <Box direction='row' gap='xsmall'>
              <Text weight='bold'>Groups:</Text>
              <Text>{groups}</Text>
            </Box>
          </Box>
        </StyledBox>
      </SlideTransition>
    </>
  );
};

MapiUnauthorized.propTypes = {};

export default MapiUnauthorized;
