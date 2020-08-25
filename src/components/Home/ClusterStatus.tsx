import styled from '@emotion/styled';
import { useTheme } from 'emotion-theming';
import PropTypes from 'prop-types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import { useSelector } from 'react-redux';
import { IState } from 'reducers/types';
import { selectCanClusterUpgrade } from 'selectors/clusterSelectors';
import { ITheme } from 'styles';
import {
  isClusterCreating,
  isClusterDeleting,
  isClusterUpdating,
} from 'utils/clusterUtils';

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

interface IUpgradeNoticeProps extends React.ComponentPropsWithoutRef<'div'> {
  clusterId: string;
  hideText?: boolean;
  onClick?: () => void;
}

// This component receive a cluster id, finds if this cluster is 'upgradable' and
// in case it is, outputs an upgrade notice,
const ClusterStatus: React.FC<IUpgradeNoticeProps> = ({
  clusterId,
  hideText,
  onClick,
  ...rest
}) => {
  const theme = useTheme<ITheme>();

  const canClusterUpgrade = useSelector(selectCanClusterUpgrade(clusterId));
  const cluster = useSelector<IState, Record<string, unknown> | undefined>(
    (state) => state.entities.clusters.items[clusterId]
  );

  let color = theme.colors.yellow1;
  let isButtonDisabled = true;
  let iconClassName = '';
  let message = '';
  let tooltip = '';
  switch (true) {
    case typeof cluster === 'undefined':
    case typeof (cluster as Record<string, unknown>).delete_date !==
      'undefined':
    case isClusterDeleting(cluster as Record<string, unknown>):
      return null;

    case isClusterCreating(cluster as Record<string, unknown>):
      color = theme.colors.gray;
      iconClassName = 'fa fa-crane';
      message = 'Cluster creating…';
      tooltip =
        'The cluster is currently creating. This step usually takes about 30 minutes.';

      break;

    case isClusterUpdating(cluster as Record<string, unknown>):
      iconClassName = 'fa fa-version-upgrade';
      message = 'Upgrade in progress…';
      tooltip =
        'The cluster is currently upgrading. This step usually takes about 30 minutes.';
      break;

    case canClusterUpgrade:
      iconClassName = 'fa fa-warning';
      message = 'Upgrade Available';
      isButtonDisabled = false;
      tooltip = `There's a new release version available. Upgrade now to get the latest features.`;
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
      >
        <i className={iconClassName} />

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
