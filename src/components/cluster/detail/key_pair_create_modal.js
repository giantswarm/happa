import { dedent, makeKubeConfigTextFile } from 'lib/helpers';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from 'UI/button';
import copy from 'copy-to-clipboard';
import ExpiryHoursPicker from './expiry_hours_picker';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import useDebounce from 'lib/effects/use_debounce';

const KeyPairCreateModal = props => {
  const defaultDescription = email => {
    return 'Added by user ' + email + ' using Happa web interface';
  };

  const [expireTTL, setExpireTTL] = useState(720);
  const [description, setDescription] = useState(
    defaultDescription(props.user.email)
  );
  const [useInternalAPI, setUseInternalAPI] = useState(false);
  const [copied, setCopied] = useState(false);
  const [kubeconfig, setKubeconfig] = useState(false);
  const [cnPrefix, setCNPrefix] = useState('');
  const [cnPrefixError, setCNPrefixError] = useState(null);
  const [certificateOrganizations, setCertificateOrganizations] = useState('');
  const [modal, setModal] = useState({
    visible: false,
    loading: false,
    template: 'addKeyPair',
  });

  const blob = () => {
    var blob = new Blob([kubeconfig], {
      type: 'application/plain;charset=utf-8',
    });
    return blob;
  };

  const copyKubeConfig = e => {
    e.preventDefault();
    copy(kubeconfig);
    setCopied(true, () => {
      setTimeout(() => {
        setCopied(false);
      }, 500);
    });
  };

  const confirmAddKeyPair = e => {
    if (e) {
      e.preventDefault();
    }

    setModal({
      visible: true,
      loading: true,
      template: 'addKeyPair',
    });
    props.actions
      .clusterCreateKeyPair(props.cluster.id, {
        certificate_organizations: certificateOrganizations,
        cn_prefix: cnPrefix,
        description: description,
        ttl_hours: expireTTL,
      })
      .then(keypair => {
        setKubeconfig(
          dedent(makeKubeConfigTextFile(props.cluster, keypair, useInternalAPI))
        );
        setModal({
          visible: true,
          loading: false,
          template: 'addKeyPairSuccess',
        });

        return props.actions.clusterLoadKeyPairs(props.cluster.id);
      })
      .catch(error => {
        console.error(error);
        setTimeout(() => {
          setModal({
            visible: true,
            loading: false,
            template: 'addKeyPairFailure',
          });
        }, 200);
      });
  };

  const downloadAsFileLink = () => {
    return (
      <a
        className='btn btn-default'
        download='giantswarm-kubeconfig'
        href={window.URL.createObjectURL(blob())}
      >
        Download
      </a>
    );
  };

  const close = () => {
    setCNPrefix('');
    setCertificateOrganizations('');
    setDescription(defaultDescription(props.user.email));
    setModal({
      visible: false,
      loading: false,
    });
  };

  const cnPrefixOrEmail = () => {
    if (cnPrefix == '') {
      return props.user.email;
    } else {
      return cnPrefix;
    }
  };

  const cnPrefixValidation = value => {
    var error = null;
    if (value !== '') {
      var endRegex = /[a-zA-Z0-9]$/g;
      var regex = /^[a-zA-Z0-9][a-zA-Z0-9@\.-]*$/g;
      if (!endRegex.test(value)) {
        error = 'The CN prefix must end with a-z, A-Z, 0-9';
      } else if (!regex.test(value)) {
        error = 'The CN prefix must contain only a-z, A-Z, 0-9 or -';
      }
    }

    setCNPrefixError(error);
  };

  const cnPrefixDebounced = useDebounce(cnPrefix, 1000);
  useEffect(
    () => {
      // Make sure we have a value (user has entered something in input)
      if (cnPrefixDebounced) {
        cnPrefixValidation(cnPrefixDebounced);
      }
    },
    // This is the useEffect input array
    // Our useEffect function will only execute if this value changes.
    // and thanks to our hook (useDebounce) it will only change if the original
    // value (cnPrefixValidation) hasn't changed for more than 500ms.
    [cnPrefixDebounced]
  );

  const handleCNPrefixChange = e => {
    var inputValue = e.target.value;

    if (cnPrefixError) {
      setCNPrefix(inputValue);
      cnPrefixValidation(inputValue);
    } else {
      setCNPrefix(inputValue);
    }
  };

  const handleCertificateOrganizationsChange = e => {
    setCertificateOrganizations(e.target.value);
  };

  const handleTTLChange = ttl => {
    setExpireTTL(ttl);
  };

  const handleUseInternalAPIChange = event => {
    setUseInternalAPI(event.target.checked);
  };

  const handleDescriptionChange = e => {
    setDescription(e.target.value);
  };

  const show = () => {
    setModal({
      visible: true,
      loading: false,
      template: 'addKeyPair',
    });
  };

  return (
    <React.Fragment>
      <Button bsStyle='default' className='small' onClick={show}>
        <i className='fa fa-add-circle' /> Create Key Pair and Kubeconfig
      </Button>
      {(() => {
        switch (modal.template) {
          case 'addKeyPair':
            return (
              <BootstrapModal
                className='create-key-pair-modal'
                onHide={close}
                show={modal.visible}
              >
                <BootstrapModal.Header closeButton>
                  <BootstrapModal.Title>
                    Create New Key Pair and Kubeconfig
                  </BootstrapModal.Title>
                </BootstrapModal.Header>
                <form onSubmit={confirmAddKeyPair}>
                  <BootstrapModal.Body>
                    <p>
                      A key pair grants you access to the Kubernetes API of this
                      cluster.
                    </p>
                    <p>
                      Kubernetes uses the common name of the certificate as the
                      username, and assigns the Organizations as groups. This
                      allows you to set up role based access rights.
                    </p>
                    <div className='row'>
                      <div className='col-6'>
                        <label>Common Name Prefix:</label>
                        <input
                          autoFocus
                          onChange={handleCNPrefixChange}
                          type='text'
                          value={cnPrefix}
                        />
                        <div className='text-field-hint'>
                          {cnPrefixError === null ? (
                            cnPrefixOrEmail() + '.user.api.clusterdomain'
                          ) : (
                            <span className='error'>
                              <i className='fa fa-warning' /> {cnPrefixError}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className='col-6'>
                        <label>Organizations:</label>
                        <input
                          onChange={handleCertificateOrganizationsChange}
                          type='text'
                          value={certificateOrganizations}
                        />
                        <div className='text-field-hint'>
                          Comma seperated values. e.g.: admin,blue-team,staging
                        </div>
                      </div>
                    </div>
                    <br />
                    <div className='row'>
                      <div className='col-12'>
                        <label>Description:</label>
                        <input
                          onChange={handleDescriptionChange}
                          type='text'
                          value={description}
                        />
                      </div>
                    </div>
                    <br />
                    <label>Expires:</label>
                    <ExpiryHoursPicker
                      initialValue={expireTTL}
                      onChange={handleTTLChange}
                    />

                    {props.provider === 'aws' && (
                      <>
                        <br />

                        <label>Kubernetes API Endpoint:</label>
                        <input
                          id='internalApi'
                          type='checkbox'
                          checked={useInternalAPI}
                          onChange={handleUseInternalAPIChange}
                        />
                        <label htmlFor='internalApi' className='checkbox-label'>
                          Use alternative internal api endpoint.
                        </label>
                        <small>
                          When this is selected, the server entry of the created
                          kubeconfig will be https://internal-api.
                          {window.config.ingressBaseDomain}
                        </small>
                        <small>
                          This is preferred in some restricted environments.
                        </small>

                        <br />
                      </>
                    )}
                  </BootstrapModal.Body>
                  <BootstrapModal.Footer>
                    <Button
                      bsStyle='primary'
                      disabled={cnPrefixError !== null}
                      loading={modal.loading}
                      onClick={confirmAddKeyPair}
                      type='submit'
                    >
                      {modal.loading ? 'Creating Key Pair' : 'Create Key Pair'}
                    </Button>

                    {modal.loading ? null : (
                      <Button bsStyle='link' onClick={close}>
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
                onHide={close}
                show={modal.visible}
              >
                <BootstrapModal.Header closeButton>
                  <BootstrapModal.Title>
                    Your key pair and kubeconfig has been created.
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
                    this file, as it enables for complete administrative access
                    to your cluster.
                  </p>

                  <form>
                    <textarea readOnly value={kubeconfig} />
                  </form>

                  {copied ? (
                    <Button bsStyle='default' onClick={copyKubeConfig}>
                      &nbsp;&nbsp;
                      <i aria-hidden='true' className='fa fa-done' />
                      &nbsp;&nbsp;
                    </Button>
                  ) : (
                    <Button bsStyle='default' onClick={copyKubeConfig}>
                      Copy
                    </Button>
                  )}

                  {downloadAsFileLink()}
                </BootstrapModal.Body>
                <BootstrapModal.Footer>
                  <Button bsStyle='link' onClick={close}>
                    Close
                  </Button>
                </BootstrapModal.Footer>
              </BootstrapModal>
            );

          case 'addKeyPairFailure':
            return (
              <BootstrapModal
                className='create-key-pair-modal--success'
                onHide={close}
                show={modal.visible}
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
                  <Button bsStyle='link' onClick={close}>
                    Close
                  </Button>
                </BootstrapModal.Footer>
              </BootstrapModal>
            );
        }
      })()}
    </React.Fragment>
  );
};

KeyPairCreateModal.propTypes = {
  user: PropTypes.object,
  actions: PropTypes.object,
  cluster: PropTypes.object,
  provider: PropTypes.string,
  show: PropTypes.func,
};

export default KeyPairCreateModal;
