import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Keyboard, Text } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import * as clusterDetailUtils from 'MAPI/clusters/ClusterDetail/utils';
import { isClusterCreating, isClusterUpgrading } from 'MAPI/clusters/utils';
import {
  getSupportedUpgradeVersions,
  reduceReleaseToComponents,
} from 'MAPI/releases/utils';
import { extractErrorMessage } from 'MAPI/utils';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { getUserIsAdmin } from 'stores/main/selectors';
import styled from 'styled-components';
import { Dot } from 'styles';
import useSWR, { mutate } from 'swr';
import Button from 'UI/Controls/Button';
import KubernetesVersionLabel from 'UI/Display/Cluster/KubernetesVersionLabel';
import ClusterDetailStatus from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailStatus';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';
import * as ui from 'UI/Display/MAPI/releases/types';
import NotAvailable from 'UI/Display/NotAvailable';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';

import ClusterDetailReleaseDetailsModal from './ClusterDetailReleaseDetailsModal';
import ClusterDetailUpgradeModal from './ClusterDetailUpgradeModal';

const StyledDot = styled(Dot)`
  padding: 0;
`;

const VersionLabel = styled(Text)``;

const StyledLink = styled.a`
  :hover {
    text-decoration: none;

    ${VersionLabel} {
      border-bottom: ${({ theme }) =>
        `${theme.global.borderSize.xsmall} solid ${theme.global.colors['text-strong'].dark}`};
    }
  }

  ${VersionLabel} {
    border-bottom: ${({ theme }) =>
      `${theme.global.borderSize.xsmall} solid ${theme.global.colors['text-xweak'].dark}`};
  }
`;

interface IClusterDetailWidgetReleaseProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
    'title'
  > {
  cluster?: capiv1alpha3.ICluster;
}

const ClusterDetailWidgetRelease: React.FC<IClusterDetailWidgetReleaseProps> = ({
  cluster,
  ...props
}) => {
  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const releaseListClient = useRef(clientFactory());
  const {
    data: releaseList,
    error: releaseListError,
  } = useSWR(releasev1alpha1.getReleaseListKey(), () =>
    releasev1alpha1.getReleaseList(releaseListClient.current, auth)
  );

  useEffect(() => {
    if (releaseListError) {
      ErrorReporter.getInstance().notify(releaseListError);
    }
  }, [releaseListError]);

  const releaseVersion = cluster
    ? capiv1alpha3.getReleaseVersion(cluster)
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
    if (!releaseList) return undefined;
    if (!currentRelease) return '';

    const version = releasev1alpha1.getK8sVersion(currentRelease);
    if (!version) return '';

    return version;
  }, [releaseList, currentRelease]);

  const provider = window.config.info.general.provider;
  const isAdmin = useSelector(getUserIsAdmin);

  const supportedUpgradeVersions: ui.IReleaseVersion[] = useMemo(() => {
    if (!releaseList || !releaseVersion) return [];

    return getSupportedUpgradeVersions(
      releaseVersion,
      provider,
      isAdmin,
      releaseList.items
    );
  }, [isAdmin, provider, releaseList, releaseVersion]);

  const nextVersion = useMemo(() => {
    return supportedUpgradeVersions.find(
      (r) => r.status !== ui.ReleaseVersionStatus.PreRelease
    )?.version;
  }, [supportedUpgradeVersions]);

  const isDeleting =
    cluster && typeof cluster.metadata.deletionTimestamp !== 'undefined';
  const isUpgrading = cluster && isClusterUpgrading(cluster);
  const isUpgradable = typeof nextVersion !== 'undefined';
  const isCreating =
    cluster &&
    (isClusterCreating(cluster) || typeof cluster.status === 'undefined');

  const canUpgrade = !isUpgrading && !isCreating && isUpgradable;

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
      const updatedCluster = await clusterDetailUtils.updateClusterReleaseVersion(
        clientFactory(),
        auth,
        cluster.metadata.namespace!,
        cluster.metadata.name,
        targetVersion
      );

      mutate(
        capiv1alpha3.getClusterKey(
          cluster.metadata.namespace!,
          cluster.metadata.name
        ),
        updatedCluster
      );

      mutate(
        capiv1alpha3.getClusterListKey({
          namespace: cluster.metadata.namespace!,
        })
      );

      new FlashMessage(
        'Cluster upgrade initiated.',
        messageType.INFO,
        messageTTL.MEDIUM,
        'Keep an eye on <code>kubectl get nodes</code> to follow the upgrade progress.'
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
          {(value) => (
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
          )}
        </OptionalValue>
        <StyledDot />
        <OptionalValue value={k8sVersion} replaceEmptyValue={false}>
          {(value) => (
            <KubernetesVersionLabel
              hidePatchVersion={false}
              version={value as string}
            />
          )}
        </OptionalValue>

        {cluster && (
          <ClusterDetailStatus
            isCreating={isCreating}
            isDeleting={isDeleting}
            isUpgrading={isUpgrading}
            isUpgradable={isUpgradable}
            margin={{ left: 'small' }}
          />
        )}
      </Box>

      {canUpgrade && (
        <Box margin={{ top: 'small' }}>
          <Button onClick={handleUpgradeButtonClick}>Upgrade cluster…</Button>
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
