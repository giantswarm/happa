import { Box, Heading, Paragraph } from 'grommet';
import PropTypes from 'prop-types';
import * as React from 'react';

interface IClusterListEmptyPlaceholderProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  organizationName: string;
}

const ClusterListEmptyPlaceholder: React.FC<IClusterListEmptyPlaceholderProps> = ({
  organizationName,
  ...props
}) => {
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
        Couldn&apos;t find any clusters in organization{' '}
        <code>{organizationName}</code>
      </Heading>
      <Paragraph fill={true}>
        Make your first cluster by pressing the green &quot;Launch New
        Cluster&quot; button above.
      </Paragraph>
      <Paragraph fill={true}>
        You can switch to a different organization by using the organization
        selector at the top right of the page.
      </Paragraph>
    </Box>
  );
};

ClusterListEmptyPlaceholder.propTypes = {
  organizationName: PropTypes.string.isRequired,
};

export default ClusterListEmptyPlaceholder;
