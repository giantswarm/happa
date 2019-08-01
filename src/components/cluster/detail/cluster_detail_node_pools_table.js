import { Code, Dot, FlexRowWithTwoBlocksOnEdges, Row } from 'styles';
import { css } from '@emotion/core';
import { relativeDate } from 'lib/helpers.js';
import Button from 'UI/button';
import NodePool from './node_pool';
import PropTypes from 'prop-types';
import React from 'react';
import ReactTimeout from 'react-timeout';
import RefreshableLabel from 'UI/refreshable_label';
import styled from '@emotion/styled';

const Upgrade = styled.div`
  color: #ce990f;
  span {
    white-space: normal !important;
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
  > *:nth-child(2) {
    justify-self: left;
  }
  > *:nth-child(9) {
    justify-self: right;
  }
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

class ClusterDetailNodePoolsTable extends React.Component {
  state = {
    nodePool1: {
      id: '6dh',
      name: 'Database',
      instanceType: 'r3.4xlarge',
      avZones: ['eu-central-1f', 'eu-central-1b', 'eu-central-1a'],
      min: 3,
      max: 3,
      desired: 3,
      current: 3,
    },
    nodePool2: {
      id: 'z66',
      name: 'General Purpose',
      instanceType: 'm5.xlarge',
      avZones: ['eu-central-1a', 'eu-central-1c'],
      min: 5,
      max: 20,
      desired: 12,
      current: 11,
    },
    availableZonesGridTemplateAreas: '',
  };

  componentDidMount() {
    const allZones = [
      ...this.state.nodePool1.avZones,
      ...this.state.nodePool2.avZones,
    ].map(zone => zone.slice(-1));

    // This array stores available zones that are in at least one node pool.
    // We only want unique values because this is used fot building the grid.
    const availableZonesGridTemplateAreas = [...new Set(allZones)]
      .sort()
      .join(' ');
    this.setState({
      availableZonesGridTemplateAreas: `"${availableZonesGridTemplateAreas}"`,
    });
  }
  // Put all last letters in an array of letters.

  render() {
    const {
      nodePool1,
      nodePool2,
      availableZonesGridTemplateAreas,
    } = this.state;

    const { cluster, workerNodesRunning } = this.props;

    const {
      create_date,
      master,
      release_version,
      release,
      nodePools,
      api_endpoint,
    } = this.props.cluster;

    return (
      <>
        <FlexRowWithTwoBlocksOnEdges>
          <div>
            <Code>{master ? master.availability_zone : null}</Code>
            <div>
              <span>
                Created {create_date ? relativeDate(create_date) : 'n/a'}
              </span>
              <span>
                <RefreshableLabel dataItems={[release_version]}>
                  <>
                    <Dot style={{ paddingRight: 0 }} />
                    <i className='fa fa-version-tag' />
                    {release_version ? release_version : 'n/a'}
                  </>
                </RefreshableLabel>
              </span>
              <span>
                {release && (
                  <>
                    <Dot />
                    <i className='fa fa-kubernetes' />
                    {() => {
                      var kubernetes = release.components.find(
                        component => component.name === 'kubernetes'
                      );
                      if (kubernetes) return kubernetes.version;
                    }}
                  </>
                )}
                {!release &&
                  cluster.kubernetes_version !== '' &&
                  cluster.kubernetes_version !== undefined &&
                  <i className='fa fa-kubernetes' /> +
                    cluster.kubernetes_version}
              </span>
            </div>
            {this.props.canClusterUpgrade && (
              <a
                className='upgrade-available'
                onClick={this.props.showUpgradeModal}
              >
                <Upgrade>
                  <span>
                    <i className='fa fa-warning' />
                    Upgrade available
                  </span>
                </Upgrade>
              </a>
            )}
          </div>
          <div>
            <div>
              <span>
                {workerNodesRunning} nodes in {nodePools ? nodePools.length : 0}{' '}
                node pools
              </span>
              <span>
                <Dot />0 GB RAM
              </span>
              <span>
                <Dot />0 CPUs
              </span>
            </div>
          </div>
        </FlexRowWithTwoBlocksOnEdges>
        <FlexRowWithTwoBlocksOnEdges>
          <div>
            <span>Kubernetes endpoint URI:</span>
            <Code>{api_endpoint}</Code>
          </div>
          <div style={{ transform: 'translateX(10px)' }}>
            <Button>
              <i className='fa fa-start' /> GET STARTED
            </Button>
          </div>
        </FlexRowWithTwoBlocksOnEdges>
        <NodePoolsWrapper>
          <h2>Node Pools</h2>
          <GridRowNodePoolsNodes>
            <div>
              <span>NODES</span>
            </div>
          </GridRowNodePoolsNodes>
          <GridRowNodePoolsHeaders>
            <span>ID</span>
            <span>NAME</span>
            <span>INSTANCE TYPE</span>
            <span>AVAILABILITY ZONES</span>
            <span>MIN</span>
            <span>MAX</span>
            <span>DESIRED</span>
            <span>CURRENT</span>
            <span> </span>
          </GridRowNodePoolsHeaders>
          <GridRowNodePoolsItem>
            <NodePool
              availableZonesGridTemplateAreas={availableZonesGridTemplateAreas}
              nodePool={nodePool1}
            />
          </GridRowNodePoolsItem>
          <GridRowNodePoolsItem>
            <NodePool
              availableZonesGridTemplateAreas={availableZonesGridTemplateAreas}
              nodePool={nodePool2}
            />
          </GridRowNodePoolsItem>
        </NodePoolsWrapper>
        <Button>
          <i className='fa fa-add-circle' /> ADD NODE POOL
        </Button>
      </>
    );
  }
}

ClusterDetailNodePoolsTable.propTypes = {
  canClusterUpgrade: PropTypes.bool,
  cluster: PropTypes.object,
  credentials: PropTypes.object,
  lastUpdated: PropTypes.number,
  provider: PropTypes.string,
  release: PropTypes.object,
  setInterval: PropTypes.func,
  showScalingModal: PropTypes.func,
  showUpgradeModal: PropTypes.func,
  workerNodesRunning: PropTypes.number,
  workerNodesDesired: PropTypes.number,
};

export default ReactTimeout(ClusterDetailNodePoolsTable);
