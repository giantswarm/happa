import { css } from '@emotion/core';
import styled from '@emotion/styled';
import * as actionTypes from 'actions/actionTypes';
import { push } from 'connected-react-router';
import { relativeDate } from 'lib/helpers.js';
import RoutePath from 'lib/routePath';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  selectClusterNodePools,
  selectErrorByIdAndAction,
} from 'selectors/clusterSelectors';
import { CSSBreakpoints } from 'shared/constants';
import { OrganizationsRoutes } from 'shared/constants/routes';
import { Dot, mq } from 'styles';
import Button from 'UI/Button';
import ClusterIDLabel from 'UI/ClusterIDLabel';
import ErrorFallback from 'UI/ErrorFallback';
import RefreshableLabel from 'UI/RefreshableLabel';

import ClusterDashboardResourcesV4 from './ClusterDashboardResourcesV4';
import ClusterDashboardResourcesV5 from './ClusterDashboardResourcesV5';
import UpgradeNotice from './UpgradeNotice';

const LabelWrapper = styled.div`
  width: 90px;
`;

const ContentWrapper = styled.div`
  flex: 1;
  padding-right: 15px;
`;

const TitleWrapper = styled.div``;

const NameWrapper = styled.span`
  font-weight: 700;
`;

const WrapperStyles = props => css`
  display: flex;
  background-color: ${props.theme.colors.darkBlueLighter1};
  border-radius: 5px;
  border: 0px;
  min-height: 20px;
  padding: 19px;
  margin-bottom: 20px;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);
  position: relative;
  flex-wrap: wrap;
  ${LabelWrapper}, ${TitleWrapper} {
    font-size: 1.2em;
  }
  ${mq(CSSBreakpoints.SMALL)} {
    flex-direction: column;
    & > div {
      width: 100%;
    }
    ${LabelWrapper} {
      margin-bottom: 5px;
    }
    /* Font sizes */
    font-size: 0.9em;
    ${LabelWrapper}, ${TitleWrapper} {
      font-size: 1em;
    }
  }
`;

const Wrapper = styled.div`
  ${WrapperStyles};
`;

const WrapperDeleted = styled.div`
  ${WrapperStyles};
  background-color: ${props => props.theme.colors.darkBlueDarker1};
`;

const ButtonsWrapper = styled.div`
  flex: 0 0 210px;
  display: flex;
  justify-content: flex-end;
  ${mq(CSSBreakpoints.MEDIUM)} {
    flex: unset;
    position: absolute;
    top: 21px;
    right: 8px;
  }
  ${mq(725) /* eslint-disable-line */} {
    position: relative;
    width: 100%;
    top: 9px;
    margin-bottom: 9px;
    justify-content: flex-start;
    padding-left: 98px;
  }
  ${mq(CSSBreakpoints.SMALL)} {
    padding-left: 9px;
  }
`;

const DeleteDateWrapper = styled.div`
  color: ${props => props.theme.colors.darkBlueLighter5};
`;

const ClusterDetailsDiv = styled.div`
  height: 27px;
  img {
    height: 22px;
  }
  ${mq(CSSBreakpoints.MEDIUM)} {
    height: unset;
  }
`;

function ClusterDashboardItem({
  cluster,
  isV5Cluster,
  selectedOrganization,
  nodePools,
  dispatch,
  nodePoolsLoadError,
}) {
  /**
   * Returns true if the cluster is younger than 30 days
   */
  const clusterYoungerThan30Days = () => {
    const age = Math.abs(
      moment(cluster.create_date)
        .utc()
        // eslint-disable-next-line no-magic-numbers
        .diff(moment().utc()) / 1000
    );

    // eslint-disable-next-line no-magic-numbers
    return age < 30 * 24 * 60 * 60;
  };

  const accessCluster = () => {
    const { id, owner } = cluster;
    const clusterGuidePath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.GettingStarted.Overview,
      {
        orgId: owner,
        clusterId: id,
      }
    );

    dispatch(push(clusterGuidePath));
  };

  const linkToCluster = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail,
    {
      orgId: selectedOrganization,
      clusterId: cluster.id,
    }
  );

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
            <UpgradeNotice clusterId={cluster.id} />
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

        {/* Cluster resources */}
        <ErrorFallback errors={nodePoolsLoadError}>
          <ClusterDetailsDiv>
            {isV5Cluster ? (
              <ClusterDashboardResourcesV5
                cluster={cluster}
                nodePools={nodePools}
              />
            ) : (
              <ClusterDashboardResourcesV4 cluster={cluster} />
            )}
          </ClusterDetailsDiv>
        </ErrorFallback>
      </ContentWrapper>

      <ButtonsWrapper>
        {clusterYoungerThan30Days() ? (
          <ButtonGroup>
            <Button onClick={accessCluster}>
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

ClusterDashboardItem.propTypes = {
  cluster: PropTypes.object,
  actions: PropTypes.object,
  className: PropTypes.string,
  children: PropTypes.array,
  selectedOrganization: PropTypes.string,
  animate: PropTypes.bool,
  dispatch: PropTypes.func,
  isV5Cluster: PropTypes.bool,
  nodePools: PropTypes.array,
  nodePoolsLoadError: PropTypes.string,
};

function mapStateToProps(state, props) {
  return {
    nodePools: selectClusterNodePools(state, props.cluster.id),
    nodePoolsLoadError: selectErrorByIdAndAction(
      state,
      props.cluster.id,
      actionTypes.CLUSTER_NODEPOOLS_LOAD_REQUEST
    ),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ClusterDashboardItem);
