import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
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
  className: string;
  clusterId: string;
  onClick?: () => void;
}

// This component receive a cluster id, finds if this cluster is 'upgradable' and
// in case it is, outputs an upgrade notice,
function UpgradeNotice({
  canClusterUpgrade,
  onClick,
  className,
}: IUpgradeNoticeProps) {
  if (!canClusterUpgrade) return null;

  return (
    <UpgradeWrapperDiv
      className={className}
      onClick={onClick ? onClick : undefined}
    >
      <i className='fa fa-warning' />
      <span>Upgrade Available</span>
    </UpgradeWrapperDiv>
  );
}

UpgradeNotice.propTypes = {
  clusterId: PropTypes.string,
  canClusterUpgrade: PropTypes.bool,
  loadingReleases: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

function mapStateToProps(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: Record<string, any>,
  props: IUpgradeNoticeProps
) {
  return {
    canClusterUpgrade: selectCanClusterUpgrade(state, props.clusterId),
  };
}

// @ts-ignore
export default connect(mapStateToProps)(UpgradeNotice);
