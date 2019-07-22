import { availabilityZonesLabels } from 'lib/utils';
import { relativeDate } from 'lib/helpers.js';
import _ from 'underscore';
import AWSAccountID from 'UI/aws_account_id';
import Button from 'UI/button';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import ReactTimeout from 'react-timeout';
import RefreshableLabel from 'UI/refreshable_label';
import ReleaseDetailsModal from '../../modals/release_details_modal';

class ClusterDetailTable extends React.Component {
  constructor(props) {
    super(props);

    if (window.config.awsCapabilitiesJSON != '') {
      this.awsInstanceTypes = JSON.parse(window.config.awsCapabilitiesJSON);
    }

    if (window.config.azureCapabilitiesJSON != '') {
      this.azureVMSizes = JSON.parse(window.config.azureCapabilitiesJSON);
    }
  }

  componentDidMount() {
    this.registerRefreshInterval();
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

  getMemoryTotal() {
    if (
      this.props.workerNodesRunning === null ||
      this.props.workerNodesRunning === 0 ||
      !this.props.cluster.workers
    ) {
      return null;
    }
    var m =
      this.props.workerNodesRunning *
      this.props.cluster.workers[0].memory.size_gb;
    return m.toFixed(2);
  }

  getStorageTotal() {
    if (
      this.props.workerNodesRunning === null ||
      this.props.workerNodesRunning === 0 ||
      !this.props.cluster.workers
    ) {
      return null;
    }
    var s =
      this.props.workerNodesRunning *
      this.props.cluster.workers[0].storage.size_gb;
    return s.toFixed(2);
  }

  getCpusTotal() {
    if (
      this.props.workerNodesRunning === null ||
      this.props.workerNodesRunning === 0 ||
      !this.props.cluster.workers
    ) {
      return null;
    }
    return (
      this.props.workerNodesRunning * this.props.cluster.workers[0].cpu.cores
    );
  }

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
    var instanceTypeOrVMSize = null;
    if (this.props.provider === 'aws') {
      let details = <span />;
      if (
        this.props.cluster.workers &&
        typeof this.props.cluster.workers[0].aws.instance_type !==
          'undefined' &&
        this.awsInstanceTypes[this.props.cluster.workers[0].aws.instance_type]
      ) {
        let t = this.awsInstanceTypes[
          this.props.cluster.workers[0].aws.instance_type
        ];
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
            {this.props.cluster.workers ? (
              <span>
                <code>{this.props.cluster.workers[0].aws.instance_type}</code>{' '}
                {details}
              </span>
            ) : null}
          </td>
        </tr>
      );
    } else if (this.props.provider === 'azure') {
      let details = <span />;
      if (
        this.props.cluster.workers &&
        typeof this.props.cluster.workers[0].azure.vm_size !== 'undefined' &&
        this.azureVMSizes[this.props.cluster.workers[0].azure.vm_size]
      ) {
        let t = this.azureVMSizes[this.props.cluster.workers[0].azure.vm_size];
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
            {this.props.cluster.workers ? (
              <span>
                <code>{this.props.cluster.workers[0].azure.vm_size}</code>{' '}
                {details}
              </span>
            ) : null}
          </td>
        </tr>
      );
    }

    var scalingLimitsOrNothing = null;
    if (
      Object.keys(this.props.cluster).includes('scaling') &&
      this.props.cluster.scaling.min > 0
    ) {
      scalingLimitsOrNothing = (
        <tr>
          <td>Worker node scaling</td>
          <td className='value'>
            <RefreshableLabel
              dataItems={[
                this.props.cluster.scaling.min,
                this.props.cluster.scaling.max,
              ]}
            >
              <span>
                {this.props.cluster.scaling.min ===
                this.props.cluster.scaling.max
                  ? `Pinned at ${this.props.cluster.scaling.min}`
                  : `Autoscaling between ${this.props.cluster.scaling.min} and ${this.props.cluster.scaling.max}`}
              </span>
            </RefreshableLabel>

            <span className='resource-details-button'>
              <Button onClick={this.props.showScalingModal}>Edit</Button>
            </span>
          </td>
        </tr>
      );
    }

    var availabilityZonesOrNothing = null;
    if (this.props.provider === 'aws') {
      const azs = availabilityZonesLabels(
        this.props.cluster.availability_zones
      );

      availabilityZonesOrNothing = (
        <tr>
          <td>Availablility zones</td>
          <td className='value'>{azs}</td>
        </tr>
      );
    }

    var numberOfDesiredNodesOrNothing = null;
    if (this.props.workerNodesDesired != null) {
      numberOfDesiredNodesOrNothing = (
        <tr>
          <td>Desired worker node count</td>
          <td className='value'>
            <RefreshableLabel
              dataItems={[
                this.props.cluster.status.cluster.scaling.desiredCapacity,
              ]}
            >
              <span>{this.props.workerNodesDesired}</span>
            </RefreshableLabel>
          </td>
        </tr>
      );
    }

    var workerNodeStorageOrNothing = null;
    if (this.props.provider === 'kvm') {
      workerNodeStorageOrNothing = (
        <tr>
          <td>Total storage in worker nodes</td>
          <td className='value'>
            <RefreshableLabel
              dataItems={[
                typeof this.props.cluster.workers === 'object'
                  ? this.props.cluster.workers.length
                  : null,
              ]}
            >
              <span>
                {this.getStorageTotal() === null ? '0' : this.getStorageTotal()}{' '}
                GB
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
            dataItems={[
              typeof this.props.cluster.workers === 'object'
                ? this.props.cluster.workers.length
                : null,
            ]}
          >
            <span>
              {this.getCpusTotal() === null ? '0' : this.getCpusTotal()}
            </span>
          </RefreshableLabel>
        </td>
      </tr>
    );

    var workerNodeMemory = (
      <tr>
        <td>Total RAM in worker nodes</td>
        <td className='value'>
          <RefreshableLabel
            dataItems={[
              typeof this.props.cluster.workers === 'object'
                ? this.props.cluster.workers.length
                : null,
            ]}
          >
            <span>
              {this.getMemoryTotal() === null ? '0' : this.getMemoryTotal()} GB
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
            dataItems={[
              typeof this.props.cluster.workers === 'object'
                ? this.props.cluster.workers.length
                : null,
            ]}
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
      this.props.cluster &&
      this.props.cluster.credential_id &&
      this.props.cluster.credential_id != '' &&
      this.props.credentials.items.length === 1
    ) {
      // check if we have the right credential info
      if (
        this.props.credentials.items[0].id !== this.props.cluster.credential_id
      ) {
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
        if (this.props.provider === 'aws') {
          credentialInfoRows.push(
            <tr key='awsAccountID'>
              <td>AWS account</td>
              <td className='value code'>
                <AWSAccountID
                  roleARN={
                    this.props.credentials.items[0].aws.roles.awsoperator
                  }
                />
              </td>
            </tr>
          );
        } else if (this.props.provider === 'azure') {
          credentialInfoRows.push(
            <tr key='azureSubscriptionID'>
              <td>Azure subscription</td>
              <td className='value code'>
                {
                  this.props.credentials.items[0].azure.credential
                    .subscription_id
                }
              </td>
            </tr>
          );
          credentialInfoRows.push(
            <tr key='azureTenantID'>
              <td>Azure tenant</td>
              <td className='value code'>
                {this.props.credentials.items[0].azure.credential.tenant_id}
              </td>
            </tr>
          );
        }
      }
    }

    return (
      <div className='cluster-details'>
        <div className='row'>
          <div className='col-12'>
            <table className='table resource-details'>
              <tbody>
                <tr>
                  <td>Created</td>
                  <td className='value'>
                    {this.props.cluster.create_date
                      ? relativeDate(this.props.cluster.create_date)
                      : 'n/a'}
                  </td>
                </tr>

                {credentialInfoRows === [] ? undefined : credentialInfoRows}

                {this.props.release ? (
                  <tr>
                    <td>Release version</td>
                    <td className='value'>
                      <RefreshableLabel
                        dataItems={[this.props.cluster.release_version]}
                      >
                        <span>
                          <a onClick={this.showReleaseDetails}>
                            <i className='fa fa-version-tag' />{' '}
                            {this.props.cluster.release_version}{' '}
                            {(() => {
                              var kubernetes = _.find(
                                this.props.release.components,
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
                      {this.props.cluster.kubernetes_version !== '' &&
                      this.props.cluster.kubernetes_version !== undefined
                        ? this.props.cluster.kubernetes_version
                        : 'n/a'}
                    </td>
                  </tr>
                )}

                <tr>
                  <td>Kubernetes API endpoint</td>
                  <td className='value code'>
                    {this.props.cluster.api_endpoint
                      ? this.props.cluster.api_endpoint
                      : 'n/a'}
                  </td>
                </tr>

                {availabilityZonesOrNothing}

                {this.props.cluster.kvm &&
                this.props.cluster.kvm.port_mappings ? (
                  <tr>
                    <td>Ingress Ports</td>
                    <td>
                      <dl className='ingress-port-table'>
                        {this.props.cluster.kvm.port_mappings.reduce(
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
          {this.props.release ? (
            <ReleaseDetailsModal
              ref={r => {
                this.releaseDetailsModal = r;
              }}
              releases={[this.props.release]}
            />
          ) : (
            undefined
          )}
        </div>
      </div>
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
  setInterval: PropTypes.func,
  showScalingModal: PropTypes.func,
  showUpgradeModal: PropTypes.func,
  workerNodesRunning: PropTypes.number,
  workerNodesDesired: PropTypes.number,
};

export default ReactTimeout(ClusterDetailTable);
