import { Box, Text } from 'grommet';
import { relativeDate } from 'lib/helpers';
import PropTypes from 'prop-types';
import * as React from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';
import KubernetesVersionLabel from 'UI/Display/Cluster/KubernetesVersionLabel';
import RefreshableLabel from 'UI/Display/RefreshableLabel';

import { IClusterItem } from './types';

const StyledRefreshableLabel = styled(RefreshableLabel)`
  padding: 0;
  margin: 0;
`;

const StyledDot = styled(Dot)`
  padding: 0;
`;

interface IClusterListItemMainInfoProps
  extends Pick<IClusterItem, 'releaseVersion' | 'creationDate' | 'k8sVersion'>,
    React.ComponentPropsWithoutRef<typeof Box> {}

const ClusterListItemMainInfo: React.FC<IClusterListItemMainInfoProps> = ({
  releaseVersion,
  creationDate,
  k8sVersion,
  ...props
}) => {
  return (
    <Box direction='row' align='baseline' gap='xsmall' {...props}>
      {/* @ts-expect-error */}
      <StyledRefreshableLabel value={releaseVersion}>
        <Text>
          <i
            className='fa fa-version-tag'
            role='presentation'
            aria-hidden='true'
          />{' '}
          {releaseVersion}
        </Text>
      </StyledRefreshableLabel>
      <StyledDot />
      {/* @ts-expect-error */}
      <StyledRefreshableLabel value={k8sVersion}>
        <KubernetesVersionLabel version={k8sVersion} />
      </StyledRefreshableLabel>
      <StyledDot />
      <Text>Created {relativeDate(creationDate)}</Text>
    </Box>
  );
};

ClusterListItemMainInfo.propTypes = {
  releaseVersion: PropTypes.string.isRequired,
  creationDate: PropTypes.string.isRequired,
  k8sVersion: PropTypes.string,
};

export default ClusterListItemMainInfo;
