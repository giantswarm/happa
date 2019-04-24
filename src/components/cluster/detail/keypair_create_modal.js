import { debounce } from 'throttle-debounce';
import { dedent, makeKubeConfigTextFile } from '../../../lib/helpers';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from '../../shared/button';
import copy from 'copy-to-clipboard';
import ExpiryHoursPicker from './expiry_hours_picker';
import PropTypes from 'prop-types';
import React from 'react';

class KeyPairCreateModal extends React.Component {
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
    this.cnPrefixValidationDebounced = debounce(1000, this.cnPrefixValidation);
  }

  defaultDescription(email) {
    return 'Added by user ' + email + ' using Happa web interface';
  }  

  blob() {
    var blob = new Blob([this.state.kubeconfig], {
      type: 'application/plain;charset=utf-8',
    });
    return blob;
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

  close = () => {
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

  cnPrefix() {
    if (this.state.cn_prefix == '') {
      return this.props.user.email;
    } else {
      return this.state.cn_prefix;
    }
  }

  cnPrefixValidation(value) {
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

  handleCNPrefixChange(e) {
    var inputValue = e.target.value;

    if (this.state.cn_prefix_error) {
      this.setState(
        {
          cn_prefix: inputValue,
        },
        () => {
          this.cnPrefixValidation(inputValue);
        }
      );
    } else {
      this.setState(
        {
          cn_prefix: inputValue,
        },
        () => {
          this.cnPrefixValidationDebounced(inputValue);
        }
      );
    }
  }

  handleCertificateOrganizationsChange(e) {
    this.setState({
      certificate_organizations: e.target.value,
    });
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

  show = () => {
    this.setState({
      modal: {
        visible: true,
        loading: false,
        template: 'addKeyPair',
      },
    });
  };  

  render() {
    return (
      <React.Fragment>
        {(() => {
          switch (this.state.modal.template) {
            case 'addKeyPair':
              return (
                <BootstrapModal
                  className='create-key-pair-modal'
                  show={this.state.modal.visible}
                  onHide={this.close}
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
                          onClick={this.close}
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
                  onHide={this.close}
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
                    <Button bsStyle='link' onClick={this.close}>
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
                  onHide={this.close}
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
                    <Button bsStyle='link' onClick={this.close}>
                      Close
                    </Button>
                  </BootstrapModal.Footer>
                </BootstrapModal>
              );
          }
        })()}
      </React.Fragment>
    );
  }
}

KeyPairCreateModal.propTypes = {
  user: PropTypes.object,
  actions: PropTypes.object,
  cluster: PropTypes.object,
};

export default KeyPairCreateModal;
