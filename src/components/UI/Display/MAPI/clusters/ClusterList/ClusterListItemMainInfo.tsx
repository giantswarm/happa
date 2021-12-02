import { Box, Text } from 'grommet';
import * as React from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';
import KubernetesVersionLabel from 'UI/Display/Cluster/KubernetesVersionLabel';
import Date from 'UI/Display/Date';
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

const ClusterListItemMainInfo: React.FC<IClusterListItemMainInfoProps> = ({
  releaseVersion,
  isPreviewRelease,
  creationDate,
  k8sVersion,
  ...props
}) => {
  return (
    <Box direction='row' align='center' gap='xsmall' {...props}>
      {isPreviewRelease && <ReleaseStateLabel state='preview' />}
      <OptionalValue value={releaseVersion} replaceEmptyValue={false}>
        {(value) => (
          <Text aria-label={`Release version: ${value}`}>
            <i
              className='fa fa-version-tag'
              role='presentation'
              aria-hidden='true'
            />{' '}
            {value}
          </Text>
        )}
      </OptionalValue>
      <StyledDot />
      <OptionalValue value={k8sVersion} replaceEmptyValue={false}>
        {(value) => (
          <KubernetesVersionLabel
            version={value as string}
            eolDate={getK8sVersionEOLDate(value as string) ?? undefined}
          />
        )}
      </OptionalValue>
      <StyledDot />
      <OptionalValue value={creationDate} replaceEmptyValue={false}>
        {(value) => (
          <Text>
            Created <Date relative={true} value={value as string} />
          </Text>
        )}
      </OptionalValue>
    </Box>
  );
};

export default ClusterListItemMainInfo;
