import MasterNodes from 'Cluster/ClusterDetail/MasterNodes/MasterNodes';
import V5ClusterDetailTableNodePoolScaling from 'Cluster/ClusterDetail/V5ClusterDetailTableNodePoolScaling';
import formatDistance from 'date-fns/fp/formatDistance';
import produce from 'immer';
import { nodePoolsURL } from 'lib/docs';
import ErrorReporter from 'lib/errors/ErrorReporter';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import ReactTimeout from 'react-timeout';
import { TransitionGroup } from 'react-transition-group';
import RUMActionTarget from 'RUM/RUMActionTarget';
import { CSSBreakpoints } from 'shared/constants';
import * as Providers from 'shared/constants/providers';
import { RUMActions } from 'shared/constants/realUserMonitoring';
import * as clusterActions from 'stores/cluster/actions';
import { isClusterCreating } from 'stores/cluster/utils';
import { updateClusterLabels } from 'stores/clusterlabels/actions';
import {
  getClusterLabelsError,
  getClusterLabelsLoading,
} from 'stores/clusterlabels/selectors';
import { selectLoadingFlagByIdAndAction } from 'stores/entityloading/selectors';
import { nodePoolsCreate } from 'stores/nodepool/actions';
import { CLUSTER_NODEPOOLS_LOAD_REQUEST } from 'stores/nodepool/constants';
import {
  makeV5ResourcesSelector,
  selectClusterNodePools,
} from 'stores/nodepool/selectors';
import { css } from 'styled-components';
import styled from 'styled-components';
import { FlexRowWithTwoBlocksOnEdges, mq, Row } from 'styles';
import BaseTransition from 'styles/transitions/BaseTransition';
import SlideTransition from 'styles/transitions/SlideTransition';
import Button from 'UI/Controls/Button';
import { FlexColumn, FlexWrapperDiv } from 'UI/Layout/FlexDivs';

import AddNodePool from './AddNodePool/AddNodePool';
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
  .np-enter {
    opacity: 0.01;
    transform: translateX(20px);
  }
  .np-enter.np-enter-active {
    opacity: 1;
    transform: translateX(0px);
    transition: opacity 0.2s, transform 0.3s;
    transition-timing-function: ease-out, ease-out;
    transition-delay: 0.1s, 0.1s;
  }
  .np-exit {
    opacity: 1;
  }
  .np-exit.np-exit-active {
    opacity: 0.01;
    transform: translateX(20px);
    transition: all 0.2s ease-out;
    transition-delay: 0.1s;
  }
`;

const GridRowNodePoolsBase = (additionalColumnCount) => css`
  ${Row};
  display: grid;
  grid-gap: 0 10px;
  grid-template-columns:
    minmax(47px, 1fr) minmax(50px, 4fr) 4fr 3fr repeat(
      ${additionalColumnCount},
      2fr
    )
    1fr;
  grid-template-rows: 30px;
  justify-content: space-between;
  place-items: center center;
  padding-right: 7px;
`;

const GridRowNodePoolsNodes = styled.div`
  ${({ additionalColumnCount }) => GridRowNodePoolsBase(additionalColumnCount)};
  margin-bottom: 0;
  margin-top: -12px;
  min-height: 25px;
  color: ${(props) => props.theme.colors.gray};
  padding-top: 0;
  padding-bottom: 0;
  transform: translateY(12px);
  div {
    grid-column: ${({ additionalColumnCount }) =>
      `5 / span ${additionalColumnCount}`};
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
  ${({ additionalColumnCount }) => GridRowNodePoolsBase(additionalColumnCount)};
  margin-bottom: 0;
`;

export const NodePoolsColumnHeader = styled.span`
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
  ${({ additionalColumnCount }) => GridRowNodePoolsBase(additionalColumnCount)};
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

  .button-wrapper {
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
  static getNumberOfAdditionalColumns(
    supportsNodePoolAutoscaling,
    supportsNodePoolSpotInstances
  ) {
    let additionalColumnCount = 2;
    if (supportsNodePoolAutoscaling) {
      additionalColumnCount += 2;
    }
    if (supportsNodePoolSpotInstances) {
      additionalColumnCount++;
    }

    return additionalColumnCount;
  }

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
    this.setState({
      lastUpdated: `${formatDistance(new Date())(new Date())} ago`,
    });
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

    try {
      await this.props.dispatch(
        nodePoolsCreate(this.props.cluster.id, data, {
          withFlashMessages: true,
        })
      );
    } catch (err) {
      ErrorReporter.getInstance().notify(err);
    }
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
      loadingNodePools,
      clusterIsCreating,
      clusterIsUpdating,
      isAdmin,
      releases,
      showUpgradeModal,
      setUpgradeVersion,
    } = this.props;

    const { create_date, api_endpoint, labels, master_nodes } = cluster;
    const { numberOfNodes, memory, cores } = resources;

    const {
      supportsHAMasters,
      supportsNodePoolAutoscaling,
      supportsNodePoolSpotInstances,
    } = cluster.capabilities;

    const zeroNodePools = nodePools && nodePools.length === 0;

    const canBeConvertedToHAMasters =
      master_nodes &&
      !master_nodes.high_availability &&
      supportsHAMasters &&
      !clusterIsCreating &&
      !clusterIsUpdating;

    const machineTypeLabel =
      provider === Providers.AWS ? 'Instance type' : 'VM Size';

    const additionalColumnCount = V5ClusterDetailTable.getNumberOfAdditionalColumns(
      supportsNodePoolAutoscaling,
      supportsNodePoolSpotInstances
    );

    const handleLabelChange = (patch) => {
      this.props.dispatch(
        updateClusterLabels({ clusterId: cluster.id, ...patch })
      );
    };

    return (
      <>
        <FlexRowWithTwoBlocksOnEdges>
          <div>
            <RegionAndVersions
              createDate={create_date}
              release={release}
              provider={provider}
              clusterId={cluster.id}
              showUpgradeModal={showUpgradeModal}
              setUpgradeVersion={setUpgradeVersion}
              region={region}
              isAdmin={isAdmin}
              releases={releases}
            />
          </div>
          <div>
            <NodesRunning
              workerNodesRunning={numberOfNodes}
              isClusterCreating={isClusterCreating(cluster)}
              RAM={memory}
              CPUs={cores}
              numNodePools={nodePools.length}
            />
          </div>
        </FlexRowWithTwoBlocksOnEdges>

        {master_nodes && (
          <MasterNodesRow
            isHA={master_nodes.high_availability}
            availabilityZones={master_nodes.availability_zones}
            supportsReadyNodes={supportsHAMasters}
            numOfReadyNodes={master_nodes.num_ready}
            onConvert={this.enableHAMasters}
            canBeConverted={canBeConvertedToHAMasters}
          />
        )}
        <LabelsRow
          labels={labels}
          onChange={handleLabelChange}
          errorMessage={this.props.labelsErrorMessage}
          isLoading={this.props.labelsIsLoading}
        />
        <KubernetesURIWrapper>
          <StyledURIBlock title='Kubernetes endpoint URI:'>
            {api_endpoint}
          </StyledURIBlock>
          <GetStartedWrapper>
            <Button onClick={accessCluster}>
              <i className='fa fa-start' /> Get started
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
              <GridRowNodePoolsNodes
                additionalColumnCount={additionalColumnCount}
              >
                <div>
                  <span>NODES</span>
                </div>
              </GridRowNodePoolsNodes>
              <GridRowNodePoolsHeaders
                additionalColumnCount={additionalColumnCount}
              >
                <NodePoolsColumnHeader>Id</NodePoolsColumnHeader>
                <NodePoolsNameColumn>Name</NodePoolsNameColumn>
                <NodePoolsColumnHeader>
                  {machineTypeLabel}
                </NodePoolsColumnHeader>
                <NodePoolsColumnHeader>
                  Availability Zones
                </NodePoolsColumnHeader>
                <V5ClusterDetailTableNodePoolScaling
                  provider={provider}
                  supportsAutoscaling={supportsNodePoolAutoscaling}
                  supportsSpotInstances={supportsNodePoolSpotInstances}
                />
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
                      key={nodePool.id}
                      classNames='np'
                      timeout={{ enter: 400, exit: 400 }}
                    >
                      <GridRowNodePoolsItem
                        additionalColumnCount={additionalColumnCount}
                        data-testid={nodePool.id}
                      >
                        <NodePool
                          cluster={cluster}
                          nodePool={nodePool}
                          provider={provider}
                          supportsAutoscaling={supportsNodePoolAutoscaling}
                          supportsSpotInstances={supportsNodePoolSpotInstances}
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
                  closeForm={this.toggleAddNodePoolForm}
                  informParent={this.updateNodePoolForm}
                  capabilities={cluster.capabilities}
                />
                <FlexWrapperDiv>
                  <Button
                    bsStyle='primary'
                    disabled={!nodePoolForm.isValid}
                    loading={nodePoolForm.isSubmitting}
                    onClick={this.createNodePool}
                    type='button'
                  >
                    Create node pool
                  </Button>
                  {/* We want to hide cancel button when the Create NP button has been clicked */}
                  {!nodePoolForm.isSubmitting && (
                    <Button
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
            <RUMActionTarget name={RUMActions.AddNodePool}>
              <Button onClick={this.toggleAddNodePoolForm}>
                <i className='fa fa-add-circle' /> Add node pool
              </Button>
            </RUMActionTarget>
            {nodePools && nodePools.length === 1 && (
              <p>
                With additional node pools, you can add different types of
                worker nodes to your cluster. Node pools also scale
                independently.{' '}
                <a
                  href={nodePoolsURL}
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
  cluster: PropTypes.object,
  credentials: PropTypes.object,
  dispatch: PropTypes.func,
  provider: PropTypes.string,
  region: PropTypes.string,
  release: PropTypes.object,
  showUpgradeModal: PropTypes.func,
  setUpgradeVersion: PropTypes.func,
  nodePools: PropTypes.array,
  resources: PropTypes.object,
  loadingNodePools: PropTypes.bool,
  clusterIsCreating: PropTypes.bool,
  clusterIsUpdating: PropTypes.bool,
  isAdmin: PropTypes.bool,
  releases: PropTypes.object,
  labelsIsLoading: PropTypes.bool,
  labelsErrorMessage: PropTypes.string,
};

// We use this wrapper function because we want different references for each cluster
// https://github.com/reduxjs/reselect#sharing-selectors-with-props-across-multiple-component-instances
const makeMapStateToProps = () => {
  const resourcesV5 = makeV5ResourcesSelector();
  const mapStateToProps = (state, props) => {
    return {
      nodePools: selectClusterNodePools(state, props.cluster.id),
      resources: resourcesV5(state, props),
      labelsIsLoading: getClusterLabelsLoading(state),
      labelsErrorMessage: getClusterLabelsError(state) ?? undefined,
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
