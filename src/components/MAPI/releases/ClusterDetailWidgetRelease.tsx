import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Keyboard, Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import * as clusterDetailUtils from 'MAPI/clusters/ClusterDetail/utils';
import ClusterStatusComponent from 'MAPI/clusters/ClusterStatus/ClusterStatus';
import { useClusterStatus } from 'MAPI/clusters/hooks/useClusterStatus';
import { ClusterStatus, getClusterConditions } from 'MAPI/clusters/utils';
import {
  getSupportedUpgradeVersions,
  reduceReleaseToComponents,
} from 'MAPI/releases/utils';
import { ProviderCluster } from 'MAPI/types';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import {
  getIsImpersonatingNonAdmin,
  getUserIsAdmin,
} from 'model/stores/main/selectors';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { Dot } from 'styles';
import useSWR, { mutate } from 'swr';
import Button from 'UI/Controls/Button';
import KubernetesVersionLabel from 'UI/Display/Cluster/KubernetesVersionLabel';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';
import * as ui from 'UI/Display/MAPI/releases/types';
import NotAvailable from 'UI/Display/NotAvailable';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import { getK8sVersionEOLDate } from 'utils/config';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import ClusterDetailReleaseDetailsModal from './ClusterDetailReleaseDetailsModal';
import ClusterDetailUpgradeModal from './ClusterDetailUpgradeModal';
import { usePermissionsForReleases } from './permissions/usePermissionsForReleases';

const StyledDot = styled(Dot)`
  padding: 0;
`;

const VersionLabel = styled(Text)``;

const StyledLink = styled.a`
  :hover {
    text-decoration: none;

    ${VersionLabel} {
      border-bottom: ${({ theme }) =>
        `${theme.global.borderSize.xsmall} solid ${normalizeColor(
          'text-strong',
          theme
        )}`};
    }
  }

  ${VersionLabel} {
    border-bottom: ${({ theme }) =>
      `${theme.global.borderSize.xsmall} solid ${normalizeColor(
        'text-xweak',
        theme
      )}`};
  }
`;

interface IClusterDetailWidgetReleaseProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
    'title'
  > {
  cluster?: capiv1beta1.ICluster;
  providerCluster?: ProviderCluster;
  canUpdateCluster?: boolean;
  onTargetReleaseVersionChange?: (version: string) => void;
}

const ClusterDetailWidgetRelease: React.FC<
  React.PropsWithChildren<IClusterDetailWidgetReleaseProps>
> = ({
  cluster,
  providerCluster,
  canUpdateCluster,
  onTargetReleaseVersionChange,
  ...props
}) => {
  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const provider = window.config.info.general.provider;

  const releaseListClient = useRef(clientFactory());
  const { canList: canListReleases } = usePermissionsForReleases(
    provider,
    'default'
  );
  const releaseListKey = canListReleases
    ? releasev1alpha1.getReleaseListKey()
    : null;

  const { data: releaseList, error: releaseListError } = useSWR<
    releasev1alpha1.IReleaseList,
    GenericResponseError
  >(releaseListKey, () =>
    releasev1alpha1.getReleaseList(releaseListClient.current, auth)
  );

  useEffect(() => {
    if (releaseListError) {
      ErrorReporter.getInstance().notify(releaseListError);
    }
  }, [releaseListError]);

  const releaseVersion = cluster
    ? capiv1beta1.getReleaseVersion(cluster)
    : undefined;

  const currentRelease = useMemo(() => {
    const formattedReleaseVersion = `v${releaseVersion}`;

    const release = releaseList?.items.find(
      (r) => r.metadata.name === formattedReleaseVersion
    );
    if (!release) return undefined;

    return release;
  }, [releaseList?.items, releaseVersion]);

  const k8sVersion = useMemo(() => {
    if (!releaseList && canListReleases) return undefined;
    if (!currentRelease) return '';

    const version = releasev1alpha1.getK8sVersion(currentRelease);
    if (!version) return '';

    return version;
  }, [releaseList, canListReleases, currentRelease]);

  const isAdmin = useSelector(getUserIsAdmin);
  const isImpersonatingNonAdmin = useSelector(getIsImpersonatingNonAdmin);

  const supportedUpgradeVersions: ui.IReleaseVersion[] = useMemo(() => {
    if (!releaseList || !releaseVersion) return [];

    return getSupportedUpgradeVersions(
      releaseVersion,
      provider,
      isAdmin && !isImpersonatingNonAdmin,
      releaseList.items
    );
  }, [isAdmin, isImpersonatingNonAdmin, provider, releaseList, releaseVersion]);

  const nextVersion = useMemo(() => {
    return supportedUpgradeVersions.find(
      (r) => r.status !== ui.ReleaseVersionStatus.PreRelease
    )?.version;
  }, [supportedUpgradeVersions]);

  const isUpgradable = typeof nextVersion !== 'undefined';

  const { isConditionUnknown, isCreating, isUpgrading } = getClusterConditions(
    cluster,
    providerCluster
  );

  const canUpgrade =
    !isUpgrading && !isCreating && !isConditionUnknown && isUpgradable;

  useEffect(() => {
    if (onTargetReleaseVersionChange) {
      onTargetReleaseVersionChange(canUpgrade ? nextVersion : '');
    }
  }, [onTargetReleaseVersionChange, canUpgrade, nextVersion]);

  const [versionModalVisible, setVersionModalVisible] = useState(false);

  const handleVersionClick = (
    e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
  ) => {
    e.preventDefault();

    setVersionModalVisible(true);
  };

  const handleVersionModalClose = () => {
    setVersionModalVisible(false);
  };

  const releaseComponents = useMemo(() => {
    if (!currentRelease) return undefined;

    return Object.values(reduceReleaseToComponents(currentRelease));
  }, [currentRelease]);

  const releaseNotesURL = currentRelease
    ? releasev1alpha1.getReleaseNotesURL(currentRelease)
    : undefined;

  const [targetVersion, setTargetVersion] = useState('');
  const targetRelease = useMemo(() => {
    if (!releaseList) return undefined;

    return releaseList.items.find(
      (v) => v.metadata.name.slice(1) === targetVersion
    );
  }, [releaseList, targetVersion]);

  const { status: clusterStatus, clusterUpdateSchedule } = useClusterStatus(
    cluster,
    providerCluster,
    releaseList?.items
  );

  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);

  const handleUpgradeModalClose = () => {
    setUpgradeModalVisible(false);

    /**
     * Reset target version only after modal closes,
     * to prevent flashes in the modal's content
     */
    setTimeout(() => {
      setTargetVersion('');
      // eslint-disable-next-line no-magic-numbers
    }, 200);
  };

  const handleUpgradeButtonClick = () => {
    if (!currentRelease || !nextVersion) return;

    setTargetVersion(nextVersion);
    setUpgradeModalVisible(true);
  };

  const handleUpgradeVersionSelect = (version: string) => {
    if (!currentRelease) return;

    handleVersionModalClose();
    setTargetVersion(version);
    setUpgradeModalVisible(true);
  };

  const upgradeCluster = async () => {
    if (!cluster) return;

    try {
      const updatedCluster =
        await clusterDetailUtils.updateClusterReleaseVersion(
          clientFactory(),
          auth,
          cluster.metadata.namespace!,
          cluster.metadata.name,
          targetVersion
        );

      mutate(
        capiv1beta1.getClusterKey(
          cluster.metadata.namespace!,
          cluster.metadata.name
        ),
        updatedCluster
      );

      mutate(
        capiv1beta1.getClusterListKey({
          namespace: cluster.metadata.namespace!,
        })
      );

      new FlashMessage(
        'Cluster upgrade initiated.',
        messageType.INFO,
        messageTTL.MEDIUM,
        (
          <>
            Keep an eye on <code>kubectl get nodes</code> to follow the upgrade
            progress.
          </>
        )
      );

      handleUpgradeModalClose();
    } catch (err) {
      const errorMessage = extractErrorMessage(err);

      new FlashMessage(
        'There was a problem initiating the cluster upgrade.',
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );

      ErrorReporter.getInstance().notify(err as Error);
    }
  };

  return (
    <ClusterDetailWidget title='Release' inline={true} {...props}>
      <Box direction='row' gap='xsmall' wrap={true} align='center'>
        <OptionalValue value={releaseVersion} replaceEmptyValue={false}>
          {(value) =>
            canListReleases ? (
              <Keyboard onSpace={handleVersionClick}>
                <StyledLink
                  href='#'
                  aria-label={`Cluster release version ${value}`}
                  onClick={handleVersionClick}
                >
                  <Text>
                    <i
                      className='fa fa-version-tag'
                      role='presentation'
                      aria-hidden='true'
                    />
                  </Text>{' '}
                  <VersionLabel>{value || <NotAvailable />}</VersionLabel>
                </StyledLink>
              </Keyboard>
            ) : (
              <Text aria-label={`Cluster release version ${value}`}>
                <i
                  className='fa fa-version-tag'
                  role='presentation'
                  aria-hidden='true'
                />{' '}
                {value || <NotAvailable />}
              </Text>
            )
          }
        </OptionalValue>
        <StyledDot />
        <OptionalValue value={k8sVersion} replaceEmptyValue={false}>
          {(value) => (
            <KubernetesVersionLabel
              hidePatchVersion={false}
              version={value}
              eolDate={getK8sVersionEOLDate(value) ?? undefined}
            />
          )}
        </OptionalValue>

        {(clusterStatus === ClusterStatus.UpgradeAvailable ||
          clusterStatus === ClusterStatus.UpgradeInProgress ||
          clusterStatus === ClusterStatus.UpgradeScheduled) && (
          <ClusterStatusComponent
            status={clusterStatus}
            clusterUpdateSchedule={clusterUpdateSchedule}
            margin={{ left: 'small' }}
          />
        )}
      </Box>

      {canUpgrade && (
        <Box
          direction='row'
          align='center'
          margin={{ top: 'small' }}
          gap='small'
        >
          <Button
            onClick={handleUpgradeButtonClick}
            unauthorized={!canUpdateCluster}
          >
            Upgrade cluster…
          </Button>
          {!canUpdateCluster && (
            <Text color='text-weak' size='small'>
              For upgrading this cluster, you need additional permissions.
              Please talk to your administrator.
            </Text>
          )}
        </Box>
      )}

      {releaseVersion && (
        <ClusterDetailReleaseDetailsModal
          version={releaseVersion}
          onClose={handleVersionModalClose}
          visible={versionModalVisible}
          creationDate={currentRelease?.metadata.creationTimestamp}
          components={releaseComponents}
          releaseNotesURL={releaseNotesURL}
          supportedUpgradeVersions={
            canUpgrade ? supportedUpgradeVersions : undefined
          }
          onUpgradeVersionSelect={handleUpgradeVersionSelect}
          canUpdateCluster={canUpdateCluster}
        />
      )}

      {currentRelease && targetRelease && (
        <ClusterDetailUpgradeModal
          visible={upgradeModalVisible}
          onClose={handleUpgradeModalClose}
          fromRelease={currentRelease}
          toRelease={targetRelease}
          onUpgrade={upgradeCluster}
        />
      )}
    </ClusterDetailWidget>
  );
};

export default ClusterDetailWidgetRelease;
