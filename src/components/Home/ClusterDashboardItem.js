import { push } from 'connected-react-router';
import differenceInSeconds from 'date-fns/fp/differenceInSeconds';
import toDate from 'date-fns-tz/toDate';
import { relativeDate } from 'lib/helpers';
import RoutePath from 'lib/routePath';
import PropTypes from 'prop-types';
import React from 'react';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { CSSBreakpoints } from 'shared/constants';
import { OrganizationsRoutes } from 'shared/constants/routes';
import ErrorBoundary from 'shared/ErrorBoundary';
import { selectClusterById } from 'stores/cluster/selectors';
import { isClusterCreating } from 'stores/cluster/utils';
import { selectErrorByIdAndAction } from 'stores/entityerror/selectors';
import { CLUSTER_NODEPOOLS_LOAD_REQUEST } from 'stores/nodepool/constants';
import { selectClusterNodePools } from 'stores/nodepool/selectors';
import { selectOrganizationByID } from 'stores/organization/selectors';
import { getAllReleases } from 'stores/releases/selectors';
import { css } from 'styled-components';
import styled from 'styled-components';
import { Dot, mq } from 'styles';
import Button from 'UI/Controls/Button';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';
import KubernetesVersionLabel from 'UI/Display/Cluster/KubernetesVersionLabel';
import RefreshableLabel from 'UI/Display/RefreshableLabel';
import ErrorFallback from 'UI/Util/ErrorFallback/ErrorFallback';
import ErrorText from 'UI/Util/ErrorFallback/ErrorText';

import ClusterDashboardResourcesV4 from './ClusterDashboardResourcesV4';
import ClusterDashboardResourcesV5 from './ClusterDashboardResourcesV5';
import ClusterStatus from './ClusterStatus';

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

const WrapperStyles = (props) => css`
  display: flex;
  background-color: ${props.theme.colors.foreground};
  border-radius: 5px;
  border: 0;
  min-height: 20px;
  padding: 19px;
  margin-bottom: 20px;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);
  position: relative;
  flex-wrap: wrap;
  ${LabelWrapper}, ${TitleWrapper} {
    font-size: 1.2em;
  }
  ${mq(CSSBreakpoints.Small)} {
    flex-direction: column;
    & > div {
      width: 100%;
    }
    ${LabelWrapper} {
      position: absolute;
      i {
        display: none;
      }
    }
    ${TitleWrapper} {
      margin-left: 60px;
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
  background-color: ${(props) => props.theme.colors.darkBlueDarker1};
`;

const ButtonsWrapper = styled.div`
  flex: 0 0 210px;
  display: flex;
  justify-content: flex-end;
  ${mq(CSSBreakpoints.Medium)} {
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
  ${mq(CSSBreakpoints.Small)} {
    display: none;
  }
`;

const DeleteDateWrapper = styled.div`
  color: ${(props) => props.theme.colors.darkBlueLighter5};
`;

const ClusterDetailsDiv = styled.div`
  height: 27px;
  img {
    height: 22px;
  }
  ${mq(CSSBreakpoints.Medium)} {
    height: unset;
  }
  ${mq(CSSBreakpoints.Small)} {
    display: inline-block;
    transform: translateY(-1px);
  }
`;

const StyledErrorFallback = styled(ErrorFallback)`
  display: block;
`;

function ClusterDashboardItem({
  cluster,
  organizationID,
  isV5Cluster,
  selectedOrganization,
  nodePools,
  dispatch,
  nodePoolsLoadError,
  clusterId,
  releases,
}) {
  // If the cluster has been deleted using gsctl, Happa doesn't know yet.
  if (!cluster) return null;

  const release = releases[cluster.release_version] ?? null;
  const isCreating = isClusterCreating(cluster);

  /**
   * Returns true if the cluster is younger than 30 days
   */
  const clusterYoungerThan30Days = () => {
    const creationDate = toDate(cluster.create_date, { timeZone: 'UTC' });
    const age = differenceInSeconds(creationDate)(new Date());

    // eslint-disable-next-line no-magic-numbers
    return age < 30 * 24 * 60 * 60;
  };

  const accessCluster = () => {
    const clusterGuidePath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.GettingStarted.Overview,
      {
        orgId: organizationID,
        clusterId,
      }
    );

    dispatch(push(clusterGuidePath));
  };

  const linkToCluster = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.Detail.Home,
    {
      orgId: selectedOrganization,
      clusterId,
    }
  );

  if (cluster.delete_date) {
    return (
      <WrapperDeleted>
        <LabelWrapper>
          <ClusterIDLabel clusterID={clusterId} copyEnabled />
        </LabelWrapper>

        <ContentWrapper>
          <TitleWrapper>
            <NameWrapper>{cluster.name}</NameWrapper>
          </TitleWrapper>
          <DeleteDateWrapper>
            Deleted{' '}
            {!isNaN(cluster.delete_date) && relativeDate(cluster.delete_date)}
          </DeleteDateWrapper>
        </ContentWrapper>
      </WrapperDeleted>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <Wrapper>
          <LabelWrapper>
            <ClusterIDLabel clusterID={clusterId} copyEnabled />
          </LabelWrapper>
          <ContentWrapper>
            <TitleWrapper>
              <RefreshableLabel value={cluster.name}>
                <NameWrapper>{cluster.name}</NameWrapper>
              </RefreshableLabel>
            </TitleWrapper>
            <ClusterDetailsDiv>
              <ErrorText>
                <i className='fa fa-warning' /> Error while loading cluster
                details. We have been notified.
              </ErrorText>
            </ClusterDetailsDiv>
          </ContentWrapper>
        </Wrapper>
      }
    >
      <Wrapper>
        <LabelWrapper>
          <Link to={linkToCluster}>
            <ClusterIDLabel clusterID={clusterId} copyEnabled />
          </Link>
        </LabelWrapper>

        <ContentWrapper>
          <TitleWrapper>
            <Link to={linkToCluster}>
              <RefreshableLabel value={cluster.name}>
                <NameWrapper>{cluster.name}</NameWrapper>
              </RefreshableLabel>
              <ClusterStatus clusterId={clusterId} />
            </Link>
          </TitleWrapper>

          <>
            <RefreshableLabel value={cluster.release_version}>
              <span>
                <i className='fa fa-version-tag' title='Release version' />{' '}
                {cluster.release_version}
              </span>
            </RefreshableLabel>
            <Dot style={{ paddingLeft: 0 }} />
            <RefreshableLabel value={release?.kubernetesVersion}>
              <KubernetesVersionLabel
                version={release?.kubernetesVersion}
                eolDate={release?.k8sVersionEOLDate}
              />
            </RefreshableLabel>
            <Dot style={{ paddingLeft: 0 }} />
            Created {relativeDate(cluster.create_date)}
          </>

          {/* Cluster resources */}
          <StyledErrorFallback error={nodePoolsLoadError}>
            <ClusterDetailsDiv>
              {isV5Cluster ? (
                <ClusterDashboardResourcesV5
                  cluster={cluster}
                  nodePools={nodePools}
                  isClusterCreating={isCreating}
                />
              ) : (
                <ClusterDashboardResourcesV4
                  cluster={cluster}
                  isClusterCreating={isCreating}
                />
              )}
            </ClusterDetailsDiv>
          </StyledErrorFallback>
        </ContentWrapper>

        <ButtonsWrapper>
          {clusterYoungerThan30Days() ? (
            <ButtonGroup>
              <Button onClick={accessCluster}>
                <i className='fa fa-start' />
                Get started
              </Button>
            </ButtonGroup>
          ) : (
            ''
          )}
        </ButtonsWrapper>
      </Wrapper>
    </ErrorBoundary>
  );
}

ClusterDashboardItem.propTypes = {
  cluster: PropTypes.object,
  organizationID: PropTypes.string,
  selectedOrganization: PropTypes.string,
  dispatch: PropTypes.func,
  isV5Cluster: PropTypes.bool,
  nodePools: PropTypes.array,
  nodePoolsLoadError: PropTypes.string,
  clusterId: PropTypes.string,
  releases: PropTypes.object,
};

function mapStateToProps(state, props) {
  const cluster = selectClusterById(state, props.clusterId);
  let organizationID = '';
  if (cluster) {
    organizationID =
      selectOrganizationByID(cluster.owner)(state)?.id ?? cluster.owner;
  }

  return {
    cluster,
    organizationID,
    nodePools: selectClusterNodePools(state, props.clusterId),
    nodePoolsLoadError: selectErrorByIdAndAction(
      state,
      props.clusterId,
      CLUSTER_NODEPOOLS_LOAD_REQUEST
    ),
    releases: getAllReleases(state),
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
