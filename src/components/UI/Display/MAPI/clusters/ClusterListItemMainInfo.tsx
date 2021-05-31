import { Box, Text } from 'grommet';
import { relativeDate } from 'lib/helpers';
import PropTypes from 'prop-types';
import * as React from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';
import KubernetesVersionLabel from 'UI/Display/Cluster/KubernetesVersionLabel';

import ClusterListItemOptionalValue from './ClusterListItemOptionalValue';
import { IClusterItem } from './types';

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
    <Box direction='row' align='center' gap='xsmall' {...props}>
      <ClusterListItemOptionalValue
        value={releaseVersion}
        replaceEmptyValue={false}
      >
        {(value) => (
          <Text>
            <i
              className='fa fa-version-tag'
              role='presentation'
              aria-hidden='true'
            />{' '}
            {value}
          </Text>
        )}
      </ClusterListItemOptionalValue>
      <StyledDot />
      <ClusterListItemOptionalValue
        value={k8sVersion}
        replaceEmptyValue={false}
      >
        {(value) => <KubernetesVersionLabel version={value as string} />}
      </ClusterListItemOptionalValue>
      <StyledDot />
      <ClusterListItemOptionalValue
        value={creationDate}
        replaceEmptyValue={false}
      >
        {(value) => <Text>Created {relativeDate(value as string)}</Text>}
      </ClusterListItemOptionalValue>
    </Box>
  );
};

ClusterListItemMainInfo.propTypes = {
  releaseVersion: PropTypes.string,
  creationDate: PropTypes.string,
  k8sVersion: PropTypes.string,
};

export default ClusterListItemMainInfo;
