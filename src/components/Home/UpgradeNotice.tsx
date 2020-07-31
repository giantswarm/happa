import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { IState } from 'reducers/types';
import {
  selectCanClusterUpgrade,
  selectIsClusterUpgrading,
} from 'selectors/clusterSelectors';

const labelDisabledOpacity = 0.7;
const UpgradeWrapperDiv = styled.div<{
  disabled: boolean;
  isHyperlink: boolean;
}>`
  display: inline-block;
  color: ${({ theme }) => theme.colors.yellow1};
  opacity: ${({ disabled }) => disabled && labelDisabledOpacity};
  cursor: ${({ isHyperlink }) => isHyperlink && 'pointer'};

  span {
    white-space: normal !important;
    display: unset;
    font-size: 16px;
    font-weight: 300;

    &:hover {
      text-decoration: ${({ isHyperlink }) => isHyperlink && 'underline'};
    }
  }

  i {
    color: ${({ theme }) => theme.colors.yellow1};
    padding: 0 2px;
  }
`;

interface IUpgradeNoticeProps {
  canClusterUpgrade: boolean;
  isClusterUpgrading: boolean;
  clusterId: string;
  className?: string;
  onClick?: () => void;
}

// This component receive a cluster id, finds if this cluster is 'upgradable' and
// in case it is, outputs an upgrade notice,
function UpgradeNotice({
  canClusterUpgrade,
  isClusterUpgrading,
  clusterId,
  className,
  onClick,
}: IUpgradeNoticeProps) {
  if (!canClusterUpgrade && !isClusterUpgrading) return null;

  const handleUpgrade = () => {
    if (isClusterUpgrading) return;

    // eslint-disable-next-line no-unused-expressions
    onClick?.();
  };

  const iconClassName = isClusterUpgrading
    ? 'fa fa-version-upgrade'
    : 'fa fa-warning';
  const message = isClusterUpgrading
    ? 'Upgrade in progress…'
    : 'Upgrade Available';

  return (
    <UpgradeWrapperDiv
      id={`upgrade-notice-${clusterId}`}
      className={className}
      onClick={handleUpgrade}
      disabled={isClusterUpgrading}
      isHyperlink={Boolean(onClick) && !isClusterUpgrading}
    >
      <i className={iconClassName} />
      <span>{message}</span>
    </UpgradeWrapperDiv>
  );
}

UpgradeNotice.propTypes = {
  clusterId: PropTypes.string.isRequired,
  canClusterUpgrade: PropTypes.bool.isRequired,
  isClusterUpgrading: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

function mapStateToProps(state: IState, props: IUpgradeNoticeProps) {
  const { clusterId } = props;

  return {
    canClusterUpgrade: selectCanClusterUpgrade(state, clusterId),
    isClusterUpgrading: selectIsClusterUpgrading(state, clusterId),
  };
}

export default connect(mapStateToProps)(UpgradeNotice);
