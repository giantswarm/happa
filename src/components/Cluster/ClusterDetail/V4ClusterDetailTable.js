import { FlexRowWithTwoBlocksOnEdges } from 'styles';
import { getCpusTotal, getMemoryTotal } from 'utils/clusterUtils';
import { Providers } from 'shared/constants';
import Button from 'UI/Button';
import CredentialInfoRow from './CredentialInfoRow';
import moment from 'moment';
import NodesRunning from './NodesRunning';
import PortMappingsRow from './PortMappingsRow';
import PropTypes from 'prop-types';
import React from 'react';
import ReactTimeout from 'react-timeout';
import RegionAndVersions from './RegionAndVersions';
import styled from '@emotion/styled';
import URIBlock from './URIBlock';
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
            <NodesRunning
              workerNodesRunning={workerNodesRunning}
              RAM={this.state.RAM}
              CPUs={this.state.CPUs}
            />
          </div>
        </FlexRowWithTwoBlocksOnEdges>
        <FlexRowWithTwoBlocksOnEdges>
          <URIBlock title='Kubernetes endpoint URI:'>{api_endpoint}</URIBlock>
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
            .
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
