import { Dot } from 'styles';
import { relativeDate } from 'lib/helpers.js';
import { Upgrade } from './cluster_detail_node_pools_table';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import RefreshableLabel from 'UI/refreshable_label';
import ReleaseDetailsModal from 'modals/release_details_modal';

const Versions = ({
  createDate,
  releaseVersion,
  release,
  k8sVersion,
  canUpgrade,
  showUpgradeModal,
}) => {
  const releaseDetailsModal = useRef(null);

  return (
    <>
      <div>
        <span>Created {createDate ? relativeDate(createDate) : 'n/a'}</span>
        <span>
          <RefreshableLabel dataItems={[releaseVersion]}>
            <>
              <Dot style={{ paddingRight: 0 }} />
              <i className='fa fa-version-tag' />
              <span
                className='pointer'
                onClick={() => releaseDetailsModal.current.show()}
              >
                {releaseVersion ? releaseVersion : 'n/a'}
              </span>
            </>
          </RefreshableLabel>
        </span>
        <span
          className='pointer'
          onClick={() => releaseDetailsModal.current.show()}
        >
          {release && (
            <>
              <Dot />
              <i className='fa fa-kubernetes' />
              {(() => {
                var kubernetes = release.components.find(
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
        </span>
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
};

Versions.propTypes = {
  createDate: PropTypes.string,
  releaseVersion: PropTypes.string,
  release: PropTypes.object,
  k8sVersion: PropTypes.string,
  canUpgrade: PropTypes.bool,
  showUpgradeModal: PropTypes.func,
};

export default Versions;
