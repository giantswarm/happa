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

class ClusterDetailTable extends React.Component {
  state = {
    enpointCopied: false,
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
      workerNodesDesired,
    } = this.props;
    const { workers, credential_id } = cluster;

    var instanceTypeOrVMSize = null;
    if (provider === 'aws') {
      let details = <span />;
      if (
        workers &&
        workers.length > 0 &&
        typeof workers[0].aws.instance_type !== 'undefined' &&
        this.awsInstanceTypes[workers[0].aws.instance_type]
      ) {
        let t = this.awsInstanceTypes[workers[0].aws.instance_type];
        details = (
          <span>
            &mdash; {t.cpu_cores} CPUs, {t.memory_size_gb.toFixed(0)} GB RAM
          </span>
        );
      }
      instanceTypeOrVMSize = (
        <tr>
          <td>EC2 instance type</td>
          <td className='value'>
            {workers && workers.length > 0 && (
              <span>
                <code>{workers[0].aws.instance_type}</code> {details}
              </span>
            )}
          </td>
        </tr>
      );
    } else if (provider === 'azure') {
      let details = <span />;
      if (
        workers &&
        typeof workers[0].azure.vm_size !== 'undefined' &&
        this.azureVMSizes[workers[0].azure.vm_size]
      ) {
        let t = this.azureVMSizes[workers[0].azure.vm_size];
        details = (
          <span>
            &mdash; {t.numberOfCores} CPUs, {(t.memoryInMb / 1000.0).toFixed(1)}{' '}
            GB RAM
          </span>
        );
      }

      instanceTypeOrVMSize = (
        <tr>
          <td>VM size</td>
          <td className='value'>
            {workers ? (
              <span>
                <code>{workers[0].azure.vm_size}</code> {details}
              </span>
            ) : null}
          </td>
        </tr>
      );
    }

    var scalingLimitsOrNothing = null;
    if (Object.keys(cluster).includes('scaling') && cluster.scaling.min > 0) {
      scalingLimitsOrNothing = (
        <tr>
          <td>Worker node scaling</td>
          <td className='value'>
            <RefreshableLabel
              dataItems={[cluster.scaling.min, cluster.scaling.max]}
            >
              <span>
                {cluster.scaling.min === cluster.scaling.max
                  ? `Pinned at ${cluster.scaling.min}`
                  : `Autoscaling between ${cluster.scaling.min} and ${cluster.scaling.max}`}
              </span>
            </RefreshableLabel>

            <span className='resource-details-button'>
              <Button onClick={() => this.props.showScalingModal()}>
                Edit
              </Button>
            </span>
          </td>
        </tr>
      );
    }

    var availabilityZonesOrNothing = null;
    if (provider === 'aws') {
      const azs = (
        <AvailabilityZonesLabels zones={cluster.availability_zones} />
      );

      availabilityZonesOrNothing = (
        <tr>
          <td>Availablility zones</td>
          <td className='value'>{azs}</td>
        </tr>
      );
    }

    var numberOfDesiredNodesOrNothing = null;
    if (workerNodesDesired != null) {
      numberOfDesiredNodesOrNothing = (
        <tr>
          <td>Desired worker node count</td>
          <td className='value'>
            <RefreshableLabel
              dataItems={[cluster.status.cluster.scaling.desiredCapacity]}
            >
              <span>{workerNodesDesired}</span>
            </RefreshableLabel>
          </td>
        </tr>
      );
    }

    var workerNodeStorageOrNothing = null;
    if (provider === 'kvm') {
      workerNodeStorageOrNothing = (
        <tr>
          <td>Total storage in worker nodes</td>
          <td className='value'>
            <RefreshableLabel
              dataItems={[typeof workers === 'object' ? workers.length : null]}
            >
              <span>
                {!getStorageTotal(cluster) ? '0' : getStorageTotal(cluster)} GB
              </span>
            </RefreshableLabel>
          </td>
        </tr>
      );
    }

    var workerNodeCPU = (
      <tr>
        <td>Total CPU cores in worker nodes</td>
        <td className='value'>
          <RefreshableLabel
            dataItems={[typeof workers === 'object' ? workers.length : null]}
          >
            <span>{!getCpusTotal(cluster) ? '0' : getCpusTotal(cluster)}</span>
          </RefreshableLabel>
        </td>
      </tr>
    );

    var workerNodeMemory = (
      <tr>
        <td>Total RAM in worker nodes</td>
        <td className='value'>
          <RefreshableLabel
            dataItems={[typeof workers === 'object' ? workers.length : null]}
          >
            <span>
              {!getMemoryTotal(cluster) ? '0' : getMemoryTotal(cluster)} GB
            </span>
          </RefreshableLabel>
        </td>
      </tr>
    );

    var workerNodesRunning = (
      <tr>
        <td>Worker nodes running</td>
        <td className='value'>
          <RefreshableLabel
            dataItems={[typeof workers === 'object' ? workers.length : null]}
          >
            <span>
              {this.props.workerNodesRunning === null
                ? '0'
                : this.props.workerNodesRunning}
            </span>
          </RefreshableLabel>
        </td>
      </tr>
    );

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

    const nodePools = [];
    const { create_date, release_version } = cluster;

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
              {!nodePools ? (
                <span>0 nodes</span>
              ) : (
                <>
                  <span>
                    {workerNodesRunning} nodes in {/*nodePools.length*/} node
                    pools
                  </span>
                  <span>
                    <Dot />
                    {/*this.state.RAM*/} GB RAM
                  </span>
                  <span>
                    <Dot />
                    {/*this.state.CPUs*/} CPUs
                  </span>
                </>
              )}
            </div>
          </div>
        </FlexRowWithTwoBlocksOnEdges>
        <FlexRowWithTwoBlocksOnEdges>
          <CopyToClipboardDiv onMouseLeave={this.mouseLeave}>
            <span>Kubernetes endpoint URI:</span>
            <Code>{/*api_endpoint*/}</Code>
            {/* Copy to clipboard. 
            TODO make a render prop component or a hooks function with it */}
            {this.state.endpointCopied ? (
              <i aria-hidden='true' className='fa fa-done' />
            ) : (
              <OverlayTrigger
                overlay={
                  <Tooltip id='tooltip'>
                    Copy {/*api_endpoint*/} to clipboard.
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
            <Button onClick={() => {} /*accessCluster*/}>
              <i className='fa fa-start' /> GET STARTED
            </Button>
          </div>
        </FlexRowWithTwoBlocksOnEdges>
        <div className='cluster-details'>
          <div className='row'>
            <div className='col-12'>
              <table className='table resource-details'>
                <tbody>
                  <tr>
                    <td>Created</td>
                    <td className='value'>
                      {cluster.create_date
                        ? relativeDate(cluster.create_date)
                        : 'n/a'}
                    </td>
                  </tr>

                  {credentialInfoRows === [] ? undefined : credentialInfoRows}

                  {release ? (
                    <tr>
                      <td>Release version</td>
                      <td className='value'>
                        <RefreshableLabel dataItems={[cluster.release_version]}>
                          <span>
                            <a onClick={this.showReleaseDetails}>
                              <i className='fa fa-version-tag' />{' '}
                              {cluster.release_version}{' '}
                              {(() => {
                                var kubernetes = release.components.find(
                                  component => component.name === 'kubernetes'
                                );
                                if (kubernetes) {
                                  return (
                                    <span>
                                      &mdash; includes Kubernetes{' '}
                                      {kubernetes.version}
                                    </span>
                                  );
                                }
                              })()}
                            </a>{' '}
                            {this.props.canClusterUpgrade ? (
                              <a
                                className='upgrade-available'
                                onClick={this.props.showUpgradeModal}
                              >
                                <i className='fa fa-info' /> Upgrade available
                              </a>
                            ) : (
                              undefined
                            )}
                          </span>
                        </RefreshableLabel>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td>Kubernetes version</td>
                      <td className='value code'>
                        {cluster.kubernetes_version !== '' &&
                        cluster.kubernetes_version !== undefined
                          ? cluster.kubernetes_version
                          : 'n/a'}
                      </td>
                    </tr>
                  )}

                  <tr>
                    <td>Kubernetes API endpoint</td>
                    <td className='value code'>
                      {cluster.api_endpoint ? cluster.api_endpoint : 'n/a'}
                    </td>
                  </tr>

                  {availabilityZonesOrNothing}

                  {cluster.kvm && cluster.kvm.port_mappings ? (
                    <tr>
                      <td>Ingress Ports</td>
                      <td>
                        <dl className='ingress-port-table'>
                          {cluster.kvm.port_mappings.reduce(
                            (acc, item, idx) => {
                              return acc.concat([
                                <dt key={`def-${idx}`}>
                                  <code>{item.protocol}</code>
                                </dt>,
                                <dd key={`term-${idx}`}>{item.port}</dd>,
                              ]);
                            },
                            []
                          )}
                        </dl>
                      </td>
                    </tr>
                  ) : (
                    undefined
                  )}

                  {instanceTypeOrVMSize}

                  {scalingLimitsOrNothing}

                  {numberOfDesiredNodesOrNothing}

                  {workerNodesRunning}

                  {workerNodeCPU}

                  {workerNodeMemory}

                  {workerNodeStorageOrNothing}
                </tbody>
              </table>
              <p className='last-updated'>
                <small>
                  The information above is auto-refreshing. Details last fetched{' '}
                  <span className='last-updated-datestring'>
                    {this.lastUpdatedLabel()}
                  </span>
                  . <span className='beta-tag'>BETA</span>
                </small>
              </p>
            </div>
            {release ? (
              <ReleaseDetailsModal
                ref={r => {
                  this.releaseDetailsModal = r;
                }}
                releases={[release]}
              />
            ) : (
              undefined
            )}
          </div>
        </div>
      </>
    );
  }
}

ClusterDetailTable.propTypes = {
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
