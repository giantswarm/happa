import {
  clusterNodePools,
  getCpusTotalNodePools,
  getMemoryTotalNodePools,
  getNumberOfNodePoolsNodes,
} from 'utils/cluster_utils';
import { Code, Dot, FlexRowWithTwoBlocksOnEdges, Row } from 'styles';
import { connect } from 'react-redux';
import { css } from '@emotion/core';
import { nodePoolsCreate, nodePoolsLoad } from 'actions/nodePoolActions';
import AddNodePool from './AddNodePool';
import Button from 'UI/button';
import copy from 'copy-to-clipboard';
import NodePool from './node_pool';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import produce from 'immer';
import PropTypes from 'prop-types';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import ReactTimeout from 'react-timeout';
import styled from '@emotion/styled';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import Versions from './Versions';

export const Upgrade = styled.div`
  color: #ce990f;
  span {
    white-space: normal !important;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const NodePoolsWrapper = styled.div`
  margin: 25px 0 23px;
  padding-top: 25px;
  border-top: 1px solid ${props => props.theme.colors.shade6};
  h2 {
    font-weight: 400;
    font-size: 22px;
    margin: 0;
  }
`;

const GridRowNodePoolsBase = css`
  ${Row};
  display: grid;
  grid-gap: 0 10px;
  grid-template-columns: minmax(47px, 1fr) 4fr 4fr 3fr repeat(4, 2fr) 1fr;
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
  color: ${props => props.theme.colors.gray};
  padding-top: 0;
  padding-bottom: 0;
  transform: translateY(12px);
  div {
    grid-column: 5 / span 4;
    font-size: 12px;
    position: relative;
    width: 100%;
    text-align: center;
    transform: translateX(0.8vw);
    span {
      display: inline-block;
      padding: 0 10px;
      background: ${props => props.theme.colors.shade2};
    }
    &::before {
      content: '';
      position: absolute;
      bottom: 6px;
      left: 0;
      width: 100%;
      height: 4px;
      border: 1px solid ${props => props.theme.colors.gray};
      border-bottom: 0;
      z-index: -1;
    }
  }
`;

const GridRowNodePoolsHeaders = styled.div`
  ${GridRowNodePoolsBase};
  margin-bottom: 0;
  span {
    text-align: center;
  }
`;

const GridRowNodePoolsItem = styled.div`
  ${GridRowNodePoolsBase};
  background-color: ${props => props.theme.colors.shade7};
`;

export const AddNodePoolWrapper = props => css`
  background-color: ${props.theme.colors.shade10};
  border-radius: 5px;
  margin-bottom: 0px;
  h3 {
    margin-bottom: 20px;
  }
`;

const AddNodePoolWrapperDiv = styled.div`
  ${AddNodePoolWrapper}
  padding: 20px 20px 40px;
`;

export const AddNodePoolFlexColumnDiv = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  max-width: 650px;
  margin: 0 auto;
  label {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    margin: 0 0 31px;
    &.instance-type {
      margin-bottom: 21px;
    }
    p {
      line-height: 1.4;
    }
  }
  label:last-of-type {
    margin-bottom: 0;
  }
  .label-span {
    color: ${props => props.theme.colors.white1};
  }
  .label-span,
  input,
  select {
    font-size: 16px;
    margin-bottom: 13px;
    font-weight: 400;
  }
  input {
    box-sizing: border-box;
    width: 100%;
    background-color: ${props => props.theme.colors.shade5};
    padding: 11px 10px;
    outline: 0;
    color: ${props => props.theme.colors.whiteInput};
    border-radius: 4px;
    border: 1px solid ${props => props.theme.colors.shade6};
    padding-left: 15px;
    line-height: normal;
  }
  p {
    margin: 0;
    font-size: 14px;
    color: ${props => props.theme.colors.white1};
  }
  a {
    text-decoration: underline;
  }
  /* Name input */
  .name-container {
    position: relative;
    margin-bottom: 23px;
  }
  input[id='name'] {
    margin-bottom: 0;
  }
  /* Overrides for AWSInstanceTypeSelector */
  .textfield label,
  .textfield,
  .textfield input {
    margin: 0;
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
        color: ${props => props.theme.colors.white1};
        font-weight: 400;
      }
      & > div:nth-of-type(2) {
        display: none;
      }
    }
  }
`;

export const FlexWrapperDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
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
  &.no-nodepools {
    flex-direction: column;
    justify-content: space-between;
    height: 147px;
    padding: 30px 10px;
    background-color: ${props => props.theme.colors.shade10};
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
      text-shadow: 0px 0px 15px ${props => props.theme.colors.shade1};
    }
  }
`;

// TODO Now on every addition or deletion of a NP, this component will be rerendered.
// It would be nice to split this into subcomponents so only the littele bits that need
// to be updated were updated. Child components might be: RAM, CPUs, workerNodesRunning.

class ClusterDetailNodePoolsTable extends React.Component {
  state = {
    availableZonesGridTemplateAreas: '',
    awsInstanceTypes: {},
    RAM: 0,
    CPUs: 0,
    workerNodesRunning: 0,
    nodePools: null,
    isNodePoolBeingAdded: false,
    nodePoolForm: {
      isValid: false,
      isSubmitting: false,
      data: {},
    },
    enpointCopied: false,
  };

  componentDidMount() {
    this.produceNodePools();
  }

  // TODO Move this to the action creator so it will be triggered on every NPs load.
  produceNodePools = () => {
    const nodePoolsArray = clusterNodePools(
      this.props.nodePools,
      this.props.cluster
    );

    this.setState({ nodePools: nodePoolsArray }, () => {
      const { nodePools } = this.state;

      const allZones = nodePools
        ? nodePools
            .reduce((accumulator, current) => {
              return [...accumulator, ...current.availability_zones];
            }, [])
            .map(zone => zone.slice(-1))
        : [];

      // This array stores available zones that are in at least one node pool.
      // We only want unique values because this is used fot building the grid.
      const availableZonesGridTemplateAreas = [...new Set(allZones)]
        .sort()
        .join(' ');
      this.setState({
        availableZonesGridTemplateAreas: `"${availableZonesGridTemplateAreas}"`,
      });

      // Compute RAM & CPU:
      const RAM = getMemoryTotalNodePools(nodePools);
      const CPUs = getCpusTotalNodePools(nodePools);
      const workerNodesRunning = getNumberOfNodePoolsNodes(nodePools);

      this.setState({ RAM, CPUs, workerNodesRunning });
    });
  };

  toggleAddNodePoolForm = () =>
    this.setState(prevState => ({
      isNodePoolBeingAdded: !prevState.isNodePoolBeingAdded,
    }));

  updateNodePoolForm = data => {
    this.setState(
      produce(this.state, draft => {
        draft.nodePoolForm = { ...this.state.nodePoolForm, ...data };
      })
    );
  };

  createNodePool = () => {
    const data = [this.state.nodePoolForm.data];

    this.setState(
      produce(draft => {
        draft.nodePoolForm.data = { isSubmiting: true };
      })
    );

    this.props.dispatch(nodePoolsCreate(this.props.cluster.id, data));
  };

  // TODO We are repeating this in several places, refactor this to a reusable HOC / hooks.
  copyToClipboard = e => {
    e.preventDefault();
    e.stopPropagation();
    copy(this.props.cluster.api_endpoint);

    this.setState({
      endpointCopied: true,
    });
  };

  mouseLeave = () => {
    this.setState({
      endpointCopied: false,
    });
  };

  render() {
    const {
      availableZonesGridTemplateAreas,
      nodePools,
      workerNodesRunning,
      nodePoolForm,
    } = this.state;
    const { accessCluster, cluster, region } = this.props;

    const { create_date, release_version, release, api_endpoint } = cluster;
    const noNodePools = !nodePools || nodePools.length === 0;

    return (
      <>
        <FlexRowWithTwoBlocksOnEdges>
          <div>
            <OverlayTrigger
              overlay={<Tooltip id='tooltip'>Region</Tooltip>}
              placement='top'
            >
              <Code>{region ? region : null}</Code>
            </OverlayTrigger>
            <Versions
              createDate={create_date}
              releaseVersion={release_version}
              release={release}
              k8sVersion={cluster.kubernetes_version}
              canUpgrade={this.props.canClusterUpgrade}
              showUpgradeModal={this.props.showUpgradeModal}
            />
          </div>
          <div>
            <div>
              {!nodePools ? (
                <span>0 nodes</span>
              ) : (
                <>
                  <span>
                    {workerNodesRunning} nodes
                    {!noNodePools && ` in ${nodePools.length} node pools`}
                  </span>
                  {!noNodePools && (
                    <>
                      <span>
                        <Dot />
                        {this.state.RAM} GB RAM
                      </span>
                      <span>
                        <Dot />
                        {this.state.CPUs} CPUs
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </FlexRowWithTwoBlocksOnEdges>
        <FlexRowWithTwoBlocksOnEdges>
          <CopyToClipboardDiv onMouseLeave={this.mouseLeave}>
            <span>Kubernetes endpoint URI:</span>
            <Code>{api_endpoint}</Code>
            {/* Copy to clipboard. 
            TODO make a render prop component or a hooks function with it */}
            {this.state.endpointCopied ? (
              <i aria-hidden='true' className='fa fa-done' />
            ) : (
              <OverlayTrigger
                overlay={
                  <Tooltip id='tooltip'>
                    Copy {api_endpoint} to clipboard.
                  </Tooltip>
                }
                placement='top'
              >
                <i
                  aria-hidden='true'
                  className='fa fa-content-copy'
                  onClick={this.copyToClipboard}
                />
              </OverlayTrigger>
            )}
          </CopyToClipboardDiv>
          <div style={{ transform: 'translateX(10px)' }}>
            <Button onClick={accessCluster}>
              <i className='fa fa-start' /> GET STARTED
            </Button>
          </div>
        </FlexRowWithTwoBlocksOnEdges>
        <NodePoolsWrapper>
          <h2>Node Pools</h2>
          {nodePools && nodePools.length > 0 && (
            <>
              <GridRowNodePoolsNodes>
                <div>
                  <span>NODES</span>
                </div>
              </GridRowNodePoolsNodes>
              <GridRowNodePoolsHeaders>
                <span>ID</span>
                <span style={{ paddingLeft: '8px', justifySelf: 'left' }}>
                  NAME
                </span>
                <span>INSTANCE TYPE {nodePools.length}</span>
                <span>AVAILABILITY ZONES</span>
                <span>MIN</span>
                <span>MAX</span>
                <span>DESIRED</span>
                <span>CURRENT</span>
                <span> </span>
              </GridRowNodePoolsHeaders>
              {nodePools &&
                nodePools
                  .sort((a, b) =>
                    a.name > b.name
                      ? 1
                      : a.name < b.name
                      ? -1
                      : a.id > b.id
                      ? 1
                      : -1
                  )
                  .map(nodePool => (
                    <GridRowNodePoolsItem key={nodePool.id || Date.now()}>
                      <NodePool
                        availableZonesGridTemplateAreas={
                          availableZonesGridTemplateAreas
                        }
                        cluster={cluster}
                        nodePool={nodePool}
                        provider={this.props.provider}
                      />
                    </GridRowNodePoolsItem>
                  ))}
            </>
          )}
        </NodePoolsWrapper>
        {this.state.isNodePoolBeingAdded ? (
          <ReactCSSTransitionGroup
            transitionAppear={true}
            transitionAppearTimeout={200}
            transitionEnterTimeout={200}
            transitionLeaveTimeout={200}
            transitionName={`login_form--transition`}
          >
            {/* Add Node Pool */}
            <AddNodePoolWrapperDiv>
              <h3 className='table-label'>Add Node Pool</h3>
              <AddNodePoolFlexColumnDiv>
                <AddNodePool
                  clusterId={cluster.id}
                  releaseVersion={release_version}
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
                      style={{ background: 'red' }}
                      type='button'
                    >
                      Cancel
                    </Button>
                  )}
                </FlexWrapperDiv>
              </AddNodePoolFlexColumnDiv>
            </AddNodePoolWrapperDiv>
          </ReactCSSTransitionGroup>
        ) : (
          <FlexWrapperDiv className={noNodePools && 'no-nodepools'}>
            {noNodePools && (
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
          </FlexWrapperDiv>
        )}
      </>
    );
  }
}

ClusterDetailNodePoolsTable.propTypes = {
  accessCluster: PropTypes.func,
  canClusterUpgrade: PropTypes.bool,
  cluster: PropTypes.object,
  credentials: PropTypes.object,
  dispatch: PropTypes.func,
  lastUpdated: PropTypes.number,
  nodePools: PropTypes.object,
  provider: PropTypes.string,
  region: PropTypes.string,
  release: PropTypes.object,
  setInterval: PropTypes.func,
  showUpgradeModal: PropTypes.func,
  workerNodesRunning: PropTypes.number,
  workerNodesDesired: PropTypes.number,
};

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(
  undefined,
  mapDispatchToProps
)(ReactTimeout(ClusterDetailNodePoolsTable));
