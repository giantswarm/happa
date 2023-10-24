import { Box, Text } from 'grommet';
import * as React from 'react';
import KubernetesVersionLabel from 'UI/Display/Cluster/KubernetesVersionLabel';
import {
  DotSeparatedList,
  DotSeparatedListItem,
} from 'UI/Display/DotSeparatedList/DotSeparatedList';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import Truncated from 'UI/Util/Truncated';
import { getK8sVersionEOLDate } from 'utils/config';

import GitOpsManagedNote from '../../GitOpsManaged/GitOpsManagedNote';
import ReleaseStateLabel from '../../releases/ReleaseStateLabel';

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
    <DotSeparatedList {...props}>
      {releaseVersion && (
        <DotSeparatedListItem>
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
                  <ReleaseStateLabel
                    state='preview'
                    margin={{ left: 'xsmall' }}
                  />
                )}
              </Text>
            )}
          </OptionalValue>
        </DotSeparatedListItem>
      )}

      <DotSeparatedListItem>
        <OptionalValue value={k8sVersion} replaceEmptyValue={false}>
          {(value) => (
            <KubernetesVersionLabel
              version={value}
              eolDate={getK8sVersionEOLDate(value) ?? undefined}
            />
          )}
        </OptionalValue>
      </DotSeparatedListItem>

      {isManagedByGitOps && (
        <DotSeparatedListItem>
          <GitOpsManagedNote displayNote={false} />
        </DotSeparatedListItem>
      )}
    </DotSeparatedList>
  );
};

export default ClusterListItemMainInfo;
