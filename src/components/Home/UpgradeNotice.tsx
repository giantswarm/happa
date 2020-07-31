import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { IState } from 'reducers/types';
import { selectCanClusterUpgrade } from 'selectors/clusterSelectors';

const UpgradeWrapperDiv = styled.div`
  display: inline-block;
  color: ${(props) => props.theme.colors.gold};
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
    color: ${(props) => props.theme.colors.yellow1};
    padding: 0 2px;
  }
`;

interface IUpgradeNoticeProps {
  canClusterUpgrade: boolean;
  clusterId: string;
  className?: string;
  onClick?: () => void;
}

// This component receive a cluster id, finds if this cluster is 'upgradable' and
// in case it is, outputs an upgrade notice,
function UpgradeNotice({
  canClusterUpgrade,
  onClick,
  className,
  clusterId,
}: IUpgradeNoticeProps) {
  if (!canClusterUpgrade) return null;

  return (
    <UpgradeWrapperDiv
      id={`upgrade-notice-${clusterId}`}
      className={className}
      onClick={onClick}
    >
      <i className='fa fa-warning' />
      <span>Upgrade Available</span>
    </UpgradeWrapperDiv>
  );
}

UpgradeNotice.propTypes = {
  clusterId: PropTypes.string.isRequired,
  canClusterUpgrade: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

function mapStateToProps(state: IState, props: IUpgradeNoticeProps) {
  return {
    canClusterUpgrade: selectCanClusterUpgrade(state, props.clusterId),
  };
}

export default connect(mapStateToProps)(UpgradeNotice);
