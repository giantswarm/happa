'use strict';

import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';

import { relativeDate } from '../../lib/helpers.js';
import AWSAccountID from '../shared/aws_account_id';
import ReleaseDetailsModal from '../modal/release_details_modal';

class ClusterDetailTable extends React.Component {
  showReleaseDetails = () => {
    this.releaseDetailsModal.show();
  };

  getDesiredNumberOfNodes() {
    if (
      Object.keys(this.props.cluster).includes('status') &&
      this.props.cluster.status != null
    ) {
      return this.props.cluster.status.cluster.scaling.desiredCapacity;
    }
    return null;
  }

  getMemoryTotal() {
    if (!this.props.cluster.workers) {
      return null;
    }
    var m = 0.0;
    for (var i = 0; i < this.props.cluster.workers.length; i++) {
      m += this.props.cluster.workers[i].memory.size_gb;
    }
    return m.toFixed(2);
  }

  getNumberOfNodes() {
    if (
      Object.keys(this.props.cluster).includes('status') &&
      this.props.cluster.status != null
    ) {
      var nodes = this.props.cluster.status.cluster.nodes;
      if (nodes.length == 0) {
        return 0;
      }

      var workers = 0;
      nodes.forEach(node => {
        if (Object.keys(node).includes('labels')) {
          if (node.labels['role'] != 'master') {
            workers++;
          }
        }
      });

      if (workers === 0) {
        // No node labels available? Fallback to assumption that one of the
        // nodes is master and rest are workers.
        workers = nodes.length - 1;
      }

      return workers;
    }
    return null;
  }

  getStorageTotal() {
    if (!this.props.cluster.workers) {
      return null;
    }
    var s = 0.0;
    for (var i = 0; i < this.props.cluster.workers.length; i++) {
      s += this.props.cluster.workers[i].storage.size_gb;
    }
    return s.toFixed(2);
  }

  getCpusTotal() {
    if (!this.props.cluster.workers) {
      return null;
    }
    var c = 0;
    for (var i = 0; i < this.props.cluster.workers.length; i++) {
      c += this.props.cluster.workers[i].cpu.cores;
    }
    return c;
  }

  render() {
    var instanceTypeOrVMSize = <tr />;

    if (this.props.provider === 'aws') {
      instanceTypeOrVMSize = (
        <tr>
          <td>EC2 instance type</td>
          <td className='value code'>
            {this.props.cluster.workers[0].aws.instance_type}
          </td>
        </tr>
      );
    } else if (this.props.provider === 'azure') {
      instanceTypeOrVMSize = (
        <tr>
          <td>VM size</td>
          <td className='value code'>
            {this.props.cluster.workers[0].azure.vm_size}
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
          <td>Scaling Limits</td>
          <td className='value'>
            {this.props.cluster.scaling.min +
              '  -  ' +
              this.props.cluster.scaling.max}
          </td>
        </tr>
      );
    }

    var availabilityZonesOrNothing = null;
    if (
      this.props.provider === 'aws' &&
      this.props.cluster.availability_zones
    ) {
      availabilityZonesOrNothing = (
        <tr>
          <td>Availablility zones</td>
          <td className='value'>
            {this.props.cluster.availability_zones.join(', ')}
          </td>
        </tr>
      );
    }

    var numberOfDesiredNodesOrNothing = null;
    if (this.props.provider === 'aws') {
      numberOfDesiredNodesOrNothing = (
        <tr>
          <td>Number of desired worker nodes</td>
          <td className='value'>
            {this.getDesiredNumberOfNodes() === null
              ? 'n/a'
              : this.getDesiredNumberOfNodes()}
          </td>
        </tr>
      );
    }

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
                    <td className='value code'>
                      <a onClick={this.showReleaseDetails}>
                        {this.props.cluster.release_version}{' '}
                        {(() => {
                          var kubernetes = _.find(
                            this.props.release.components,
                            component => component.name === 'kubernetes'
                          );
                          if (kubernetes) {
                            return (
                              <span>
                                &mdash; includes Kubernetes {kubernetes.version}
                              </span>
                            );
                          }
                        })()}
                      </a>{' '}
                      {this.props.canClusterUpgrade ? (
                        <a
                          onClick={this.props.showUpgradeModal}
                          className='upgrade-available'
                        >
                          <i className='fa fa-info-circle' /> Upgrade available
                        </a>
                      ) : (
                        undefined
                      )}
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
                {scalingLimitsOrNothing}
                {numberOfDesiredNodesOrNothing}
                <tr>
                  <td>Number of running worker nodes</td>
                  <td className='value'>
                    {this.getNumberOfNodes() === null
                      ? 'n/a'
                      : this.getNumberOfNodes()}
                  </td>
                </tr>
                {instanceTypeOrVMSize}
                <tr>
                  <td>Total CPU cores in worker nodes</td>
                  <td className='value'>
                    {this.getCpusTotal() === null ? 'n/a' : this.getCpusTotal()}
                  </td>
                </tr>
                <tr>
                  <td>Total RAM in worker nodes</td>
                  <td className='value'>
                    {this.getMemoryTotal() === null
                      ? 'n/a'
                      : this.getMemoryTotal()}{' '}
                    GB
                  </td>
                </tr>
                {this.props.provider === 'kvm' ? (
                  <tr>
                    <td>Total storage in worker nodes</td>
                    <td className='value'>
                      {this.getStorageTotal() === null
                        ? 'n/a'
                        : this.getStorageTotal()}{' '}
                      GB
                    </td>
                  </tr>
                ) : (
                  undefined
                )}
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
              </tbody>
            </table>
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
  showUpgradeModal: PropTypes.func,
  cluster: PropTypes.object,
  provider: PropTypes.string,
  credentials: PropTypes.object,
  release: PropTypes.object,
};

export default ClusterDetailTable;
