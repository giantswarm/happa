import styled from '@emotion/styled';
import { relativeDate } from 'lib/helpers.js';
import ReleaseDetailsModal from 'Modals/ReleaseDetailsModal';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import { Code, Dot } from 'styles';
import RefreshableLabel from 'UI/RefreshableLabel';

import { Upgrade } from './V5ClusterDetailTable';

const ReleaseDetail = styled.span`
  text-decoration: underline;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.white2};

  &:hover {
    color: ${({ theme }) => theme.colors.white1};
  }
`;

const showReleaseDetailsModal = modalRef => () => {
  const { current: modalElement } = modalRef;

  if (modalElement) modalElement.show();
};

// Versions data and icons at the top of cluster details view.
function RegionAndVersions({
  createDate,
  releaseVersion,
  release,
  k8sVersion,
  canUpgrade,
  showUpgradeModal,
  region,
}) {
  const releaseDetailsModal = useRef(null);
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
        <span>
          <RefreshableLabel value={releaseVersion ? releaseVersion : 'n/a'}>
            <>
              <Dot style={{ paddingRight: 0 }} />
              <ReleaseDetail onClick={onReleaseDetailClick}>
                <i className='fa fa-version-tag' />
                {releaseVersion ? releaseVersion : 'n/a'}
              </ReleaseDetail>
            </>
          </RefreshableLabel>
        </span>
        <ReleaseDetail onClick={onReleaseDetailClick}>
          {release && (
            <>
              <Dot />
              <i className='fa fa-kubernetes' />
              {(() => {
                const kubernetes = release.components.find(
                  component => component.name === 'kubernetes'
                );
                if (kubernetes) return kubernetes.version;

                return null;
              })()}
            </>
          )}
          {!release &&
            k8sVersion !== '' &&
            typeof k8sVersion !== 'undefined' &&
            <i className='fa fa-kubernetes' /> + k8sVersion}
        </ReleaseDetail>
      </div>
      {canUpgrade && (
        <a className='upgrade-available' onClick={showUpgradeModal}>
          <Upgrade>
            <span>
              <i className='fa fa-warning' />
              Upgrade available
            </span>
          </Upgrade>
        </a>
      )}
      {release && (
        <ReleaseDetailsModal ref={releaseDetailsModal} releases={[release]} />
      )}
    </>
  );
}

RegionAndVersions.propTypes = {
  createDate: PropTypes.string,
  releaseVersion: PropTypes.string,
  release: PropTypes.object,
  k8sVersion: PropTypes.string,
  canUpgrade: PropTypes.bool,
  showUpgradeModal: PropTypes.func,
  region: PropTypes.string,
};

export default RegionAndVersions;
