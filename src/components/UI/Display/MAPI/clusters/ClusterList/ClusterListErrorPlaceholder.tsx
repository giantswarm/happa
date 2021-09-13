import { Box, Heading, Paragraph } from 'grommet';
import * as React from 'react';

interface IClusterListErrorPlaceholderProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  organizationName: string;
}

const ClusterListErrorPlaceholder: React.FC<IClusterListErrorPlaceholderProps> =
  ({ organizationName, ...props }) => {
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
        <Heading level={1}>
          Error loading clusters for organization{' '}
          <code>{organizationName}</code>
        </Heading>
        <Paragraph fill={true}>
          We&apos;re probably getting things set up for you right now. Come back
          later or contact our support!
        </Paragraph>
        <Paragraph fill={true}>
          You can switch to a different organization by using the organization
          selector at the top right of the page.
        </Paragraph>
      </Box>
    );
  };

export default ClusterListErrorPlaceholder;
