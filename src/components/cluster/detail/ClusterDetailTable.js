import { Code, Dot, FlexRowWithTwoBlocksOnEdges, Row } from 'styles';
import {
  getCpusTotal,
  getMemoryTotal,
  getStorageTotal,
} from 'utils/cluster_utils';
import { relativeDate } from 'lib/helpers.js';
import {
  Upgrade,
  FlexWrapperDiv,
  CopyToClipboardDiv,
} from './cluster_detail_node_pools_table';
import AvailabilityZonesLabels from 'UI/availability_zones_labels';
import AWSAccountID from 'UI/aws_account_id';
import Button from 'UI/button';
import moment from 'moment';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import PropTypes from 'prop-types';
import React from 'react';
import ReactTimeout from 'react-timeout';
import RefreshableLabel from 'UI/refreshable_label';
import ReleaseDetailsModal from '../../modals/release_details_modal';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import WorkerNodes from './WorkerNodes';

class ClusterDetailTable extends React.Component {
  state = {
    enpointCopied: false,
    RAM: 0,
    CPUs: 0,
  };

  awsInstanceTypes = {};
  azureVMSizes = {};

  componentDidMount() {
    this.registerRefreshInterval();

    this.awsInstanceTypes = window.config.awsCapabilitiesJSON
      ? JSON.parse(window.config.awsCapabilitiesJSON)
      : {};

    this.azureVMSizes = window.config.azureCapabilitiesJSON
      ? JSON.parse(window.config.azureCapabilitiesJSON)
      : {};

    const { cluster } = this.props;
    const memory = getMemoryTotal(cluster);
    const RAM = !memory ? 0 : memory;

    const cores = getCpusTotal(cluster);
    const CPUs = !cores ? 0 : cores;

    this.setState({ RAM, CPUs });
  }

  registerRefreshInterval = () => {
    // set re-rendering to update relative date/time values
    var refreshInterval = 10 * 1000; // 10 seconds
    this.props.setInterval(() => {
      // enforce re-rendering
      this.setState({ enforceReRender: Date.now() });
    }, refreshInterval);
  };

  showReleaseDetails = () => {
    this.releaseDetailsModal.show();
  };

  /**
   * Returns the proper last updated info string based on available
   * cluster and/or status information.
   */
  lastUpdatedLabel() {
    if (
      this.props.cluster &&
      this.props.cluster.status &&
      this.props.cluster.status.lastUpdated
    ) {
      return moment(this.props.cluster.status.lastUpdated).fromNow();
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

    // BYOC provider credential info
    var credentialInfoRows = [];
    if (
      cluster &&
      credential_id &&
      credential_id != '' &&
      credentials.items.length === 1
    ) {
      // check if we have the right credential info
      if (credentials.items[0].id !== credential_id) {
        credentialInfoRows.push(
          <tr key='providerCredentialsInvalid'>
            <td>Provider credentials</td>
            <td className='value'>
              Error: cluster credentials do not match organization credentials.
              Please contact support for details.
            </td>
          </tr>
        );
      } else {
        if (provider === 'aws') {
          credentialInfoRows.push(
            <tr key='awsAccountID'>
              <td>AWS account</td>
              <td className='value code'>
                <AWSAccountID
                  roleARN={credentials.items[0].aws.roles.awsoperator}
                />
              </td>
            </tr>
          );
        } else if (provider === 'azure') {
          credentialInfoRows.push(
            <tr key='azureSubscriptionID'>
              <td>Azure subscription</td>
              <td className='value code'>
                {credentials.items[0].azure.credential.subscription_id}
              </td>
            </tr>
          );
          credentialInfoRows.push(
            <tr key='azureTenantID'>
              <td>Azure tenant</td>
              <td className='value code'>
                {credentials.items[0].azure.credential.tenant_id}
              </td>
            </tr>
          );
        }
      }
    }

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
              {!workerNodesRunning ? (
                <span>0 nodes</span>
              ) : (
                <>
                  <span>{workerNodesRunning} nodes</span>
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
            <Button onClick={this.props.accessCluster}>
              <i className='fa fa-start' /> GET STARTED
            </Button>
          </div>
        </FlexRowWithTwoBlocksOnEdges>
        <FlexRowWithTwoBlocksOnEdges>
          {credentialInfoRows === [] ? undefined : credentialInfoRows}
        </FlexRowWithTwoBlocksOnEdges>
        <WorkerNodes />
      </>
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
  workerNodesRunning: PropTypes.number,
  workerNodesDesired: PropTypes.number,
};

export default ReactTimeout(ClusterDetailTable);
