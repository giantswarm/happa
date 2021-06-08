import { Box, Text } from 'grommet';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import ClusterDetailCounter from '../clusters/ClusterDetail/ClusterDetailCounter';
import ClusterDetailWidget from '../clusters/ClusterDetail/ClusterDetailWidget';
import { IClusterItem } from '../clusters/types';

const StyledLink = styled.a`
  color: ${({ theme }) => theme.global.colors['input-highlight']};
`;

interface IClusterDetailWidgetKeyPairsProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
      'title'
    >,
    Pick<IClusterItem, 'activeKeyPairsCount'> {
  createKeyPairPath: string;
}

const ClusterDetailWidgetKeyPairs: React.FC<IClusterDetailWidgetKeyPairsProps> = ({
  createKeyPairPath,
  activeKeyPairsCount,
  ...props
}) => {
  const hasNoKeyPairs =
    typeof activeKeyPairsCount === 'number' && activeKeyPairsCount === 0;

  return (
    <ClusterDetailWidget
      title='Key pairs'
      contentProps={{
        direction: 'row',
        gap: 'small',
        wrap: true,
        justify: hasNoKeyPairs ? 'start' : 'around',
      }}
      {...props}
    >
      {hasNoKeyPairs && (
        <Box pad={{ bottom: 'xsmall' }}>
          <Text margin={{ bottom: 'small' }}>No key pairs</Text>
          <Text size='small'>
            Use{' '}
            <StyledLink
              target='_blank'
              href={createKeyPairPath}
              rel='noopener noreferrer'
            >
              gsctl create kubeconfig
            </StyledLink>{' '}
            to create one.
          </Text>
        </Box>
      )}

      {!hasNoKeyPairs && (
        <ClusterDetailCounter
          label='key pair'
          pluralize={true}
          value={activeKeyPairsCount}
        />
      )}
    </ClusterDetailWidget>
  );
};

ClusterDetailWidgetKeyPairs.propTypes = {
  createKeyPairPath: PropTypes.string.isRequired,
  activeKeyPairsCount: PropTypes.number,
};

export default ClusterDetailWidgetKeyPairs;
