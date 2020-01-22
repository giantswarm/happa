import { css } from '@emotion/core';
import styled from '@emotion/styled';
import * as clusterActions from 'actions/clusterActions';
import { push } from 'connected-react-router';
import { relativeDate } from 'lib/helpers.js';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { Dot } from 'styles';
import Button from 'UI/Button';
import ClusterIDLabel from 'UI/ClusterIDLabel';
import RefreshableLabel from 'UI/RefreshableLabel';
import { clusterNodePools } from 'utils/clusterUtils';

import ClusterDashboardResources from './ClusterDashboardResources';

const WrapperStyles = props => css`
  display: flex;
  background-color: ${props.theme.colors.darkBlueLighter1};
  border-radius: 5px;
  border: 0px;
  min-height: 20px;
  padding: 19px;
  margin-bottom: 20px;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);
`;

const Wrapper = styled.div`
  ${WrapperStyles};
`;

const WrapperDeleted = styled.div`
  ${WrapperStyles};
  background-color: ${props => props.theme.colors.darkBlueDarker1};
`;

const LabelWrapper = styled.div`
  flex: 0 0 90px;
  font-size: 1.2em;
`;

const ContentWrapper = styled.div`
  flex: 1;
  padding-right: 15px;
`;

const TitleWrapper = styled.div`
  font-size: 1.2em;
  z-index: 120;
  position: relative;
`;

const NameWrapper = styled.span`
  font-weight: 700;
`;

const ButtonsWrapper = styled.div`
  text-align: right;
  flex: 0 0 210px;
`;

const DeleteDateWrapper = styled.div`
  color: ${props => props.theme.colors.darkBlueLighter5};
`;

class ClusterDashboardItem extends React.Component {
  state = {
    // eslint-disable-next-line react/no-unused-state
    enforceReRender: null,
    nodePools: [],
  };

  componentDidMount() {
    this.registerReRenderInterval();

    if (this.props.isNodePool) {
      this.setClusterNodePools();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isNodePool && prevProps.nodePools !== this.props.nodePools) {
      this.setClusterNodePools();
    }
  }

  componentWillUnmount() {
    window.clearInterval(this.reRenderInterval);
  }

  setClusterNodePools = () => {
    const { cluster, nodePools } = this.props;
    const nodePoolsData = clusterNodePools(nodePools, cluster);
    this.setState({ nodePools: nodePoolsData });
  };

  /**
   * Activates periodic re-rendering to keep displayed info, like relative
   * dates, fresh.
   */
  registerReRenderInterval = () => {
    // eslint-disable-next-line no-magic-numbers
    const refreshInterval = 10 * 1000; // 10 seconds
    this.reRenderInterval = window.setInterval(() => {
      // enforce re-rendering by state change
      // eslint-disable-next-line react/no-unused-state
      this.setState({ enforceReRender: Date.now() });
    }, refreshInterval);
  };

  /**
   * Returns true if the cluster is younger than 30 days
   */
  clusterYoungerThan30Days() {
    const age = Math.abs(
      moment(this.props.cluster.create_date)
        .utc()
        // eslint-disable-next-line no-magic-numbers
        .diff(moment().utc()) / 1000
    );

    // eslint-disable-next-line no-magic-numbers
    return age < 30 * 24 * 60 * 60;
  }

  accessCluster = () => {
    const { id, owner } = this.props.cluster;

    this.props.dispatch(
      push(`/organizations/${owner}/clusters/${id}/getting-started/`)
    );
  };

  render() {
    const { cluster, isNodePool, selectedOrganization } = this.props;
    const { nodePools } = this.state;

    const linkToCluster = `/organizations/${selectedOrganization}/clusters/${cluster.id}`;

    if (cluster.delete_date) {
      return (
        <WrapperDeleted>
          <LabelWrapper>
            <ClusterIDLabel clusterID={cluster.id} copyEnabled />
          </LabelWrapper>

          <ContentWrapper>
            <TitleWrapper>
              <NameWrapper>{cluster.name}</NameWrapper>
            </TitleWrapper>
            <DeleteDateWrapper>
              Deleted {relativeDate(cluster.delete_date)}
            </DeleteDateWrapper>
          </ContentWrapper>
        </WrapperDeleted>
      );
    }

    return (
      <Wrapper>
        <LabelWrapper>
          <Link to={linkToCluster}>
            <ClusterIDLabel clusterID={cluster.id} copyEnabled />
          </Link>
        </LabelWrapper>

        <ContentWrapper>
          <TitleWrapper>
            <Link to={linkToCluster}>
              <RefreshableLabel value={cluster.name}>
                <NameWrapper>{cluster.name}</NameWrapper>
              </RefreshableLabel>
            </Link>
          </TitleWrapper>

          <div>
            <RefreshableLabel value={cluster.release_version}>
              <span>
                <i className='fa fa-version-tag' title='Release version' />{' '}
                {cluster.release_version}
              </span>
            </RefreshableLabel>
            <Dot style={{ paddingLeft: 0 }} />
            Created {relativeDate(cluster.create_date)}
          </div>
          <ClusterDashboardResources
            cluster={cluster}
            nodePools={nodePools}
            isNodePool={isNodePool}
          />
        </ContentWrapper>

        <ButtonsWrapper>
          {this.clusterYoungerThan30Days() ? (
            <ButtonGroup>
              <Button onClick={this.accessCluster}>
                <i className='fa fa-start' />
                Get Started
              </Button>
            </ButtonGroup>
          ) : (
            ''
          )}
        </ButtonsWrapper>
      </Wrapper>
    );
  }
}

ClusterDashboardItem.propTypes = {
  cluster: PropTypes.object,
  actions: PropTypes.object,
  className: PropTypes.string,
  children: PropTypes.array,
  selectedOrganization: PropTypes.string,
  animate: PropTypes.bool,
  dispatch: PropTypes.func,
  isNodePool: PropTypes.bool,
  nodePools: PropTypes.object,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(null, mapDispatchToProps)(ClusterDashboardItem);
