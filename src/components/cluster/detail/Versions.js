import { Dot } from 'styles';
import { relativeDate } from 'lib/helpers.js';
import { Upgrade } from './cluster_detail_node_pools_table';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import RefreshableLabel from 'UI/refreshable_label';
import ReleaseDetailsModal from 'modals/release_details_modal';
import styled from '@emotion/styled';

const ReleaseDetail = styled.span`
  text-decoration: underline;

  &:hover {
    opacity: 0.7;
  }
`;

// Versions data and icons at the top of cluster details view.
function Versions({
  createDate,
  releaseVersion,
  release,
  k8sVersion,
  canUpgrade,
  showUpgradeModal,
}) {
  const releaseDetailsModal = useRef(null);

  return (
    <>
      <div>
        <span>Created {createDate ? relativeDate(createDate) : 'n/a'}</span>
        <span>
          <RefreshableLabel dataItems={[releaseVersion]}>
            <>
              <Dot style={{ paddingRight: 0 }} />
              <ReleaseDetail
                className='pointer'
                onClick={() => releaseDetailsModal.current.show()}
              >
                <i className='fa fa-version-tag' />
                {releaseVersion ? releaseVersion : 'n/a'}
              </ReleaseDetail>
            </>
          </RefreshableLabel>
        </span>
        <ReleaseDetail
          className='pointer'
          onClick={() => releaseDetailsModal.current.show()}
        >
          {release && (
            <>
              <Dot />
              <i className='fa fa-kubernetes' />
              {(() => {
                const kubernetes = release.components.find(
                  component => component.name === 'kubernetes'
                );
                if (kubernetes) return kubernetes.version;
              })()}
            </>
          )}
          {!release &&
            k8sVersion !== '' &&
            k8sVersion !== undefined &&
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

Versions.propTypes = {
  createDate: PropTypes.string,
  releaseVersion: PropTypes.string,
  release: PropTypes.object,
  k8sVersion: PropTypes.string,
  canUpgrade: PropTypes.bool,
  showUpgradeModal: PropTypes.func,
};

export default Versions;
