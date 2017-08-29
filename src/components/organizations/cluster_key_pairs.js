'use strict';

import React from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Button from '../button';
import * as clusterActions from '../../actions/clusterActions';
import { relativeDate, truncate } from '../../lib/helpers.js';
import {OverlayTrigger, Tooltip} from 'react-bootstrap/lib';
import ExpiryHoursPicker from './expiry_hours_picker';
import GiantSwarm from '../../lib/giantswarm_client_wrapper';
import { makeKubeConfigTextFile, dedent } from '../../lib/helpers';
import copy from 'copy-to-clipboard';
import _ from 'underscore';

class ClusterKeyPairs extends React.Component {
 constructor(props) {
    super(props);

    this.state = {
      loading: true,
      expireTTL: 8760,
      description: this.defaultDescription(props.user.email),
      cn_prefix: '',
      certificate_organizations: '',
      modal: {
        visible: false,
        loading: false,
        template: 'addKeyPair',
      }
    };
  }

  defaultDescription(email) {
    return 'Added by user ' + email + ' using Happa web interface';
  }

  handleTTLChange(ttl) {
    this.setState({
      expireTTL: ttl
    });
  }

  handleDescriptionChange(e) {
    this.setState({
      description: e.target.value
    });
  }

  handleCNPrefixChange(e) {
    this.setState({
      cn_prefix: e.target.value
    });
  }

  handleCertificateOrganizationsChange(e) {
    this.setState({
      certificate_organizations: e.target.value
    });
  }

  componentDidMount() {
    return this.props.actions.clusterLoadKeyPairs(this.props.cluster.id)
    .then(() => {
      this.setState({
        loading: false
      });
    });
  }

  closeModal() {
    this.setState({
      cn_prefix: '',
      certificate_organizations: '',
      description: this.defaultDescription(this.props.user.email),
      modal: {
        visible: false,
        loading: false
      }
    });
  }

  addKeyPair() {
    this.setState({
      modal: {
        visible: true,
        loading: false,
        template: 'addKeyPair'
      }
    });
  }

  confirmAddKeyPair(e) {
    if (e) {
      e.preventDefault();
    }

    var authToken = this.props.user.authToken;
    var giantSwarm = new GiantSwarm.Client(authToken);

    this.setState({
      modal: {
        visible: true,
        loading: true,
        template: 'addKeyPair'
      }
    }, () => {
      giantSwarm.createClusterKeyPair({
        certificate_organizations: this.state.certificate_organizations,
        clusterId: this.props.cluster.id,
        cn_prefix: this.state.cn_prefix,
        description: this.state.description,
        ttl_hours: this.state.expireTTL,
      })
      .then((response) => {
        this.setState({
          kubeconfig: dedent(makeKubeConfigTextFile(this.props.cluster, response.result)),
          modal: {
            visible: true,
            loading: false,
            template: 'addKeyPairSuccess'
          }
        });

        return this.props.actions.clusterLoadKeyPairs(this.props.cluster.id);
      })
      .catch(() => {
        setTimeout(() => {
          this.setState({
            modal: {
              visible: true,
              loading: false,
              template: 'addKeyPairFailure'
            }
          });
        }, 200);
      });
    });
  }

  copyKubeConfig(e) {
    e.preventDefault();
    copy(this.state.kubeconfig);
    this.setState({
      copied: true
    }, () => {
      setTimeout(() => {
        this.setState({
          copied: false
        });
      }, 500);
    });
  }

  blob() {
    var blob = new Blob([this.state.kubeconfig], {type: 'application/plain;charset=utf-8'});
    return blob;
  }

  downloadAsFileLink() {
    return(
      <a href={window.URL.createObjectURL(this.blob())} className="btn btn-default" download='giantswarm-kubeconfig'>
        Download
      </a>
    );
  }

  downloadKubeConfig() {

  }

  render() {
    return (
      <div className='row section cluster_key_pairs'>
        <div className='row'>
          <div className='col-12'>
            <h3 className='table-label'>Key Pairs</h3>
          </div>
        </div>

        <div className='row'>
          <div className='col-9'>
            <p>Key pairs consist of an RSA private key and certificate, signed by the certificate authority (CA) belonging to this cluster. They are used for access to the cluster via the Kubernetes API.</p>
          </div>
        </div>

        <div className='row'>
          <div className='col-12'>
            {
              (() => {
                if (this.state.loading) {
                  return <p><img className='loader' src='/images/loader_oval_light.svg'/></p>;
                } else if (this.props.cluster.keyPairs.length === 0) {
                  return <p>No key pairs yet. Why don't you create your first?</p>;
                } else {
                  return <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Description</th>
                        <th>Created</th>
                        <th>Expires</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        _.map(_.sortBy(this.props.cluster.keyPairs, 'create_date').reverse(), (keyPair) => {
                          return <tr key={keyPair.id}>
                            <td className="code">
                              <OverlayTrigger placement="top" overlay={
                                  <Tooltip id="tooltip">{keyPair.id}</Tooltip>
                                }>
                                <span>{truncate(keyPair.id.replace(/:/g, ''), 9)}</span>
                              </OverlayTrigger>
                            </td>

                            <td>{keyPair.description}</td>
                            <td>{relativeDate(keyPair.create_date)}</td>
                            <td>{relativeDate(keyPair.expire_date)}</td>
                          </tr>;
                        })
                      }
                    </tbody>
                  </table>;
                }
              })()
            }
            <Button onClick={this.addKeyPair.bind(this)} bsStyle='default' className='small'>Create Key Pair</Button>
          </div>
        </div>
        {
          (() => {
            switch(this.state.modal.template) {
              case 'addKeyPair':
                return <BootstrapModal className='create-key-pair-modal' show={this.state.modal.visible} onHide={this.closeModal.bind(this)}>
                  <BootstrapModal.Header closeButton>
                    <BootstrapModal.Title>Create New Key Pair</BootstrapModal.Title>
                  </BootstrapModal.Header>
                  <form onSubmit={this.confirmAddKeyPair.bind(this)} >
                    <BootstrapModal.Body>
                      <p>A key pair grants you access to the Kubernetes API of this cluster.</p>
                      <p>Kubernetes uses the common name of the certificate as the username, and assigns the Organizations as roles. This allows you to set up role based access rights.</p>
                        <div className="row">
                          <div className="col-6">
                            <label>Common Name Prefix:</label>
                            <input ref='domainInput' autoFocus type='text' value={this.state.cn_prefix} onChange={this.handleCNPrefixChange.bind(this)}/>
                            <div className="text-field-hint">Will be prefixed to the api hostname of this cluster.</div>
                          </div>
                          <div className="col-6">
                            <label>Organizations:</label>
                            <input ref='domainInput' type='text' value={this.state.certificate_organizations} onChange={this.handleCertificateOrganizationsChange.bind(this)}/>
                            <div className="text-field-hint">Comma seperated values. e.g.: admin,blue-team,staging</div>
                          </div>
                        </div>
                        <br/>
                        <div className="row">
                          <div className="col-12">
                            <label>Description:</label>
                            <input ref='domainInput' type='text' value={this.state.description} onChange={this.handleDescriptionChange.bind(this)}/>
                          </div>
                        </div>
                        <br/>
                        <label>Expires:</label>
                        <ExpiryHoursPicker onChange={this.handleTTLChange.bind(this)} />
                    </BootstrapModal.Body>
                    <BootstrapModal.Footer>
                      <Button
                        type='submit'
                        bsStyle='primary'
                        loading={this.state.modal.loading}
                        onClick={this.confirmAddKeyPair.bind(this)}>
                        {
                          this.state.modal.loading ?
                          'Creating Key Pair'
                          :
                          'Create Key Pair'
                        }
                      </Button>

                      {
                        this.state.modal.loading ?
                        null
                        :
                        <Button
                          bsStyle='link'
                          onClick={this.closeModal.bind(this)}>
                          Cancel
                        </Button>
                      }
                    </BootstrapModal.Footer>
                  </form>
                </BootstrapModal>;

              case 'addKeyPairSuccess':
                return <BootstrapModal className="create-key-pair-modal--success" show={this.state.modal.visible} onHide={this.closeModal.bind(this)}>
                  <BootstrapModal.Header closeButton>
                    <BootstrapModal.Title>Your key pair has been created.</BootstrapModal.Title>
                  </BootstrapModal.Header>
                  <BootstrapModal.Body>
                    <p>Copy the text below and save it to a text file named kubeconfig on your local machine. Caution: You won't see the key and certificate again!</p>
                    <p><b>Important:</b> Make sure that only you have access to this file, as it enables for complete administrative access to your cluster.</p>

                    <form>
                    <textarea value={this.state.kubeconfig} readOnly />
                    </form>

                    {
                      this.state.copied ?
                      <Button
                        bsStyle='default'
                        onClick={this.copyKubeConfig.bind(this)}>
                        &nbsp;&nbsp;<i className='fa fa-check' aria-hidden='true'></i>&nbsp;&nbsp;
                      </Button>
                      :
                      <Button
                        bsStyle='default'
                        onClick={this.copyKubeConfig.bind(this)}>
                        Copy
                      </Button>
                    }


                    {this.downloadAsFileLink.bind(this)()}
                  </BootstrapModal.Body>
                  <BootstrapModal.Footer>
                    <Button
                      bsStyle='link'
                      onClick={this.closeModal.bind(this)}>
                      Close
                    </Button>
                  </BootstrapModal.Footer>
                </BootstrapModal>;

              case 'addKeyPairFailure':
                return <BootstrapModal className="create-key-pair-modal--success" show={this.state.modal.visible} onHide={this.closeModal.bind(this)}>
                  <BootstrapModal.Header closeButton>
                    <BootstrapModal.Title>Could not create key pair.</BootstrapModal.Title>
                  </BootstrapModal.Header>
                  <BootstrapModal.Body>
                    <p>Something went wrong while trying to create your key pair.</p>
                    <p>Perhaps our servers are down, please try again later or contact support: support@giantswarm.io</p>
                  </BootstrapModal.Body>
                  <BootstrapModal.Footer>
                    <Button
                      bsStyle='link'
                      onClick={this.closeModal.bind(this)}>
                      Close
                    </Button>
                  </BootstrapModal.Footer>
                </BootstrapModal>;
            }
          })()
        }
      </div>
    );
  }
}

ClusterKeyPairs.propTypes = {
  user: React.PropTypes.object,
  actions: React.PropTypes.object,
  cluster: React.PropTypes.object
};


function mapStateToProps(state) {
  return {
    clusters: state.entities.clusters,
    user: state.app.loggedInUser
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
    dispatch: dispatch
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ClusterKeyPairs);

