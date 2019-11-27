import { Code, Dot, FlexRowWithTwoBlocksOnEdges } from 'styles';
import { CopyToClipboardDiv } from './V5ClusterDetailTable';
import { getCpusTotal, getMemoryTotal } from 'utils/cluster_utils';
import { Providers } from 'shared/constants';
import Button from 'UI/button';
import copy from 'copy-to-clipboard';
import CredentialInfoRow from './CredentialInfoRow';
import moment from 'moment';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import PortMappingsRow from './PortMappingsRow';
import PropTypes from 'prop-types';
import React from 'react';
import ReactTimeout from 'react-timeout';
import RegionAndVersions from './RegionAndVersions';
import styled from '@emotion/styled';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import WorkerNodesAWS from './WorkerNodesAWS';
import WorkerNodesAzure from './WorkerNodesAzure';
import WorkerNodesKVM from './WorkerNodesKVM';

const WrapperDiv = styled.div`
  h2 {
    font-weight: 400;
    font-size: 22px;
    margin: 0 0 25px;
  }
  .pointer {
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
`;

class V4ClusterDetailTable extends React.Component {
  state = {
    enpointCopied: false,
    RAM: 0,
    CPUs: 0,
    awsInstanceTypes: {},
    azureVMSizes: {},
  };

  componentDidMount() {
    const awsInstanceTypes = window.config.awsCapabilitiesJSON
      ? JSON.parse(window.config.awsCapabilitiesJSON)
      : {};

    const azureVMSizes = window.config.azureCapabilitiesJSON
      ? JSON.parse(window.config.azureCapabilitiesJSON)
      : {};

    const { cluster } = this.props;
    const memory = getMemoryTotal(cluster);
    const RAM = !memory ? 0 : memory;

    const cores = getCpusTotal(cluster);
    const CPUs = !cores ? 0 : cores;

    this.setState({ awsInstanceTypes, azureVMSizes, RAM, CPUs });
  }

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

  /**
   * Returns the proper last updated info string based on available
   * cluster and/or status information.
   */
  lastUpdatedLabel() {
    const { cluster } = this.props;
    if (cluster && cluster.status && cluster.status.lastUpdated) {
      return moment(cluster.status.lastUpdated).fromNow();
    }
    return 'n/a';
  }

  render() {
    const {
      cluster,
      credentials,
      provider,
      release,
      region,
      workerNodesRunning,
    } = this.props;

    const { create_date, release_version, api_endpoint } = cluster;

    return (
      <WrapperDiv>
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
            <div>
              {!workerNodesRunning ? (
                <span>0 nodes</span>
              ) : (
                <>
                  <span>
                    {workerNodesRunning}
                    {workerNodesRunning === 1 ? ' node' : ' nodes'}
                  </span>
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
            </div>
          </div>
        </FlexRowWithTwoBlocksOnEdges>
        <FlexRowWithTwoBlocksOnEdges>
          <CopyToClipboardDiv onMouseLeave={this.mouseLeave}>
            <span>Kubernetes endpoint URI:</span>
            <Code>{api_endpoint}</Code>
            {/* Copy to clipboard. */}
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
            <Button onClick={this.props.accessCluster}>
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

        <hr style={{ margin: '25px 0' }} />
        <h2>Worker nodes</h2>
        {provider === Providers.AZURE && (
          <WorkerNodesAzure
            az={cluster.availability_zones}
            instanceType={
              this.state.azureVMSizes[cluster.workers[0].azure.vm_size]
            }
            nodes={workerNodesRunning}
            showScalingModal={this.props.showScalingModal}
          />
        )}
        {provider === Providers.KVM && (
          <WorkerNodesKVM
            worker={cluster.workers[0]}
            nodes={workerNodesRunning}
            showScalingModal={this.props.showScalingModal}
          />
        )}
        {provider === Providers.AWS && (
          <WorkerNodesAWS
            az={cluster.availability_zones}
            instanceName={cluster.workers[0].aws.instance_type}
            instanceType={
              this.state.awsInstanceTypes[cluster.workers[0].aws.instance_type]
            }
            scaling={cluster.scaling}
            showScalingModal={this.props.showScalingModal}
            workerNodesDesired={this.props.workerNodesDesired}
            workerNodesRunning={workerNodesRunning}
          />
        )}
        <p className='last-updated'>
          <small>
            The information above is auto-refreshing. Details last fetched{' '}
            <span className='last-updated-datestring'>
              {this.lastUpdatedLabel()}
            </span>
            . <span className='beta-tag'>BETA</span>
          </small>
        </p>
      </WrapperDiv>
    );
  }
}

V4ClusterDetailTable.propTypes = {
  accessCluster: PropTypes.func,
  canClusterUpgrade: PropTypes.bool,
  cluster: PropTypes.object,
  credentials: PropTypes.object,
  lastUpdated: PropTypes.number,
  provider: PropTypes.string,
  release: PropTypes.object,
  region: PropTypes.string,
  setInterval: PropTypes.func,
  showScalingModal: PropTypes.func,
  showUpgradeModal: PropTypes.func,
  workerNodesDesired: PropTypes.number,
  workerNodesRunning: PropTypes.number,
};

export default ReactTimeout(V4ClusterDetailTable);
