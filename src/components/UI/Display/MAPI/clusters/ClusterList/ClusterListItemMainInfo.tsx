import { Box, Text } from 'grommet';
import * as React from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';
import KubernetesVersionLabel from 'UI/Display/Cluster/KubernetesVersionLabel';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import { getK8sVersionEOLDate } from 'utils/config';

import ReleaseStateLabel from '../../releases/ReleaseStateLabel';

const StyledDot = styled(Dot)`
  padding: 0;
`;

interface IClusterListItemMainInfoProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  releaseVersion?: string;
  isPreviewRelease?: boolean;
  creationDate?: string;
  k8sVersion?: string;
}

const ClusterListItemMainInfo: React.FC<
  React.PropsWithChildren<IClusterListItemMainInfoProps>
> = ({
  releaseVersion,
  isPreviewRelease,
  creationDate,
  k8sVersion,
  ...props
}) => {
  return (
    <Box direction='row' align='center' gap='xsmall' {...props}>
      <OptionalValue value={releaseVersion} replaceEmptyValue={false}>
        {(value) => (
          <Text aria-label={`Release version: ${value}`}>
            <i
              className='fa fa-version-tag'
              role='presentation'
              aria-hidden='true'
            />{' '}
            {value}
            {isPreviewRelease && (
              <ReleaseStateLabel state='preview' margin={{ left: 'xsmall' }} />
            )}
          </Text>
        )}
      </OptionalValue>
      <StyledDot />
      <OptionalValue value={k8sVersion} replaceEmptyValue={false}>
        {(value) => (
          <KubernetesVersionLabel
            version={value}
            eolDate={getK8sVersionEOLDate(value) ?? undefined}
          />
        )}
      </OptionalValue>
    </Box>
  );
};

export default ClusterListItemMainInfo;
