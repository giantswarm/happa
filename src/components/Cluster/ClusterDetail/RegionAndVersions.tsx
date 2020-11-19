import styled from '@emotion/styled';
import ClusterStatus from 'Home/ClusterStatus';
import { relativeDate } from 'lib/helpers';
import ReleaseDetailsModal from 'Modals/ReleaseDetailsModal/ReleaseDetailsModal';
import PropTypes from 'prop-types';
import React, { FC, RefObject, useRef } from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import { Code, Dot } from 'styles';
import KubernetesVersionLabel from 'UI/KubernetesVersionLabel';
import RefreshableLabel from 'UI/RefreshableLabel';

interface IRegionAndVersionsProps {
  clusterId: string;
  createDate?: string;
  region?: string;
  release?: IRelease;
  k8sVersionEOLDate?: string;
  showUpgradeModal?(): void;
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
        <span>Created {createDate ? relativeDate(createDate) : 'n/a'}</span>
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
      {showUpgradeModal && (
        <ClusterStatus clusterId={clusterId} onClick={showUpgradeModal} />
      )}
      {release && (
        <ReleaseDetailsModal ref={releaseDetailsModal} release={release} />
      )}
    </>
  );
};

RegionAndVersions.propTypes = {
  clusterId: PropTypes.string.isRequired,
  createDate: PropTypes.string,
  region: PropTypes.string,
  // @ts-expect-error
  release: PropTypes.shape({
    active: PropTypes.bool.isRequired,
    changelog: PropTypes.arrayOf(
      PropTypes.shape({
        component: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
      }).isRequired
    ).isRequired,
    components: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        version: PropTypes.string.isRequired,
      }).isRequired
    ).isRequired,
    timestamp: PropTypes.string.isRequired,
    version: PropTypes.string.isRequired,
    kubernetesVersion: PropTypes.string,
    k8sVersionEOLDate: PropTypes.string,
    releaseNotesURL: PropTypes.string,
  }),
  showUpgradeModal: PropTypes.func,
};

export default RegionAndVersions;
