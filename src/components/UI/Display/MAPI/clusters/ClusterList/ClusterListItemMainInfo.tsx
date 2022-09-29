import { Box, Text } from 'grommet';
import * as React from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';
import KubernetesVersionLabel from 'UI/Display/Cluster/KubernetesVersionLabel';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import Truncated from 'UI/Util/Truncated';
import { getK8sVersionEOLDate } from 'utils/config';

import GitOpsManagedNote from '../../GitOpsManaged/GitOpsManagedNote';
import ReleaseStateLabel from '../../releases/ReleaseStateLabel';

const StyledDot = styled(Dot)`
  padding: 0;
`;

export enum ClusterListItemMainInfoVariant {
  Release = 'Release',
  ClusterApp = 'ClusterApp',
}

interface IClusterListItemMainInfoProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  variant: ClusterListItemMainInfoVariant;
  releaseVersion?: string;
  isPreviewRelease?: boolean;
  k8sVersion?: string;
  isManagedByGitOps?: boolean;
}

const ClusterListItemMainInfo: React.FC<
  React.PropsWithChildren<IClusterListItemMainInfoProps>
> = ({
  variant,
  releaseVersion,
  isPreviewRelease,
  k8sVersion,
  isManagedByGitOps,
  ...props
}) => {
  return (
    <Box direction='row' align='center' gap='xsmall' {...props}>
      <OptionalValue value={releaseVersion} replaceEmptyValue={false}>
        {(value) => (
          <Text
            aria-label={`${
              variant === ClusterListItemMainInfoVariant.Release
                ? 'Release'
                : 'Cluster app'
            } version: ${value}`}
          >
            <i
              className='fa fa-version-tag'
              role='presentation'
              aria-hidden='true'
            />{' '}
            <Truncated numStart={8} numEnd={3}>
              {value}
            </Truncated>
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
      {isManagedByGitOps && (
        <Box direction='row' align='center' gap='xsmall'>
          <StyledDot />
          <GitOpsManagedNote displayNote={false} />
        </Box>
      )}
    </Box>
  );
};

export default ClusterListItemMainInfo;
