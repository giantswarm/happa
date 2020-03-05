import styled from '@emotion/styled';
import { RELEASES_LOAD_REQUEST } from 'actions/actionTypes';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
  selectCanClusterUpgrade,
  selectLoadingFlagByAction,
} from 'selectors/clusterSelectors';
import LoadingOverlay from 'UI/LoadingOverlay';

const UpgradeWrapperDiv = styled.div`
  display: inline-block;
  color: ${props => props.theme.colors.gold};
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'inherit')};
  span {
    white-space: normal !important;
    display: unset;
    font-size: 16px;
    font-weight: 300;
    &:hover {
      text-decoration: ${({ onClick }) => {
        return onClick ? 'underline' : 'inherit';
      }};
    }
  }
  i {
    color: ${props => props.theme.colors.yellow1};
    padding: 0 2px;
  }
`;

// This component receive a cluster id, finds if this cluster is 'upgradable' and
// in case it is, outputs an upgrade notice,
function UpgradeNotice({
  canClusterUpgrade,
  loadingReleases,
  showUpgradeModal,
}) {
  if (!canClusterUpgrade) return null;

  return (
    <LoadingOverlay loading={loadingReleases}>
      <UpgradeWrapperDiv onClick={showUpgradeModal ? showUpgradeModal : null}>
        <i className='fa fa-warning' />
        <span>Upgrade Available</span>
      </UpgradeWrapperDiv>
    </LoadingOverlay>
  );
}

UpgradeNotice.propTypes = {
  clusterId: PropTypes.string,
  canClusterUpgrade: PropTypes.bool,
  loadingReleases: PropTypes.bool,
  showUpgradeModal: PropTypes.func,
};

function mapStateToProps(state, props) {
  return {
    canClusterUpgrade: selectCanClusterUpgrade(state, props.clusterId),
    loadingReleases: selectLoadingFlagByAction(state, RELEASES_LOAD_REQUEST),
  };
}

export default connect(mapStateToProps)(UpgradeNotice);
