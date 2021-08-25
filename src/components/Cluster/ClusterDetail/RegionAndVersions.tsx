import ClusterStatus from 'Home/ClusterStatus';
import { relativeDate } from 'lib/helpers';
import ReleaseDetailsModal from 'Modals/ReleaseDetailsModal/ReleaseDetailsModal';
import React, { FC, RefObject, useRef } from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import styled from 'styled-components';
import { Code, Dot } from 'styles';
import KubernetesVersionLabel from 'UI/Display/Cluster/KubernetesVersionLabel';
import NotAvailable from 'UI/Display/NotAvailable';
import RefreshableLabel from 'UI/Display/RefreshableLabel';

interface IRegionAndVersionsProps {
  clusterId: string;
  isAdmin: boolean;
  releases: IReleases;
  provider: PropertiesOf<typeof Providers>;
  showUpgradeModal: () => void;
  setUpgradeVersion: (newVersion: string) => void;
  createDate?: string;
  region?: string;
  release?: IRelease;
  k8sVersionEOLDate?: string;
}

const ReleaseDetail = styled.span`
  text-decoration: underline;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.white2};

  &:hover {
    color: ${({ theme }) => theme.colors.white1};
  }
`;

const showReleaseDetailsModal = (
  modalRef: RefObject<ReleaseDetailsModal>
) => () => {
  const { current: modalElement } = modalRef;

  if (modalElement) modalElement.show();
};

// Versions data and icons at the top of cluster details view.
const RegionAndVersions: FC<IRegionAndVersionsProps> = ({
  clusterId,
  createDate,
  region,
  release,
  showUpgradeModal,
  setUpgradeVersion,
  isAdmin,
  releases,
  provider,
}) => {
  const releaseDetailsModal = useRef<ReleaseDetailsModal | null>(null);
  const onReleaseDetailClick = showReleaseDetailsModal(releaseDetailsModal);

  return (
    <>
      {region && (
        <OverlayTrigger
          overlay={<Tooltip id='tooltip'>Region</Tooltip>}
          placement='top'
        >
          <Code>{region}</Code>
        </OverlayTrigger>
      )}
      <div>
        <span>
          Created {createDate ? relativeDate(createDate) : <NotAvailable />}
        </span>
        {release && (
          <>
            <span>
              <RefreshableLabel value={release.version}>
                <Dot style={{ paddingRight: 0 }} />
                <ReleaseDetail onClick={onReleaseDetailClick}>
                  <i className='fa fa-version-tag' />
                  {release.version}
                </ReleaseDetail>
              </RefreshableLabel>
            </span>
            <Dot />
            <RefreshableLabel value={release?.kubernetesVersion}>
              <KubernetesVersionLabel
                version={release?.kubernetesVersion}
                hidePatchVersion={false}
                eolDate={release?.k8sVersionEOLDate}
              />
            </RefreshableLabel>
          </>
        )}
      </div>
      <ClusterStatus clusterId={clusterId} onClick={showUpgradeModal} />

      {release && (
        <ReleaseDetailsModal
          ref={releaseDetailsModal}
          release={release}
          isAdmin={isAdmin}
          releases={releases}
          provider={provider}
          showUpgradeModal={showUpgradeModal}
          setUpgradeVersion={setUpgradeVersion}
        />
      )}
    </>
  );
};

export default RegionAndVersions;
