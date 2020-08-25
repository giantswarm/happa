import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
import {
  selectCanClusterUpgrade,
  selectIsClusterUpgrading,
} from 'selectors/clusterSelectors';

const Wrapper = styled.div<{
  disabled: boolean;
  isHyperlink: boolean;
}>`
  display: inline-block;
  color: ${({ theme }) => theme.colors.yellow1};
  opacity: ${({ theme, disabled }) => disabled && theme.disabledOpacity};
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

interface IUpgradeNoticeProps extends React.ComponentPropsWithoutRef<'div'> {
  clusterId: string;
  onClick?: () => void;
}

// This component receive a cluster id, finds if this cluster is 'upgradable' and
// in case it is, outputs an upgrade notice,
const ClusterStatus: React.FC<IUpgradeNoticeProps> = ({
  clusterId,
  onClick,
  ...rest
}) => {
  const canClusterUpgrade = useSelector(selectCanClusterUpgrade(clusterId));
  const isClusterUpgrading = useSelector(selectIsClusterUpgrading(clusterId));

  if (!canClusterUpgrade && !isClusterUpgrading) return null;

  const handleUpgrade = () => {
    if (isClusterUpgrading) return;

    onClick?.();
  };

  const iconClassName = isClusterUpgrading
    ? 'fa fa-version-upgrade'
    : 'fa fa-warning';
  const message = isClusterUpgrading
    ? 'Upgrade in progress…'
    : 'Upgrade Available';

  return (
    <Wrapper
      {...rest}
      onClick={handleUpgrade}
      disabled={isClusterUpgrading}
      isHyperlink={Boolean(onClick) && !isClusterUpgrading}
    >
      <i className={iconClassName} />
      <span>{message}</span>
    </Wrapper>
  );
};

ClusterStatus.propTypes = {
  clusterId: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

export default ClusterStatus;
