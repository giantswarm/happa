import { Code, Dot, FlexRowWithTwoBlocksOnEdges } from 'styles';
import { CopyToClipboardDiv } from './cluster_detail_node_pools_table';
import { getCpusTotal, getMemoryTotal } from 'utils/cluster_utils';
import AWSAccountID from 'UI/aws_account_id';
import Button from 'UI/button';
import copy from 'copy-to-clipboard';
import moment from 'moment';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import PropTypes from 'prop-types';
import React from 'react';
import ReactTimeout from 'react-timeout';
import styled from '@emotion/styled';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import Versions from './Versions';
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

class ClusterDetailTable extends React.Component {
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

    const {
      credential_id,
      create_date,
      release_version,
      api_endpoint,
    } = cluster;

    // TODO Refactor credentials: markup in render, data in variables or functions outside render
    // BYOC provider credential info
    let credentialInfoRows = [];
    if (
      cluster &&
      credential_id &&
      credential_id != '' &&
      credentials.items.length === 1
    ) {
      // check if we have the right credential info
      if (credentials.items[0].id !== credential_id) {
        credentialInfoRows.push(
          <div key='providerCredentialsInvalid'>
            <div>Provider credentials</div>
            <div className='value'>
              Error: cluster credentials do not match organization credentials.
              Please contact support for details.
            </div>
          </div>
        );
      } else {
        if (provider === 'aws') {
          credentialInfoRows.push(
            <div key='awsAccountID'>
              <div>AWS account</div>
              <div className='value code'>
                <AWSAccountID
                  roleARN={credentials.items[0].aws.roles.awsoperator}
                />
              </div>
            </div>
          );
        } else if (provider === 'azure') {
          credentialInfoRows.push(
            <div key='azureSubscriptionID'>
              <div>Azure subscription</div>
              <div className='value code'>
                {credentials.items[0].azure.credential.subscription_id}
              </div>
            </div>
          );
          credentialInfoRows.push(
            <div key='azureTenantID'>
              <div>Azure tenant</div>
              <div className='value code'>
                {credentials.items[0].azure.credential.tenant_id}
              </div>
            </div>
          );
        }
      }
    }

    return (
      <WrapperDiv>
        <FlexRowWithTwoBlocksOnEdges>
          <div>
            <OverlayTrigger
              overlay={<Tooltip id='tooltip'>Region</Tooltip>}
              placement='top'
            >
              <Code>{region && region}</Code>
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

        {credentialInfoRows.length !== 0 && (
          <FlexRowWithTwoBlocksOnEdges>
            credentialInfoRows
          </FlexRowWithTwoBlocksOnEdges>
        )}

        <hr style={{ margin: '25px 0' }} />
        <h2>Worker nodes</h2>
        {provider === 'azure' && (
          <WorkerNodesAzure
            instanceType={
              this.state.azureVMSizes[cluster.workers[0].azure.vm_size]
            }
            nodes={workerNodesRunning}
            showScalingModal={this.props.showScalingModal}
          />
        )}
        {provider === 'kvm' && (
          <WorkerNodesKVM
            worker={cluster.workers[0]}
            nodes={workerNodesRunning}
            showScalingModal={this.props.showScalingModal}
          />
        )}
        {provider === 'aws' && (
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

ClusterDetailTable.propTypes = {
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

export default ReactTimeout(ClusterDetailTable);
