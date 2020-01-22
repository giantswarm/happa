import { css } from '@emotion/core';
import styled from '@emotion/styled';
import { nodePoolsCreate } from 'actions/nodePoolActions';
import produce from 'immer';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import ReactTimeout from 'react-timeout';
import { TransitionGroup } from 'react-transition-group';
import { selectComputedResourcesV5 } from 'selectors/index';
import { FlexRowWithTwoBlocksOnEdges, Row } from 'styles';
import BaseTransition from 'styles/transitions/BaseTransition';
import SlideTransition from 'styles/transitions/SlideTransition';
import Button from 'UI/Button';
import { clusterNodePools } from 'utils/clusterUtils';

import AddNodePool from './AddNodePool';
import CredentialInfoRow from './CredentialInfoRow';
import NodePool from './NodePool';
import NodesRunning from './NodesRunning';
import PortMappingsRow from './PortMappingsRow';
import RegionAndVersions from './RegionAndVersions';
import URIBlock from './URIBlock';

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
  &.zero-nodepools {
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

class V5ClusterDetailTable extends React.Component {
  state = {
    loading: false,
    availableZonesGridTemplateAreas: '',
    nodePools: null,
    isNodePoolBeingAdded: false,
    nodePoolForm: {
      isValid: false,
      isSubmitting: false,
      data: {},
    },
  };

  componentDidMount() {
    this.produceNodePools();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.nodePools !== this.props.nodePools) {
      this.produceNodePools();
    }
  }

  // TODO Move this to the action creator so it will be triggered on every NPs load.
  produceNodePools = () => {
    if (Object.keys(this.props.nodePools).length > 0) {
      this.setState({ loading: true });
      const nodePools = clusterNodePools(
        this.props.nodePools,
        this.props.cluster
      );

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

      this.setState({
        nodePools,
        loading: false,
      });
    }
  };

  toggleAddNodePoolForm = () =>
    this.setState(prevState => ({
      isNodePoolBeingAdded: !prevState.isNodePoolBeingAdded,
    }));

  updateNodePoolForm = data => {
    this.setState(prevState =>
      produce(prevState, draft => {
        draft.nodePoolForm = { ...prevState.nodePoolForm, ...data };
      })
    );
  };

  createNodePool = async () => {
    const data = [this.state.nodePoolForm.data];

    this.setState(
      produce(draft => {
        draft.nodePoolForm.data = { isSubmiting: true };
      })
    );

    this.toggleAddNodePoolForm();
    await this.props.dispatch(nodePoolsCreate(this.props.cluster.id, data));
  };

  /**
   * Returns the proper last updated info string based on available
   * cluster and/or status information.
   */
  lastUpdatedLabel() {
    const { cluster } = this.props;
    if (cluster && cluster.lastUpdated) {
      return moment(cluster.lastUpdated).fromNow();
    }

    return 'n/a';
  }

  render() {
    const {
      availableZonesGridTemplateAreas,
      nodePools,
      nodePoolForm,
    } = this.state;
    const {
      accessCluster,
      cluster,
      credentials,
      provider,
      region,
      release,
      resources,
    } = this.props;

    const { create_date, release_version, api_endpoint } = cluster;
    const zeroNodePools = nodePools && nodePools.length === 0;

    const { numberOfNodes, memory, cores } = resources;

    return (
      <>
        <FlexRowWithTwoBlocksOnEdges>
          <div>
            <RegionAndVersions
              createDate={create_date}
              releaseVersion={release_version}
              release={release}
              k8sVersion={cluster.kubernetes_version}
              canUpgrade={this.props.canClusterUpgrade}
              showUpgradeModal={this.props.showUpgradeModal}
              region={region}
            />
          </div>
          <div>
            <NodesRunning
              workerNodesRunning={numberOfNodes}
              RAM={memory}
              CPUs={cores}
              nodePools={nodePools}
            />
          </div>
        </FlexRowWithTwoBlocksOnEdges>
        <FlexRowWithTwoBlocksOnEdges>
          <URIBlock title='Kubernetes endpoint URI:'>{api_endpoint}</URIBlock>
          <div style={{ transform: 'translateX(10px)' }}>
            <Button onClick={accessCluster}>
              <i className='fa fa-start' /> GET STARTED
            </Button>
          </div>
        </FlexRowWithTwoBlocksOnEdges>

        <PortMappingsRow cluster={cluster} />

        <CredentialInfoRow
          cluster={cluster}
          credentials={credentials}
          provider={provider}
        />

        <NodePoolsWrapper>
          <h2>Node Pools</h2>
          {nodePools && nodePools.length > 0 && !this.state.loading && (
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
                <span>INSTANCE TYPE</span>
                <span>AVAILABILITY ZONES</span>
                <span>MIN</span>
                <span>MAX</span>
                <span>DESIRED</span>
                <span>CURRENT</span>
                <span> </span>
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
                  .map(nodePool => (
                    <BaseTransition
                      key={nodePool.id || Date.now()}
                      appear={true}
                      exit={false}
                      classNames='np'
                      timeout={{ enter: 500, appear: 500 }}
                    >
                      <GridRowNodePoolsItem data-testid={nodePool.id}>
                        <NodePool
                          availableZonesGridTemplateAreas={
                            availableZonesGridTemplateAreas
                          }
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
        {this.state.isNodePoolBeingAdded ? (
          <SlideTransition in={true} appear={true} direction='down'>
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
                      type='button'
                    >
                      Cancel
                    </Button>
                  )}
                </FlexWrapperDiv>
              </AddNodePoolFlexColumnDiv>
            </AddNodePoolWrapperDiv>
          </SlideTransition>
        ) : (
          <FlexWrapperDiv className={zeroNodePools && 'zero-nodepools'}>
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
          </FlexWrapperDiv>
        )}
        <p className='last-updated' style={{ marginTop: '20px' }}>
          <small>
            The information above is auto-refreshing. Details last fetched{' '}
            <span className='last-updated-datestring'>
              {this.lastUpdatedLabel()}
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
  nodePools: PropTypes.object,
  provider: PropTypes.string,
  region: PropTypes.string,
  release: PropTypes.object,
  setInterval: PropTypes.func,
  showUpgradeModal: PropTypes.func,
  workerNodesDesired: PropTypes.number,
  resources: PropTypes.object,
};

function mapStateToProps(state, ownProps) {
  return {
    resources: selectComputedResourcesV5(state, ownProps),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReactTimeout(V5ClusterDetailTable));
