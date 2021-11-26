import { Box, Heading, Paragraph } from 'grommet';
import { OrganizationsRoutes } from 'model/constants/routes';
import * as React from 'react';
import { Link } from 'react-router-dom';

interface IClusterListNoOrgsPlaceholderProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const ClusterListNoOrgsPlaceholder: React.FC<
  IClusterListNoOrgsPlaceholderProps
> = (props) => {
  return (
    <Box
      pad='medium'
      background='background-back'
      round='xsmall'
      direction='column'
      justify='center'
      align='center'
      height={{ min: 'medium' }}
      {...props}
    >
      <Heading level={1}>Welcome to Giant Swarm!</Heading>
      <Paragraph fill={true}>
        There are no organizations yet in your installation.
      </Paragraph>
      <Paragraph fill={true}>
        Go to <Link to={OrganizationsRoutes.List}>Manage Organizations</Link> to
        create your first organization, then come back to this screen to create
        your first cluster!
      </Paragraph>
    </Box>
  );
};

export default ClusterListNoOrgsPlaceholder;
