import {
  selectCanClusterUpgrade,
  selectIsClusterAwaitingUpgrade,
} from 'model/stores/cluster/selectors';
import {
  isClusterCreating,
  isClusterDeleting,
  isClusterUpdating,
} from 'model/stores/cluster/utils';
import { IState } from 'model/stores/state';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import theme from 'styles/theme';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

const Wrapper = styled.div<{
  disabled: boolean;
  isHyperlink: boolean;
  color: string;
}>`
  display: inline-block;
  color: ${({ color }) => color};
  opacity: ${(props) => props.disabled && props.theme.disabledOpacity};
  cursor: ${({ isHyperlink }) => isHyperlink && 'pointer'};

  span {
    white-space: normal !important;
    font-size: 16px;
    font-weight: 300;

    &:hover {
      text-decoration: ${({ isHyperlink }) => isHyperlink && 'underline'};
    }
  }

  i {
    color: ${({ color }) => color};
    padding: 0 2px;
  }
`;

interface IClusterStatusProps extends React.ComponentPropsWithoutRef<'div'> {
  clusterId: string;
  hideText?: boolean;
  onClick?: () => void;
}

// This component receive a cluster id, finds if this cluster is 'upgradable' and
// in case it is, outputs an upgrade notice,
const ClusterStatus: React.FC<IClusterStatusProps> = ({
  clusterId,
  hideText,
  onClick,
  ...rest
}) => {
  const canClusterUpgrade = useSelector(selectCanClusterUpgrade(clusterId));
  const isClusterAwaitingUpgrade = useSelector(
    selectIsClusterAwaitingUpgrade(clusterId)
  );
  const cluster = useSelector<IState, Cluster>(
    (state) => state.entities.clusters.items[clusterId]
  );

  let color = theme.colors.yellow1;
  let isButtonDisabled = true;
  let iconClassName = '';
  let message = '';
  let tooltip = '';
  switch (true) {
    case typeof cluster === 'undefined':
    case typeof cluster.delete_date !== 'undefined':
    case cluster.delete_date === null:
    case isClusterDeleting(cluster):
      return null;

    case canClusterUpgrade:
      iconClassName = 'fa fa-warning';
      message = 'Upgrade Available';
      isButtonDisabled = typeof onClick === 'undefined';
      tooltip = `There's a new release version available. Upgrade now to get the latest features.`;
      break;

    case isClusterCreating(cluster):
      color = theme.colors.gray;
      iconClassName = 'fa fa-change-in-progress';
      message = 'Cluster creating…';
      tooltip =
        'The cluster is currently creating. This step usually takes about 30 minutes.';
      break;

    case isClusterUpdating(cluster):
      iconClassName = 'fa fa-version-upgrade';
      message = 'Upgrade in progress…';
      tooltip =
        'The cluster is currently upgrading. This step usually takes about 30 minutes.';
      break;

    case isClusterAwaitingUpgrade:
      iconClassName = 'fa fa-version-upgrade';
      message = 'Awaiting upgrade…';
      tooltip = 'The cluster is about to start an upgrade.';
      break;

    default:
      return null;
  }

  const handleClick = () => {
    if (isButtonDisabled) return;

    onClick?.();
  };

  return (
    <TooltipContainer content={<Tooltip>{tooltip}</Tooltip>}>
      <Wrapper
        {...rest}
        onClick={handleClick}
        disabled={isButtonDisabled}
        isHyperlink={Boolean(onClick) && !isButtonDisabled}
        color={color}
        aria-label={message}
        role='document'
      >
        <i className={iconClassName} role='presentation' aria-hidden='true' />

        {!hideText && <span>{message}</span>}
      </Wrapper>
    </TooltipContainer>
  );
};

export default ClusterStatus;
