import formatDistance from 'date-fns/fp/formatDistance';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { CSSBreakpoints, Providers } from 'shared/constants';
import { selectResourcesV4 } from 'stores/cluster/selectors';
import { isClusterCreating } from 'stores/cluster/utils';
import styled from 'styled-components';
import { FlexRowWithTwoBlocksOnEdges, mq } from 'styles';
import Button from 'UI/Controls/Button';

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

class V4ClusterDetailTable extends React.Component {
  state = {
    awsInstanceTypes: {},
    azureVMSizes: {},
    lastUpdated: '',
  };

  componentDidMount() {
    const awsInstanceTypes = window.config.awsCapabilitiesJSON
      ? JSON.parse(window.config.awsCapabilitiesJSON)
      : {};

    const azureVMSizes = window.config.azureCapabilitiesJSON
      ? JSON.parse(window.config.azureCapabilitiesJSON)
      : {};

    const lastUpdated = `${formatDistance(new Date())(new Date())} ago`;

    this.setState({ awsInstanceTypes, azureVMSizes, lastUpdated });
  }

  render() {
    const {
      cluster,
      credentials,
      provider,
      release,
      region,
      resources,
      isAdmin,
      releases,
      showUpgradeModal,
      setUpgradeVersion,
    } = this.props;

    const { create_date, api_endpoint } = cluster;
    const { numberOfNodes, memory, cores } = resources;
    const firstWorker = cluster.workers?.[0];

    const isCreating = isClusterCreating(cluster);

    return (
      <WrapperDiv>
        <FlexRowWithTwoBlocksOnEdges>
          <div>
            <RegionAndVersions
              createDate={create_date}
              release={release}
              isAdmin={isAdmin}
              releases={releases}
              provider={provider}
              clusterId={cluster.id}
              showUpgradeModal={showUpgradeModal}
              setUpgradeVersion={setUpgradeVersion}
              region={region}
            />
          </div>
          <div>
            <NodesRunning
              isClusterCreating={isClusterCreating(cluster)}
              workerNodesRunning={numberOfNodes}
              RAM={memory}
              CPUs={cores}
            />
          </div>
        </FlexRowWithTwoBlocksOnEdges>
        <KubernetesURIWrapper>
          <StyledURIBlock title='Kubernetes endpoint URI:'>
            {api_endpoint}
          </StyledURIBlock>
          <GetStartedWrapper>
            <Button onClick={this.props.accessCluster}>
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

        <hr style={{ margin: '25px 0' }} />
        <h2>Worker nodes</h2>
        {provider === Providers.AZURE &&
          Object.keys(this.state.azureVMSizes).length > 0 && (
            <WorkerNodesAzure
              az={cluster.availability_zones}
              isClusterCreating={isCreating}
              instanceType={this.state.azureVMSizes[firstWorker?.azure.vm_size]}
              nodes={numberOfNodes}
              showScalingModal={this.props.showScalingModal}
            />
          )}
        {provider === Providers.KVM && (
          <WorkerNodesKVM
            isClusterCreating={isCreating}
            worker={firstWorker}
            nodes={numberOfNodes}
            showScalingModal={this.props.showScalingModal}
          />
        )}
        {provider === Providers.AWS &&
          Object.keys(this.state.awsInstanceTypes).length > 0 && (
            <WorkerNodesAWS
              az={cluster.availability_zones}
              isClusterCreating={isCreating}
              instanceName={firstWorker?.aws.instance_type}
              instanceType={
                this.state.awsInstanceTypes[firstWorker?.aws.instance_type]
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
              {this.state.lastUpdated}
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
  cluster: PropTypes.object,
  credentials: PropTypes.object,
  provider: PropTypes.string,
  release: PropTypes.object,
  region: PropTypes.string,
  showScalingModal: PropTypes.func,
  showUpgradeModal: PropTypes.func,
  setUpgradeVersion: PropTypes.func.isRequired,
  workerNodesDesired: PropTypes.number,
  resources: PropTypes.object,
  isAdmin: PropTypes.bool,
  releases: PropTypes.object,
};

// We use this wrapper function because we want different references for each cluster
// https://github.com/reduxjs/reselect#sharing-selectors-with-props-across-multiple-component-instances
const makeMapStateToProps = () => {
  const resourcesV4 = selectResourcesV4();
  const mapStateToProps = (state, props) => {
    return {
      resources: resourcesV4(state, props.cluster.id),
    };
  };

  return mapStateToProps;
};

export default connect(makeMapStateToProps, undefined)(V4ClusterDetailTable);
