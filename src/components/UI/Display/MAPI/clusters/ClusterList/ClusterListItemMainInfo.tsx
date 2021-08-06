import { Box, Text } from 'grommet';
import { relativeDate } from 'lib/helpers';
import PropTypes from 'prop-types';
import * as React from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';
import KubernetesVersionLabel from 'UI/Display/Cluster/KubernetesVersionLabel';
import OptionalValue from 'UI/Display/MAPI/clusters/ClusterDetail/OptionalValue';

const StyledDot = styled(Dot)`
  padding: 0;
`;

interface IClusterListItemMainInfoProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  releaseVersion?: string;
  creationDate?: string;
  k8sVersion?: string;
}

const ClusterListItemMainInfo: React.FC<IClusterListItemMainInfoProps> = ({
  releaseVersion,
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
          </Text>
        )}
      </OptionalValue>
      <StyledDot />
      <OptionalValue value={k8sVersion} replaceEmptyValue={false}>
        {(value) => <KubernetesVersionLabel version={value as string} />}
      </OptionalValue>
      <StyledDot />
      <OptionalValue value={creationDate} replaceEmptyValue={false}>
        {(value) => <Text>Created {relativeDate(value as string)}</Text>}
      </OptionalValue>
    </Box>
  );
};

ClusterListItemMainInfo.propTypes = {
  releaseVersion: PropTypes.string,
  creationDate: PropTypes.string,
  k8sVersion: PropTypes.string,
};

export default ClusterListItemMainInfo;
