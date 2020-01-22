import styled from '@emotion/styled';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { selectComputedResourcesV4 } from 'selectors/index';
import { Providers } from 'shared/constants';
import { FlexRowWithTwoBlocksOnEdges } from 'styles';
import Button from 'UI/Button';

import CredentialInfoRow from './CredentialInfoRow';
import NodesRunning from './NodesRunning';
import PortMappingsRow from './PortMappingsRow';
import RegionAndVersions from './RegionAndVersions';
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

    this.setState({ awsInstanceTypes, azureVMSizes });
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
      resources,
    } = this.props;

    const { create_date, release_version, api_endpoint } = cluster;
    const { numberOfNodes, memory, cores } = resources;

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
              workerNodesRunning={numberOfNodes}
              RAM={memory}
              CPUs={cores}
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
            nodes={numberOfNodes}
            showScalingModal={this.props.showScalingModal}
          />
        )}
        {provider === Providers.KVM && (
          <WorkerNodesKVM
            worker={cluster.workers[0]}
            nodes={numberOfNodes}
            showScalingModal={this.props.showScalingModal}
          />
        )}
        {provider === Providers.AWS &&
          cluster.workers &&
          cluster.workers.length !== 0 && (
            <WorkerNodesAWS
              az={cluster.availability_zones}
              instanceName={cluster.workers[0].aws.instance_type}
              instanceType={
                this.state.awsInstanceTypes[
                  cluster.workers[0].aws.instance_type
                ]
              }
              scaling={cluster.scaling}
              showScalingModal={this.props.showScalingModal}
              workerNodesDesired={this.props.workerNodesDesired}
              workerNodesRunning={numberOfNodes}
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
  resources: PropTypes.object,
};

function mapStateToProps(state, ownProps) {
  return {
    resources: selectComputedResourcesV4(state, ownProps),
  };
}

export default connect(mapStateToProps, undefined)(V4ClusterDetailTable);
