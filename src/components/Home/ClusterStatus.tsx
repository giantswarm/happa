import styled from '@emotion/styled';
import { useTheme } from 'emotion-theming';
import PropTypes from 'prop-types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import { useSelector } from 'react-redux';
import { CLUSTER_LOAD_STATUS_REQUEST } from 'stores/cluster/constants';
import {
  selectCanClusterUpgrade,
  selectIsClusterAwaitingUpgrade,
} from 'stores/cluster/selectors';
import {
  isClusterCreating,
  isClusterDeleting,
  isClusterUpdating,
} from 'stores/cluster/utils';
import { selectLoadingFlagByIdAndAction } from 'stores/entityloading/selectors';
import { IState } from 'stores/state';
import { ITheme } from 'styles';

const Wrapper = styled.div<{
  disabled: boolean;
  isHyperlink: boolean;
  color: string;
}>`
  display: inline-block;
  color: ${({ color }) => color};
  opacity: ${({ theme, disabled }) => disabled && theme.disabledOpacity};
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
  const theme = useTheme<ITheme>();

  const canClusterUpgrade = useSelector(selectCanClusterUpgrade(clusterId));
  const isStatusLoading = useSelector<IState, boolean>((state) =>
    selectLoadingFlagByIdAndAction(
      state,
      clusterId,
      CLUSTER_LOAD_STATUS_REQUEST
    )
  );
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
      return null;

    case typeof cluster.delete_date !== 'undefined':
      return null;

    case cluster.delete_date === null:
      return null;

    case isClusterDeleting(cluster):
      return null;

    case canClusterUpgrade:
      iconClassName = 'fa fa-warning';
      message = 'Upgrade Available';
      isButtonDisabled = typeof onClick === 'undefined';
      tooltip = `There's a new release version available. Upgrade now to get the latest features.`;
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

    case isStatusLoading:
      iconClassName = 'fa fa-ellipsis-h';
      message = 'Cluster status is loading';
      isButtonDisabled = typeof onClick === 'undefined';
      tooltip = `The status of this cluster is being loaded.`;
      break;

    case isClusterCreating(cluster):
      color = theme.colors.gray;
      iconClassName = 'fa fa-change-in-progress';
      message = 'Cluster creating…';
      tooltip =
        'The cluster is currently creating. This step usually takes about 30 minutes.';
      break;

    default:
      return null;
  }

  const handleClick = () => {
    if (isButtonDisabled) return;

    onClick?.();
  };

  return (
    <OverlayTrigger
      overlay={<Tooltip id='tooltip'>{tooltip}</Tooltip>}
      placement='top'
    >
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
    </OverlayTrigger>
  );
};

ClusterStatus.propTypes = {
  clusterId: PropTypes.string.isRequired,
  hideText: PropTypes.bool,
  onClick: PropTypes.func,
};

export default ClusterStatus;
