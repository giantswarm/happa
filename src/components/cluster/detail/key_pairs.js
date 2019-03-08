'use strict';

import * as clusterActions from '../../../actions/clusterActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { debounce } from 'throttle-debounce';
import { dedent, makeKubeConfigTextFile } from '../../../lib/helpers';
import { relativeDate } from '../../../lib/helpers.js';
import _ from 'underscore';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from '../../shared/button';
import copy from 'copy-to-clipboard';
import ExpiryHoursPicker from './expiry_hours_picker';
import moment from 'moment';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import PropTypes from 'prop-types';
import React from 'react';
import Tooltip from 'react-bootstrap/lib/Tooltip';

class ClusterKeyPairs extends React.Component {
  state = {
    loading: true,
    error: false,
    expireTTL: 720,
    description: '',
    cn_prefix: '',
    cn_prefix_error: null,
    certificate_organizations: '',
    modal: {
      visible: false,
      loading: false,
      template: 'addKeyPair',
    },
  };

  constructor(props) {
    super(props);

    this.CNPrefixValidationDebounced = debounce(1000, this.CNPrefixValidation);
  }

  defaultDescription(email) {
    return 'Added by user ' + email + ' using Happa web interface';
  }

  handleTTLChange(ttl) {
    this.setState({
      expireTTL: ttl,
    });
  }

  handleDescriptionChange(e) {
    this.setState({
      description: e.target.value,
    });
  }

  handleCNPrefixChange(e) {
    var inputValue = e.target.value;

    if (this.state.cn_prefix_error) {
      this.setState(
        {
          cn_prefix: inputValue,
        },
        () => {
          this.CNPrefixValidation(inputValue);
        }
      );
    } else {
      this.setState(
        {
          cn_prefix: inputValue,
        },
        () => {
          this.CNPrefixValidationDebounced(inputValue);
        }
      );
    }
  }

  CNPrefixValidation(value) {
    var error = null;
    if (value !== '') {
      var endRegex = /[a-zA-Z0-9]$/g;
      var regex = /^[a-zA-Z0-9][a-zA-Z0-9@\.-]*[a-zA-Z0-9]$/g;
      if (!endRegex.test(value)) {
        error = 'The CN prefix must end with a-z, A-Z, 0-9';
      } else if (!regex.test(value)) {
        error = 'The CN prefix must contain only a-z, A-Z, 0-9 or -';
      }
    }

    this.setState({
      cn_prefix_error: error,
    });
  }

  handleCertificateOrganizationsChange(e) {
    this.setState({
      certificate_organizations: e.target.value,
    });
  }

  componentDidMount() {
    this.setState({
      description: this.defaultDescription(this.props.user.email),
    });
    this.loadKeyPairs();
  }

  loadKeyPairs() {
    this.setState({
      loading: true,
      error: false,
    });

    return this.props.actions
      .clusterLoadKeyPairs(this.props.cluster.id)
      .then(() => {
        this.setState({
          loading: false,
          error: false,
        });
      })
      .catch(() => {
        // In case of error delay a half second so that the user gets a chance to
        // see the spinner before we blast the error state.
        setTimeout(() => {
          this.setState({
            loading: false,
            error: true,
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
        loading: false,
      },
    });
  }

  addKeyPair() {
    this.setState({
      modal: {
        visible: true,
        loading: false,
        template: 'addKeyPair',
      },
    });
  }

  confirmAddKeyPair(e) {
    if (e) {
      e.preventDefault();
    }

    this.setState(
      {
        modal: {
          visible: true,
          loading: true,
          template: 'addKeyPair',
        },
      },
      () => {
        this.props.actions
          .clusterCreateKeyPair(this.props.cluster.id, {
            certificate_organizations: this.state.certificate_organizations,
            cn_prefix: this.state.cn_prefix,
            description: this.state.description,
            ttl_hours: this.state.expireTTL,
          })
          .then(keypair => {
            this.setState({
              kubeconfig: dedent(
                makeKubeConfigTextFile(this.props.cluster, keypair)
              ),
              modal: {
                visible: true,
                loading: false,
                template: 'addKeyPairSuccess',
              },
            });

            return this.props.actions.clusterLoadKeyPairs(
              this.props.cluster.id
            );
          })
          .catch(error => {
            console.log(error);
            setTimeout(() => {
              this.setState({
                modal: {
                  visible: true,
                  loading: false,
                  template: 'addKeyPairFailure',
                },
              });
            }, 200);
          });
      }
    );
  }

  copyKubeConfig(e) {
    e.preventDefault();
    copy(this.state.kubeconfig);
    this.setState(
      {
        copied: true,
      },
      () => {
        setTimeout(() => {
          this.setState({
            copied: false,
          });
        }, 500);
      }
    );
  }

  blob() {
    var blob = new Blob([this.state.kubeconfig], {
      type: 'application/plain;charset=utf-8',
    });
    return blob;
  }

  downloadAsFileLink() {
    return (
      <a
        href={window.URL.createObjectURL(this.blob())}
        className='btn btn-default'
        download='giantswarm-kubeconfig'
      >
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

  downloadKubeConfig() {}

  render() {
    return (
      <div className='row section cluster_key_pairs col-12'>
        <div className='row'>
          <h3 className='table-label'>Key Pairs</h3>
        </div>

        <div className='row'>
          <p>
            Key pairs consist of an RSA private key and certificate, signed by
            the certificate authority (CA) belonging to this cluster. They are
            used for access to the cluster via the Kubernetes API.
          </p>
        </div>

        <div className='row'>
          <div className='col-12'>
            {(() => {
              if (this.state.loading) {
                return (
                  <p>
                    <img
                      className='loader'
                      src='/images/loader_oval_light.svg'
                    />
                  </p>
                );
              } else if (this.state.error) {
                return (
                  <div>
                    <div className='flash-messages--flash-message flash-messages--danger'>
                      Something went wrong while trying to load the list of key
                      pairs.
                    </div>
                    <Button onClick={this.loadKeyPairs.bind(this)}>
                      Try loading key pairs again.
                    </Button>
                  </div>
                );
              } else if (this.props.cluster.keyPairs.length === 0) {
                return (
                  <div>
                    <p>
                      No key pairs yet. Why don&apos;t you create your first?
                    </p>
                    <Button
                      onClick={this.addKeyPair.bind(this)}
                      bsStyle='default'
                      className='small'
                    >
                      <i className='fa fa-add-circle' /> Create Key Pair
                    </Button>
                  </div>
                );
              } else {
                return (
                  <div>
                    <table>
                      <thead>
                        <tr>
                          <th className='hidden-xs'>ID</th>
                          <th className='hidden-xs'>Description</th>
                          <th className='hidden-xs'>Created</th>
                          <th className='hidden-xs'>Expires</th>
                          <th className=''>Common Name (CN)</th>
                          <th className=''>Organization (O)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {_.sortBy(this.props.cluster.keyPairs, 'create_date')
                          .reverse()
                          .map(keyPair => {
                            var expiryClass = '';
                            var expirySeconds =
                              moment(keyPair.expire_date)
                                .utc()
                                .diff(moment().utc()) / 1000;
                            if (Math.abs(expirySeconds) < 60 * 60 * 24) {
                              expiryClass = 'expiring';
                            }

                            return (
                              <tr key={keyPair.id}>
                                <td className='code truncate hidden-xs col-sm-2'>
                                  <OverlayTrigger
                                    placement='top'
                                    overlay={
                                      <Tooltip id='tooltip'>
                                        {keyPair.id}
                                      </Tooltip>
                                    }
                                  >
                                    <span>{keyPair.id.replace(/:/g, '')}</span>
                                  </OverlayTrigger>
                                </td>
                                <td className='truncate hidden-xs col-sm-4'>
                                  <OverlayTrigger
                                    placement='top'
                                    overlay={
                                      <Tooltip id='tooltip'>
                                        {keyPair.description}
                                      </Tooltip>
                                    }
                                  >
                                    <span>{keyPair.description}</span>
                                  </OverlayTrigger>
                                </td>
                                <td className='truncate hidden-xs col-sm-1'>
                                  {relativeDate(keyPair.create_date)}
                                </td>
                                <td
                                  className={`${expiryClass} truncate hidden-xs col-sm-1`}
                                >
                                  {relativeDate(keyPair.expire_date)}
                                </td>
                                <td className='code truncate col-xs-3'>
                                  <OverlayTrigger
                                    placement='top'
                                    overlay={
                                      <Tooltip id='tooltip'>
                                        {keyPair.common_name}
                                      </Tooltip>
                                    }
                                  >
                                    <span>{keyPair.common_name}</span>
                                  </OverlayTrigger>
                                </td>
                                <td className='code truncate col-xs-1'>
                                  <OverlayTrigger
                                    placement='top'
                                    overlay={
                                      <Tooltip id='tooltip'>
                                        {keyPair.certificate_organizations}
                                      </Tooltip>
                                    }
                                  >
                                    <span>
                                      {keyPair.certificate_organizations}
                                    </span>
                                  </OverlayTrigger>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                    <Button
                      onClick={this.addKeyPair.bind(this)}
                      bsStyle='default'
                      className='small'
                    >
                      <i className='fa fa-add-circle' /> Create Key Pair
                    </Button>
                  </div>
                );
              }
            })()}
          </div>
        </div>
        {(() => {
          switch (this.state.modal.template) {
            case 'addKeyPair':
              return (
                <BootstrapModal
                  className='create-key-pair-modal'
                  show={this.state.modal.visible}
                  onHide={this.closeModal.bind(this)}
                >
                  <BootstrapModal.Header closeButton>
                    <BootstrapModal.Title>
                      Create New Key Pair
                    </BootstrapModal.Title>
                  </BootstrapModal.Header>
                  <form onSubmit={this.confirmAddKeyPair.bind(this)}>
                    <BootstrapModal.Body>
                      <p>
                        A key pair grants you access to the Kubernetes API of
                        this cluster.
                      </p>
                      <p>
                        Kubernetes uses the common name of the certificate as
                        the username, and assigns the Organizations as groups.
                        This allows you to set up role based access rights.
                      </p>
                      <div className='row'>
                        <div className='col-6'>
                          <label>Common Name Prefix:</label>
                          <input
                            autoFocus
                            type='text'
                            value={this.state.cn_prefix}
                            onChange={this.handleCNPrefixChange.bind(this)}
                          />
                          <div className='text-field-hint'>
                            {this.state.cn_prefix_error === null ? (
                              this.cnPrefix() + '.user.api.clusterdomain'
                            ) : (
                              <span className='error'>
                                <i className='fa fa-warning' />{' '}
                                {this.state.cn_prefix_error}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className='col-6'>
                          <label>Organizations:</label>
                          <input
                            type='text'
                            value={this.state.certificate_organizations}
                            onChange={this.handleCertificateOrganizationsChange.bind(
                              this
                            )}
                          />
                          <div className='text-field-hint'>
                            Comma seperated values. e.g.:
                            admin,blue-team,staging
                          </div>
                        </div>
                      </div>
                      <br />
                      <div className='row'>
                        <div className='col-12'>
                          <label>Description:</label>
                          <input
                            type='text'
                            value={this.state.description}
                            onChange={this.handleDescriptionChange.bind(this)}
                          />
                        </div>
                      </div>
                      <br />
                      <label>Expires:</label>
                      <ExpiryHoursPicker
                        onChange={this.handleTTLChange.bind(this)}
                        initialValue={this.state.expireTTL}
                      />
                    </BootstrapModal.Body>
                    <BootstrapModal.Footer>
                      <Button
                        type='submit'
                        bsStyle='primary'
                        disabled={this.state.cn_prefix_error !== null}
                        loading={this.state.modal.loading}
                        onClick={this.confirmAddKeyPair.bind(this)}
                      >
                        {this.state.modal.loading
                          ? 'Creating Key Pair'
                          : 'Create Key Pair'}
                      </Button>

                      {this.state.modal.loading ? null : (
                        <Button
                          bsStyle='link'
                          onClick={this.closeModal.bind(this)}
                        >
                          Cancel
                        </Button>
                      )}
                    </BootstrapModal.Footer>
                  </form>
                </BootstrapModal>
              );

            case 'addKeyPairSuccess':
              return (
                <BootstrapModal
                  className='create-key-pair-modal--success'
                  show={this.state.modal.visible}
                  onHide={this.closeModal.bind(this)}
                >
                  <BootstrapModal.Header closeButton>
                    <BootstrapModal.Title>
                      Your key pair has been created.
                    </BootstrapModal.Title>
                  </BootstrapModal.Header>
                  <BootstrapModal.Body>
                    <p>
                      Copy the text below and save it to a text file named
                      kubeconfig on your local machine. Caution: You won&apos;t
                      see the key and certificate again!
                    </p>
                    <p>
                      <b>Important:</b> Make sure that only you have access to
                      this file, as it enables for complete administrative
                      access to your cluster.
                    </p>

                    <form>
                      <textarea value={this.state.kubeconfig} readOnly />
                    </form>

                    {this.state.copied ? (
                      <Button
                        bsStyle='default'
                        onClick={this.copyKubeConfig.bind(this)}
                      >
                        &nbsp;&nbsp;
                        <i className='fa fa-done' aria-hidden='true' />
                        &nbsp;&nbsp;
                      </Button>
                    ) : (
                      <Button
                        bsStyle='default'
                        onClick={this.copyKubeConfig.bind(this)}
                      >
                        Copy
                      </Button>
                    )}

                    {this.downloadAsFileLink.bind(this)()}
                  </BootstrapModal.Body>
                  <BootstrapModal.Footer>
                    <Button bsStyle='link' onClick={this.closeModal.bind(this)}>
                      Close
                    </Button>
                  </BootstrapModal.Footer>
                </BootstrapModal>
              );

            case 'addKeyPairFailure':
              return (
                <BootstrapModal
                  className='create-key-pair-modal--success'
                  show={this.state.modal.visible}
                  onHide={this.closeModal.bind(this)}
                >
                  <BootstrapModal.Header closeButton>
                    <BootstrapModal.Title>
                      Could not create key pair.
                    </BootstrapModal.Title>
                  </BootstrapModal.Header>
                  <BootstrapModal.Body>
                    <p>
                      Something went wrong while trying to create your key pair.
                    </p>
                    <p>
                      Perhaps our servers are down, please try again later or
                      contact support: support@giantswarm.io
                    </p>
                  </BootstrapModal.Body>
                  <BootstrapModal.Footer>
                    <Button bsStyle='link' onClick={this.closeModal.bind(this)}>
                      Close
                    </Button>
                  </BootstrapModal.Footer>
                </BootstrapModal>
              );
          }
        })()}
      </div>
    );
  }
}

ClusterKeyPairs.propTypes = {
  user: PropTypes.object,
  actions: PropTypes.object,
  cluster: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    clusters: state.entities.clusters,
    user: state.app.loggedInUser,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ClusterKeyPairs);
