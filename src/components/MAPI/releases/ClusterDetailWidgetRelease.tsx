import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Keyboard, Text } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { useHttpClient } from 'lib/hooks/useHttpClient';
import { isClusterUpgradable, isClusterUpgrading } from 'MAPI/clusters/utils';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getProvider, getUserIsAdmin } from 'stores/main/selectors';
import styled from 'styled-components';
import { Dot } from 'styles';
import useSWR from 'swr';
import KubernetesVersionLabel from 'UI/Display/Cluster/KubernetesVersionLabel';
import ClusterDetailStatus from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailStatus';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';
import ClusterDetailWidgetOptionalValue from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidgetOptionalValue';
import NotAvailable from 'UI/Display/NotAvailable';

import ClusterDetailReleaseDetailsModal from './ClusterDetailReleaseDetailsModal';

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
  const releaseListClient = useHttpClient();
  const auth = useAuthProvider();

  const {
    data: releaseList,
    error: releaseListError,
  } = useSWR(releasev1alpha1.getReleaseListKey(), () =>
    releasev1alpha1.getReleaseList(releaseListClient, auth)
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

  const provider = useSelector(getProvider);
  const isAdmin = useSelector(getUserIsAdmin);

  const isDeleting =
    cluster && typeof cluster.metadata.deletionTimestamp !== 'undefined';
  const isUpgrading = cluster && isClusterUpgrading(cluster);
  const isUpgradable = useMemo(() => {
    if (!releaseList || !cluster) return false;

    return isClusterUpgradable(cluster, provider, isAdmin, releaseList.items);
  }, [cluster, provider, isAdmin, releaseList]);

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

    return [
      ...currentRelease.spec.components,
      ...(currentRelease.spec.apps ?? []),
    ];
  }, [currentRelease]);

  const releaseNotesURL = currentRelease
    ? releasev1alpha1.getReleaseNotesURL(currentRelease)
    : undefined;

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

      {cluster && (
        <ClusterDetailStatus
          isDeleting={isDeleting}
          isUpgrading={isUpgrading}
          isUpgradable={isUpgradable}
          margin={{ left: 'small' }}
        />
      )}

      {releaseVersion && (
        <ClusterDetailReleaseDetailsModal
          version={releaseVersion}
          onClose={handleVersionModalClose}
          visible={versionModalVisible}
          creationDate={currentRelease?.metadata.creationTimestamp}
          components={releaseComponents}
          releaseNotesURL={releaseNotesURL}
        />
      )}
    </ClusterDetailWidget>
  );
};

ClusterDetailWidgetRelease.propTypes = {
  cluster: PropTypes.object as PropTypes.Requireable<capiv1alpha3.ICluster>,
};

export default ClusterDetailWidgetRelease;
