import styled from '@emotion/styled';
import { RELEASES_LOAD_REQUEST } from 'actions/actionTypes';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
  selectCanClusterUpgrade,
  selectLoadingFlagByAction,
} from 'selectors/clusterSelectors';
import { UpgradeNoticeStyles } from 'styles';
import LoadingOverlay from 'UI/LoadingOverlay';

const UpgradeWrapperDiv = styled.div`
  display: inline-block;
  ${UpgradeNoticeStyles({ textDecoration: 'none' })}
`;

// This component receiveis a cluster id, finds if this cluster is 'upgradable' and
// in case it is, outputs an uograde notice,
function UpgradeNotice({ canClusterUpgrade, loadingReleases }) {
  if (!canClusterUpgrade) return null;

  return (
    <LoadingOverlay loading={loadingReleases}>
      <UpgradeWrapperDiv>
        <span>Upgrade Available</span>
      </UpgradeWrapperDiv>
    </LoadingOverlay>
  );
}

UpgradeNotice.propTypes = {
  clusterId: PropTypes.string,
  canClusterUpgrade: PropTypes.bool,
  loadingReleases: PropTypes.bool,
};

function mapStateToProps(state, props) {
  return {
    canClusterUpgrade: selectCanClusterUpgrade(state, props.clusterId),
    loadingReleases: selectLoadingFlagByAction(state, RELEASES_LOAD_REQUEST),
  };
}

export default connect(mapStateToProps)(UpgradeNotice);
