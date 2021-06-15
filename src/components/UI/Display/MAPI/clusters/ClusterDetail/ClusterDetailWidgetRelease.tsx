import { Text } from 'grommet';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';
import KubernetesVersionLabel from 'UI/Display/Cluster/KubernetesVersionLabel';
import NotAvailable from 'UI/Display/NotAvailable';

import { IRelease } from '../../releases/types';
import ClusterDetailWidget from './ClusterDetailWidget';
import ClusterDetailWidgetOptionalValue from './ClusterDetailWidgetOptionalValue';

const StyledDot = styled(Dot)`
  padding: 0;
`;

interface IClusterDetailWidgetReleaseProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
    'title'
  > {
  currentRelease?: IRelease;
  currentReleaseErrorMessage?: string;
}

const ClusterDetailWidgetRelease: React.FC<IClusterDetailWidgetReleaseProps> = ({
  currentRelease,
  currentReleaseErrorMessage,
  ...props
}) => {
  const releaseVersion = currentReleaseErrorMessage
    ? ''
    : currentRelease?.version;
  const k8sVersion = currentReleaseErrorMessage
    ? ''
    : currentRelease?.k8sVersion;

  return (
    <ClusterDetailWidget
      title='Release'
      inline={true}
      contentProps={{
        direction: 'row',
        gap: 'xsmall',
        wrap: true,
        align: 'center',
      }}
      {...props}
    >
      <ClusterDetailWidgetOptionalValue
        value={releaseVersion}
        replaceEmptyValue={false}
      >
        {(value) => (
          <Text aria-label={`Cluster release version ${value}`}>
            <i
              className='fa fa-version-tag'
              role='presentation'
              aria-hidden='true'
            />{' '}
            {value || <NotAvailable />}
          </Text>
        )}
      </ClusterDetailWidgetOptionalValue>
      <StyledDot />
      <ClusterDetailWidgetOptionalValue
        value={k8sVersion}
        replaceEmptyValue={false}
      >
        {(value) => (
          <KubernetesVersionLabel
            hidePatchVersion={false}
            version={value as string}
          />
        )}
      </ClusterDetailWidgetOptionalValue>
    </ClusterDetailWidget>
  );
};

ClusterDetailWidgetRelease.propTypes = {
  currentRelease: PropTypes.object as PropTypes.Requireable<IRelease>,
  currentReleaseErrorMessage: PropTypes.string,
};

export default ClusterDetailWidgetRelease;
