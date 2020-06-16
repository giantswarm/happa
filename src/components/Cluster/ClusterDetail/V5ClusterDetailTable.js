import { css } from '@emotion/core';
import styled from '@emotion/styled';
import { CLUSTER_NODEPOOLS_LOAD_REQUEST } from 'actions/actionTypes';
import * as clusterActions from 'actions/clusterActions';
import { nodePoolsCreate } from 'actions/nodePoolActions';
import MasterNodes from 'Cluster/ClusterDetail/MasterNodes/MasterNodes';
import produce from 'immer';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import { connect } from 'react-redux';
import ReactTimeout from 'react-timeout';
import { TransitionGroup } from 'react-transition-group';
import {
  selectAndProduceAZGridTemplateAreas,
  selectClusterNodePools,
  selectLoadingFlagByIdAndAction,
  selectResourcesV5,
} from 'selectors/clusterSelectors';
import { Constants, CSSBreakpoints } from 'shared/constants';
import FeatureFlags from 'shared/FeatureFlags';
import { FlexRowWithTwoBlocksOnEdges, mq, Row } from 'styles';
import BaseTransition from 'styles/transitions/BaseTransition';
import SlideTransition from 'styles/transitions/SlideTransition';
import Button from 'UI/Button';
import { FlexColumn, FlexWrapperDiv } from 'UI/FlexDivs';
import { isClusterCreating, isClusterUpdating } from 'utils/clusterUtils';

import AddNodePool from './AddNodePool';
import ClusterLabels from './ClusterLabels/ClusterLabels';
import CredentialInfoRow from './CredentialInfoRow';
import NodePool from './NodePool';
import NodesRunning from './NodesRunning';
import PortMappingsRow from './PortMappingsRow';
import RegionAndVersions from './RegionAndVersions';
import URIBlock from './URIBlock';

const NodePoolsWrapper = styled.div`
  margin: 25px 0 23px;
  padding-top: 25px;
  border-top: 1px solid ${(props) => props.theme.colors.shade6};
  h2 {
    font-weight: 400;
    font-size: 22px;
    margin: 0;
  }
  /* Manual */
  .np-enter,
  .np-appear {
    opacity: 0.01;
    transform: translateX(20px);
  }
  .np-enter.np-enter-active,
  .np-appear.np-appear-active {
    opacity: 1;
    transform: translateX(0px);
    transition: opacity 200ms, transform 300ms;
    transition-delay: 300ms, 300ms;
  }
  .np-exit {
    opacity: 1;
  }
  .np-exit.np-exit-active {
    opacity: 0.01;
    transform: translateX(0px);
    transition: all 100ms ease-in;
    transition-delay: 0ms;
  }
`;

const GridRowNodePoolsBase = css`
  ${Row};
  display: grid;
  grid-gap: 0 10px;
  grid-template-columns:
    minmax(47px, 1fr) minmax(50px, 4fr) 4fr 3fr repeat(5, 2fr)
    1fr;
  grid-template-rows: 30px;
  justify-content: space-between;
  place-items: center center;
  padding-right: 7px;
`;

const GridRowNodePoolsNodes = styled.div`
  ${GridRowNodePoolsBase};
  margin-bottom: 0;
  margin-top: -12px;
  min-height: 25px;
  color: ${(props) => props.theme.colors.gray};
  padding-top: 0;
  padding-bottom: 0;
  transform: translateY(12px);
  div {
    grid-column: 5 / span 5;
    font-size: 12px;
    position: relative;
    width: 100%;
    text-align: center;
    transform: translateX(0.8vw);
    span {
      display: inline-block;
      padding: 0 10px;
      background: ${(props) => props.theme.colors.shade2};
    }
    &::before {
      content: '';
      position: absolute;
      bottom: 6px;
      left: 0;
      width: 100%;
      height: 4px;
      border: 1px solid ${(props) => props.theme.colors.gray};
      border-bottom: 0;
      z-index: -1;
    }
  }
`;

const GridRowNodePoolsHeaders = styled.div`
  ${GridRowNodePoolsBase};
  margin-bottom: 0;
`;

const NodePoolsColumnHeader = styled.span`
  text-align: center;
  text-transform: uppercase;
`;

const NodePoolsNameColumn = styled.span`
  ${NodePoolsColumnHeader};
  text-align: center;
  text-transform: uppercase;
  padding-left: 8px;
  justify-self: left;
`;

const GridRowNodePoolsItem = styled.div`
  ${GridRowNodePoolsBase};
  background-color: ${({ theme }) => theme.colors.foreground};
`;

export const AddNodePoolWrapper = (props) => css`
  background-color: ${props.theme.colors.shade10};
  border-radius: 5px;
  margin-bottom: 0px;
  h3 {
    margin-bottom: 20px;
  }
`;

const AddNodePoolWrapperDiv = styled.div`
  ${AddNodePoolWrapper};
  padding: 20px 20px 40px;
`;

export const AddNodePoolFlexColumnDiv = styled(FlexColumn)`
  a {
    text-decoration: underline;
  }
  /* Overrides for NumberPicker */
  .availability-zones {
    margin-bottom: 12px;
    & > div > div,
    & > div > div > div {
      margin: 0;
    }
  }
  .scaling-range {
    form {
      label {
        margin-bottom: 7px;
        color: ${(props) => props.theme.colors.white1};
        font-weight: 400;
      }
      & > div:nth-of-type(2) {
        display: none;
      }
    }
  }
`;

const NodePoolsFlexWrapperDiv = styled(FlexWrapperDiv)`
  p {
    font-size: 14px;
    line-height: 1.2;
    margin: 0;
    max-width: 550px;
    padding-left: 20px;
  }
  & > div:nth-of-type(2) > button {
    padding-top: 9px;
    padding-bottom: 9px;
  }
  button {
    margin-right: 16px;
  }
  &.zero-nodepools {
    flex-direction: column;
    justify-content: space-between;
    height: 147px;
    padding: 30px 10px;
    background-color: ${(props) => props.theme.colors.shade10};
    border-radius: 5px;
    p {
      font-size: 16px;
      max-width: 90%;
    }
  }
`;

export const CopyToClipboardDiv = styled.div`
  display: inline-block;
  &:hover {
    i {
      opacity: 0.7;
    }
  }
  i {
    cursor: pointer;
    font-size: 14px;
    margin-left: 5px;
    margin-right: 5px;
    opacity: 0;
    transform: translateX(-15px);
    &:hover {
      opacity: 1;
      text-shadow: 0px 0px 15px ${(props) => props.theme.colors.shade1};
    }
  }
`;

const KubernetesURIWrapper = styled(FlexRowWithTwoBlocksOnEdges)`
  flex-wrap: wrap;

  .progress_button--container {
    margin-right: 0;
  }

  & > div:nth-of-type(1) {
    margin-right: 0;

    & > * {
      display: flex;
    }
  }

  & > div:nth-of-type(2) {
    margin-left: 0;
    margin-right: 0;

    ${mq(CSSBreakpoints.Large)} {
      & > * {
        margin-left: 0;
      }
    }
  }

  i {
    padding: 0 8px;
  }
`;

const GetStartedWrapper = styled.div`
  ${mq(CSSBreakpoints.Large)} {
    margin: 8px 0;
  }
`;

const StyledURIBlock = styled(URIBlock)`
  flex: 1 1 auto;
`;

const MasterNodesRow = styled(MasterNodes)`
  ${Row};
  background-color: ${({ theme }) => theme.colors.foreground};
`;

const LabelsRow = styled(ClusterLabels)`
  ${Row};
  background-color: ${({ theme }) => theme.colors.foreground};
`;

// TODO Now on every addition or deletion of a NP, this component will be rerendered.
// It would be nice to split this into subcomponents so only the littele bits that need
// to be updated were updated. Child components might be: RAM, CPUs, workerNodesRunning.

class V5ClusterDetailTable extends React.Component {
  state = {
    isNodePoolBeingAdded: false,
    nodePoolForm: {
      isValid: false,
      isSubmitting: false,
      data: {},
    },
    lastUpdated: '',
  };

  componentDidMount() {
    this.setState({ lastUpdated: moment().fromNow() });
  }

  toggleAddNodePoolForm = () =>
    this.setState((prevState) => ({
      isNodePoolBeingAdded: !prevState.isNodePoolBeingAdded,
    }));

  updateNodePoolForm = (data) => {
    this.setState((prevState) =>
      produce(prevState, (draft) => {
        draft.nodePoolForm = { ...prevState.nodePoolForm, ...data };
      })
    );
  };

  createNodePool = async () => {
    const data = [this.state.nodePoolForm.data];

    this.setState(
      produce((draft) => {
        draft.nodePoolForm.data = { isSubmiting: true };
      })
    );

    this.toggleAddNodePoolForm();
    await this.props.dispatch(
      nodePoolsCreate(this.props.cluster.id, data, { withFlashMessages: true })
    );
  };

  patchCluster(payload) {
    return this.props.dispatch(
      clusterActions.clusterPatch(this.props.cluster, payload, true)
    );
  }

  enableHAMasters = () => {
    return this.patchCluster({
      master_nodes: {
        high_availability: true,
      },
    });
  };

  render() {
    const { nodePoolForm } = this.state;
    const {
      nodePools,
      accessCluster,
      cluster,
      credentials,
      provider,
      region,
      release,
      resources,
      AZGridTemplateAreas,
      loadingNodePools,
    } = this.props;

    const {
      create_date,
      release_version,
      api_endpoint,
      labels,
      master_nodes,
    } = cluster;
    const { numberOfNodes, memory, cores } = resources;

    const zeroNodePools = nodePools && nodePools.length === 0;

    const canBeConvertedToHAMasters =
      master_nodes &&
      !master_nodes.high_availability &&
      cluster.capabilities.supportsHAMasters &&
      !isClusterCreating(cluster) &&
      !isClusterUpdating(cluster);

    return (
      <>
        <FlexRowWithTwoBlocksOnEdges>
          <div>
            <RegionAndVersions
              createDate={create_date}
              releaseVersion={release_version}
              release={release}
              k8sVersion={cluster.kubernetes_version}
              clusterId={cluster.id}
              showUpgradeModal={this.props.showUpgradeModal}
              region={region}
            />
          </div>
          <div>
            <NodesRunning
              workerNodesRunning={numberOfNodes}
              createDate={create_date}
              RAM={memory}
              CPUs={cores}
              nodePools={nodePools}
            />
          </div>
        </FlexRowWithTwoBlocksOnEdges>

        {FeatureFlags.FEATURE_HA_MASTERS && master_nodes && (
          <MasterNodesRow
            isHA={master_nodes.high_availability}
            availabilityZones={master_nodes.availability_zones}
            supportsReadyNodes={cluster.capabilities.supportsHAMasters}
            numOfReadyNodes={master_nodes.num_ready}
            onConvert={this.enableHAMasters}
            canBeConverted={canBeConvertedToHAMasters}
          />
        )}

        {FeatureFlags.FEATURE_CLUSTER_LABELS_V0 && (
          <LabelsRow labels={labels} clusterId={cluster.id} />
        )}
        <KubernetesURIWrapper>
          <StyledURIBlock title='Kubernetes endpoint URI:'>
            {api_endpoint}
          </StyledURIBlock>
          <GetStartedWrapper>
            <Button onClick={accessCluster}>
              <i className='fa fa-start' /> GET STARTED
            </Button>
          </GetStartedWrapper>
        </KubernetesURIWrapper>

        <PortMappingsRow cluster={cluster} />

        <CredentialInfoRow
          cluster={cluster}
          credentials={credentials}
          provider={provider}
        />

        <NodePoolsWrapper>
          <h2>Node Pools</h2>
          {!zeroNodePools && !loadingNodePools && (
            <>
              <GridRowNodePoolsNodes>
                <div>
                  <span>NODES</span>
                </div>
              </GridRowNodePoolsNodes>
              <GridRowNodePoolsHeaders>
                <NodePoolsColumnHeader>Id</NodePoolsColumnHeader>
                <NodePoolsNameColumn>Name</NodePoolsNameColumn>
                <NodePoolsColumnHeader>Instance Type</NodePoolsColumnHeader>
                <NodePoolsColumnHeader>
                  Availability Zones
                </NodePoolsColumnHeader>
                <OverlayTrigger
                  overlay={
                    <Tooltip id='min-tooltip'>
                      {Constants.MIN_NODES_EXPLANATION}
                    </Tooltip>
                  }
                  placement='top'
                >
                  <NodePoolsColumnHeader>Min</NodePoolsColumnHeader>
                </OverlayTrigger>
                <OverlayTrigger
                  overlay={
                    <Tooltip id='max-tooltip'>
                      {Constants.MAX_NODES_EXPLANATION}
                    </Tooltip>
                  }
                  placement='top'
                >
                  <NodePoolsColumnHeader>Max</NodePoolsColumnHeader>
                </OverlayTrigger>
                <OverlayTrigger
                  overlay={
                    <Tooltip id='desired-tooltip'>
                      {Constants.DESIRED_NODES_EXPLANATION}
                    </Tooltip>
                  }
                  placement='top'
                >
                  <NodePoolsColumnHeader>Desired</NodePoolsColumnHeader>
                </OverlayTrigger>
                <OverlayTrigger
                  overlay={
                    <Tooltip id='current-tooltip'>
                      {Constants.CURRENT_NODES_INPOOL_EXPLANATION}
                    </Tooltip>
                  }
                  placement='top'
                >
                  <NodePoolsColumnHeader>Current</NodePoolsColumnHeader>
                </OverlayTrigger>
                <OverlayTrigger
                  overlay={
                    <Tooltip id='spot-tooltip'>
                      {Constants.SPOT_NODES_EXPLNANATION}
                    </Tooltip>
                  }
                  placement='top'
                >
                  <NodePoolsColumnHeader>Spot</NodePoolsColumnHeader>
                </OverlayTrigger>

                <NodePoolsColumnHeader>&nbsp;</NodePoolsColumnHeader>
              </GridRowNodePoolsHeaders>
              <TransitionGroup>
                {nodePools
                  .sort((a, b) => {
                    if (a.name > b.name) {
                      return 1;
                    } else if (a.name < b.name) {
                      return -1;
                    } else if (a.id > b.id) {
                      return 1;
                    }

                    return -1;
                  })
                  .map((nodePool) => (
                    <BaseTransition
                      key={nodePool.id || Date.now()}
                      appear={true}
                      exit={false}
                      classNames='np'
                      timeout={{ enter: 500, appear: 500 }}
                    >
                      <GridRowNodePoolsItem data-testid={nodePool.id}>
                        <NodePool
                          availableZonesGridTemplateAreas={AZGridTemplateAreas}
                          cluster={cluster}
                          nodePool={nodePool}
                          provider={this.props.provider}
                        />
                      </GridRowNodePoolsItem>
                    </BaseTransition>
                  ))}
              </TransitionGroup>
            </>
          )}
        </NodePoolsWrapper>
        {this.state.isNodePoolBeingAdded && (
          <SlideTransition in={true} appear={true} direction='down'>
            {/* Add Node Pool */}
            <AddNodePoolWrapperDiv>
              <h3 className='table-label'>Add Node Pool</h3>
              <AddNodePoolFlexColumnDiv>
                <AddNodePool
                  clusterId={cluster.id}
                  selectedRelease={release_version}
                  closeForm={this.toggleAddNodePoolForm}
                  informParent={this.updateNodePoolForm}
                />
                <FlexWrapperDiv>
                  <Button
                    bsSize='large'
                    bsStyle='primary'
                    disabled={!nodePoolForm.isValid}
                    loading={nodePoolForm.isSubmitting}
                    onClick={this.createNodePool}
                    type='button'
                  >
                    Create Node Pool
                  </Button>
                  {/* We want to hide cancel button when the Create NP button has been clicked */}
                  {!nodePoolForm.isSubmitting && (
                    <Button
                      bsSize='large'
                      bsStyle='default'
                      loading={nodePoolForm.isSubmitting}
                      onClick={this.toggleAddNodePoolForm}
                      type='button'
                    >
                      Cancel
                    </Button>
                  )}
                </FlexWrapperDiv>
              </AddNodePoolFlexColumnDiv>
            </AddNodePoolWrapperDiv>
          </SlideTransition>
        )}
        {!this.state.isNodePoolBeingAdded && !loadingNodePools && (
          <NodePoolsFlexWrapperDiv
            className={zeroNodePools && 'zero-nodepools'}
          >
            {zeroNodePools && (
              <p>
                Add at least one node pool to this cluster so that you can
                actually run workloads.
              </p>
            )}
            <Button onClick={this.toggleAddNodePoolForm}>
              <i className='fa fa-add-circle' /> ADD NODE POOL
            </Button>
            {nodePools && nodePools.length === 1 && (
              <p>
                With additional node pools, you can add different types of
                worker nodes to your cluster. Node pools also scale
                independently.{' '}
                <a
                  href='https://docs.giantswarm.io/basics/nodepools/'
                  alt='Read more about node pools'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {' '}
                  Read more
                </a>
              </p>
            )}
          </NodePoolsFlexWrapperDiv>
        )}
        <p className='last-updated' style={{ marginTop: '20px' }}>
          <small>
            The information above is auto-refreshing. Details last fetched{' '}
            <span className='last-updated-datestring'>
              {this.state.lastUpdated}
            </span>
            .
          </small>
        </p>
      </>
    );
  }
}

V5ClusterDetailTable.propTypes = {
  accessCluster: PropTypes.func,
  canClusterUpgrade: PropTypes.bool,
  cluster: PropTypes.object,
  credentials: PropTypes.object,
  dispatch: PropTypes.func,
  lastUpdated: PropTypes.number,
  provider: PropTypes.string,
  region: PropTypes.string,
  release: PropTypes.object,
  setInterval: PropTypes.func,
  showUpgradeModal: PropTypes.func,
  workerNodesDesired: PropTypes.number,
  nodePools: PropTypes.array,
  resources: PropTypes.object,
  AZGridTemplateAreas: PropTypes.string,
  loadingNodePools: PropTypes.bool,
};

// We use this wrapper function because we want different references for each cluster
// https://github.com/reduxjs/reselect#sharing-selectors-with-props-across-multiple-component-instances
const makeMapStateToProps = () => {
  const resourcesV5 = selectResourcesV5();
  const AZGridTemplateAreas = selectAndProduceAZGridTemplateAreas();
  const mapStateToProps = (state, props) => {
    return {
      nodePools: selectClusterNodePools(state, props.cluster.id),
      resources: resourcesV5(state, props),
      AZGridTemplateAreas: AZGridTemplateAreas(state, props.cluster.id),
      loadingNodePools: selectLoadingFlagByIdAndAction(
        state,
        props.cluster.id,
        CLUSTER_NODEPOOLS_LOAD_REQUEST
      ),
    };
  };

  return mapStateToProps;
};

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(
  makeMapStateToProps,
  mapDispatchToProps
)(ReactTimeout(V5ClusterDetailTable));
