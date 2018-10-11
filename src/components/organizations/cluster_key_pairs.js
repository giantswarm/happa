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
import { makeKubeConfigTextFile, dedent } from '../../lib/helpers';
import copy from 'copy-to-clipboard';
import _ from 'underscore';
import PropTypes from 'prop-types';
import moment from 'moment';

class ClusterKeyPairs extends React.Component {
 constructor(props) {
    super(props);

    this.state = {
      loading: true,
      error: false,
      expireTTL: 720,
      description: this.defaultDescription(props.user.email),
      cn_prefix: '',
      cn_prefix_error: null,
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
    var error = null;
    if (e.target.value !== '') {
      var regex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/g;
      var found = e.target.value.match(regex);
      if (found === null) {
        error = 'Please use characters a-z, 0-9 or -';
      }
    }

    this.setState({
      cn_prefix: e.target.value,
      cn_prefix_error: error,
    });
  }

  handleCertificateOrganizationsChange(e) {
    this.setState({
      certificate_organizations: e.target.value
    });
  }

  componentDidMount() {
    this.loadKeyPairs();
  }

  loadKeyPairs() {
    this.setState({
      loading: true,
      error: false
    });

    return this.props.actions.clusterLoadKeyPairs(this.props.cluster.id)
    .then(() => {
      this.setState({
        loading: false,
        error: false
      });
    })
    .catch(() => {
      // In case of error delay a half second so that the user gets a chance to
      // see the spinner before we blast the error state.
      setTimeout(() => {
        this.setState({
          loading: false,
          error: true
        });
      }, 500);
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

    this.setState({
      modal: {
        visible: true,
        loading: true,
        template: 'addKeyPair'
      }
    }, () => {
      this.props.actions.clusterCreateKeyPair(this.props.cluster.id, {
        certificate_organizations: this.state.certificate_organizations,
        cn_prefix: this.state.cn_prefix,
        description: this.state.description,
        ttl_hours: this.state.expireTTL
      })
      .then((keypair) => {
        this.setState({
          kubeconfig: dedent(makeKubeConfigTextFile(this.props.cluster, keypair)),
          modal: {
            visible: true,
            loading: false,
            template: 'addKeyPairSuccess'
          }
        });

        return this.props.actions.clusterLoadKeyPairs(this.props.cluster.id);
      })
      .catch((error) => {
        console.log(error);
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

  cnPrefix() {
    if (this.state.cn_prefix == '') {
      return this.props.user.email;
    } else {
      return this.state.cn_prefix;
    }
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
                } else if (this.state.error) {
                  return <div><div className='flash-messages--flash-message flash-messages--danger'>
                    Something went wrong while trying to load the list of key pairs.
                  </div>
                  <Button onClick={this.loadKeyPairs.bind(this)}>Try loading key pairs again.</Button>
                  </div>;
                } else if (this.props.cluster.keyPairs.length === 0) {
                  return <div>
                  <p>No key pairs yet. Why don&apos;t you create your first?</p>
                  <Button onClick={this.addKeyPair.bind(this)} bsStyle='default' className='small'>Create Key Pair</Button>
                  </div>;
                } else {
                  return <div>
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Description</th>
                        <th>Created</th>
                        <th>Expires</th>
                        <th>Common Name (CN)</th>
                        <th>Organization (O)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        _.map(_.sortBy(this.props.cluster.keyPairs, 'create_date').reverse(), (keyPair) => {

                          var expiryClass = '';
                          var expirySeconds = moment(keyPair.expire_date).utc().diff(moment().utc()) / 1000;
                          if (Math.abs(expirySeconds) < (60 * 60 * 24)) {
                            expiryClass = 'expiring';
                          }

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
                            <td className={expiryClass}>{relativeDate(keyPair.expire_date)}</td>
                            <td className="code">
                              <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip">{keyPair.common_name}</Tooltip>}>
                                <span>{truncate(keyPair.common_name, 24)}</span>
                              </OverlayTrigger>
                            </td>
                            <td className="code">{keyPair.certificate_organizations}</td>
                          </tr>;
                        })
                      }
                    </tbody>
                  </table>
                  <Button onClick={this.addKeyPair.bind(this)} bsStyle='default' className='small'>Create Key Pair</Button>
                  </div>;
                }
              })()
            }
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
                      <p>Kubernetes uses the common name of the certificate as the username, and assigns the Organizations as groups. This allows you to set up role based access rights.</p>
                        <div className="row">
                          <div className="col-6">
                            <label>Common Name Prefix:</label>
                            <input autoFocus type='text' value={this.state.cn_prefix} onChange={this.handleCNPrefixChange.bind(this)}/>
                            <div className="text-field-hint">{
                              this.state.cn_prefix_error === null
                              ?
                              (this.cnPrefix() + '.user.api.clusterdomain')
                              :
                              <span className='error'><i className='fa fa-exclamation-triangle' /> { this.state.cn_prefix_error }</span>
                            }</div>
                          </div>
                          <div className="col-6">
                            <label>Organizations:</label>
                            <input type='text' value={this.state.certificate_organizations} onChange={this.handleCertificateOrganizationsChange.bind(this)}/>
                            <div className="text-field-hint">Comma seperated values. e.g.: admin,blue-team,staging</div>
                          </div>
                        </div>
                        <br/>
                        <div className="row">
                          <div className="col-12">
                            <label>Description:</label>
                            <input type='text' value={this.state.description} onChange={this.handleDescriptionChange.bind(this)}/>
                          </div>
                        </div>
                        <br/>
                        <label>Expires:</label>
                        <ExpiryHoursPicker onChange={this.handleTTLChange.bind(this)} initialValue={this.state.expireTTL} />
                    </BootstrapModal.Body>
                    <BootstrapModal.Footer>
                      <Button
                        type='submit'
                        bsStyle='primary'
                        disabled={this.state.cn_prefix_error !== null}
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
                    <p>Copy the text below and save it to a text file named kubeconfig on your local machine. Caution: You won&apos;t see the key and certificate again!</p>
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
  user: PropTypes.object,
  actions: PropTypes.object,
  cluster: PropTypes.object
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
